// REAL. Every record here is an announced event with a real poster.
//
// Eight of them run the same twelve-day, three-round format and share their
// tracks, rounds, judging and rules from the SERIES_ constants below:
// tech-circuit, future-stack, code-axis, codex-48, codestar-30,
// codeverse-india, codehack-india and wcc-forge-48. Each runs from its own
// start date to that date plus eleven days.
//
// wcc-launchpad-30 is deliberately left on its original thirty-hour,
// single-submission format. protocol-60 is finished and marked `past`.
//
// The seven invented placeholder events that used to follow them are gone.
// They existed to give the rail and the ring something to hold before there
// was real content. With nine real events they were nearly half the ring, and
// every second slot a visitor scrolled past said "Not announced yet".
//
// We do not issue problem statements. A track is an area to work in, and
// choosing the problem inside it is the first thing a team is scored on. Copy
// that implies a brief will be handed out is wrong, and src/lib/events.test.ts
// fails the build on it.
//
// To add an event: copy a record, give it a unique `slug` and a unique
// `posterSeed`, and it appears everywhere automatically. To use a real
// poster image instead of the generated one, set `posterImage` to a path
// under /public. Nothing else needs changing.
//
// Set `featured: true` to put an event at the front of every list on the
// site. It is an editorial choice about what the community is pushing now,
// not a claim about the event, and it is what the October series carries.
//
// Set `locked: true` to hold an event back before it is announced. The record
// can be written out in full — the read seam in src/lib/events.ts strips it to
// an opaque placeholder, so none of it reaches the browser. Nothing is locked
// today; the machinery stays, and its redaction is unit-tested directly so
// that remains true while no record uses it.
//
// `place` is intentionally blank: the site does not advertise whether an
// event is online or in person. Fill it in only when there is a specific
// location worth naming, and it will appear wherever it is relevant.
//
// The Event type requires the fields a visitor needs before deciding to come
// — brief, deliverables, team size, eligibility. An event cannot be published
// half-described, because a page that answers nothing is worse than no page.

import type { Event, EventSection } from "@/lib/types";

/*
  The October 2026 hackathon series.

  Six events run the same format, so the tracks, the judging, the submission
  list and the rules are written once here and shared. That is not only to
  save lines: the promise made to entrants is that all six are judged on
  identical criteria, and the only way to keep that true as one of them is
  edited is for there to be a single copy to edit.

  What differs per event lives on the record itself — dates, duration, what
  the top three teams receive, and the poster.
*/

/**
 * The three tracks, identical across the series.
 *
 * Read the intro carefully before changing it. We do not issue problem
 * statements for these events and never have: a track is a area to work in,
 * and choosing the problem inside it is the first thing a team is judged on
 * ("User insight and problem evidence", 15 points). Copy that implies a
 * problem statement will be handed out is wrong, and it makes the first
 * judging criterion unanswerable.
 */
const SERIES_TRACKS: EventSection = {
  kind: "columns",
  label: "Tracks",
  intro:
    "Pick one track. A track is a field to work in, not a brief: we do not set the problem. Within your track, take on a problem that already exists or one you have found yourself, and build something that solves it. Proving that problem is real is the first thing judges score, before anything you have built on top of it. Work that spans more than one track is welcome, as long as the entry names its primary one.",
  items: [
    {
      code: "01",
      name: "Agentic AI",
      blurb:
        "Systems where AI agents reason, plan, use tools and finish useful work with proper human oversight. Judged on how useful the agent is, how well it is orchestrated, how reliably it runs, and how clearly a human stays in control.",
      points: [
        "Research and knowledge agents",
        "Customer-support agents",
        "Personal productivity assistants",
        "Multi-agent collaboration",
        "Business-process automation",
        "Developer and coding agents",
        "Responsible autonomous workflows",
        "Industry-specific copilots",
      ],
    },
    {
      code: "02",
      name: "Full-Stack Product Engineering",
      blurb:
        "A complete product rather than a demo: a front end someone can use, a back end that holds the state, and the plumbing between them working end to end. Judged on whether the whole journey runs, not on how much of it was started.",
      points: [
        "Web and mobile applications",
        "APIs, services and data models",
        "Authentication, permissions and accounts",
        "Payments, bookings and transactional flows",
        "Dashboards and internal tools",
        "Real-time and collaborative features",
        "Integrations with existing platforms",
        "Deployment, reliability and performance",
      ],
    },
    {
      code: "03",
      name: "Open Innovation",
      blurb:
        "A real problem, solved with whatever technology fits. The problem should be specific, the user should be clear, and the solution should measurably beat what people do today.",
      points: [
        "Accessibility",
        "Climate and sustainability",
        "Healthcare operations",
        "Finance and commerce",
        "Civic technology",
        "Community platforms",
        "Logistics and mobility",
        "Creator tools",
        "Safety and trust",
      ],
    },
  ],
};

/**
 * The three rounds.
 *
 * Deliberately silent about what happens in the gaps between rounds. The
 * judging intervals are internal; what an entrant needs to know is that
 * qualification updates reach the teams that qualify, and that is all this
 * says.
 */
/**
 * The dates a round covers, from the event's own start.
 *
 * Rounds sit on fixed offsets — 1-2, 5-7 and 10-12 — so every event can build
 * its own dates from one number. Written out rather than left to the reader
 * to work out from a start date and a round length, because "Round 2 — The
 * build" with no dates on it is the question everyone asks next.
 */
function span(startsAt: string, fromDay: number, toDay: number): string {
  const day = (offset: number) => {
    const d = new Date(startsAt);
    d.setDate(d.getDate() + offset);
    return d;
  };
  const fmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
  const a = fmt.format(day(fromDay));
  const b = fmt.format(day(toDay));
  return a === b ? a : `${a} — ${b}`;
}

/**
 * The three rounds, dated for one event.
 *
 * A function rather than a constant because the dates differ per event while
 * everything else is identical — the structure stays shared, which is what
 * the promise of "judged the same way" rests on.
 */
