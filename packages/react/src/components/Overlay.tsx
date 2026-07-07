import type { SpotlightRect } from "@tourmaker/core";

interface OverlayProps {
  spotlight: SpotlightRect | null;
  /** When true, clicks outside the spotlight are blocked and trigger onClose. */
  blockInteraction: boolean;
  onClose: () => void;
}

/**
 * Dims the page and, for anchored steps, cuts a spotlight around the target.
 *
 * Visual dimming uses the classic large `box-shadow` on the spotlight element,
 * which leaves the highlighted element fully clickable (great for interactive
 * tours). When `blockInteraction` is set, four transparent panels around the
 * hole capture clicks so the rest of the page can't be touched.
 */
export function Overlay({ spotlight, blockInteraction, onClose }: OverlayProps) {
  if (!spotlight) {
    return <div className="tm-overlay-full" onClick={onClose} />;
  }

  const { x, y, width, height } = spotlight;

  return (
    <>
      <div
        className="tm-spotlight"
        style={{ transform: `translate(${x}px, ${y}px)`, width, height }}
      />
      {blockInteraction ? (
        <Blockers x={x} y={y} width={width} height={height} onClose={onClose} />
      ) : null}
    </>
  );
}

function Blockers({
  x,
  y,
  width,
  height,
  onClose,
}: SpotlightRect & { onClose: () => void }) {
  // top, bottom, left, right panels surrounding the transparent hole
  const panels: React.CSSProperties[] = [
    { top: 0, left: 0, right: 0, height: Math.max(0, y) },
    { top: y + height, left: 0, right: 0, bottom: 0 },
    { top: y, left: 0, width: Math.max(0, x), height },
    { top: y, left: x + width, right: 0, height },
  ];
  return (
    <>
      {panels.map((style, i) => (
        <div key={i} className="tm-blocker" style={{ position: "fixed", ...style }} onClick={onClose} />
      ))}
    </>
  );
}
