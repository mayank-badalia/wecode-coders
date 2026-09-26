// MIXED. The first nine records are real, announced events with real posters:
// wcc-launchpad-30, protocol-60, wcc-forge-48, and the six-event October 2026
// series (tech-circuit, future-stack, code-axis, codex-48, codestar-30,
// codehack-india). Everything after them is still placeholder and still locked.
//
// We do not issue problem statements. A track is an area to work in, and
// choosing the problem inside it is the first thing a team is scored on. Copy
// that implies a brief will be handed out is wrong, and src/lib/events.test.ts
// fails the build on it.
//
// Every placeholder record is invented so the layout, the horizontal rail and the
// events ring have something true-shaped to hold. No real person, partner
// organisation, sponsor, or verified outcome is named anywhere in this file.
// The prose is written in the voice the site should have — edit it freely.
//
// To add an event: copy a record, give it a unique `slug` and a unique
// `posterSeed`, and it appears everywhere automatically. To use a real
// poster image instead of the generated one, set `posterImage` to a path
// under /public. Nothing else needs changing.
//
// Set `locked: true` to hold an event back before it is announced. The record
// can be written out in full — the read seam in src/lib/events.ts strips it to
// an opaque placeholder, so none of it reaches the browser.
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
    "Three tracks, and you pick one. A track is the area you work in — not a problem statement. Nobody hands you a problem to solve: finding one worth solving, and showing it is real, is the first thing the judges score. Interdisciplinary projects are welcome, but the entry has to name its primary track.",
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
 * Judging, identical across the series and to WCC Launchpad 30.
 *
 * Takes the duration in words only because the last criterion names it. The
 * weights total 100 and are published, so a team can see where the marks are
 * before it decides what to spend its hours on.
 */
function seriesJudging(durationWords: string) {
  return [
    {
      name: "User insight and problem evidence",
      weight: "15 points",
      detail:
        "How well do you understand the person you are building for? Research, observation, interviews or survey data that shows the problem you chose is real.",
    },
    {
      name: "Strength of the core solution",
      weight: "20 points",
      detail:
        "Does the product solve the problem you named, directly? Is the main workflow focused, useful, and does it produce a clear outcome?",
    },
    {
      name: "Technical depth and reliability",
      weight: "20 points",
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
      weight: "10 points",
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
      name: "Public product storytelling",
      weight: "5 points",
      detail:
        "How well do your LinkedIn, Instagram and Reddit posts explain the product and why it matters? Judged on clarity and honesty, never on likes.",
    },
    {
      name: "Demonstration quality and learning velocity",
      weight: "5 points",
      detail:
        `Does the demo video show real progress made during the ${durationWords}? Does it say what changed, what broke, what you learned and what you would fix next?`,
    },
  ];
}

const SERIES_SUBMISSION: EventSection = {
  kind: "list",
  label: "What you must submit",
  numbered: true,
  intro:
    "One final submission per team. The product does not need to be commercially launched, but its central workflow has to run and be demonstrable. Repositories may be private as long as judges get access before the deadline.",
  items: [
    "Project name",
    "Selected track",
    "The problem you chose, in your own words",
    "Short solution summary",
    "List of team members",
    "Technology stack",
    "Source-code repository",
    "Working product or demo link",
    "Two-to-three-minute demonstration video",
    "Short pitch deck",
    "Future development plan",
    "Disclosure of AI tools, templates and pre-existing assets used",
    "A LinkedIn post showcasing the product",
    "An Instagram post or reel showcasing the product",
    "A Reddit post showcasing the product",
  ],
};

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
    "Everything on the submission list has to arrive before the deadline.",
    "The three showcase posts must be written by team members and describe the product accurately.",
    "No bots, paid engagement, misleading claims or spam to promote those posts.",
    "Judges may ask for repository access or other proof of development at any point.",
    "Organisers may remove anyone who disrupts the event or breaks community guidelines.",
    "The judges' decision is final.",
  ],
};

/** The three shared blocks, in the order they appear on a detail page. */
const SERIES_SECTIONS: EventSection[] = [SERIES_TRACKS, SERIES_SUBMISSION, SERIES_RULES];