function seriesRounds(startsAt: string): EventSection {
  return {
  kind: "columns",
  label: "How the three rounds run",
  intro:
    "Three rounds, each asking for something the last did not. Qualification updates and the instructions for the next stage go directly to the teams that qualify, between rounds. One submission per round per team, made by the team leader — not one per member. No promotional posts, no social links and no video demonstrations are required; only the documents and project links listed here.",
  items: [
    {
      code: "01",
      meta: span(startsAt, 0, 1),
      name: "Round 1 — The plan",
      blurb:
        "Two days to make the case for what you are going to build. One PDF, on the format we provide: the problem, who has it, how you intend to solve it, what you will build and in what order. This round is the thinking — you are judged on how clear, original, feasible and promising the plan is, and the code comes in the rounds that follow.",
      points: [
        "The problem statement you chose or defined",
        "Who the users are",
        "Your proposed solution",
        "The product workflow",
        "The main features you intend to build",
        "The technology stack you plan to use",
        "Who on the team is responsible for what",
        "A development plan for the three rounds",
        "The impact you expect it to have",
        "Where the product could go after the event",
        "Team and participant details",
      ],
    },
    {
      code: "02",
      meta: span(startsAt, 4, 6),
      name: "Round 2 — The build",
      blurb:
        "Three days to build what you proposed. The central workflow and the essential features from Round 1 have to run end to end: a judge opens your link and uses the product. Rough edges are expected this early — a broken core is not.",
      points: [
        "A link to the functioning project",
        "The source-code repository",
        "An updated project PDF",
        "The list of features you completed",
        "Technology and implementation details",
        "An explanation of anything you changed from the original proposal",
        "The three major improvements you will make in Round 3 — substantial work on the product, not cosmetic tweaks, and you are judged on delivering them",
      ],
    },
    {
      code: "03",
      meta: span(startsAt, 9, 11),
      name: "Round 3 — The finish",
      blurb:
        "Three days to turn something that works into something people would use. Finish the features you left open, tighten the interface, repair the faults you already know about, test the main journeys and write the documentation. Round 2 proved the idea runs; this round decides whether it is a product.",
      points: [
        "The final working project link",
        "The final source-code repository",
        "The final product PDF",
        "The complete list of features",
        "A technical architecture and implementation summary",
        "The improvements you completed after Round 2, including the three you named",
        "Testing details",
        "A product roadmap and future development plan",
      ],
    },
  ],
  };
}

/**
 * Judging, identical across the series and to WCC Launchpad 30.
 *
 * The weights total 100 and are published, so a team can see where the marks
 * are before it decides what to spend the three rounds on.
 *
 * Nothing here scores the showcase posts. They are still required — a
 * submission without them is incomplete, and the rules say so — but they are
 * a condition of entry rather than a way to earn marks, so every point on the
 * sheet is for the product. The five they used to carry went back to the
 * solution, the engineering and the usability.
 */
function seriesJudging() {
  return [
    {
      name: "User insight and problem evidence",
      weight: "15 points",
      detail:
        "How well do you understand the person you are building for? Research, observation, interviews or survey data that shows the problem you chose is real.",
    },
    {
      name: "Strength of the core solution",
      weight: "22 points",
      detail:
        "Does the product solve the problem you named, directly? Is the main workflow focused, useful, and does it produce a clear outcome?",
    },
    {
      name: "Technical depth and reliability",
      weight: "22 points",
      detail:
        "How well have you used what you chose? Does it work consistently? Are the integrations, data flows and AI components put together with thought?",
    },
    {
      name: "Originality and differentiation",
      weight: "15 points",
      detail:
        "What makes this different from the tools that exist and the ideas that show up at every hackathon? A distinctive insight, interaction or approach.",
    },
    {
      name: "Real-world usability",
      weight: "11 points",
      detail:
        "Could the intended user work it out without a walkthrough? Is it accessible and practical in the setting it is meant for?",
    },
    {
      name: "Responsible design and trust",
      weight: "10 points",
      detail:
        "Privacy, security, bias, transparency, accessibility and human oversight, where they are relevant. Do users keep control of the decisions that matter?",
    },
    {
      name: "Improvement between rounds",
      weight: "5 points",
      detail:
        "How far the product travels: from the Round 1 proposal to the Round 2 build, and from there to the Round 3 finish. Delivering the three major improvements you named at Round 2 is what this measures.",
    },
  ];
}

/**
 * Rules, identical across the series.
 *
 * Rules 1 to 3 are the anti-backdating rules and they are deliberately blunt.
 * A hackathon that cannot say this plainly gets submissions that were built
 * the week before, and the teams who respected the clock lose to them.
 *
 * They state that the checking happens and stop there. Naming the signals we
 * look at would be a checklist for defeating them, so the rule says we do not
 * discuss the method — and nothing anywhere on this site should.
 */
const SERIES_RULES: EventSection = {
  kind: "list",
  label: "Rules",
  numbered: true,
  items: [
    "The product must be built inside the official hackathon window. Work that existed before the clock started does not count.",
    "We verify this. Submissions are checked, judges may ask a team to evidence that the work was done inside the window, and we do not discuss how those checks are run.",
    "A project found to have been built before the event does not win, however good it is. There is no partial credit for this and no appeal.",
    "You may research, plan and discuss ideas before the event. Thinking is not building.",
    "Existing libraries, APIs, frameworks and open-source components are allowed.",
    "Templates or code you wrote earlier must be clearly disclosed in the submission.",
    "Only work done during the event counts towards judging.",
    "AI, no-code and low-code tools are allowed, and the significant ones must be disclosed.",
    "Every participant belongs to one team only.",
    "The project must be the team's own work.",
    "Plagiarised, copied or misleading submissions are disqualified.",
    "Respect software licences, intellectual property and user privacy.",
    "Projects must not promote illegal, harmful or discriminatory activity.",
    "Everything on each round's submission list has to arrive before that round's deadline.",
    "One submission per round per team, made by the team leader. Individual members do not submit separately, and a second entry from the same team is not counted.",
    "Missing a round's deadline ends the event for that team. There is no late window.",
    "The three major improvements named at Round 2 are what Round 3 is measured against — name substantial work, then deliver it.",
    "Judges may ask for repository access or other proof of development at any point.",
    "Organisers may remove anyone who disrupts the event or breaks community guidelines.",
    "The judges' decision is final.",
  ],
};

/** The three shared blocks, in the order they appear on a detail page. */
/**
 * Everything after the tracks, for an event that publishes its own.
 *
 * WCC Forge 48 has four tracks of its own rather than the series' three, but
 * it runs the same three rounds and is judged on the same rules — so it takes
 * these two and keeps its own first block.
 */
const seriesTrailingSections = (startsAt: string): EventSection[] => [
  seriesRounds(startsAt),
  SERIES_RULES,
];

const seriesSections = (startsAt: string): EventSection[] => [
  SERIES_TRACKS,
  ...seriesTrailingSections(startsAt),
];

