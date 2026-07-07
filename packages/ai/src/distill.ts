import type { Candidate } from "./types";

/**
 * Runs IN THE BROWSER (passed to Playwright's page.evaluate). Walks the DOM and
 * returns the meaningful, visible elements a tour might target — each with a
 * resilient CSS selector already verified to resolve uniquely on the page.
 *
 * Must be fully self-contained: it may only reference browser globals and its
 * own nested helpers (Playwright serializes it via toString()).
 */
export function collectCandidates(maxCandidates: number): Candidate[] {
  function isVisible(el: Element): boolean {
    const rect = (el as HTMLElement).getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    const style = window.getComputedStyle(el);
    return (
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      style.opacity !== "0"
    );
  }

  function unique(sel: string): boolean {
    try {
      return document.querySelectorAll(sel).length === 1;
    } catch {
      return false;
    }
  }

  function resilientSelector(el: Element): string | null {
    const id = el.getAttribute("id");
    if (id) {
      const sel = "#" + CSS.escape(id);
      if (unique(sel)) return sel;
    }
    const dataAttrs = ["data-testid", "data-tour", "data-cy", "data-test"];
    for (const a of dataAttrs) {
      const v = el.getAttribute(a);
      if (v) {
        const sel = "[" + a + '="' + v.replace(/"/g, '\\"') + '"]';
        if (unique(sel)) return sel;
      }
    }
    const aria = el.getAttribute("aria-label");
    if (aria) {
      const sel =
        el.tagName.toLowerCase() + '[aria-label="' + aria.replace(/"/g, '\\"') + '"]';
      if (unique(sel)) return sel;
    }
    // Fallback: build a structural path, anchoring on the nearest id ancestor.
    const path: string[] = [];
    let node: Element | null = el;
    while (node && node.nodeType === 1 && node.tagName.toLowerCase() !== "html") {
      let seg = node.tagName.toLowerCase();
      const parent: Element | null = node.parentElement;
      if (parent) {
        const current = node;
        const sameTag = Array.prototype.filter.call(
          parent.children,
          (c: Element) => c.tagName === current.tagName,
        ) as Element[];
        if (sameTag.length > 1) {
          seg += ":nth-of-type(" + (sameTag.indexOf(current) + 1) + ")";
        }
      }
      path.unshift(seg);
      const parentId = parent && parent.getAttribute("id");
      if (parentId) {
        path.unshift("#" + CSS.escape(parentId));
        break;
      }
      node = parent;
    }
    const sel = path.join(" > ");
    return sel && unique(sel) ? sel : null;
  }

  function isMeaningful(el: Element): boolean {
    const tag = el.tagName.toLowerCase();
    const tags = [
      "a", "button", "input", "select", "textarea",
      "nav", "header", "main", "aside", "footer",
      "h1", "h2", "h3",
    ];
    if (tags.indexOf(tag) !== -1) return true;
    if (el.getAttribute("role")) return true;
    if (el.getAttribute("id")) return true;
    if (el.getAttribute("aria-label")) return true;
    const dataAttrs = ["data-testid", "data-tour", "data-cy", "data-test"];
    for (const a of dataAttrs) if (el.getAttribute(a)) return true;
    return false;
  }

  function textOf(el: Element): string {
    const tag = el.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea") {
      return (
        el.getAttribute("placeholder") ||
        el.getAttribute("aria-label") ||
        el.getAttribute("value") ||
        ""
      ).slice(0, 80);
    }
    const t = (el as HTMLElement).innerText || el.textContent || "";
    return t.replace(/\s+/g, " ").trim().slice(0, 80);
  }

  const out: Candidate[] = [];
  const all = document.querySelectorAll("body *");
  for (let i = 0; i < all.length && out.length < maxCandidates; i++) {
    const el = all[i]!;
    if (!isMeaningful(el) || !isVisible(el)) continue;
    const selector = resilientSelector(el);
    if (!selector) continue;
    out.push({
      index: out.length,
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute("role"),
      text: textOf(el),
      selector,
      ariaLabel: el.getAttribute("aria-label"),
      id: el.getAttribute("id"),
    });
  }
  return out;
}
