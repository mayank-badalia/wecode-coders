import { describe, expect, it } from "vitest";
import { DrawSVGPlugin, Flip, gsap, ScrollTrigger, SplitText } from "./gsap";

describe("gsap registration point", () => {
  it("exports gsap", () => {
    expect(typeof gsap.timeline).toBe("function");
  });

  it("registers every plugin the design depends on", () => {
    for (const plugin of [ScrollTrigger, SplitText, Flip, DrawSVGPlugin]) {
      expect(plugin).toBeDefined();
    }
  });

  it("registers the project custom eases", () => {
    expect(gsap.parseEase("wcc")).toBeTypeOf("function");
    expect(gsap.parseEase("wccOut")).toBeTypeOf("function");
  });
});
