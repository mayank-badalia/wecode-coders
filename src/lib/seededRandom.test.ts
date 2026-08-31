import { describe, expect, it } from "vitest";
import { createRng, pick, range } from "./seededRandom";

describe("createRng", () => {
  it("is deterministic for a given seed", () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("differs across seeds", () => {
    expect(createRng(1)()).not.toBe(createRng(2)());
  });

  it("stays within [0, 1)", () => {
    const rng = createRng(7);
    for (let i = 0; i < 500; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("pick and range", () => {
  it("pick returns a member of the array", () => {
    const rng = createRng(3);
    expect(["a", "b", "c"]).toContain(pick(rng, ["a", "b", "c"]));
  });

  it("pick throws on an empty array rather than returning undefined", () => {
    expect(() => pick(createRng(1), [])).toThrow();
  });

  it("range stays within bounds", () => {
    const rng = createRng(9);
    for (let i = 0; i < 200; i++) {
      const v = range(rng, 10, 20);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThan(20);
    }
  });
});
