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

/**
 * The radius that holds panel spacing constant however many events there are.
 *
 * Panels are a fixed size, so a fixed radius only works at a fixed count. The
 * ring was tuned at ten events; at sixteen the chord between neighbours falls
 * from 2.10 to 1.33 against a panel 2.15 wide, so each poster buries 38% of
 * the next and the ring reads as one smeared band. Solving for the radius that
 * keeps the chord at the panel width instead means adding events widens the
 * ring rather than crushing it.
 *
 * Chord between adjacent slots is 2r·sin(π/n), so r = (w·spacing) / (2·sin(π/n)).
 *
 * @param count   Number of slots on the ring.
 * @param width   Panel width in world units.
 * @param spacing Fraction of the panel width to leave between centres. The
 *                default reproduces the original ten-event ring exactly.
 */
export function ringRadius(count: number, width: number, spacing = 0.977): number {
  // One or two panels have no meaningful chord — sin(pi/1) is 0 and would
  // divide by zero, and sin(pi/2) puts them back to back.
  if (count < 3) return width;
  return (width * spacing) / (2 * Math.sin(Math.PI / count));
}
