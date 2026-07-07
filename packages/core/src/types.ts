/**
 * Current tour schema version. Bumped when the {@link Tour} shape changes in a
 * breaking way, so old serialized tours can be migrated instead of silently
 * breaking. The AI authoring layer (Phase 2) emits tours stamped with this.
 */
export const SCHEMA_VERSION = 1;

export type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end"
  | "auto";

/** A single step in a tour. */
export interface TourStep {
  /**
   * CSS selector for the element to highlight. Omit for a centered "modal"
   * step (e.g. a welcome screen) with no anchor.
   */
  target?: string;
  title?: string;
  /** Body text. Plain string; the UI layer decides how to render it. */
  content: string;
  /** Preferred tooltip placement relative to the target. Default: "bottom". */
  placement?: Placement;
  /**
   * Milliseconds to wait for the target to appear before giving up on this
   * step. Falls back to the tour-level option. `0` disables waiting.
   */
  waitForTarget?: number;
  /** Block interaction with the rest of the page while this step is shown. */
  disableInteraction?: boolean;
  /** Called when advancing away from this step (before the next resolves). */
  onNext?: () => void | Promise<void>;
  /** Called when going back from this step. */
  onPrev?: () => void | Promise<void>;
  /** Called right before this step becomes visible. */
  onShow?: () => void;
}

export interface TourOptions {
  /** Default ms to wait for a step's target element. Default: 3000. */
  waitForTarget?: number;
  /** Close the tour when Escape is pressed. Default: true. */
  closeOnEscape?: boolean;
  /** Close the tour when the dimmed overlay is clicked. Default: false. */
  closeOnOverlayClick?: boolean;
  /** Padding (px) around the highlighted element's spotlight. Default: 8. */
  spotlightPadding?: number;
}

export interface Tour {
  id: string;
  /** Defaults to {@link SCHEMA_VERSION} when omitted. */
  schemaVersion?: number;
  steps: TourStep[];
  options?: TourOptions;
  /**
   * Content version of this tour. Bump it when you change the tour's copy or
   * steps and want users who already saw the previous version to see it again.
   * `startOnce`/`hasSeen` compare this against the persisted record. Default: 1.
   */
  version?: number;
  /**
   * Segment predicate. When present, `startOnce` only starts the tour if this
   * returns a truthy value. Being a function, it is a code-level escape hatch —
   * AI-generated (serializable) tours never set it.
   */
  when?: () => boolean | Promise<boolean>;
}

export type MaybePromise<T> = T | Promise<T>;

/** What gets persisted per tour so we know a user already saw it. */
export interface SeenRecord {
  /** The tour {@link Tour.version} that was seen. */
  version: number;
  status: "completed" | "skipped";
  /** Unix ms timestamp. */
  at: number;
}

/**
 * Pluggable persistence for "who saw which tour". The default is
 * {@link localStorageStore}; provide your own (e.g. backed by your API) to
 * persist per-user, cross-device. All methods may be sync or async.
 */
export interface TourStore {
  getSeen(tourId: string): MaybePromise<SeenRecord | null>;
  setSeen(tourId: string, record: SeenRecord): MaybePromise<void>;
  /** Clear a tour's seen state, or all of it when no id is given. */
  clear?(tourId?: string): MaybePromise<void>;
}

export type TourStatus = "idle" | "running";

export interface TourState {
  status: TourStatus;
  tourId: string | null;
  stepIndex: number;
  step: TourStep | null;
  totalSteps: number;
}

/** Lifecycle events emitted by the engine. Consumed by persistence/analytics. */
export type TourEvent =
  | { type: "start"; tourId: string }
  | { type: "step"; tourId: string; stepIndex: number; step: TourStep }
  | { type: "complete"; tourId: string }
  | { type: "skip"; tourId: string; stepIndex: number }
  | { type: "stop"; tourId: string }
  | { type: "targetNotFound"; tourId: string; stepIndex: number; selector: string };
