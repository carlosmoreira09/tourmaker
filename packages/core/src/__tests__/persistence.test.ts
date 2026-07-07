import { describe, it, expect, beforeEach } from "vitest";
import { TourEngine } from "../tour-engine";
import { memoryStore } from "../store";
import type { Tour } from "../types";

function tour(overrides: Partial<Tour> = {}): Tour {
  return {
    id: "demo",
    steps: [{ content: "Welcome" }, { content: "Step 2" }],
    ...overrides,
  };
}

describe("persistence & controlled starts", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("startOnce runs the first time, then not again", async () => {
    const engine = new TourEngine([tour()], { store: memoryStore() });

    expect(await engine.startOnce("demo")).toBe(true);
    expect(engine.getState().status).toBe("running");

    engine.complete();
    expect(await engine.hasSeen("demo")).toBe(true);

    // Second attempt should be a no-op.
    expect(await engine.startOnce("demo")).toBe(false);
    expect(engine.getState().status).toBe("idle");
  });

  it("records skip as seen too", async () => {
    const engine = new TourEngine([tour()], { store: memoryStore() });
    await engine.startOnce("demo");
    engine.skip();
    expect(await engine.hasSeen("demo")).toBe(true);
    expect(await engine.startOnce("demo")).toBe(false);
  });

  it("stop() does NOT mark the tour as seen", async () => {
    const engine = new TourEngine([tour()], { store: memoryStore() });
    await engine.startOnce("demo");
    engine.stop();
    expect(await engine.hasSeen("demo")).toBe(false);
    expect(await engine.startOnce("demo")).toBe(true);
  });

  it("re-shows when the tour version is bumped", async () => {
    const store = memoryStore();
    const v1 = new TourEngine([tour({ version: 1 })], { store });
    await v1.startOnce("demo");
    v1.complete();
    expect(await v1.hasSeen("demo")).toBe(true);

    // A new engine with a bumped version should treat it as unseen.
    const v2 = new TourEngine([tour({ version: 2 })], { store });
    expect(await v2.hasSeen("demo")).toBe(false);
    expect(await v2.startOnce("demo")).toBe(true);
  });

  it("respects the `when` segment predicate", async () => {
    const store = memoryStore();
    let allowed = false;
    const engine = new TourEngine([tour({ when: () => allowed })], { store });

    expect(await engine.startOnce("demo")).toBe(false); // predicate blocks
    allowed = true;
    expect(await engine.startOnce("demo")).toBe(true);
  });

  it("reset() clears seen-state so it can show again", async () => {
    const engine = new TourEngine([tour()], { store: memoryStore() });
    await engine.startOnce("demo");
    engine.complete();
    expect(await engine.hasSeen("demo")).toBe(true);

    await engine.reset("demo");
    expect(await engine.hasSeen("demo")).toBe(false);
    expect(await engine.startOnce("demo")).toBe(true);
  });

  it("unknown tour: hasSeen/canStart are false, startOnce no-ops", async () => {
    const engine = new TourEngine([], { store: memoryStore() });
    expect(await engine.hasSeen("nope")).toBe(false);
    expect(await engine.canStart("nope")).toBe(false);
    expect(await engine.startOnce("nope")).toBe(false);
  });
});
