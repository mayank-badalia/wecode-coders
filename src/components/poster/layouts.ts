/*
  Shared source of truth for poster composition.

  The DOM poster and (later) the WebGL texture version both read from here so
  they cannot drift apart.
*/

export const GROUNDS = [
  { name: "ink", bg: "#142139", fg: "#F3EFE5", accent: "#ED1C24" },
  { name: "signal", bg: "#ED1C24", fg: "#F3EFE5", accent: "#142139" },
  { name: "blush", bg: "#F3A5B7", fg: "#142139", accent: "#ED1C24" },
  { name: "acid", bg: "#D8EF72", fg: "#142139", accent: "#ED1C24" },
  { name: "paper", bg: "#E8E1D5", fg: "#142139", accent: "#ED1C24" },
] as const;

export const TITLE_TREATMENTS = ["solid", "outline", "mixed"] as const;
export const TITLE_ALIGNMENTS = ["top", "centre", "bottom"] as const;

export type Ground = { name: string; bg: string; fg: string; accent: string };
export type TitleTreatment = (typeof TITLE_TREATMENTS)[number];
export type TitleAlignment = (typeof TITLE_ALIGNMENTS)[number];

/** The same turbulence field used by the site-wide paper grain. */
export const GRAIN_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
     <filter id="n">
       <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
       <feColorMatrix type="saturate" values="0"/>
     </filter>
     <rect width="180" height="180" filter="url(#n)"/>
   </svg>`,
)}`;

import { createRng, pick } from "@/lib/seededRandom";
import type { PublicEvent } from "@/lib/types";

/**
 * The ground an event's generated poster lands on.
 *
 * Draws the first value from the same seeded sequence Poster uses, so hover
 * states, cursor bubbles and canvas tints all match the poster the visitor is
 * actually looking at instead of one shared accent.
 */
/** A ground colour at partial opacity, for hatching and hairlines. */
export function tint(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export function groundFor(event: PublicEvent): Ground {
  /*
    A locked event's ground comes from its position in the run.

    It has no seed to compose from, and it must not borrow the published
    seed's ground — that would make the colour a fingerprint of the event
    being withheld. Its order is already on the card in plain text ("03 / 07"),
    so keying off it tells the visitor nothing they cannot already see, while
    keeping the sealed cards as visually distinct from each other as the
    published ones are.
  */
  if (event.locked) return GROUNDS[event.order % GROUNDS.length]!;
  return pick(createRng(event.posterSeed), GROUNDS);
}