/** FAQ, identical across the series. */
function seriesFaq(durationWords: string) {
  return [
    { q: "Is it free?", a: "Yes. Registration costs nothing." },
    { q: "Are problem statements provided?", a: "No. You pick one of the three tracks and choose your own problem to solve inside it. Showing that the problem is real is worth 15 points." },
    { q: "Can I take part on my own?", a: "Yes. Solo entries are allowed, and so are teams of up to four." },
    { q: "Can beginners enter?", a: "Yes. The event is built for first-timers and experienced builders alike, judged on the same criteria." },
    { q: "Do I need an idea before I register?", a: `No. Register first and choose your problem before the ${durationWords} start.` },
    { q: "Can my team come from different colleges?", a: "Yes. Members can be from different institutions, cities or backgrounds entirely." },
    { q: "Can I use AI tools?", a: "Yes. Disclose the significant ones in your submission." },
    { q: "Can I use something I built earlier?", a: "No. The product has to be built during the event, and submissions are checked. Disclosed reusable components are fine; a finished project is not." },
    { q: "Can I change track?", a: "Yes, any time before final submission. Only one primary track can be selected." },
    { q: "Is deployment compulsory?", a: "Strongly recommended. If you cannot deploy, provide a reliable executable demo and a video." },
    { q: "Do the social posts really matter?", a: "Yes — all three are required. They are worth 5 points, judged on clarity and honesty. Likes and views count for nothing." },
    { q: "Will everyone get a certificate?", a: "Certificates go to participants who submit a valid project on time and follow the rules. Registering alone does not qualify." },
    { q: "Are the tool credits guaranteed?", a: "No. Credits, domains and subscriptions have their own eligibility rules and depend on partner confirmation and availability." },
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
      "A two-to-three-minute demo video and a short pitch deck",
      "Source code judges can reach before the deadline",
      "A showcase post on LinkedIn, Instagram and Reddit, links included",
    ],
    schedule: [
      { when: "Sun 4 Oct, 10:00", what: "The brief, the tracks and the submission list go out. Building starts." },
      { when: "Mon 5 Oct, 14:00", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "Mon 5 Oct, 16:00", what: "Building period ends. Judging begins on what was submitted." },
      { when: "After the event", what: "Scores and written feedback go to every team that submitted, and the winners are announced." },
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
        weight: "20 points",
        detail:
          "Does the product solve the problem you named, directly? Is the main workflow focused, useful, and does it produce a clear outcome?",
      },
      {
        name: "Technical depth and reliability",
        weight: "20 points",
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
        weight: "10 points",
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
        name: "Public product storytelling",
        weight: "5 points",
        detail:
          "How well do your LinkedIn, Instagram and Reddit posts explain the product and why it matters? Judged on clarity and honesty, never on likes.",
      },
      {
        name: "Demonstration quality and learning velocity",
        weight: "5 points",
        detail:
          "Does the demo video show real progress made during the thirty hours? Does it say what changed, what broke, what you learned and what you would fix next?",
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
      "Written feedback and a score from the judges on what you submitted",
    ],
    sections: [
      {
        kind: "columns",
        label: "Tracks",
        intro:
          "Pick one primary track. Interdisciplinary projects are welcome, but the entry has to say which track it belongs to.",
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
        label: "What you must submit",
        numbered: true,
        intro:
          "The product does not need to be commercially launched, but its central workflow has to run and be demonstrable. Repositories may be private as long as judges get access before the deadline.",
        items: [
          "Project name",
          "Selected track",
          "Problem statement",
          "Short solution summary",
          "List of team members",
          "Technology stack",
          "Source-code repository",
          "Working product or demo link",
          "Two-to-three-minute demonstration video",
          "Short pitch deck",
          "Future development plan",
          "Disclosure of AI tools, templates and pre-existing assets used",
          "A LinkedIn post showcasing the product",
          "An Instagram post or reel showcasing the product",
          "A Reddit post showcasing the product",
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
          "The three showcase posts must be written by team members and describe the product accurately.",
          "No bots, paid engagement, misleading claims or spam to promote those posts.",
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
      { q: "Do I need an idea before I register?", a: "No. Register first and choose your problem before the building period starts." },
      { q: "Can my team come from different colleges?", a: "Yes. Members can be from different institutions, cities or backgrounds entirely." },
      { q: "Can I use AI tools?", a: "Yes. Disclose the significant ones in your submission." },
      { q: "Can I change track?", a: "Yes, any time before final submission. Only one primary track can be selected." },
      { q: "Is deployment compulsory?", a: "Strongly recommended. If you cannot deploy, provide a reliable executable demo and a video." },
      { q: "Do the social posts really matter?", a: "Yes — all three are required. They are worth 5 points, judged on clarity and honesty. Likes and views count for nothing." },
      { q: "Will everyone get a certificate?", a: "Certificates go to participants who submit a valid project on time, post the three showcases and follow the rules. Registering alone does not qualify." },
      { q: "Are the tool credits guaranteed?", a: "No. Credits, domains and subscriptions have their own eligibility rules and depend on partner confirmation and availability." },
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
    status: "upcoming",
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
      "Top 60 each receive n8n access or benefits",
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
        a: "Each of them gets the full bundle: n8n benefits, Lovable benefits and one .XYZ domain. The rewards are not split into separate categories.",
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
      { name: "Miro", role: "Tooling partner", logo: "/sponsors/miro.png" },
      { name: "n8n", role: "Tooling partner" },
      { name: ".XYZ", role: "Domain partner", logo: "/sponsors/xyz.png" },
      { name: "Unstop", role: "Official event partner", logo: "/sponsors/unstop.png" },
    ],
    registration: {
      href: "https://unstop.com/quiz/protocol-60-wecodecoders-1754684",
      label: "Register on Unstop",
      note: "Free to enter, one attempt per person. Registration runs through Unstop; the quiz time and joining link go out by email and the official event channel.",
    },
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
    kicker: "HACKATHON — 48 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-30T18:00:00+05:30",
    endsAt: "2026-11-01T18:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "Forty-eight hours to turn a problem worth solving into a product that runs. National, online, free to enter, with ₹25,000 in cash and PPO opportunities for the top three teams.",
    description: [
      "WCC Forge 48 asks for one thing: a working product. Not a deck, not a concept, not an idea you would build if you had more time — something a person can open and use by the time the clock stops.",
      "You get forty-eight hours to find a problem that genuinely exists, decide which single journey through it matters most, and build that journey until it runs reliably. Scope is the hard part. Most teams that struggle here are not short of ideas; they are short of decisions.",
      "Projects are judged on whether they work and whether they are worth using. A narrow product with one dependable workflow beats a broad one held together with screenshots.",
    ],
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
      "Find a problem worth solving and build the one workflow that solves it, in forty-eight hours.",
    deliverables: [
      "A working prototype or deployed product whose main workflow runs",
      "A two-to-three-minute demonstration video and a short pitch deck",
      "A GitHub repository judges can reach",
      "Problem statement, solution summary and technology stack",
      "Team-member contributions, and disclosure of external tools, APIs and reused components",
    ],
    schedule: [
      { when: "15 Sep — 29 Oct", what: "Registration open. Form a team, join the official channel, take part in the giveaways and mini-challenges." },
      { when: "Thu 29 Oct, 23:59", what: "Registration closes." },
      { when: "Fri 30 Oct, 18:00", what: "Opening session: briefing, tracks, judging criteria and submission requirements. The 48 hours begin." },
      { when: "Sun 1 Nov, 18:00", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "Within 7–10 days", what: "Judging on what was submitted, then results and certificates are announced." },
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
        name: "Presentation and user experience",
        weight: "10%",
        detail:
          "Could the intended user work it out without a walkthrough? Does the demo video and deck explain the product clearly and honestly?",
      },
    ],
    rewards: [
      "₹25,000 in cash, shared among the top three teams",
      "PPO opportunities for the top three teams",
      "100+ reward recipients across the hackathon, giveaways and mini-challenges",
      "Special awards for exceptional projects",
      "n8n Cloud Pro, Lovable Premium, Miro Enterprise and AI tools, and a .XYZ domain",
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
          "Pick one primary track. Interdisciplinary projects are welcome, but the entry has to say which track it belongs to.",
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
      {
        kind: "list",
        label: "What you must submit",
        numbered: true,
        intro:
          "One final submission per team. The product does not need to be commercially launched, but its main workflow has to run and be demonstrable.",
        items: [
          "Project name",
          "Selected track",
          "Problem statement",
          "Solution description",
          "Working prototype or deployed product",
          "GitHub repository judges can access",
          "Two-to-three-minute demonstration video",
          "Short pitch deck",
          "Technology stack",
          "Team-member contributions",
          "Details of external tools, APIs, datasets and existing components used",
        ],
      },
      {
        kind: "list",
        label: "Rules",
        numbered: true,
        items: [
          "Teams may have one to four members.",
          "Every team member registers individually, under the same team name.",
          "AI tools, APIs, open-source libraries and frameworks are allowed.",
          "All reused code, APIs, datasets and templates must be disclosed.",
          "The main solution and its implementation must be built during the hackathon.",
          "Existing projects cannot be resubmitted without significant new development.",
          "Plagiarised or copied submissions are disqualified.",
          "One final submission per team.",
          "Late or incomplete submissions may not be evaluated.",
          "A valid final submission is required for a participation certificate.",
          "The organisers' decision on eligibility, evaluation and prizes is final.",
        ],
      },
    ],
    faq: [
      { q: "Is it free?", a: "Yes. Registration costs nothing." },
      { q: "Can I take part on my own?", a: "Yes. Solo entries are allowed, and so are teams of up to four." },
      { q: "Can beginners enter?", a: "Yes. The tracks are broad enough that a first project and an experienced team can both find something to build." },
      { q: "Does every team member have to register?", a: "Yes, individually — and everyone must use the same team name so the entries can be matched up." },
      { q: "Can my team come from different colleges?", a: "Yes. Members can be from different institutions, cities or backgrounds entirely." },
      { q: "Can I use AI tools?", a: "Yes. Disclose the significant ones, along with any reused code, APIs and datasets, in your submission." },
      { q: "Can I bring an existing project?", a: "Not as it stands. The main solution has to be built during the 48 hours, and an old project resubmitted without significant new work does not qualify." },
      { q: "Is deployment compulsory?", a: "Strongly recommended. If you cannot deploy, provide a reliable executable prototype and a video that shows it running." },
      { q: "When are results announced?", a: "Within seven to ten days of the hackathon ending, once every eligible submission has been judged." },
      { q: "Will everyone get a certificate?", a: "A verifiable participation certificate goes to every eligible participant who makes a valid final submission. Registering without submitting does not qualify." },
      { q: "Are the tool credits guaranteed?", a: "No. Credits, domains and subscriptions have their own eligibility rules and depend on sponsor availability, redemption conditions and any announced event tasks." },
      { q: "How is the cash split?", a: "Across the top three teams. The exact split is announced before the hackathon begins." },
      { q: "Are the PPO opportunities guaranteed?", a: "No. They are subject to the recruiting partner's own eligibility requirements and selection process." },
    ],
    stats: [
      { label: "Hours to build", value: "48" },
      { label: "Cash prize", value: "₹25,000" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
    ],
    sponsors: [
      { name: "Inkloom", role: "Title sponsor", logo: "/sponsors/inkloom.png" },
      { name: "Unstop", role: "Official event partner", logo: "/sponsors/unstop.png" },
      { name: "n8n", role: "Tooling partner" },
      { name: "Miro", role: "Tooling partner", logo: "/sponsors/miro.png" },
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
    // judging, submission list and rules are shared with the other five.
    locked: false,
    slug: "tech-circuit",
    title: "TechCircuit",
    kicker: "HACKATHON — 48 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-20T10:00:00+05:30",
    endsAt: "2026-10-22T18:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online hackathon where students, developers and designers build functional technology products that address real problems. Forty-eight hours, free to enter, teams of one to four.",
    description: [
      "TechCircuit is a national-level online hackathon for students, developers and designers who want to build something that actually runs.",
      "You get forty-eight hours, one of three tracks, and a problem of your own choosing. Nobody hands you a problem statement — finding one worth solving and showing that it is real is the first thing the judges score.",
      "The aim is not the biggest project in the room. It is the clearest possible proof that your idea works. One reliable, well-made workflow beats a pile of half-finished features almost every time.",
    ],
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "open innovation",
      "online",
      "national",
      "48 hours",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is free and open nationally.",
    brief:
      "Find a problem worth solving and build the one workflow that solves it, in forty-eight hours.",
    deliverables: [
      "A working product or prototype whose central workflow actually runs",
      "A two-to-three-minute demo video and a short pitch deck",
      "Source code judges can reach before the deadline",
      "The problem you chose and the evidence that it is real",
      "A showcase post on LinkedIn, Instagram and Reddit, links included",
    ],
    schedule: [
      { when: "Until Mon 19 Oct, 23:59", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Tue 20 Oct", what: "The tracks, the judging criteria and the submission list go out. The 48 hours begin." },
      { when: "Thu 22 Oct", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Scores and written feedback go to every team that submitted, and the winners are announced." },
    ],
    judging: seriesJudging("forty-eight hours"),
    rewards: [
      "PPO opportunities for the top three teams",
      "Incubation opportunities for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across track awards, sponsor challenges, mini-challenges and giveaways",
      "A verifiable digital certificate for every participant who makes a valid submission",
      "Written feedback and a score from the judges on what you submitted",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: SERIES_SECTIONS,
    faq: seriesFaq("forty-eight hours"),
    stats: [
      { label: "Hours to build", value: "48" },
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
    posterImage: "/posters/tech-circuit-v1.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Tracks,
    // judging, submission list and rules are shared with the other five.
    locked: false,
    slug: "future-stack",
    title: "FutureStack",
    kicker: "HACKATHON — 48 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-20T10:00:00+05:30",
    endsAt: "2026-10-22T18:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "Forty-eight hours to turn an idea into a working product with modern tooling. National, online, free to enter, with PPO and incubation opportunities for the top three teams.",
    description: [
      "FutureStack is a national-level online hackathon for students, developers and designers who want to turn an idea into something functional.",
      "You choose one of three tracks and the problem you want to solve inside it. There is no problem statement to wait for — the judges score how well you found a real problem before they score anything you built on top of it.",
      "Modern tooling is encouraged and AI tools are allowed, as long as you disclose the significant ones. What is judged is whether the thing runs and whether it helps somebody.",
    ],
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "open innovation",
      "online",
      "national",
      "48 hours",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is free and open nationally.",
    brief:
      "Take an idea, choose a track, and make it run in forty-eight hours.",
    deliverables: [
      "A working product or prototype whose central workflow actually runs",
      "A two-to-three-minute demo video and a short pitch deck",
      "Source code judges can reach before the deadline",
      "The problem you chose and the evidence that it is real",
      "A showcase post on LinkedIn, Instagram and Reddit, links included",
    ],
    schedule: [
      { when: "Until Mon 19 Oct, 23:59", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Tue 20 Oct", what: "The tracks, the judging criteria and the submission list go out. The 48 hours begin." },
      { when: "Thu 22 Oct", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Scores and written feedback go to every team that submitted, and the winners are announced." },
    ],
    judging: seriesJudging("forty-eight hours"),
    rewards: [
      "PPO opportunities for the top three teams",
      "Incubation opportunities for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across track awards, sponsor challenges, mini-challenges and giveaways",
      "A verifiable digital certificate for every participant who makes a valid submission",
      "Written feedback and a score from the judges on what you submitted",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: SERIES_SECTIONS,
    faq: seriesFaq("forty-eight hours"),
    stats: [
      { label: "Hours to build", value: "48" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
      { label: "Entry", value: "Free" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/futurestack-hackathon-wecodecoders-1758558",
      label: "Register on Unstop",
      note: "Free to enter, in teams of one to four. Registration closes 19 October at 23:59 IST.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9102,
    posterImage: "/posters/future-stack-v1.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Tracks,
    // judging, submission list and rules are shared with the other five.
    locked: false,
    slug: "code-axis",
    title: "CodeAxis",
    kicker: "HACKATHON — 48 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-20T10:00:00+05:30",
    endsAt: "2026-10-22T18:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online hackathon focused on practical, technology-driven solutions to problems that actually matter. Forty-eight hours, three tracks, free to enter.",
    description: [
      "CodeAxis is a national-level online hackathon about practical solutions rather than impressive-sounding ones.",
      "Pick a track, pick a problem inside it, and build the part that proves it can work. We do not issue problem statements; the problem is yours to find, and the evidence that it is real is worth fifteen points before a line of code is read.",
      "A small product with one dependable workflow is a better submission than an ambitious one that cannot be demonstrated.",
    ],
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "open innovation",
      "online",
      "national",
      "48 hours",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is free and open nationally.",
    brief:
      "Build a practical solution to a real problem, and show it working, in forty-eight hours.",
    deliverables: [
      "A working product or prototype whose central workflow actually runs",
      "A two-to-three-minute demo video and a short pitch deck",
      "Source code judges can reach before the deadline",
      "The problem you chose and the evidence that it is real",
      "A showcase post on LinkedIn, Instagram and Reddit, links included",
    ],
    schedule: [
      { when: "Until Mon 19 Oct, 23:59", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Tue 20 Oct", what: "The tracks, the judging criteria and the submission list go out. The 48 hours begin." },
      { when: "Thu 22 Oct", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Scores and written feedback go to every team that submitted, and the winners are announced." },
    ],
    judging: seriesJudging("forty-eight hours"),
    rewards: [
      "PPO opportunities for the top three teams",
      "Incubation opportunities for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across track awards, sponsor challenges, mini-challenges and giveaways",
      "A verifiable digital certificate for every participant who makes a valid submission",
      "Written feedback and a score from the judges on what you submitted",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: SERIES_SECTIONS,
    faq: seriesFaq("forty-eight hours"),
    stats: [
      { label: "Hours to build", value: "48" },
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
    posterImage: "/posters/code-axis-v1.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Tracks,
    // judging, submission list and rules are shared with the other five.
    locked: false,
    slug: "codex-48",
    title: "Codex 48",
    kicker: "HACKATHON — 48 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-24T10:00:00+05:30",
    endsAt: "2026-10-26T18:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "Forty-eight hours to turn an original idea into a functional, working product. National, online, free, with paid internship and incubation opportunities for the top three teams.",
    description: [
      "Codex 48 is a national-level AI and full-stack online hackathon. Forty-eight hours, one original idea, one working product at the end of it.",
      "There are three tracks and no problem statements. You choose what to build and who it is for, and the first thing the judges look at is whether the problem you picked is real.",
      "Original means built here. Research and planning beforehand are fine; a codebase that existed last week is not, and submissions are checked.",
    ],
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "open innovation",
      "online",
      "national",
      "48 hours",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is free and open nationally.",
    brief:
      "Turn an original idea into a functional product in forty-eight hours.",
    deliverables: [
      "A working product or prototype whose central workflow actually runs",
      "A two-to-three-minute demo video and a short pitch deck",
      "Source code judges can reach before the deadline",
      "The problem you chose and the evidence that it is real",
      "A showcase post on LinkedIn, Instagram and Reddit, links included",
    ],
    schedule: [
      { when: "Before the event", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Sat 24 Oct", what: "The tracks, the judging criteria and the submission list go out. The 48 hours begin." },
      { when: "Mon 26 Oct", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Scores and written feedback go to every team that submitted, and the winners are announced." },
    ],
    judging: seriesJudging("forty-eight hours"),
    rewards: [
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across track awards, sponsor challenges, mini-challenges and giveaways",
      "A verifiable digital certificate for every participant who makes a valid submission",
      "Written feedback and a score from the judges on what you submitted",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: SERIES_SECTIONS,
    faq: seriesFaq("forty-eight hours"),
    stats: [
      { label: "Hours to build", value: "48" },
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
    // judging, submission list and rules are shared with the other five.
    locked: false,
    slug: "codestar-30",
    title: "CodeStar 30",
    kicker: "HACKATHON — 48 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-25T10:00:00+05:30",
    endsAt: "2026-10-27T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "Forty-eight hours for students and young builders to develop and present a functional technology product. National, online, free, with paid internship and incubation opportunities for the top three teams.",
    description: [
      "CodeStar 30 is a national-level AI and full-stack online hackathon: forty-eight hours from the opening brief to the submission deadline.",
      "Forty-eight hours rewards scope discipline. Choose one of the three tracks, choose a problem inside it, and build the single journey that proves your idea works rather than the five that show what it could become.",
      "There are no problem statements. What you build and who it is for is your decision, and how well you justify it is the first thing scored.",
    ],
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "open innovation",
      "online",
      "national",
      "48 hours",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is free and open nationally.",
    brief:
      "Develop and present a functional product in forty-eight hours.",
    deliverables: [
      "A working product or prototype whose central workflow actually runs",
      "A two-to-three-minute demo video and a short pitch deck",
      "Source code judges can reach before the deadline",
      "The problem you chose and the evidence that it is real",
      "A showcase post on LinkedIn, Instagram and Reddit, links included",
    ],
    schedule: [
      { when: "Before the event", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Sun 25 Oct", what: "The tracks, the judging criteria and the submission list go out. The 48 hours begin." },
      { when: "Tue 27 Oct", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Scores and written feedback go to every team that submitted, and the winners are announced." },
    ],
    judging: seriesJudging("forty-eight hours"),
    rewards: [
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across track awards, sponsor challenges, mini-challenges and giveaways",
      "A verifiable digital certificate for every participant who makes a valid submission",
      "Written feedback and a score from the judges on what you submitted",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: SERIES_SECTIONS,
    faq: seriesFaq("forty-eight hours"),
    stats: [
      { label: "Hours to build", value: "48" },
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
    // judging, submission list and rules are shared with the other five.
    locked: false,
    slug: "codehack-india",
    title: "CodeHack India",
    kicker: "HACKATHON — 48 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-28T10:00:00+05:30",
    endsAt: "2026-10-30T18:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online technology hackathon: build a working solution in forty-eight hours. Free to enter, teams of one to four, with paid internship and incubation opportunities for the top three teams.",
    description: [
      "CodeHack India is a national-level online technology hackathon that asks for one thing: a working solution, built in forty-eight hours.",
      "Three tracks, and the problem inside your track is yours to choose. No problem statements are issued, and no brief arrives to tell you what to make — identifying something worth fixing is part of what is being judged.",
      "Submissions are scored on the same eight published criteria as every other event in this series, and every team that submits gets its scores and written feedback back.",
    ],
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "open innovation",
      "online",
      "national",
      "48 hours",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is free and open nationally.",
    brief:
      "Build a working solution to a problem you chose, in forty-eight hours.",
    deliverables: [
      "A working product or prototype whose central workflow actually runs",
      "A two-to-three-minute demo video and a short pitch deck",
      "Source code judges can reach before the deadline",
      "The problem you chose and the evidence that it is real",
      "A showcase post on LinkedIn, Instagram and Reddit, links included",
    ],
    schedule: [
      { when: "Before the event", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Wed 28 Oct", what: "The tracks, the judging criteria and the submission list go out. The 48 hours begin." },
      { when: "Fri 30 Oct", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Scores and written feedback go to every team that submitted, and the winners are announced." },
    ],
    judging: seriesJudging("forty-eight hours"),
    rewards: [
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "A verifiable digital certificate for every participant who makes a valid submission",
      "Written feedback and a score from the judges on what you submitted",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: SERIES_SECTIONS,
    faq: seriesFaq("forty-eight hours"),
    stats: [
      { label: "Hours to build", value: "48" },
      { label: "Per team", value: "1–4" },
      { label: "Entry", value: "Free" },
      { label: "Tracks", value: "3" },
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
    posterImage: "/posters/codehack-india-v1.webp",
  },
  {
    locked: true,
    slug: "cold-start",
    title: "Cold Start",
    kicker: "MEETUP — ONE EVENING",
    format: "meetup",
    status: "past",
    startsAt: "2026-02-14T18:30:00+05:30",
    endsAt: "2026-02-14T21:30:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who joins", place: "" },
    summary:
      "The first one. Nineteen people, one projector that did not work, and a rule that everybody had to show something unfinished.",
    description: [
      "There was no plan beyond a room and a date. The pitch was simple enough to fit in a message: bring the thing you have been poking at for months and are slightly embarrassed by, and talk about it for five minutes.",
      "Nineteen people came. The projector refused to cooperate, so everybody crowded around laptops instead, which turned out to be better. Two people met that night and have been building together since.",
      "We learned the format works when the work is genuinely unfinished. Polished demos make a room quiet. Broken ones make it talk.",
    ],
    forWho: "Anyone who writes code and has something half-built lying around.",
    tags: ["first", "show-and-tell", "informal"],
    teamSize: "Come alone",
    eligibility: "Anyone who writes code, at any level.",
    brief: "Bring the thing you have been poking at for months and are slightly embarrassed by, and talk about it for five minutes.",
    deliverables: ["Five minutes of talking about something unfinished"],
    schedule: [
      { when: "18:30", what: "Doors, and the projector refusing to cooperate" },
      { when: "19:00", what: "Five-minute shows, in whatever order people volunteer" },
      { when: "20:30", what: "Everyone crowds round laptops instead" },
    ],
    rewards: ["Feedback from people who are building the same week you are"],
    faq: [
      { q: "What if my thing is barely working?", a: "That is the format. Polished demos make a room quiet; broken ones make it talk." },
      { q: "Do I have to show something?", a: "No. Several people came to watch the first time and showed at the next one." },
    ],
    stats: [
      { label: "Attended", value: "19" },
      { label: "Things shown", value: "11" },
    ],
    posterSeed: 1001,
  },
  {
    locked: true,
    slug: "build-night-01",
    title: "Build Night 01",
    kicker: "BUILD NIGHT — FOUR HOURS",
    format: "build-night",
    status: "past",
    startsAt: "2026-03-21T17:00:00+05:30",
    endsAt: "2026-03-21T21:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who joins", place: "" },
    summary:
      "No talks, no slides, no agenda. Four hours, one table, everyone working on their own thing in the same room.",
    description: [
      "The least structured thing we run, and the one people ask for most. You turn up with whatever you are working on. You work on it. Somebody nearby is stuck on something adjacent and you help them, or they help you.",
      "The only rule is that laptops face outward. If your screen is visible, someone will eventually lean over and ask what that is, and that question is the entire point of the evening.",
      "We close by going round the table and saying one sentence about what moved. Not what you finished — what moved.",
    ],
    forWho: "People who work better with other people in the room.",
    tags: ["co-working", "no-agenda", "recurring"],
    teamSize: "Whatever you turn up as",
    eligibility: "People who work better with other people in the room.",
    brief: "There is no brief. Bring your own work and put it on the table.",
    deliverables: ["One sentence at the end about what moved"],
    schedule: [
      { when: "17:00", what: "Doors, tables, power strips" },
      { when: "17:15", what: "Work. That is the entire middle of the evening." },
      { when: "20:45", what: "Round the table: one sentence each on what moved" },
    ],
    rewards: ["A room of people to interrupt when you are stuck"],
    faq: [
      { q: "Is there a talk?", a: "No. This is the one we run with no agenda at all." },
      { q: "Can I bring work from my job?", a: "Yes, as long as your screen can face outward." },
    ],
    stats: [
      { label: "Attended", value: "34" },
      { label: "Laptops open", value: "34" },
    ],
    posterSeed: 2000,
  },
  {
    locked: true,
    slug: "first-light",
    title: "First Light",
    kicker: "DEMO DAY — ONE AFTERNOON",
    format: "demo-day",
    status: "past",
    startsAt: "2026-05-09T14:00:00+05:30",
    endsAt: "2026-05-09T18:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who joins", place: "" },
    summary:
      "Everything built across the first three months, shown in public, in one afternoon. Working software only — no mockups, no roadmaps.",
    description: [
      "One rule, enforced without sympathy: it has to run. Not a deck about what it will do. Not a Figma file. It runs on stage or it does not go on stage.",
      "That rule cost us four sign-ups in the last week and it was still the right rule. The things that did make it were rougher than their authors wanted, and much more interesting for it.",
      "Nobody judged anything. There were no prizes. People clapped for the bugs.",
    ],
    forWho: "Anyone with something that runs, and anyone who wants to see what running looks like this early.",
    tags: ["demo", "public", "no-prizes"],
    teamSize: "Solo or team, whoever built it",
    eligibility: "Anyone with something that runs, and anyone who wants to watch.",
    brief: "Show what you built in the first three months. It has to run on stage.",
    deliverables: ["A working demo, run live", "No slides"],
    schedule: [
      { when: "14:00", what: "Doors" },
      { when: "14:30", what: "Demos, ten minutes each, run live" },
      { when: "17:00", what: "Break, and people cornering each other about how things work" },
      { when: "17:30", what: "Remaining demos, then the room stays as long as it wants" },
    ],
    judging: [
      { name: "Nothing is judged", detail: "There were no judges and no prizes. People clapped for the bugs." },
    ],
    rewards: ["A public record that the thing exists and you made it"],
    faq: [
      { q: "What if it breaks on stage?", a: "It did, twice, and those were the two most useful demos of the afternoon." },
      { q: "Can I present a design or a plan?", a: "No. One rule, enforced without sympathy: it has to run." },
    ],
    stats: [
      { label: "Projects shown", value: "16" },
      { label: "That actually ran", value: "16" },
    ],
    posterSeed: 3000,
  },
  {
    locked: true,
    slug: "shaders-at-dawn",
    title: "Shaders at Dawn",
    kicker: "WORKSHOP — SIX HOURS",
    format: "workshop",
    status: "upcoming",
    startsAt: "2026-09-19T07:00:00+05:30",
    endsAt: "2026-09-19T13:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who joins", place: "" },
    summary:
      "Six hours of GLSL from an empty file. No engine, no framework, no library — a quad, a fragment shader, and enough maths to draw light.",
    description: [
      "Most people meet shaders through a wrapper that hides them. This is the opposite: you start with a blank fragment shader and a full-screen quad, and you leave having drawn something you can explain line by line.",
      "We work up from signed distance fields to raymarching, stopping wherever the room wants to stop. The pace is set by whoever is furthest behind, on purpose.",
      "It starts at seven in the morning because the room is free then and because doing hard maths before breakfast is funnier than it should be.",
    ],
    forWho: "Anyone comfortable with a for-loop who has never written a shader.",
    tags: ["glsl", "webgl", "graphics", "hands-on"],
    teamSize: "Individual, on your own machine",
    eligibility: "Comfortable with a for-loop. No graphics experience assumed.",
    brief: "Start from a blank fragment shader and a full-screen quad, and leave having drawn something you can explain line by line.",
    deliverables: [
      "A shader you wrote from an empty file",
      "An explanation of every line in it",
    ],
    schedule: [
      { when: "07:00", what: "Coffee, and a quad on the screen" },
      { when: "07:30", what: "Colour, coordinates, and why everything is a float" },
      { when: "09:00", what: "Signed distance fields, built up from circles" },
      { when: "10:30", what: "Break" },
      { when: "11:00", what: "Raymarching, as far as the room wants to take it" },
      { when: "12:30", what: "Everyone shows what is on their screen" },
    ],
    rewards: [
      "A working shader you understand end to end",
      "The reference sheet we build together during the session",
    ],
    faq: [
      { q: "Do I need a powerful laptop?", a: "No. Everything runs in a browser tab." },
      { q: "Why seven in the morning?", a: "The room is free then, and hard maths before breakfast is funnier than it should be." },
      { q: "What if I fall behind?", a: "The pace is set by whoever is furthest behind, on purpose." },
    ],
    posterSeed: 4000,
  },
  {
    locked: true,
    slug: "type-and-motion",
    title: "Type & Motion",
    kicker: "WORKSHOP — ONE EVENING",
    format: "workshop",
    status: "upcoming",
    startsAt: "2026-10-03T18:00:00+05:30",
    endsAt: "2026-10-03T21:30:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who joins", place: "" },
    summary:
      "Why most web animation looks cheap, and what typographers knew about timing a century before anyone had a browser.",
    description: [
      "An evening about the part of front-end work that gets treated as decoration and is actually craft. We take a page that animates badly and fix it, in public, arguing about every easing curve.",
      "Half the session is typography: measure, hierarchy, optical alignment, and the variable-font axes almost nobody animates. The other half is timing — why 300ms feels cheap, why stagger reads as intent, and why the best motion is the motion you do not consciously notice.",
      "Bring a page of your own that you think is nearly right. We will look at it together.",
    ],
    forWho: "Front-end developers who suspect their work looks generic and cannot say why.",
    tags: ["typography", "motion", "css", "critique"],
    teamSize: "Individual, bring a page of your own",
    eligibility: "Front-end developers who suspect their work looks generic.",
    brief: "Take a page that animates badly and fix it, in public, arguing about every easing curve.",
    deliverables: [
      "Your own page, critiqued and changed",
      "A set of timings you can defend",
    ],
    schedule: [
      { when: "18:00", what: "Doors" },
      { when: "18:20", what: "Typography: measure, hierarchy, optical alignment" },
      { when: "19:30", what: "Break" },
      { when: "19:45", what: "Timing: why 300ms feels cheap and stagger reads as intent" },
      { when: "20:45", what: "Open critique of pages people brought" },
    ],
    rewards: ["A critique of your own work, in front of people who will be honest"],
    faq: [
      { q: "Do I need design experience?", a: "No. This is aimed at developers who can build it but cannot yet say why it looks wrong." },
      { q: "What should I bring?", a: "A page of your own that you think is nearly right." },
    ],
    posterSeed: 5004,
  },
  {
    locked: true,
    slug: "ship-or-sink",
    title: "Ship or Sink",
    kicker: "HACKATHON — 36 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-11-14T09:00:00+05:30",
    endsAt: "2026-11-15T21:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who joins", place: "" },
    summary:
      "Thirty-six hours. One deployed URL at the end or you are out of the room. No slide decks, no judges, no prize pool.",
    description: [
      "The deal is blunt. You have thirty-six hours and at the end there must be a URL that a stranger can open. Not a repository. Not a video. A URL.",
      "There are no judges. Judging rewards the team that presents best, not the team that built most, and we would rather have thirty rough things that exist than three polished pitches for things that do not. There is no prize pool for the same reason.",
      "You can come alone. Teams form in the first hour and they form better when people arrive without one. Sleep is allowed and quietly encouraged.",
    ],
    forWho: "Anyone who can get something onto the internet in a weekend, or wants to find out if they can.",
    tags: ["hackathon", "36-hours", "deploy-or-bust", "no-judges"],
    teamSize: "1 to 4. Teams form in the first hour.",
    eligibility: "Anyone who can get something onto the internet in a weekend, or wants to find out.",
    brief: "Thirty-six hours. At the end there must be a URL a stranger can open. Not a repository. Not a video. A URL.",
    deliverables: [
      "A deployed URL that loads for someone who was not there",
      "One sentence on what it does",
    ],
    schedule: [
      { when: "Sat 09:00", what: "Doors, and the only briefing there is" },
      { when: "Sat 10:00", what: "Teams form. Come alone and this hour matters." },
      { when: "Sat 14:00", what: "First checkpoint: what are you actually building" },
      { when: "Sun 09:00", what: "Second checkpoint: what are you cutting" },
      { when: "Sun 18:00", what: "Deploy deadline. The URL exists or it does not." },
      { when: "Sun 19:00", what: "Everyone opens everyone else's link" },
    ],
    judging: [
      { name: "No judging", detail: "There are no judges. What you leave with is the thing you built and the people who saw you build it." },
    ],
    rewards: [
      "Something deployed with your name on it",
      "Mentors on call through both days",
    ],
    faq: [
      { q: "Can I come without a team?", a: "Yes, and teams form better when people arrive without one." },
      { q: "Is there a theme?", a: "No theme and no problem statement. Build what you want." },
      { q: "Do I have to stay overnight?", a: "No. Sleep is allowed and quietly encouraged." },
    ],
    posterSeed: 6011,
  },
  {
    // Locked: prepared here in full, published nowhere. Flip this to false
    // (or delete the line) to announce it.
    locked: true,
    slug: "no-gatekeepers",
    title: "No Gatekeepers",
    kicker: "HACKATHON — ONE WEEKEND",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-12-12T09:00:00+05:30",
    endsAt: "2026-12-13T20:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who joins", place: "" },
    summary:
      "A weekend build for people who have never done one. Half the room will be first-timers by design, and the other half are there to make sure they finish.",
    description: [
      "Most hackathons quietly select for people who have already done hackathons. This one selects against that. Half the places are held for people who have never entered one, and the experienced half know that going in.",
      "There is no theme and no problem statement. There is a room, a weekend, and a rule that no question is too basic to ask out loud.",
      "If you have been meaning to try one of these for two years and keep deciding you are not ready yet, this is the one to stop deciding that at.",
    ],
    forWho: "First-timers especially. Everyone else, on the condition that they help.",
    tags: ["hackathon", "beginner-friendly", "weekend"],
    teamSize: "2 to 4, mixed by experience on purpose",
    eligibility: "Half the places are held for people who have never done a hackathon.",
    brief: "Build anything, over one weekend, in a room where no question is too basic to ask out loud.",
    deliverables: [
      "Something that runs, at whatever scale you got to",
      "A short walkthrough for the room",
    ],
    schedule: [
      { when: "Sat 09:00", what: "Doors, and an honest explanation of how these usually go" },
      { when: "Sat 10:00", what: "Team forming, deliberately mixing first-timers with everyone else" },
      { when: "Sat 15:00", what: "Checkpoint, aimed at catching people who are stuck and not saying so" },
      { when: "Sun 11:00", what: "Scope cut. Everyone cuts something." },
      { when: "Sun 17:00", what: "Walkthroughs, in front of a friendly room" },
    ],
    rewards: [
      "A first hackathon that does not put you off hackathons",
      "Experienced builders on your team who signed up knowing that was the deal",
    ],
    faq: [
      { q: "I have never written a full app. Is that a problem?", a: "No. That is who half the room is." },
      { q: "What if my team carries me?", a: "The experienced half know in advance that helping is the job." },
      { q: "Do I need to bring an idea?", a: "No. Ideas get found in the first two hours." },
    ],
    posterSeed: 7003,
  },
];