/** FAQ, identical across the series. */
function seriesFaq() {
  return [
    { q: "Is it free?", a: "Yes. Registration costs nothing." },
    { q: "How does it run?", a: "Three rounds: the plan, the build, then the finish. Dates for each round go out with the brief." },
    { q: "Are problem statements provided?", a: "No. You pick one of the three tracks, then either take a problem that already exists in it or define your own. Showing that the problem is real is worth 15 points." },
    { q: "What happens between rounds?", a: "Qualification updates and the instructions for the next stage go directly to the teams that qualify." },
    { q: "Who submits for the team?", a: "The team leader, once per round. Members do not submit separately." },
    { q: "Do I need a working product in Round 1?", a: "No. Round 1 is one PDF on the official format — the problem, the users, the solution, the workflow, the features, the stack and the plan." },
    { q: "What are the three improvements in Round 2?", a: "At Round 2 you name the three major improvements you will make in Round 3. They have to be substantial work on the product, not cosmetic changes, and Round 3 is measured against delivering them." },
    { q: "Can I take part on my own?", a: "Yes. Solo entries are allowed, and so are teams of up to four." },
    { q: "Can beginners enter?", a: "Yes. The event is built for first-timers and experienced builders alike, judged on the same criteria." },
    { q: "Can my team come from different colleges?", a: "Yes. Members can be from different institutions, cities or backgrounds entirely." },
    { q: "Can I use AI tools?", a: "Yes. Disclose the significant ones in your submission." },
    { q: "Can I use something I built earlier?", a: "No. The product has to be built during the event, and submissions are checked. Disclosed reusable components are fine; a finished project is not." },
    { q: "Can I change track?", a: "Yes, any time before the final submission. Only one primary track can be selected." },
    { q: "Is deployment compulsory?", a: "From Round 2 you need a link judges can open and use. If you cannot deploy, provide a reliable executable the judges can run." },
    { q: "Are social media posts required?", a: "No. Nothing on LinkedIn, Instagram or anywhere else is part of a submission, and no video demonstration is required." },
    { q: "What certificate do I get?", a: "The one for the furthest stage you reach. A valid Round 1 submission earns a National Participation Certificate, qualifying for Round 2 a National Round 2 Qualifier Certificate, reaching Round 3 a National Finalist Certificate, and winning a National Winner Certificate." },
  ];
}

/** Billing for the series. Identical on every poster in it. */
const SERIES_SPONSORS = [
  { name: "Inkloom", role: "Title sponsor", logo: "/sponsors/inkloom.png" },
  { name: "Unstop", role: "Official event partner", logo: "/sponsors/unstop.png" },
  { name: ".XYZ", role: "Domain partner", logo: "/sponsors/xyz.png" },
  {
    name: "We Code Coders",
    role: "Organised by",
    logo: "/sponsors/we-code-coders.png",
  },
];

