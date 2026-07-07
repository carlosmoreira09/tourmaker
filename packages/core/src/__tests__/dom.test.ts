import { describe, it, expect, beforeEach } from "vitest";
import { resolveTarget } from "../dom";

describe("resolveTarget", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("returns the single match", () => {
    document.body.innerHTML = `<button id="x"></button>`;
    expect(resolveTarget("#x")).toBe(document.getElementById("x"));
  });

  it("returns null when nothing matches", () => {
    expect(resolveTarget("#nope")).toBeNull();
  });

  it("prefers the visible element among multiple matches (responsive show/hide)", () => {
    document.body.innerHTML = `
      <nav data-tour="menu" id="desktop" style="display:none"></nav>
      <button data-tour="menu" id="mobile"></button>
    `;
    // Desktop sidebar is hidden (display:none) — should pick the visible mobile one.
    expect(resolveTarget('[data-tour="menu"]')?.id).toBe("mobile");
  });

  it("falls back to the first match when none is visibly displayed", () => {
    document.body.innerHTML = `
      <div data-tour="m" id="a" style="display:none"></div>
      <div data-tour="m" id="b" style="visibility:hidden"></div>
    `;
    expect(resolveTarget('[data-tour="m"]')?.id).toBe("a");
  });

  it("returns null for an invalid selector instead of throwing", () => {
    expect(resolveTarget(">>bad<<")).toBeNull();
  });
});
