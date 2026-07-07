/** True only in a real browser environment. Guards every DOM access so the
 * package is safe to import during SSR (Next App/Pages Router, etc.). */
export const isBrowser = (): boolean =>
  typeof window !== "undefined" && typeof document !== "undefined";

/** Not visible if it (or the check) resolves to display:none / visibility:hidden. */
function isDisplayed(el: Element): boolean {
  if (!isBrowser()) return true;
  const style = window.getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden";
}

export function resolveTarget(selector?: string): Element | null {
  if (!selector || !isBrowser()) return null;
  try {
    const matches = document.querySelectorAll(selector);
    if (matches.length <= 1) return matches[0] ?? null;
    // Multiple matches — common with responsive show/hide (e.g. a desktop
    // sidebar and a mobile menu sharing `data-tour="menu"`). Prefer the one
    // that's actually visible so we never spotlight a hidden element.
    for (const el of matches) {
      if (isDisplayed(el)) return el;
    }
    return matches[0] ?? null;
  } catch {
    // Invalid selector — treat as "not found" rather than throwing.
    return null;
  }
}

/**
 * Resolve a selector now, or wait (via MutationObserver) up to `timeout` ms for
 * it to appear. Resolves `null` on timeout. Used so tours survive async UI that
 * mounts a beat after navigation.
 */
export function waitForElement(
  selector: string,
  timeout: number,
): Promise<Element | null> {
  if (!isBrowser()) return Promise.resolve(null);
  const existing = resolveTarget(selector);
  if (existing) return Promise.resolve(existing);
  if (timeout <= 0) return Promise.resolve(null);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (el: Element | null) => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      clearTimeout(timer);
      resolve(el);
    };
    const observer = new MutationObserver(() => {
      const el = resolveTarget(selector);
      if (el) finish(el);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = setTimeout(() => finish(null), timeout);
  });
}
