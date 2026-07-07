import { useEffect, useRef, useState } from "react";
import { useTourEngine } from "./context";
import { useTour } from "./useTour";

export interface UseAutoStartTourOptions {
  /** Turn the auto-start on/off (e.g. wait for auth to load). Default: true. */
  enabled?: boolean;
  /** Delay (ms) before starting, e.g. to let the page settle. Default: 0. */
  delay?: number;
}

/**
 * Auto-start a tour (via `startOnce`) when the component mounts. Because a page
 * component mounts when its route becomes active, dropping this in a page IS the
 * "start on this route, once" behavior — no router coupling required.
 *
 * It respects seen-state, tour `version`, and the tour's `when` predicate, so it
 * only ever runs when it should.
 */
export function useAutoStartTour(
  tourId: string,
  options: UseAutoStartTourOptions = {},
): void {
  const engine = useTourEngine();
  const { enabled = true, delay = 0 } = options;
  const firedRef = useRef(false);

  useEffect(() => {
    if (!enabled || firedRef.current) return;
    firedRef.current = true;

    if (delay > 0) {
      const timer = setTimeout(() => void engine.startOnce(tourId), delay);
      return () => clearTimeout(timer);
    }
    void engine.startOnce(tourId);
    return;
  }, [engine, tourId, enabled, delay]);
}

/**
 * Reactively read whether the user has already seen a tour (at its current
 * version). Returns `undefined` while the (possibly async) store is resolving,
 * then `true`/`false`. Re-checks whenever a tour finishes.
 */
export function useHasSeen(tourId: string): boolean | undefined {
  const engine = useTourEngine();
  const { state } = useTour();
  const [seen, setSeen] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    Promise.resolve(engine.hasSeen(tourId)).then((value) => {
      if (alive) setSeen(value);
    });
    return () => {
      alive = false;
    };
    // Re-check when the running tour changes (e.g. right after complete/skip).
  }, [engine, tourId, state.status]);

  return seen;
}
