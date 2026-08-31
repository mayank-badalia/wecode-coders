import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Condensed,
  Instrument_Serif,
} from "next/font/google";

/*
  Instrument Serif carries every editorial headline. It ships one weight plus
  an italic — that constraint is the point: scale and colour do the work that
  weight would otherwise do, which is how print sets a headline.
*/
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

/** Repeated maximalist titles: rail cards, transition panel, tape stack. */
export const plexCondensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
  variable: "--font-condensed",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-mono-face",
});
