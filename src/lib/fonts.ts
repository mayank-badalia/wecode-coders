import { Archivo, Fraunces, JetBrains_Mono } from "next/font/google";

// Fraunces carries the editorial voice. SOFT and WONK are animated, not
// decorative: WONK warps the italic on hover, SOFT softens terminals as the
// manifesto pull-quote arrives.
export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

// Archivo echoes the logo's condensed heaviness. The wdth axis is animated
// across the hero's scroll range and seeded per generative poster.
export const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  axes: ["wdth"],
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});
