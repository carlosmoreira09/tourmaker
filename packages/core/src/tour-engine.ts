import { Emitter } from "./emitter";
import { resolveTarget, waitForElement } from "./dom";
import { localStorageStore } from "./store";
import type { Tour, TourEvent, TourState, TourStore } from "./types";

export interface TourEngineOptions {
  /** Where seen-state is persisted. Default: {@link localStorageStore}. */
  store?: TourStore;
}

export interface ResolvedOptions {
  waitForTarget: number;
  closeOnEscape: boolean;
  closeOnOverlayClick: boolean;
  spotlightPadding: number;
}

export const DEFAULT_OPTIONS: ResolvedOptions = {
  waitForTarget: 3000,
  closeOnEscape: true,
  closeOnOverlayClick: false,
  spotlightPadding: 8,
};

const IDLE_STATE: TourState = {
  status: "idle",
  tourId: null,
  stepIndex: -1,
  step: null,
  totalSteps: 0,
};

/**
 * The heart of TourMaker: a pure, framework-agnostic state machine that drives
 * a tour. It owns tour registration, the current step, navigation, and target
 * resolution (including waiting for async elements). It renders nothing — a
 * binding layer subscribes and draws the UI.
 */
export class TourEngine {
  private tours = new Map<string, Tour>();
  private state: TourState = IDLE_STATE;
  private stateEmitter = new Emitter<TourState>();
  private eventEmitter = new Emitter<TourEvent>();
  /** Bumped on every navigation so stale async target-waits can bail out. */
  private transitionId = 0;
  private store: TourStore;

  constructor(tours: Tour[] = [], options: TourEngineOptions = {}) {
    this.store = options.store ?? localStorageStore();
    for (const tour of tours) this.register(tour);
  }

  register(tour: Tour): void {
    this.tours.set(tour.id, tour);
  }

  getTour(id: string): Tour | undefined {
    return this.tours.get(id);
  }

  getState(): TourState {
    return this.state;
  }

  /** Subscribe to state changes (drives rendering). Returns an unsubscribe fn. */
  subscribe(fn: (state: TourState) => void): () => void {
    return this.stateEmitter.subscribe(fn);
  }

  /** Subscribe to lifecycle events (drives persistence/analytics). */
  on(fn: (event: TourEvent) => void): () => void {
    return this.eventEmitter.subscribe(fn);
  }

  getResolvedOptions(): ResolvedOptions {
    const tour = this.state.tourId ? this.tours.get(this.state.tourId) : undefined;
    return { ...DEFAULT_OPTIONS, ...(tour?.options ?? {}) };
  }

  private setState(next: TourState): void {
    this.state = next;
    this.stateEmitter.emit(next);
  }

  private activeTour(): Tour | undefined {
    return this.state.tourId ? this.tours.get(this.state.tourId) : undefined;
  }

  async start(tourId: string, atStep = 0): Promise<void> {
    const tour = this.tours.get(tourId);
    if (!tour) {
      console.warn(`[TourMaker] start(): unknown tour "${tourId}".`);
      return;
    }
    if (tour.steps.length === 0) return;

    this.eventEmitter.emit({ type: "start", tourId });
    this.setState({
      status: "running",
      tourId,
      stepIndex: -1,
      step: null,
      totalSteps: tour.steps.length,
    });
    await this.goTo(atStep);
  }