export const events: Event[] = [
  {
    // LIVE. One of three announced events — real content, real posters.
    // Everything after them is still placeholder and locked.
    locked: false,
    slug: "wcc-launchpad-30",
    title: "WCC Launchpad 30",
    kicker: "HACKATHON — 30 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-04T10:00:00+05:30",
    endsAt: "2026-10-05T16:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "Thirty hours to turn one problem worth solving into a working product. National, online, free to enter, with ₹50,000 in cash and PPO opportunities for the top three teams.",
    description: [
      "WCC Launchpad 30 is a national online hackathon for students, developers, designers and anyone else who wants to find out what an idea looks like once it has to run.",
      "You get thirty hours to pick a problem that genuinely exists, build the one journey through it that matters, and show that it works. You do not need a startup, a rehearsed pitch, or years of experience behind you. You need a problem worth solving and the willingness to build.",
      "The aim is not the biggest project in the room. It is the clearest possible proof that your idea can work. A small product with one reliable, well-made workflow beats a pile of half-finished features almost every time.",
    ],
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "open innovation",
      "everyday automation",
      "online",
      "beginner-friendly",
      "product building",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "School and college students, developers, designers, no-code builders, first-timers and early-stage teams. Under-18s may be asked for a parent or guardian's permission.",
    brief:
      "Take one problem worth solving and turn it into something people can use, in thirty hours.",
    deliverables: [
      "A working product or prototype whose central workflow actually runs",
      "Source code judges can reach before the deadline",
      "The problem you chose and the evidence that it is real",
    ],
    schedule: [
      { when: "Sun 4 Oct, 10:00", what: "The brief, the tracks and the submission list go out. Building starts." },
      { when: "Mon 5 Oct, 14:00", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "Mon 5 Oct, 16:00", what: "Building period ends. Judging begins on what was submitted." },
      { when: "After the event", what: "Judging on what was submitted, and then the winners are announced." },
    ],
    judging: [
      {
        name: "User insight and problem evidence",
        weight: "15 points",
        detail:
          "How well do you understand the person you are building for? Research, observation, interviews or survey data that shows the problem is real.",
      },
      {
        name: "Strength of the core solution",
        weight: "24 points",
        detail:
          "Does the product solve the problem you named, directly? Is the main workflow focused, useful, and does it produce a clear outcome?",
      },
      {
        name: "Technical depth and reliability",
        weight: "24 points",
        detail:
          "How well have you used what you chose? Does it work consistently? Are the integrations, data flows and AI components put together with thought?",
      },
      {
        name: "Originality and differentiation",
        weight: "15 points",
        detail:
          "What makes this different from the tools that exist and the ideas that show up at every hackathon? A distinctive insight, interaction or approach.",
      },
      {
        name: "Real-world usability",
        weight: "12 points",
        detail:
          "Could the intended user work it out without a walkthrough? Is it accessible and practical in the setting it is meant for?",
      },
      {
        name: "Responsible design and trust",
        weight: "10 points",
        detail:
          "Privacy, security, bias, transparency, accessibility and human oversight, where they are relevant. Do users keep control of the decisions that matter?",
      },
    ],
    rewards: [
      "₹50,000 in cash, split across the top three teams",
      "PPO opportunities for the top three teams",
      "100+ winners across the hackathon and the mini-challenges",
      "T-shirts, pens and stickers",
      "Miro AI access, n8n, a .XYZ domain and Lovable Premium",
      "A verifiable digital participation certificate",
      "Sponsor challenges and surprise rewards through the thirty hours",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: [
      {
        kind: "columns",
        label: "Tracks",
        intro:
          "Choose one track from those below. A track is the area you work in — it is not a problem statement. Inside the track you pick, you identify your own problem and build the solution to it. Nobody hands you a brief, and finding a problem worth solving — then showing it is real — is the first thing the judges score. Interdisciplinary projects are welcome, but the entry has to name its primary track.",
        items: [
          {
            code: "01",
            name: "Agentic AI",
            blurb:
              "Systems where AI agents reason, plan, use tools and finish useful work with proper human oversight. Judged on how useful the agent is, how well it is orchestrated, how reliably it runs, and how clearly a human stays in control.",
            points: [
              "Research and knowledge agents",
              "Customer-support agents",
              "Personal productivity assistants",
              "Multi-agent collaboration",
              "Business-process automation",
              "Developer and coding agents",
              "Responsible autonomous workflows",
              "Industry-specific copilots",
            ],
          },
          {
            code: "02",
            name: "Open Innovation",
            blurb:
              "A real problem, solved with whatever technology fits. The problem should be specific, the user should be clear, and the solution should measurably beat what people do today.",
            points: [
              "Accessibility",
              "Climate and sustainability",
              "Healthcare operations",
              "Finance and commerce",
              "Civic technology",
              "Community platforms",
              "Logistics and mobility",
              "Creator tools",
              "Safety and trust",
            ],
          },
          {
            code: "03",
            name: "Everyday Automation",
            blurb:
              "Tools that take a repetitive, unglamorous job off someone's day and do it reliably. The result is measured in time given back and mistakes stopped — an automation that has to be watched every run has not automated anything.",
            points: [
              "Personal and team workflow automation",
              "Documents, forms and paperwork",
              "Inbox, calendar and scheduling",
              "Data entry, cleanup and reconciliation",
              "Reports and status updates that write themselves",
              "Small-business and household operations",
              "Monitoring, alerting and follow-ups",
              "Glue between the tools people already use",
            ],
          },
        ],
      },
      {
        kind: "list",
        label: "Rules",
        numbered: true,
        items: [
          "The core product must be built during the official hackathon period.",
          "You may research and discuss ideas before the event.",
          "Existing libraries, APIs, frameworks and open-source components are allowed.",
          "Templates or code you wrote earlier must be clearly disclosed.",
          "Only work done during the event counts towards judging.",
          "AI, no-code and low-code tools are allowed.",
          "Every participant belongs to one team only.",
          "The project must be the team's own work.",
          "Plagiarised, copied or misleading submissions are disqualified.",
          "Respect software licences, intellectual property and user privacy.",
          "Projects must not promote illegal, harmful or discriminatory activity.",
          "Everything on the submission list has to arrive before the deadline.",
          "Judges may ask for repository access or other proof of development.",
          "Organisers may remove anyone who disrupts the event or breaks community guidelines.",
          "The judges' decision is final.",
        ],
      },
    ],
    faq: [
      { q: "Is it free?", a: "Yes. Registration costs nothing." },
      { q: "Can I take part on my own?", a: "Yes. Solo entries are allowed, and so are teams of up to four." },
      { q: "Can beginners enter?", a: "Yes. The event is built for first-timers and experienced builders alike, judged on the same criteria." },
      { q: "Can my team come from different colleges?", a: "Yes. Members can be from different institutions, cities or backgrounds entirely." },
      { q: "Can I use AI tools?", a: "Yes. Disclose the significant ones in your submission." },
      { q: "Can I change track?", a: "Yes, any time before final submission. Only one primary track can be selected." },
      { q: "Is deployment compulsory?", a: "Strongly recommended. If you cannot deploy, provide a reliable executable demo and a video." },
      { q: "Will everyone get a certificate?", a: "Certificates go to participants who submit a valid project on time and follow the rules. Registering alone does not qualify." },
    ],
    stats: [
      { label: "Hours to build", value: "30" },
      { label: "Cash prize", value: "₹50,000" },
      { label: "Winners", value: "100+" },
      { label: "Per team", value: "1–4" },
    ],
    sponsors: [
      { name: "Inkloom", role: "Title sponsor", logo: "/sponsors/inkloom.png" },
      { name: "Miro", role: "Tooling partner", logo: "/sponsors/miro.png" },
      { name: "n8n", role: "Tooling partner" },
      { name: ".XYZ", role: "Domain partner", logo: "/sponsors/xyz.png" },
      { name: "Unstop", role: "Official event partner", logo: "/sponsors/unstop.png" },
      {
        name: "We Code Coders",
        role: "Community partner",
        logo: "/sponsors/we-code-coders.png",
      },
    ],
    registration: {
      href: "https://unstop.com/p/wcc-launchpad-30-wecodecoders-1751873",
      label: "Register on Unstop",
      note: "Free to enter, in teams of one to four. Registration and submissions run through Unstop; joining details go out by email and the official event channel.",
    },
    // The seed no longer composes anything — posterImage wins — but its ground
    // still tints hover states and the ring's glow, so it is chosen to land on
    // "paper", which is what the artwork is printed on.
    posterSeed: 8002,
    posterImage: "/posters/wcc-launchpad-30-v6.webp",
  },
  {
    locked: false,
    slug: "protocol-60",
    title: "Protocol//60",
    kicker: "QUIZ — ONE SITTING",
    format: "quiz",
    status: "past",
    startsAt: "2026-10-03T17:00:00+05:30",
    endsAt: "2026-10-03T19:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online quiz on MCP, ACP and how AI agents actually talk to tools and to each other. Top 60 each take home all three rewards.",
    description: [
      "Modern AI has moved past the standalone chatbot. Agents connect to tools, pull in context, take actions and hand work to other systems. Protocol//60 asks how well you understand the protocols underneath that shift.",
      "The questions are conceptual, technical and situational. You will be asked to spot the right protocol concept, read a proposed agent workflow and find what is wrong with it, and choose between approaches to interoperability. Memorising definitions will not get you far.",
      "The top 60 on the leaderboard each receive the complete reward bundle — not one prize split three ways, but all three to every winner. Everyone who completes the quiz properly gets a verifiable certificate.",
    ],
    forWho: "Students, developers, AI enthusiasts and anyone curious about how agents work.",
    tags: [
      "mcp",
      "acp",
      "ai agents",
      "automation",
      "interoperability",
      "online",
      "beginner-friendly",
    ],
    teamSize: "Individual. Everyone registers and attempts on their own.",
    eligibility:
      "School and college students, developers, AI and automation builders, no-code creators and anyone exploring agents. No professional MCP or ACP experience needed.",
    brief: "Understand the protocols. Crack the challenge. Finish in the top 60.",
    deliverables: [
      "One timed attempt, submitted before the clock runs out",
      "Optional mini-challenges, for extra rewards and recognition",
    ],
    schedule: [
      {
        when: "Before",
        what: "Register, join the official channel, read the participant guide and review the recommended MCP and ACP resources",
      },
      { when: "3 Oct", what: "Join through the official link, check in, read the final instructions" },
      { when: "The quiz", what: "One attempt. The timer runs until you submit or it expires." },
      { when: "Alongside", what: "Optional mini-challenges, running separately from the main leaderboard" },
      { when: "After", what: "Responses validated, leaderboard reviewed, top 60 announced, certificates issued" },
    ],
    judging: [
      { name: "Total score", detail: "The primary ranking. Everything below is used to separate people who tie." },
      { name: "Correct answers", detail: "How many you got right across the paper." },
      { name: "Accuracy", detail: "Right answers against attempted ones, across the whole quiz." },
      {
        name: "Completion time",
        detail: "Used as a tie-breaker, alongside designated tie-breaker questions where needed.",
      },
    ],
    rewards: [
      "Top 60 each receive Lovable access or benefits",
      "Top 60 each receive one .XYZ domain",
      "A verifiable digital participation certificate for everyone who completes the quiz",
      "Additional rewards and recognition through the optional mini-challenges",
    ],
    sections: [
      {
        kind: "columns",
        label: "What the quiz covers",
        intro:
          "The participant guide names the recommended reading and the exact protocol versions in scope.",
        items: [
          {
            code: "01",
            name: "MCP foundations",
            points: [
              "Purpose and core concepts",
              "Clients, servers and connected applications",
              "Tools, resources and prompts",
              "Context exchange between systems",
              "Capability discovery",
              "Request-and-response flows",
              "Permission and access boundaries",
              "Connecting models to external services",
            ],
          },
          {
            code: "02",
            name: "ACP foundations",
            points: [
              "Purpose and core concepts",
              "Communication between agents and services",
              "Tasks, messages and responses",
              "Agent discovery and collaboration",
              "Structured information exchange",
              "Long-running operations",
              "Multi-agent coordination",
            ],
          },
          {
            code: "03",
            name: "Agent interoperability",
            points: [
              "How independent systems work together",
              "Passing context between tools and agents",
              "Designing workflows that hold up",
              "Human approval and oversight",
              "Handling failures and partial responses",
              "Avoiding duplicated or conflicting actions",
              "Choosing the right protocol for the job",
            ],
          },
          {
            code: "04",
            name: "Security and responsible design",
            points: [
              "Authentication and authorisation",
              "User consent",
              "Data privacy and access control",
              "Prompt injection and unsafe tool use",
              "Logging and traceability",
              "Limiting agent permissions",
              "Human control over decisions that matter",
            ],
          },
          {
            code: "05",
            name: "Practical scenarios",
            points: [
              "Connecting an assistant to external tools",
              "Building research and productivity agents",
              "Coordinating specialised agents",
              "Automating repetitive workflows",
              "Choosing a communication structure",
              "Spotting unsafe or unreliable implementations",
              "Improving a workflow that already exists",
            ],
          },
        ],
      },
      {
        kind: "list",
        label: "Format",
        intro:
          "Fifteen minutes, one official attempt, taken any time inside the two-hour access window. The final question count and marking scheme come with the participant instructions.",
        items: [
          "Multiple-choice and multiple-select questions",
          "Technical concept questions",
          "Scenario-based questions",
          "Workflow analysis questions",
          "Short visual and code-based questions",
          "Once it starts, the timer runs until you submit or time expires",
          "Answers submitted after the deadline are not accepted",
        ],
      },
      {
        kind: "list",
        label: "Rules and fair play",
        numbered: true,
        items: [
          "One registration and one attempt per person.",
          "Use accurate personal and contact details.",
          "The quiz is attempted individually.",
          "Do not share questions or answers during the event.",
          "Working with another person during the live quiz is prohibited.",
          "No search engines, AI assistants, group chats or outside help during the quiz unless explicitly allowed.",
          "Do not copy, record, publish or redistribute the questions.",
          "No automated answering tools, scripts, bots or browser manipulation.",
          "Do not impersonate anyone else.",
          "Duplicate, manipulated or suspicious entries may be disqualified.",
          "Finish within the official event window.",
          "Report technical problems immediately through the official support channel.",
          "Organisers may review activity and response patterns to keep the event fair.",
          "Breaking the rules can cost you your leaderboard position, rewards and certificate.",
          "The organisers' decision on eligibility, ranking and disqualification is final.",
        ],
      },
      {
        kind: "list",
        label: "What you need",
        intro:
          "Open the quiz link before the scheduled start and make sure your device is charged. A second attempt cannot be guaranteed for connectivity trouble, device failure or an accidental close.",
        items: [
          "A laptop, desktop, tablet or supported smartphone",
          "A modern, updated browser",
          "A reliable internet connection",
          "Access to the email address you registered with",
          "The official event communication channel",
          "A quiet place to sit the timed quiz",
        ],
      },
    ],
    faq: [
      {
        q: "Is this a quiz or a hackathon?",
        a: "A quiz, on MCP, ACP and AI-agent concepts. It is a separate event from WCC Launchpad 30.",
      },
      { q: "Is it free?", a: "Yes. Registration costs nothing." },
      { q: "Can I take part as a team?", a: "No. This one is individual." },
      { q: "Can beginners take part?", a: "Yes. Recommended learning resources go out before the event." },
      {
        q: "What do the top 60 get?",
        a: "Each of them gets the full bundle: Lovable benefits and one .XYZ domain. The rewards are not split into separate categories.",
      },
      {
        q: "Will everyone get a certificate?",
        a: "Everyone who registers, joins through the official link, completes and submits the quiz, follows the rules and passes the integrity checks. Registering alone does not qualify.",
      },
      {
        q: "Are the mini-challenges compulsory?",
        a: "No. They are optional, and they run separately from the main top-60 leaderboard unless announced otherwise beforehand.",
      },
      {
        q: "How are winners chosen?",
        a: "By score first. Accuracy, completion time and designated tie-breaker questions separate people who tie.",
      },
      {
        q: "When do I get the joining link?",
        a: "Before the event, by email and through the official event channel.",
      },
      {
        q: "When are results and rewards announced?",
        a: "After the responses are validated and the leaderboard is reviewed. Timelines are shared through the same two channels.",
      },
    ],
    stats: [
      { label: "Winners", value: "60" },
      { label: "Rewards each", value: "3" },
      { label: "Entry fee", value: "₹0" },
      { label: "Quiz length", value: "15 min" },
    ],
    sponsors: [
      { name: "Inkloom", role: "Title sponsor", logo: "/sponsors/inkloom.png" },
      { name: ".XYZ", role: "Domain partner", logo: "/sponsors/xyz.png" },
      { name: "Unstop", role: "Official event partner", logo: "/sponsors/unstop.png" },
    ],
    // As above: the seed only chooses the accent now, and "paper" matches the
    // poster it is tinting.
    posterSeed: 8016,
    posterImage: "/posters/protocol-60-v2.webp",
  },
  {
    // LIVE. Third announced event.
    locked: false,
    slug: "wcc-forge-48",
    title: "WCC Forge 48",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-30T18:00:00+05:30",
    endsAt: "2026-11-10T18:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "Three rounds to turn a problem worth solving into a product that runs. National, online, free to enter, with ₹25,000 in cash and PPO opportunities for the top three teams.",
    description: [
      "WCC Forge 48 asks for one thing: a working product. Not a deck, not a concept, not an idea you would build if you had more time — something a person can open and use by the time the last round closes.",
      "Three rounds to find a problem that genuinely exists, choose the single journey through it that matters most, and build that journey until it runs reliably. Scope is the hard part. Teams here rarely run out of ideas — they run out of decisions.",
      "Projects are judged on whether they work and whether they are worth using. A narrow product with one dependable workflow beats a broad one held together with screenshots.",
    ],
    emphasis:
      "Nobody hands you a problem statement. Pick a track, bring a problem worth solving, and show that it is real — that is the first thing the judges score.",
    forWho: "Students, developers, designers, AI builders and first-time hackers.",
    tags: [
      "agentic ai",
      "digital twins",
      "human-computer interaction",
      "open innovation",
      "online",
      "product building",
    ],
    teamSize: "1 to 4. Every member registers individually under the same team name.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is free and open nationally.",
    brief:
      "Find a problem worth solving and build the one workflow that solves it, across three rounds.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "A certificate at the level you reached — participant, Round 2 qualifier, finalist or winner",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Before it starts", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Fri 30 Oct — Sat 31 Oct", what: "Round 1. The official PDF format goes out; two days to submit the idea and the plan." },
      { when: "Tue 3 Nov — Thu 5 Nov", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Sun 8 Nov — Tue 10 Nov", what: "Round 3. Three days to finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Qualification updates and the instructions for the next stage go to the teams that qualify." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: [
      {
        name: "Working product and execution",
        weight: "30%",
        detail:
          "Does it actually run? The central workflow has to work end to end, not in a screenshot. Reliability counts for more than surface area.",
      },
      {
        name: "Real-world usefulness and impact",
        weight: "20%",
        detail:
          "Is the problem real, is the user specific, and does the product measurably beat what that person does today?",
      },
      {
        name: "Innovation and originality",
        weight: "20%",
        detail:
          "What makes this different from the tools that already exist and the ideas that turn up at every hackathon? A distinctive insight, interaction or approach.",
      },
      {
        name: "Technical implementation",
        weight: "20%",
        detail:
          "How well is it built? Architecture, data flows, integrations and AI components put together with thought rather than glued together to demo once.",
      },
      {
        name: "Usability and real-world fit",
        weight: "10%",
        detail:
          "Could the intended user work it out without a walkthrough? Is it accessible and practical in the setting it is meant for?",
      },
    ],
    rewards: [
      "₹25,000 in cash, shared among the top three teams",
      "PPO opportunities for the top three teams",
      "100+ reward recipients across the hackathon, giveaways and mini-challenges",
      "Special awards for exceptional projects",
      "Lovable Premium, AI tools and a .XYZ domain",
      "T-shirts, stickers, pens and merchandise",
      "Workshops, technical resources and community access",
      "Winner, finalist and participation certificates",
      "Your project promoted through We Code Coders and its partner communities",
    ],
    sections: [
      {
        kind: "columns",
        label: "Tracks",
        intro:
          "Pick one track. A track is a field to work in, not a brief: we do not set the problem. Within your track, take on a problem that already exists or one you have found yourself, and build something that solves it. Proving that problem is real is the first thing judges score, before anything you have built on top of it. Work that spans more than one track is welcome, as long as the entry names its primary one.",
        items: [
          {
            code: "01",
            name: "Agentic AI",
            blurb:
              "Autonomous agents that reason, plan, use tools and finish multi-step work — with a human still able to see and steer what they do.",
            points: [
              "Multi-agent business systems",
              "Research and knowledge agents",
              "AI coding and testing agents",
              "Autonomous education assistants",
              "Workflow and productivity agents",
            ],
          },
          {
            code: "02",
            name: "Digital Twins & Predictive Intelligence",
            blurb:
              "A digital representation of a real system, fed by data, used to monitor it, simulate it or predict what it does next.",
            points: [
              "Smart campus digital twins",
              "Supply-chain simulations",
              "Traffic and mobility prediction",
              "Energy-consumption monitoring",
              "Healthcare operations",
              "Disaster-management systems",
            ],
          },
          {
            code: "03",
            name: "Next-Generation HCI",
            blurb:
              "New ways for people to talk to software — beyond a form and a button. Judged on whether the interface genuinely suits the task.",
            points: [
              "Voice-controlled applications",
              "Gesture-based systems",
              "Computer-vision interfaces",
              "AR and VR experiences",
              "Multimodal AI applications",
              "Accessibility-focused interfaces",
            ],
          },
          {
            code: "04",
            name: "Open Innovation",
            blurb:
              "Any real problem, any industry, any stack. The problem should be specific and the user should be someone you can name.",
            points: [
              "Choose your own industry and audience",
              "Any technology or framework",
              "Judged on the same criteria as every other track",
            ],
          },
        ],
      },
      ...seriesTrailingSections("2026-10-30T18:00:00+05:30"),
    ],
    faq: [
      { q: "Is it free?", a: "Yes. Registration costs nothing." },
      { q: "Can I take part on my own?", a: "Yes. Solo entries are allowed, and so are teams of up to four." },
      { q: "Can beginners enter?", a: "Yes. The tracks are broad enough that a first project and an experienced team can both find something to build." },
      { q: "Does every team member have to register?", a: "Yes, individually — and everyone must use the same team name so the entries can be matched up." },
      { q: "Can my team come from different colleges?", a: "Yes. Members can be from different institutions, cities or backgrounds entirely." },
      { q: "Can I use AI tools?", a: "Yes. Disclose the significant ones, along with any reused code, APIs and datasets, in your submission." },
      { q: "Can I bring an existing project?", a: "Not as it stands. The main solution has to be built during the event, and an old project resubmitted without significant new work does not qualify." },
      { q: "Is deployment compulsory?", a: "Strongly recommended. If you cannot deploy, provide a reliable executable the judges can run." },
      { q: "When are results announced?", a: "Within seven to ten days of the hackathon ending, once every eligible submission has been judged." },
      { q: "Will everyone get a certificate?", a: "A verifiable participation certificate goes to every eligible participant who makes a valid final submission. Registering without submitting does not qualify." },
      { q: "How is the cash split?", a: "Across the top three teams. The exact split is announced before the hackathon begins." },
      { q: "Are the PPO opportunities guaranteed?", a: "No. They are subject to the recruiting partner's own eligibility requirements and selection process." },
    ],
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Cash prize", value: "₹25,000" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
    ],
    sponsors: [
      { name: "Inkloom", role: "Title sponsor", logo: "/sponsors/inkloom.png" },
      { name: "Unstop", role: "Official event partner", logo: "/sponsors/unstop.png" },
      { name: ".XYZ", role: "Domain partner", logo: "/sponsors/xyz.png" },
    ],
    registration: {
      href: "https://unstop.com/p/wcc-forge-48-wecodecoders-1756040",
      label: "Register on Unstop",
      note: "Free to enter, in teams of one to four. Registration closes 29 October at 23:59 IST, and every member registers individually on Unstop under the same team name.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9001,
    posterImage: "/posters/wcc-forge-48-v2.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Tracks,
    // judging and rules are shared with the other five.
    locked: false,
    featured: true,
    slug: "tech-circuit",
    title: "TechCircuit",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-20T10:00:00+05:30",
    endsAt: "2026-10-31T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online hackathon where students, developers and designers build functional technology products that address real problems. Three rounds, free to enter, teams of one to four.",
    description: [
      "TechCircuit is a national-level online hackathon for students, developers and designers who want to build something that actually runs.",
      "The aim is not the biggest project in the room. It is the clearest possible proof that your idea works. One reliable, well-made workflow beats a pile of half-finished features almost every time.",
    ],
    emphasis:
      "Nobody hands you a problem statement. Pick a track, bring a problem worth solving, and show that it is real — that is the first thing the judges score.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "open innovation",
      "online",
      "national",
      "three rounds",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is free and open nationally.",
    brief:
      "Find a problem worth solving, plan it, build it and finish it across three rounds.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "A certificate at the level you reached — participant, Round 2 qualifier, finalist or winner",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Until Mon 19 Oct, 23:59", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Tue 20 Oct — Wed 21 Oct", what: "Round 1. The official PDF format goes out; two days to submit the idea and the plan." },
      { when: "Sat 24 Oct — Mon 26 Oct", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Thu 29 Oct — Sat 31 Oct", what: "Round 3. Three days to finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Qualification updates and the instructions for the next stage go to the teams that qualify." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: seriesJudging(),
    rewards: [
      "PPO opportunities for the top three teams",
      "Incubation opportunities for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across track awards, sponsor challenges, mini-challenges and giveaways",
      "A National Participation Certificate for every valid Round 1 submission",
      "A National Round 2 Qualifier Certificate for teams that reach Round 2",
      "A National Finalist Certificate for teams that reach Round 3",
      "A National Winner Certificate for the winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-20T10:00:00+05:30"),
    faq: seriesFaq(),
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
      { label: "Entry", value: "Free" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/techcircuit-hackathon-wecodecoders-1758409",
      label: "Register on Unstop",
      note: "Free to enter, in teams of one to four. Registration closes 19 October at 23:59 IST.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9101,
    posterImage: "/posters/tech-circuit-v2.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Tracks,
    // judging and rules are shared with the other five.
    locked: false,
    featured: true,
    slug: "future-stack",
    title: "FutureStack",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-20T10:00:00+05:30",
    endsAt: "2026-10-31T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "Three rounds to turn an idea into a finished product with modern tooling. National, online, free to enter, with PPO and incubation opportunities for the top three teams.",
    description: [
      "FutureStack is a national-level online hackathon for students, developers and designers who want to turn an idea into something functional.",
      "Modern tooling is encouraged and AI tools are allowed, as long as you disclose the significant ones. What is judged is whether the thing runs and whether it helps somebody.",
    ],
    emphasis:
      "Nobody hands you a problem statement. Pick a track, bring a problem worth solving, and show that it is real — that is the first thing the judges score.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "open innovation",
      "online",
      "national",
      "three rounds",
    ],
    teamSize: "1 to 6. Every participant belongs to one team only.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is free and open nationally.",
    brief:
      "Take an idea, choose a track, and carry it from a plan to a finished product.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "A certificate at the level you reached — participant, Round 2 qualifier, finalist or winner",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Until Mon 19 Oct, 23:59", what: "Registration open. Form a team of one to six and join the official channel." },
      { when: "Tue 20 Oct — Wed 21 Oct", what: "Round 1. The official PDF format goes out; two days to submit the idea and the plan." },
      { when: "Sat 24 Oct — Mon 26 Oct", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Thu 29 Oct — Sat 31 Oct", what: "Round 3. Three days to finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Qualification updates and the instructions for the next stage go to the teams that qualify." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: seriesJudging(),
    rewards: [
      "PPO opportunities for the top three teams",
      "Incubation opportunities for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across track awards, sponsor challenges, mini-challenges and giveaways",
      "A National Participation Certificate for every valid Round 1 submission",
      "A National Round 2 Qualifier Certificate for teams that reach Round 2",
      "A National Finalist Certificate for teams that reach Round 3",
      "A National Winner Certificate for the winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-20T10:00:00+05:30"),
    faq: seriesFaq(),
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–6" },
      { label: "Entry", value: "Free" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/futurestack-hackathon-wecodecoders-1758558",
      label: "Register on Unstop",
      note: "Free to enter, in teams of one to six. Registration closes 19 October at 23:59 IST.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9102,
    posterImage: "/posters/future-stack-v3.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Tracks,
    // judging and rules are shared with the other five.
    locked: false,
    featured: true,
    slug: "code-axis",
    title: "CodeAxis",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-20T10:00:00+05:30",
    endsAt: "2026-10-31T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online hackathon focused on practical, technology-driven solutions to problems that actually matter. Three rounds, three tracks, free to enter.",
    description: [
      "CodeAxis is a national-level online hackathon about practical solutions rather than impressive-sounding ones.",
      "A small product with one dependable workflow is a better submission than an ambitious one that cannot be demonstrated.",
    ],
    emphasis:
      "Nobody hands you a problem statement. Pick a track, bring a problem worth solving, and show that it is real — that is the first thing the judges score.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "open innovation",
      "online",
      "national",
      "three rounds",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is free and open nationally.",
    brief:
      "Build a practical solution to a real problem, and finish it across three rounds.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "A certificate at the level you reached — participant, Round 2 qualifier, finalist or winner",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Until Mon 19 Oct, 23:59", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Tue 20 Oct — Wed 21 Oct", what: "Round 1. The official PDF format goes out; two days to submit the idea and the plan." },
      { when: "Sat 24 Oct — Mon 26 Oct", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Thu 29 Oct — Sat 31 Oct", what: "Round 3. Three days to finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Qualification updates and the instructions for the next stage go to the teams that qualify." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: seriesJudging(),
    rewards: [
      "PPO opportunities for the top three teams",
      "Incubation opportunities for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across track awards, sponsor challenges, mini-challenges and giveaways",
      "A National Participation Certificate for every valid Round 1 submission",
      "A National Round 2 Qualifier Certificate for teams that reach Round 2",
      "A National Finalist Certificate for teams that reach Round 3",
      "A National Winner Certificate for the winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-20T10:00:00+05:30"),
    faq: seriesFaq(),
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
      { label: "Entry", value: "Free" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codeaxis-hackathon-wecodecoders-1758538",
      label: "Register on Unstop",
      note: "Free to enter, in teams of one to four. Registration closes 19 October at 23:59 IST.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9103,
    posterImage: "/posters/code-axis-v2.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Tracks,
    // judging and rules are shared with the other five.
    locked: false,
    featured: true,
    slug: "codex-48",
    title: "Codex 48",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-24T10:00:00+05:30",
    endsAt: "2026-11-04T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "Three rounds to turn an original idea into a finished, working product. National, online, free, with paid internship and incubation opportunities for the top three teams.",
    description: [
      "Codex 48 is a national-level AI and full-stack online hackathon, run across three rounds — one original idea carried from a plan to a product that runs.",
      "Original means built here. Research and planning beforehand are fine; a codebase that existed last week is not, and submissions are checked.",
    ],
    emphasis:
      "Nobody hands you a problem statement. Pick a track, bring a problem worth solving, and show that it is real — that is the first thing the judges score.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "open innovation",
      "online",
      "national",
      "three rounds",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is free and open nationally.",
    brief:
      "Turn an original idea into a finished product across three rounds.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "A certificate at the level you reached — participant, Round 2 qualifier, finalist or winner",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Before it starts", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Sat 24 Oct — Sun 25 Oct", what: "Round 1. The official PDF format goes out; two days to submit the idea and the plan." },
      { when: "Wed 28 Oct — Fri 30 Oct", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Mon 2 Nov — Wed 4 Nov", what: "Round 3. Three days to finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Qualification updates and the instructions for the next stage go to the teams that qualify." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: seriesJudging(),
    rewards: [
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across track awards, sponsor challenges, mini-challenges and giveaways",
      "A National Participation Certificate for every valid Round 1 submission",
      "A National Round 2 Qualifier Certificate for teams that reach Round 2",
      "A National Finalist Certificate for teams that reach Round 3",
      "A National Winner Certificate for the winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-24T10:00:00+05:30"),
    faq: seriesFaq(),
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
      { label: "Entry", value: "Free" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codex-48-national-level-hackathon-wecodecoders-1761082",
      label: "Register on Unstop",
      note: "Free to enter, in teams of one to four.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9104,
    posterImage: "/posters/codex-48-v1.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Tracks,
    // judging and rules are shared with the other five.
    locked: false,
    featured: true,
    slug: "codestar-30",
    title: "CodeStar 30",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-25T10:00:00+05:30",
    endsAt: "2026-11-05T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "Three rounds for students and young builders to develop and present a functional technology product. National, online, free, with paid internship and incubation opportunities for the top three teams.",
    description: [
      "CodeStar 30 is a national-level AI and full-stack online hackathon, run across three rounds.",
      "The format rewards scope discipline. Choose one of the three tracks, choose a problem inside it, and build the single journey that proves your idea works rather than the five that show what it could become.",
    ],
    emphasis:
      "Nobody hands you a problem statement. Pick a track, bring a problem worth solving, and show that it is real — that is the first thing the judges score.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "open innovation",
      "online",
      "national",
      "three rounds",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is free and open nationally.",
    brief:
      "Develop and present a functional product across three rounds.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "A certificate at the level you reached — participant, Round 2 qualifier, finalist or winner",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Before it starts", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Sun 25 Oct — Mon 26 Oct", what: "Round 1. The official PDF format goes out; two days to submit the idea and the plan." },
      { when: "Thu 29 Oct — Sat 31 Oct", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Tue 3 Nov — Thu 5 Nov", what: "Round 3. Three days to finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Qualification updates and the instructions for the next stage go to the teams that qualify." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: seriesJudging(),
    rewards: [
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across track awards, sponsor challenges, mini-challenges and giveaways",
      "A National Participation Certificate for every valid Round 1 submission",
      "A National Round 2 Qualifier Certificate for teams that reach Round 2",
      "A National Finalist Certificate for teams that reach Round 3",
      "A National Winner Certificate for the winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-25T10:00:00+05:30"),
    faq: seriesFaq(),
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
      { label: "Entry", value: "Free" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codestar-30-national-level-hackathon-wecodecoders-1760472",
      label: "Register on Unstop",
      note: "Free to enter, in teams of one to four.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9105,
    posterImage: "/posters/codestar-30-v1.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Tracks,
    // judging and rules are shared with the other six.
    locked: false,
    featured: true,
    slug: "codeverse-india",
    title: "CodeVerse India",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-30T09:00:00+05:30",
    endsAt: "2026-11-10T09:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online AI and coding hackathon: three rounds, one finished product. Free to enter, teams of one to four, with paid internship and incubation opportunities for the top three teams.",
    description: [
      "CodeVerse India is a national-level online AI and coding hackathon, run across three rounds — one idea carried from a plan to a thing that runs.",
      "Open to undergraduates, postgraduates and students from engineering, management, arts, commerce and the sciences alike. The criteria are the same for everyone.",
    ],
    emphasis:
      "Nobody hands you a problem statement. Pick a track, bring a problem worth solving, and show that it is real — that is the first thing the judges score.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "open innovation",
      "online",
      "national",
      "three rounds",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "Undergraduate and postgraduate students across engineering, management, arts, commerce and the sciences, alongside developers, designers, AI and no-code builders and first-timers. Registration is free and open nationally.",
    brief:
      "Build a working product across three rounds, in the track of your choosing.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "A certificate at the level you reached — participant, Round 2 qualifier, finalist or winner",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Until Thu 29 Oct, 07:30", what: "Registration open. Form a team of one to four and join the official group." },
      { when: "Fri 30 Oct — Sat 31 Oct", what: "Round 1. The official PDF format goes out; two days to submit the idea and the plan." },
      { when: "Tue 3 Nov — Thu 5 Nov", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Sun 8 Nov — Tue 10 Nov", what: "Round 3. Three days to finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Qualification updates and the instructions for the next stage go to the teams that qualify." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: seriesJudging(),
    rewards: [
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across the hackathon",
      "A National Participation Certificate for every valid Round 1 submission",
      "A National Round 2 Qualifier Certificate for teams that reach Round 2",
      "A National Finalist Certificate for teams that reach Round 3",
      "A National Winner Certificate for the winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-30T09:00:00+05:30"),
    faq: seriesFaq(),
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
      { label: "Entry", value: "Free" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codeverse-india-national-level-hackathon-wecodecoders-1763003",
      label: "Register on Unstop",
      note: "Free to enter, in teams of one to four. Registration closes 29 October at 07:30 IST.",
    },
    links: [
      {
        label: "Official WhatsApp group",
        href: "https://chat.whatsapp.com/JAwVa0s9siI2LUoyL7Hha1",
      },
    ],
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9107,
    posterImage: "/posters/codeverse-india-v1.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Tracks,
    // judging and rules are shared with the other five.
    locked: false,
    featured: true,
    slug: "codehack-india",
    title: "CodeHack India",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-28T10:00:00+05:30",
    endsAt: "2026-11-08T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online technology hackathon: three rounds to build a working solution. Free to enter, teams of one to four, with paid internship and incubation opportunities for the top three teams.",
    description: [
      "CodeHack India is a national-level online technology hackathon that asks for one thing: a working solution, planned, built and finished across three rounds.",
      "Submissions are scored on the same eight published criteria as every other event in this series, and those criteria are published here before you start.",
    ],
    emphasis:
      "Nobody hands you a problem statement. Pick a track, bring a problem worth solving, and show that it is real — that is the first thing the judges score.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "open innovation",
      "online",
      "national",
      "three rounds",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is free and open nationally.",
    brief:
      "Build a working solution to a problem you chose, across three rounds.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "A certificate at the level you reached — participant, Round 2 qualifier, finalist or winner",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Before it starts", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Wed 28 Oct — Thu 29 Oct", what: "Round 1. The official PDF format goes out; two days to submit the idea and the plan." },
      { when: "Sun 1 Nov — Tue 3 Nov", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Fri 6 Nov — Sun 8 Nov", what: "Round 3. Three days to finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Qualification updates and the instructions for the next stage go to the teams that qualify." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: seriesJudging(),
    rewards: [
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "A National Participation Certificate for every valid Round 1 submission",
      "A National Round 2 Qualifier Certificate for teams that reach Round 2",
      "A National Finalist Certificate for teams that reach Round 3",
      "A National Winner Certificate for the winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-28T10:00:00+05:30"),
    faq: seriesFaq(),
    stats: [
      { label: "Per team", value: "1–4" },
      { label: "Entry", value: "Free" },
      { label: "Rounds", value: "3" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/p/codehack-india-national-level-hackathon-wecodecoders-1762158",
      label: "Register on Unstop",
      note: "Free to enter, in teams of one to four.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9106,
    posterImage: "/posters/codehack-india-v2.webp",
  },
];
