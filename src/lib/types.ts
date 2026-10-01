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
        /**
         * A short line above the name, set bold.
         *
         * Holds the dates a round runs. They differ per event, which is why
         * the rounds block is built from the start date rather than being a
         * single shared constant.
         */
        meta?: string;
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

  /**
   * Lead every list on the site, ahead of events with earlier dates.
   *
   * An editorial choice about what the community is actively pushing, not a
   * claim about the event — so it says nothing a visitor could be misled by,
   * and it is safe to move between records as campaigns change. Within the
   * featured group, and within the rest, ordering stays chronological.
   */
  featured?: boolean;

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
  /**
   * One line under the description, set in signal red.
   *
   * For the single thing a reader must not skim past. On the three-round
   * events that is the fact that no problem statement is issued — people
   * arrive expecting a brief, and finding out otherwise three sections later
   * is too late.
   */
  emphasis?: string;
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

  /**
   * Who is backing the event, in the order they should be credited.
   *
   * `role` is the billing, not a description — "Title sponsor", "Domain
   * partner" — because that is the thing a sponsor agreed to and the thing
   * they check for. The first entry is rendered larger than the rest, so the
   * title sponsor goes first and the order here is the order on the page.
   *
   * `logo` is a path under /public. The files there are pre-processed: each
   * one is knocked out to transparency, trimmed to its own ink and exported at
   * a common height, so they sit on the paper ground as marks rather than as
   * five mismatched rectangles. `name` stays required — it is the alt text,
   * and the fallback when a logo has not been supplied.
   */
  sponsors?: { name: string; role: string; logo?: string; href?: string }[];

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

/**
 * One open role in the recruitment programme.
 *
 * `anchor` is the fragment the role is linked by (`/hiring#organiser`), so it
 * is stable the same way an event slug is — changing it breaks any link
 * already shared. `support` is optional because only the organiser role has
 * something the community provides back; the other two would carry an empty
 * heading.
 */
export type Role = {
  /** Short ordinal shown large, e.g. "01". */
  code: string;
  anchor: string;
  title: string;
  /** Short mono label under the title. */
  kicker: string;
  /** One or two sentences. What the role actually is. */
  summary: string;
  responsibilities: string[];
  /** How many people we are taking for this role. */
  openings: number;

  /**
   * What the role returns, rendered first and rendered large.
   *
   * It leads because it is the thing applicants scroll looking for, and on
   * the first version of this page it sat sixth in a list of nine bullets.
   *
   * `kind` exists because not every role pays. Creators are recognition
   * only — credit, tagging, collaborations and exposure — and labelling that
   * block "What you are paid" would be a lie on the one page where being
   * straight about money matters most.
   */
  reward: { kind: "pay" | "recognition"; headline: string; detail: string };

  /** What the person gets, beyond the pay. */
  benefits: string[];
  /** What We Code Coders provides to make the role possible. */
  support?: { intro: string; items: string[] };
  /** Not requirements — the shape of a strong applicant. */
  skills?: string[];
  /** Targets the role is measured against, where it has any. */
  milestones?: string[];
};

/**
 * The terms that apply to every role.
 *
 * These are not fine print and the page does not render them as such. The
 * programme is performance-based with no guaranteed salary, and an applicant
 * has to be able to read that before they read a list of benefits — so it
 * lives in its own type rather than as a paragraph appended to each role.
 */
export type Programme = {
  /** The one-line statement of what this is. */
  premise: string;
  /**
   * How and when someone starts being paid.
   *
   * `headline` is the number, set large near the top of the page — this is
   * what an applicant is reading for, and burying it under process was the
   * old page's worst habit. `gate` is the milestone that unlocks it, and
   * `detail` is the sentence underneath.
   */
  pay: { headline: string; gate: string; detail: string };
  commitment: { label: string; detail: string }[];
  rounds: { round: string; title: string; detail: string; items?: string[] }[];
  /** What happens between "selected" and "started". */
  onboarding: { title: string; detail: string };
  conditions: string[];
  /**
   * Where applications are taken.
   *
   * No `href` is the honest state before the form exists: the page says
   * applications have not opened rather than rendering a button that goes
   * nowhere. Adding the URL here is the only edit needed to open it.
   */
  application: { href?: string; label?: string; note: string };
};
