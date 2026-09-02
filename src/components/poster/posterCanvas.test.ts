import { afterEach, describe, expect, it, vi } from "vitest";
import { GROUNDS, groundFor, tint } from "./layouts";
import { posterToCanvas } from "./posterCanvas";
import type { PublicEvent } from "@/lib/types";

/*
  The canvas poster is a second renderer of the same design.

  Its header promises the two cannot drift, and for the seeded compositions
  that held — both read GROUNDS. The locked branch did not: it carried its own
  written-out copy of the sealed plate's colours, so a change to the palette
  moved the DOM posters and the About tiles while the events ring went on
  drawing the old plate. These assert the branch reads the shared table.

  They also pin what a locked plate is allowed to derive its colour from: the
  order, which is already printed on the card, and never the poster seed,
  which would turn the colour into a fingerprint of the withheld event.
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

function drawLocked(order = 0) {
  const { ctx, fills, strokes } = recordingContext();
  const spy = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  const locked: PublicEvent = { locked: true, slug: `locked-${order + 1}`, order };
  posterToCanvas(locked);
  spy.mockRestore();
  return { fills, strokes, ground: groundFor(locked) };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("posterToCanvas — locked", () => {
  it("fills the plate with the shared ground, not a second copy of it", () => {
    const { fills, ground } = drawLocked();
    expect(fills).toContain(ground.bg);
  });

  it("draws the LOCKED label in that ground's foreground", () => {
    const { fills, ground } = drawLocked();
    expect(fills).toContain(ground.fg);
  });

  it("derives the hatching and padlock from that ground's foreground", () => {
    const { strokes, ground } = drawLocked();
    expect(strokes.length).toBeGreaterThan(0);
    // Alpha varies between the hatching and the padlock; the channels must not.
    const channels = tint(ground.fg, 1).replace(",1)", "");
    for (const s of strokes) expect(s.startsWith(channels)).toBe(true);
  });

  it("gives consecutive locked plates different grounds", () => {
    const grounds = [0, 1, 2, 3].map((o) => drawLocked(o).ground.bg);
    expect(new Set(grounds).size).toBe(4);
  });

  it("takes the ground from the order, never from a seed", () => {
    // The order is already printed on the card. A seed is not, and a colour
    // derived from one would fingerprint the event being withheld.
    for (const order of [0, 1, 2, 3, 4, 5, 6]) {
      const { ground } = drawLocked(order);
      expect(ground).toBe(GROUNDS[order % GROUNDS.length]);
    }
  });
});
