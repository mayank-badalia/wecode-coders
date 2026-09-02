export type EventFormat =
  | "hackathon"
  | "workshop"
  | "build-night"
  | "demo-day"
  | "meetup";

export type Event = {
  /**
   * Hold the event back until it is announced.
   *
   * A locked event still lives in the data file in full so it can be prepared
   * ahead of time, but nothing about it is published: see PublicEvent, which
   * is what every consumer actually receives.
   */
  locked?: boolean;

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
   * How to join, and optionally where.
   *
   * The site does not advertise whether events run remotely or in a room —
   * that framing narrows who thinks it is for them. `place` is blank unless
   * there is a specific location worth naming, and nothing renders it when
   * it is empty.
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

/**
 * What the rest of the app is allowed to see.
 *
 * A locked event collapses to an opaque placeholder with no title, no dates,
 * no venue and no copy — not hidden in CSS, but genuinely absent from the
 * object, so nothing can leak through the HTML, the JSON payload or devtools.
 *
 * It is a discriminated union on purpose: reading `title` off a locked event
 * is a type error, so a component cannot accidentally render one.
 */
export type PublicEvent =
  | ({ locked: false } & Event)
  | {
      locked: true;
      /** Opaque and stable. Derived from position, never from the title. */
      slug: string;
      /** Position in the schedule, so ordering survives without a date. */
      order: number;
    };
