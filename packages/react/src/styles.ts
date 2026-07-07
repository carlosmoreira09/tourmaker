/**
 * Default TourMaker styles, shipped as a string and injected once at runtime so
 * the library looks good with ZERO consumer setup (no Tailwind config, no CSS
 * import). Everything is namespaced under `.tm-*` and driven by CSS custom
 * properties, so consumers can re-theme by overriding the variables, or opt out
 * entirely with `<TourProvider injectStyles={false}>` and ship their own.
 */
export const DEFAULT_STYLES = `
.tm-root {
  --tm-accent: #6d28d9;
  --tm-accent-contrast: #ffffff;
  --tm-radius: 12px;
  --tm-z: 2147483000;
  /* dark theme (default) */
  --tm-card-bg: #1e1e28;
  --tm-card-fg: #f4f4f6;
  --tm-muted: #a1a1b0;
  --tm-overlay: rgba(15, 15, 22, 0.55);
  --tm-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}
/* light theme (fundo branco) */
.tm-root[data-theme="light"] {
  --tm-card-bg: #ffffff;
  --tm-card-fg: #16161d;
  --tm-muted: #6b6b7b;
  --tm-overlay: rgba(15, 15, 22, 0.4);
  --tm-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
}
/* auto: follow the OS preference */
@media (prefers-color-scheme: light) {
  .tm-root[data-theme="auto"] {
    --tm-card-bg: #ffffff;
    --tm-card-fg: #16161d;
    --tm-muted: #6b6b7b;
    --tm-overlay: rgba(15, 15, 22, 0.4);
    --tm-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
  }
}
.tm-spotlight {
  position: fixed;
  top: 0;
  left: 0;
  border-radius: 8px;
  box-shadow: 0 0 0 9999px var(--tm-overlay);
  pointer-events: none;
  z-index: var(--tm-z);
  transition: transform 0.25s ease, width 0.25s ease, height 0.25s ease;
}
.tm-overlay-full {
  position: fixed;
  inset: 0;
  background: var(--tm-overlay);
  z-index: var(--tm-z);
}
.tm-blocker {
  position: fixed;
  z-index: calc(var(--tm-z) + 1);
}
.tm-tooltip-wrapper {
  z-index: calc(var(--tm-z) + 2);
  opacity: 0;
  transition: opacity 0.18s ease;
}
.tm-tooltip-wrapper[data-visible="true"] {
  opacity: 1;
}
.tm-card {
  box-sizing: border-box;
  width: max-content;
  max-width: min(360px, calc(100vw - 24px));
  background: var(--tm-card-bg);
  color: var(--tm-card-fg);
  border-radius: var(--tm-radius);
  box-shadow: var(--tm-shadow);
  padding: 18px;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  line-height: 1.5;
}
.tm-card * { box-sizing: border-box; }
.tm-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 650;
}
.tm-content {
  margin: 0;
  font-size: 14px;
  color: var(--tm-card-fg);
}
.tm-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}
.tm-progress {
  font-size: 12px;
  color: var(--tm-muted);
  font-variant-numeric: tabular-nums;
}
.tm-actions { display: flex; gap: 8px; }
.tm-btn {
  appearance: none;
  border: 0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 550;
  padding: 8px 14px;
  border-radius: 8px;
  transition: filter 0.15s ease, background 0.15s ease;
}
.tm-btn:focus-visible {
  outline: 2px solid var(--tm-accent);
  outline-offset: 2px;
}
.tm-btn-primary { background: var(--tm-accent); color: var(--tm-accent-contrast); }
.tm-btn-primary:hover { filter: brightness(1.08); }
.tm-btn-ghost { background: transparent; color: var(--tm-muted); }
.tm-btn-ghost:hover { color: var(--tm-card-fg); }
.tm-skip {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: 0;
  color: var(--tm-muted);
  cursor: pointer;
  font-size: 12px;
  padding: 4px;
}
.tm-skip:hover { color: var(--tm-card-fg); }
@media (prefers-reduced-motion: reduce) {
  .tm-spotlight, .tm-tooltip-wrapper { transition: none; }
}
`;

const STYLE_ID = "tourmaker-default-styles";
let injected = false;

export function injectDefaultStyles(): void {
  if (injected) return;
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) {
    injected = true;
    return;
  }
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = DEFAULT_STYLES;
  document.head.appendChild(el);
  injected = true;
}
