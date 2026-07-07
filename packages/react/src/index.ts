export { TourProvider } from "./TourProvider";
export type { TourProviderProps, TourTheme } from "./TourProvider";
export { useTour } from "./useTour";
export type { UseTour } from "./useTour";
export { useAutoStartTour, useHasSeen } from "./hooks";
export type { UseAutoStartTourOptions } from "./hooks";
export { DefaultTooltip } from "./components/DefaultTooltip";
export type { TooltipRenderProps, TourComponents } from "./components/types";
export { DEFAULT_STYLES, injectDefaultStyles } from "./styles";

// Re-export core so consumers only need one import.
export { localStorageStore, memoryStore } from "tourmaker-core";
export type {
  Tour,
  TourStep,
  TourOptions,
  TourState,
  TourEvent,
  Placement,
  TourStore,
  SeenRecord,
} from "tourmaker-core";
export { SCHEMA_VERSION } from "tourmaker-core";
