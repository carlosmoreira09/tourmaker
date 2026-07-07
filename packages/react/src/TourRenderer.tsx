import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  computeSpotlight,
  resolveTarget,
  scrollTargetIntoView,
  watchTooltip,
  type SpotlightRect,
  type TooltipPosition,
} from "@tourmaker/core";
import { useTour } from "./useTour";
import { useTourEngine } from "./context";
import { Overlay } from "./components/Overlay";
import { DefaultTooltip } from "./components/DefaultTooltip";
import type { TourComponents } from "./components/types";

interface TourRendererProps {
  components?: TourComponents;
  theme?: "dark" | "light" | "auto";
}

/** Draws the active step: overlay + spotlight + positioned tooltip. Rendered
 *  once by TourProvider; returns null whenever no tour is running. */
export function TourRenderer({ components, theme = "dark" }: TourRendererProps) {
  const engine = useTourEngine();
  const { state, next, prev, skip } = useTour();
  const options = engine.getResolvedOptions();

  const step = state.step;
  const active = state.status === "running" && step !== null;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [targetEl, setTargetEl] = useState<Element | null>(null);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [pos, setPos] = useState<TooltipPosition | null>(null);

  // Resolve the target element whenever the step changes.
  useLayoutEffect(() => {
    if (!active || !step) {
      setTargetEl(null);
      setSpotlight(null);
      setPos(null);
      return;
    }
    const el = step.target ? resolveTarget(step.target) : null;
    setTargetEl(el);
    if (el) scrollTargetIntoView(el);
  }, [active, step]);

  // Position spotlight + tooltip and keep them in sync with scroll/resize.
  useEffect(() => {
    if (!active || !step) return;
    const floating = wrapperRef.current;
    if (!floating) return;

    const padding = options.spotlightPadding;
    const syncSpotlight = () => {
      if (targetEl) {
        setSpotlight(computeSpotlight(targetEl.getBoundingClientRect(), padding));
      } else {
        setSpotlight(null);
      }
    };

    syncSpotlight();

    let cleanup = () => {};
    if (targetEl) {
      cleanup = watchTooltip(targetEl, floating, step, (p) => {
        setPos(p);
        syncSpotlight();
      });
    } else {
      setPos(null); // centered step
    }

    window.addEventListener("scroll", syncSpotlight, true);
    window.addEventListener("resize", syncSpotlight);
    return () => {
      cleanup();
      window.removeEventListener("scroll", syncSpotlight, true);
      window.removeEventListener("resize", syncSpotlight);
    };
  }, [active, step, targetEl, options.spotlightPadding]);

  // Keyboard navigation.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && options.closeOnEscape) skip();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, options.closeOnEscape, next, prev, skip]);

  if (!active || !step) return null;

  const Tooltip = components?.Tooltip ?? DefaultTooltip;
  const isCentered = targetEl === null;
  const visible = isCentered || pos !== null;

  const wrapperStyle: React.CSSProperties = isCentered
    ? { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
    : { position: "fixed", top: 0, left: 0, transform: `translate(${pos?.x ?? 0}px, ${pos?.y ?? 0}px)` };

  const onOverlayClose = () => {
    if (options.closeOnOverlayClick || step.disableInteraction) skip();
  };

  return (
    <div className="tm-root" data-theme={theme}>
      <Overlay
        spotlight={spotlight}
        blockInteraction={step.disableInteraction ?? false}
        onClose={onOverlayClose}
      />
      <div
        ref={wrapperRef}
        className="tm-tooltip-wrapper"
        data-visible={visible ? "true" : "false"}
        style={wrapperStyle}
        role="dialog"
        aria-modal="true"
        aria-label={step.title ?? "Product tour step"}
      >
        <Tooltip
          step={step}
          index={state.stepIndex}
          total={state.totalSteps}
          placement={pos?.placement}
          onNext={next}
          onPrev={prev}
          onSkip={skip}
          hasNext={state.stepIndex < state.totalSteps - 1}
          hasPrev={state.stepIndex > 0}
        />
      </div>
    </div>
  );
}