  async goTo(index: number): Promise<void> {
    const tour = this.activeTour();
    if (!tour) return;
    if (index < 0 || index >= tour.steps.length) return;

    const token = ++this.transitionId;
    const step = tour.steps[index]!;
    const options = { ...DEFAULT_OPTIONS, ...(tour.options ?? {}) };

    // For anchored steps, make sure the element exists (waiting if needed).
    if (step.target) {
      const timeout = step.waitForTarget ?? options.waitForTarget;
      const el =
        resolveTarget(step.target) ?? (await waitForElement(step.target, timeout));

      if (token !== this.transitionId) return; // superseded by a newer navigation
      if (!el) {
        this.eventEmitter.emit({
          type: "targetNotFound",
          tourId: tour.id,
          stepIndex: index,
          selector: step.target,
        });
        // Auto-skip missing targets so one broken selector can't stall a tour.
        if (index + 1 < tour.steps.length) {
          await this.goTo(index + 1);
        } else {
          this.complete();
        }
        return;
      }
    }

    if (token !== this.transitionId) return;
    step.onShow?.();
    this.setState({
      status: "running",
      tourId: tour.id,
      stepIndex: index,
      step,
      totalSteps: tour.steps.length,
    });
    this.eventEmitter.emit({ type: "step", tourId: tour.id, stepIndex: index, step });
  }

  async next(): Promise<void> {
    const tour = this.activeTour();
    if (!tour) return;
    await this.state.step?.onNext?.();
    const nextIndex = this.state.stepIndex + 1;
    if (nextIndex >= tour.steps.length) this.complete();
    else await this.goTo(nextIndex);
  }

  async prev(): Promise<void> {
    if (!this.activeTour()) return;
    await this.state.step?.onPrev?.();
    const prevIndex = this.state.stepIndex - 1;
    if (prevIndex >= 0) await this.goTo(prevIndex);
  }

  skip(): void {
    if (!this.state.tourId) return;
    const tourId = this.state.tourId;
    this.transitionId++;
    this.eventEmitter.emit({ type: "skip", tourId, stepIndex: this.state.stepIndex });
    void this.recordSeen(tourId, "skipped");
    this.setState(IDLE_STATE);
  }

  complete(): void {
    if (!this.state.tourId) return;
    const tourId = this.state.tourId;
    this.transitionId++;
    this.eventEmitter.emit({ type: "complete", tourId });
    void this.recordSeen(tourId, "completed");
    this.setState(IDLE_STATE);
  }

  stop(): void {
    if (!this.state.tourId) return;
    // `stop` is a silent bail-out (e.g. route change) — it does NOT mark the
    // tour as seen, so it can show again next time.
    this.transitionId++;
    this.eventEmitter.emit({ type: "stop", tourId: this.state.tourId });
    this.setState(IDLE_STATE);
  }

  // ── Persistence & controlled starts (Phase 3) ──────────────────────────────

  private tourVersion(tour: Tour): number {
    return tour.version ?? 1;
  }

  private async recordSeen(
    tourId: string,
    status: "completed" | "skipped",
  ): Promise<void> {
    const tour = this.tours.get(tourId);
    if (!tour) return;
    await this.store.setSeen(tourId, {
      version: this.tourVersion(tour),
      status,
      at: Date.now(),
    });
  }

  /** True if the user already saw this tour at its current {@link Tour.version}. */
  async hasSeen(tourId: string): Promise<boolean> {
    const tour = this.tours.get(tourId);
    if (!tour) return false;
    const record = await this.store.getSeen(tourId);
    return record != null && record.version >= this.tourVersion(tour);
  }

  /** True if the tour is not yet seen (at this version) and its `when` passes. */
  async canStart(tourId: string): Promise<boolean> {
    const tour = this.tours.get(tourId);
    if (!tour || tour.steps.length === 0) return false;
    if (await this.hasSeen(tourId)) return false;
    if (tour.when && !(await tour.when())) return false;
    return true;
  }

  /**
   * Start the tour only if {@link canStart} — i.e. not seen at this version and
   * the segment predicate passes. Returns whether it actually started.
   */
  async startOnce(tourId: string, atStep = 0): Promise<boolean> {
    if (!(await this.canStart(tourId))) return false;
    await this.start(tourId, atStep);
    return true;
  }

  /** Clear seen-state for a tour (or all tours) so it can be shown again. */
  async reset(tourId?: string): Promise<void> {
    await this.store.clear?.(tourId);
  }
}
