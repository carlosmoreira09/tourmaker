import { describe, it, expect, beforeEach, vi } from "vitest";
import { TourEngine } from "../tour-engine";
import type { Tour, TourEvent } from "../types";

function makeTour(overrides: Partial<Tour> = {}): Tour {
  return {
    id: "demo",
    steps: [
      { content: "Welcome" }, // centered, no target
      { target: "#a", content: "Step A" },
      { target: "#b", content: "Step B" },
    ],
    ...overrides,
  };
}

describe("TourEngine", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="a"></div><div id="b"></div>`;
  });

  it("starts at the first step and reports state", async () => {
    const engine = new TourEngine([makeTour()]);
    await engine.start("demo");
    const s = engine.getState();
    expect(s.status).toBe("running");
    expect(s.stepIndex).toBe(0);
    expect(s.totalSteps).toBe(3);
    expect(s.step?.content).toBe("Welcome");
  });

  it("advances and goes back", async () => {
    const engine = new TourEngine([makeTour()]);
    await engine.start("demo");
    await engine.next();
    expect(engine.getState().stepIndex).toBe(1);
    await engine.next();
    expect(engine.getState().stepIndex).toBe(2);
    await engine.prev();
    expect(engine.getState().stepIndex).toBe(1);
  });

  it("completes after the last step and emits complete", async () => {
    const events: TourEvent[] = [];
    const engine = new TourEngine([makeTour()]);
    engine.on((e) => events.push(e));
    await engine.start("demo");
    await engine.next();
    await engine.next();
    await engine.next(); // past the end
    expect(engine.getState().status).toBe("idle");
    expect(events.map((e) => e.type)).toContain("complete");
  });

  it("skip emits skip and resets to idle", async () => {
    const events: TourEvent[] = [];
    const engine = new TourEngine([makeTour()]);
    engine.on((e) => events.push(e));
    await engine.start("demo");
    engine.skip();
    expect(engine.getState().status).toBe("idle");
    const skip = events.find((e) => e.type === "skip");
    expect(skip).toMatchObject({ type: "skip", stepIndex: 0 });
  });

  it("auto-skips a missing target and emits targetNotFound", async () => {
    const events: TourEvent[] = [];
    const tour = makeTour({
      steps: [
        { target: "#missing", content: "gone", waitForTarget: 0 },
        { target: "#b", content: "Step B" },
      ],
    });
    const engine = new TourEngine([tour]);
    engine.on((e) => events.push(e));
    await engine.start("demo");
    // Should have skipped index 0 and landed on index 1.
    expect(engine.getState().stepIndex).toBe(1);
    expect(events.some((e) => e.type === "targetNotFound")).toBe(true);
  });

  it("waits for a target that appears late", async () => {
    const tour = makeTour({
      steps: [{ target: "#late", content: "late", waitForTarget: 1000 }],
    });
    const engine = new TourEngine([tour]);
    const startPromise = engine.start("demo");
    // Inject the element shortly after starting.
    setTimeout(() => {
      const el = document.createElement("div");
      el.id = "late";
      document.body.appendChild(el);
    }, 20);
    await startPromise;
    expect(engine.getState().stepIndex).toBe(0);
    expect(engine.getState().step?.content).toBe("late");
  });

  it("warns and no-ops on an unknown tour", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const engine = new TourEngine();
    await engine.start("nope");
    expect(engine.getState().status).toBe("idle");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
