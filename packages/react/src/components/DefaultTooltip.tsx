import type { TooltipRenderProps } from "./types";

/** The out-of-the-box tooltip card. Replaceable via the `components.Tooltip` slot. */
export function DefaultTooltip({
  step,
  index,
  total,
  onNext,
  onPrev,
  onSkip,
  hasNext,
  hasPrev,
}: TooltipRenderProps) {
  return (
    <div className="tm-card">
      <button type="button" className="tm-skip" onClick={onSkip} aria-label="Skip tour">
        Skip
      </button>
      {step.title ? <h2 className="tm-title">{step.title}</h2> : null}
      <p className="tm-content">{step.content}</p>
      <div className="tm-footer">
        <span className="tm-progress">
          {index + 1} / {total}
        </span>
        <div className="tm-actions">
          {hasPrev ? (
            <button type="button" className="tm-btn tm-btn-ghost" onClick={onPrev}>
              Back
            </button>
          ) : null}
          <button type="button" className="tm-btn tm-btn-primary" onClick={onNext}>
            {hasNext ? "Next" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
