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
  /**
   * Where it happens. Most events are online and open to anyone; `place` is
   * the human label shown everywhere ("Online", or a city when there is one).
   */
  mode: "online" | "in-person" | "hybrid";
  venue: { name: string; place: string };
  /** One or two sentences. Used on rail cards and the events ring panel. */
  summary: string;
  /** Paragraphs for the detail page. */
  description: string[];
  forWho: string;
  tags: string[];

  /** Practical facts a visitor needs before deciding. */
  teamSize: string;
  eligibility: string;
  /** The central challenge, in the event's own words. */
  brief: string;
  /** What a participant is expected to have at the end. */
  deliverables: string[];
  /** Running order. Only rendered when present. */
  schedule?: { when: string; what: string }[];
  /** Only the criteria this event actually uses. */
  judging?: { name: string; detail: string }[];
  /** What people get out of it beyond the work itself. */
  rewards?: string[];
  faq?: { q: string; a: string }[];

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
  /** Where the community is reachable from, in words. */
  reach: string;
  /** IANA timezone — the clock the schedule is published in. */
  timezone: string;
  timezoneLabel: string;
  manifesto: string[];
  stats: { label: string; value: string }[];
  socials: { label: string; href: string }[];
};
