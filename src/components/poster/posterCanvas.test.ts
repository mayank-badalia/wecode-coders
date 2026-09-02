import { afterEach, describe, expect, it, vi } from "vitest";
import { LOCKED_GROUND } from "./layouts";
import { posterToCanvas } from "./posterCanvas";
import type { PublicEvent } from "@/lib/types";

/*
  The canvas poster is a second renderer of the same design.

  Its header promises the two cannot drift, and for the seeded compositions
  that held — both read GROUNDS. The locked branch did not: it carried its own
  written-out copy of the sealed plate's colours, so lightening the token moved
  the DOM posters and the About tiles while the events ring went on drawing the
  old near-black plate. These assert the branch reads the token.
*/

/** Records every fill and stroke colour the drawing code sets. */
function recordingContext() {
  const fills: string[] = [];
  const strokes: string[] = [];
  const ctx = {
    _fillStyle: "",
    _strokeStyle: "",
    get fillStyle() {
      return this._fillStyle;
    },
    set fillStyle(v: string) {
      this._fillStyle = v;
      fills.push(v);
    },
    get strokeStyle() {
      return this._strokeStyle;
    },
    set strokeStyle(v: string) {
      this._strokeStyle = v;
      strokes.push(v);
    },
    lineWidth: 0,
    font: "",
    textAlign: "left",
    globalAlpha: 1,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    clip: vi.fn(),
    rect: vi.fn(),
    closePath: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  };
  return { ctx, fills, strokes };
}

function drawLocked() {
  const { ctx, fills, strokes } = recordingContext();
  const spy = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  const locked: PublicEvent = { locked: true, slug: "locked-1", order: 0 };
  posterToCanvas(locked);
  spy.mockRestore();
  return { fills, strokes };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("posterToCanvas — locked", () => {
  it("fills the plate with the shared locked ground, not a second copy of it", () => {
    const { fills } = drawLocked();
    expect(fills).toContain(LOCKED_GROUND.bg);
  });

  it("draws the LOCKED label in the shared locked foreground", () => {
    const { fills } = drawLocked();
    expect(fills).toContain(LOCKED_GROUND.fg);
  });

  it("derives the hatching and padlock from the shared foreground", () => {
    const { strokes } = drawLocked();
    const n = parseInt(LOCKED_GROUND.fg.slice(1), 16);
    const channels = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
    expect(strokes.length).toBeGreaterThan(0);
    for (const s of strokes) expect(s).toContain(channels);
  });

  it("never paints a published ground's colours onto a locked plate", () => {
    const { fills, strokes } = drawLocked();
    // A locked plate that happened to render as, say, the acid ground would
    // leak the one thing the lock exists to hide: which event this is.
    for (const colour of [...fills, ...strokes]) {
      expect(colour).not.toBe("#D8EF72");
      expect(colour).not.toBe("#F3A5B7");
      expect(colour).not.toBe("#ED1C24");
    }
  });
});
