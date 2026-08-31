/*
  Shared source of truth for poster composition.

  The DOM poster and (later) the WebGL texture version both read from here so
  they cannot drift apart.
*/

export const GROUNDS = [
  { name: "ink", bg: "#142139", fg: "#F3EFE5", accent: "#F04436" },
  { name: "signal", bg: "#F04436", fg: "#F3EFE5", accent: "#142139" },
  { name: "blush", bg: "#F3A5B7", fg: "#142139", accent: "#F04436" },
  { name: "acid", bg: "#D8EF72", fg: "#142139", accent: "#F04436" },
  { name: "paper", bg: "#E8E1D5", fg: "#142139", accent: "#F04436" },
] as const;

export const TITLE_TREATMENTS = ["solid", "outline", "mixed"] as const;
export const TITLE_ALIGNMENTS = ["top", "centre", "bottom"] as const;

export type Ground = (typeof GROUNDS)[number];
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
import type { Event } from "@/lib/types";

/**
 * The ground an event's generated poster lands on.
 *
 * Draws the first value from the same seeded sequence Poster uses, so hover
 * states, cursor bubbles and canvas tints all match the poster the visitor is
 * actually looking at instead of one shared accent.
 */
export function groundFor(event: Event): Ground {
  return pick(createRng(event.posterSeed), GROUNDS);
}
