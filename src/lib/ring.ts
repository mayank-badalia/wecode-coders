const TAU = Math.PI * 2;

/** The angle of slot `index` on a ring of `count` evenly spaced slots. */
export function slotAngle(index: number, count: number): number {
  return (index / count) * TAU;
}

/**
 * The slot nearest a given rotation, wrapping in both directions.
 *
 * Rotation accumulates without bound as the visitor keeps dragging, so this
 * must cope with values far outside [0, 2pi) and with negatives.
 */
export function nearestSlot(rotation: number, count: number): number {
  const step = TAU / count;
  const wrapped = ((rotation % TAU) + TAU) % TAU;
  return Math.round(wrapped / step) % count;
}

/** Shortest angular distance between two angles, always within [0, pi]. */
export function angularDistance(a: number, b: number): number {
  const d = ((((a - b) % TAU) + TAU + Math.PI) % TAU) - Math.PI;
  return Math.abs(d);
}
