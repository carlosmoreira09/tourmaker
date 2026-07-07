import type { ComponentType } from "react";
import type { Placement, TourStep } from "@tourmaker/core";

/** Props handed to a tooltip component (default or custom slot). */
export interface TooltipRenderProps {
  step: TourStep;
  index: number;
  total: number;
  /** Resolved placement from the positioner (undefined for centered steps). */
  placement?: Placement;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  /** True when there is a next step; false on the last step. */
  hasNext: boolean;
  /** True when there is a previous step. */
  hasPrev: boolean;
}

/** Slot overrides so consumers can fully replace the default UI. */
export interface TourComponents {
  Tooltip?: ComponentType<TooltipRenderProps>;
}
