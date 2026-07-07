export { TourProvider } from "./TourProvider";
export type { TourProviderProps, TourTheme } from "./TourProvider";
export { useTour } from "./useTour";
export type { UseTour } from "./useTour";
export { DefaultTooltip } from "./components/DefaultTooltip";
export type { TooltipRenderProps, TourComponents } from "./components/types";
export { DEFAULT_STYLES, injectDefaultStyles } from "./styles";

// Re-export core types so consumers only need one import.
export type {
  Tour,
  TourStep,
  TourOptions,
  TourState,
  TourEvent,
  Placement,
} from "tourmaker-core";
export { SCHEMA_VERSION } from "tourmaker-core";
