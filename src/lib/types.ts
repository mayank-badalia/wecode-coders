export type EventFormat =
  | "hackathon"
  | "quiz"
  | "workshop"
  | "build-night"
  | "demo-day"
  | "meetup";

/**
 * One labelled block on a detail page.
 *
 * `columns` is for a small number of named things a reader compares before
 * choosing one — tracks, topic areas. `list` is for an ordered set of
 * requirements a reader works through — rules, a submission checklist.
 */
export type EventSection =
  | {
      kind: "columns";
      label: string;
      intro?: string;
      items: {
        /** Short ordinal shown large, e.g. "01". */
        code: string;
        name: string;
        blurb?: string;
        points: string[];
      }[];
    }
  | {
      kind: "list";
      label: string;
      intro?: string;
      items: string[];
      /** Renders 01, 02, 03 rather than bullets. */
      numbered?: boolean;
    };

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
   * Stands in for the published start time when there is not one yet.
   *
   * `startsAt` must still hold a real timestamp so the event sorts into the
   * schedule, but an event whose hour is announced later must not print that
   * placeholder as though it were confirmed. When this is set the page shows
   * it instead of a clock time, and omits the duration for the same reason.
   */
  startTimeNote?: string;
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
  judging?: {
    name: string;
    detail: string;
    /** Weight as it is published, e.g. "20 points". Omitted when unweighted. */
    weight?: string;
  }[];
  /** What people get out of it beyond the work itself. */
  rewards?: string[];
  faq?: { q: string; a: string }[];

  /**
   * Long-form blocks that only some events have.
   *
   * A hackathon publishes tracks and a submission checklist; a quiz publishes
   * a topic list and fair-play rules. Both are the same two shapes wearing
   * different headings, so they are a list of labelled blocks rather than a
   * field per format — otherwise the type grows a `tracks`, a `quizTopics`, a
   * `submission` and a `rules` and every event carries the four it does not
   * need. The label travels with the block, so nothing is titled "Tracks" on
   * an event that has none.
   */
  sections?: EventSection[];

  /**
   * Where to send someone who wants in.
   *
   * An object with no `href` is the honest state before the form exists: the
   * page says registration has not opened rather than rendering a button that
   * goes nowhere. Adding the URL here is the only edit needed to turn it into
   * a live call to action. Omit the field entirely for events that never
   * took registrations.
   */
  registration?: {
    href?: string;
    /** Overrides the default button text. */
    label?: string;
    /** One line under it — cost, deadline, or what happens after. */
    note?: string;
  };

  stats?: { label: string; value: string }[];
  /**
   * Drives the generative poster. Must be unique per event.
   *
   * When `posterImage` is set the composition comes from the file instead,
   * and the seed's only remaining job is choosing the ground colour that
   * hover states and the ring's glow are tinted with — so pick a seed whose
   * ground matches the artwork.
   */
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
