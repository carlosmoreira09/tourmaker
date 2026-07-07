import { useCallback, useSyncExternalStore } from "react";
import type { TourState } from "tourmaker-core";
import { useTourEngine } from "./context";

export interface UseTour {
  state: TourState;
  /** True when a step is currently on screen. */
  isActive: boolean;
  start: (tourId: string) => void;
  /** Start only if not seen (at this version) and the tour's `when` passes. */
  startOnce: (tourId: string) => Promise<boolean>;
  next: () => void;
  prev: () => void;
  skip: () => void;
  stop: () => void;
  goTo: (index: number) => void;
  /** Clear seen-state for a tour (or all) so it can show again. */
  reset: (tourId?: string) => Promise<void>;
}

/** Read tour state and drive navigation from any client component. */
export function useTour(): UseTour {
  const engine = useTourEngine();

  const state = useSyncExternalStore(
    (cb) => engine.subscribe(cb),
    () => engine.getState(),
    () => engine.getState(), // SSR snapshot: idle
  );

  return {
    state,
    isActive: state.status === "running" && state.step !== null,
    start: useCallback((id: string) => void engine.start(id), [engine]),
    startOnce: useCallback((id: string) => engine.startOnce(id), [engine]),
    next: useCallback(() => void engine.next(), [engine]),
    prev: useCallback(() => void engine.prev(), [engine]),
    skip: useCallback(() => engine.skip(), [engine]),
    stop: useCallback(() => engine.stop(), [engine]),
    goTo: useCallback((i: number) => void engine.goTo(i), [engine]),
    reset: useCallback((id?: string) => engine.reset(id), [engine]),
  };
}
