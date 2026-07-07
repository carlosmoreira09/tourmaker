export { SCHEMA_VERSION } from "./types";
export type {
  Placement,
  Tour,
  TourStep,
  TourOptions,
  TourState,
  TourStatus,
  TourEvent,
} from "./types";

export { TourEngine, DEFAULT_OPTIONS } from "./tour-engine";
export type { ResolvedOptions } from "./tour-engine";

export { Emitter } from "./emitter";
export type { Listener } from "./emitter";

export { isBrowser, resolveTarget, waitForElement } from "./dom";
export {
  computeSpotlight,
  watchTooltip,
  scrollTargetIntoView,
} from "./positioning";
export type { SpotlightRect, TooltipPosition } from "./positioning";
