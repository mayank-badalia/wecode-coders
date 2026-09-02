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
/*
  The sealed plate's colours.

  Kept well clear of the events ring's world (#0A0F1C). At #0F1626 the plate
  was all but the same value as the world behind it, which read fine while one
  locked plate sat among six colourful ones — the contrast came from its
  neighbours. With every event locked those neighbours are gone, and the ring
  became a single black void, so the plate has to carry its own separation and
  be legible as the only thing on the page.
*/
export const LOCKED_GROUND: Ground = {
  name: "ink",
  bg: "#242F45",
  fg: "#B4BECF",
  accent: "#ED1C24",
};

export function groundFor(event: PublicEvent): Ground {
  // A locked event has no seed to derive from, and must not look like any
  // particular one of the published grounds.
  if (event.locked) return LOCKED_GROUND;
  return pick(createRng(event.posterSeed), GROUNDS);
}
