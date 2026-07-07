import { useEffect, useMemo, type ReactNode } from "react";
import { TourEngine, type Tour, type TourEvent } from "tourmaker-core";
import { TourContext } from "./context";
import { TourRenderer } from "./TourRenderer";
import { injectDefaultStyles } from "./styles";
import type { TourComponents } from "./components/types";

/** Visual theme for the default UI. `"auto"` follows the OS color scheme. */
export type TourTheme = "dark" | "light" | "auto";

export interface TourProviderProps {
  children: ReactNode;
  /** Tours available to start via `useTour().start(id)`. */
  tours?: Tour[];
  /** Default UI theme: dark card (default), light card, or OS-driven. */
  theme?: TourTheme;
  /** Inject the default stylesheet (zero-config UI). Default: true. */
  injectStyles?: boolean;
  /** Observe lifecycle events (persistence, analytics). */
  onEvent?: (event: TourEvent) => void;
  /** Override built-in UI (e.g. a custom Tooltip). */
  components?: TourComponents;
}

export function TourProvider({
  children,
  tours = [],
  theme = "dark",
  injectStyles = true,
  onEvent,
  components,
}: TourProviderProps) {
  // One engine per provider instance; created lazily and kept stable.
  const engine = useMemo(() => new TourEngine(), []);

  // Register/refresh tours when the list changes.
  useEffect(() => {
    for (const tour of tours) engine.register(tour);
  }, [engine, tours]);

  useEffect(() => {
    if (injectStyles) injectDefaultStyles();
  }, [injectStyles]);

  useEffect(() => {
    if (!onEvent) return;
    return engine.on(onEvent);
  }, [engine, onEvent]);

  return (
    <TourContext.Provider value={engine}>
      {children}
      <TourRenderer components={components} theme={theme} />
    </TourContext.Provider>
  );
}
