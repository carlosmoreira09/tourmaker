import {
  computePosition,
  autoUpdate,
  offset,
  flip,
  shift,
  type Placement as FloatingPlacement,
} from "@floating-ui/dom";
import type { TourStep } from "./types";

export interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TooltipPosition {
  x: number;
  y: number;
  placement: FloatingPlacement;
}

/** Viewport-space rect for the spotlight cut-out around a target. */
export function computeSpotlight(rect: DOMRect, padding: number): SpotlightRect {
  return {
    x: rect.left - padding,
    y: rect.top - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

const DEFAULT_PLACEMENT: FloatingPlacement = "bottom";

/**
 * Keep `floating` positioned next to `reference` for the lifetime of the step,
 * re-computing on scroll/resize/layout shifts. Returns a cleanup function.
 *
 * Lives in core (not the React binding) so future Vue/Svelte/vanilla bindings
 * reuse the exact same positioning math.
 */
export function watchTooltip(
  reference: Element,
  floating: HTMLElement,
  step: TourStep,
  onUpdate: (pos: TooltipPosition) => void,
): () => void {
  const placement: FloatingPlacement =
    step.placement && step.placement !== "auto"
      ? (step.placement as FloatingPlacement)
      : DEFAULT_PLACEMENT;

  return autoUpdate(reference, floating, () => {
    computePosition(reference, floating, {
      strategy: "fixed",
      placement,
      middleware: [offset(12), flip(), shift({ padding: 8 })],
    }).then(({ x, y, placement: resolved }) => {
      onUpdate({ x, y, placement: resolved });
    });
  });
}

export function scrollTargetIntoView(el: Element): void {
  el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
}
