// PLACEHOLDER — replace with real content.
// Every fact below is invented so the layout has something true-shaped to
// hold. Nothing here names a real person, partner, or verified outcome.
// Replace the numbers with real ones before launch, or remove them.

import type { SiteData } from "@/lib/types";

export const site: SiteData = {
  name: "We Code Coders",
  tagline: "Build in public. Leave with proof.",
  foundedYear: 2026,
  // Online-first and open to anyone who can reach a browser. Naming a single
  // city made it read as a local, in-person meetup group, which it is not.
  reach: "Online, open to anyone",
  timezone: "Asia/Kolkata",
  timezoneLabel: "IST",

  manifesto: [
    "We are not a course, a cohort, or a funnel. We are a room where people build things and show their working — and the room is online, so it has space for everyone.",
    "Nobody here asks what you have shipped before, or where you are from. They ask what you are shipping now, and whether you want a hand with it.",
    "Everything we run ends the same way: with something that exists, in public, with your name on it.",
  ],

  stats: [
    { label: "Builders", value: "210" },
    { label: "Events run", value: "3" },
    { label: "Projects shipped", value: "27" },
  ],

  // Only real, reachable URLs belong here. An empty array is correct and the
  // footer will omit the column entirely — this site ships no dead links.
  socials: [],
};
