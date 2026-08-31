/*
  Shared source of truth for poster composition.

  The DOM poster and (later) the WebGL texture version both read from here so
  they cannot drift apart.
*/

export const GROUNDS = [
  { name: "violet", bg: "#4B3BF0", fg: "#F5C9D0", accent: "#C9F73D" },
  { name: "pink", bg: "#F5C9D0", fg: "#4B3BF0", accent: "#131C33" },
  { name: "lime", bg: "#C9F73D", fg: "#131C33", accent: "#4B3BF0" },
  { name: "ink", bg: "#131C33", fg: "#F5C9D0", accent: "#C9F73D" },
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
