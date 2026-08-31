export type EventFormat =
  | "hackathon"
  | "workshop"
  | "build-night"
  | "demo-day"
  | "meetup";

export type Event = {
  /** URL segment. Stable — changing it breaks any link already shared. */
  slug: string;
  title: string;
  /** Short mono label, e.g. "HACKATHON — 36 HOURS". */
  kicker: string;
  format: EventFormat;
  status: "upcoming" | "past";
  /** ISO 8601 with offset. */
  startsAt: string;
  endsAt: string;
  venue: { name: string; city: string; country: string };
  /** One or two sentences. Used on rail cards and the events ring panel. */
  summary: string;
  /** Paragraphs for the detail page. */
  description: string[];
  forWho: string;
  tags: string[];
  stats?: { label: string; value: string }[];
  /** Drives the generative poster. Must be unique per event. */
  posterSeed: number;
  /** Optional override — a real poster image path. Wins over the generated one. */
  posterImage?: string;
  links?: { label: string; href: string }[];
};

export type SiteData = {
  name: string;
  tagline: string;
  foundedYear: number;
  city: string;
  country: string;
  /** IANA timezone — used by the footer clock. */
  timezone: string;
  manifesto: string[];
  stats: { label: string; value: string }[];
  socials: { label: string; href: string }[];
};
