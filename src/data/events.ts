// REAL. Every record here is an announced event with a real poster.
//
// Eight of them run the same twelve-day, three-round format and share their
// rounds, judging and rules from the SERIES_ constants below:
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
// The series issues one problem statement, released an hour before the start.
// WCC Launchpad 30 is the exception and still runs on tracks: choosing the
// problem inside one is the first thing a team is scored on. Copy
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

  Six events run the same format, so the judging, the submission
  list and the rules are written once here and shared. That is not only to
  save lines: the promise made to entrants is that all six are judged on
  identical criteria, and the only way to keep that true as one of them is
  edited is for there to be a single copy to edit.

  What differs per event lives on the record itself — dates, duration, what
  the top three teams receive, and the poster.
*/


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
/**
 * Day offsets from `startsAt` for the three rounds, as [from, to] pairs.
 *
 * Most of the series runs 2 days / 3 days / 3 days with gaps between, which
 * is the default. CodeNexus and CodeTitans were scheduled on Unstop with
 * wider windows, so the offsets are a parameter rather than a constant — the
 * dates printed on a round card have to be the ones a team is actually
 * working to.
 */
type RoundOffsets = readonly (readonly [number, number])[];
const DEFAULT_ROUNDS: RoundOffsets = [
  [0, 1],
  [4, 6],
  [9, 11],
];

function seriesRounds(startsAt: string, offsets: RoundOffsets = DEFAULT_ROUNDS): EventSection {
  // Filtered from seriesJudging rather than written out again: one source for
  // the criteria, so a weight cannot be right in the round and wrong in the
  // event's own table.
  const forRound = (n: number) =>
    seriesJudging().filter((j) => j.round.startsWith(`Round ${n}`)).map(({ name, detail, weight }) => ({ name, detail, weight }));
  return {
  kind: "columns",
  variant: "tabs",
  label: "How the three rounds run",
  intro:
    "Three rounds, each asking for something the last did not. The problem statement is released by the organisers one hour before the event begins, so every team starts from the same brief at the same moment. Qualification updates and the instructions for the next stage go directly to the teams that qualify, between rounds. One submission per round per team, made by the team leader — not one per member. No promotional posts, no social links and no video demonstrations are required; only the documents and project links listed here.",
  items: [
    {
      code: "01",
      meta: span(startsAt, offsets[0]![0], offsets[0]![1]),
      name: "Round 1 — The plan",
      blurb:
        "Two days to make the case for what you are going to build. One PDF, on the format we provide: the problem, who has it, how you intend to solve it, what you will build and in what order. This round is the thinking — you are judged on how clear, original, feasible and promising the plan is, and the code comes in the rounds that follow.",
      points: [
        "Your reading of the problem statement you were given",
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
      judging: forRound(1),
    },
    {
      code: "02",
      meta: span(startsAt, offsets[1]![0], offsets[1]![1]),
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
      judging: forRound(2),
    },
    {
      code: "03",
      meta: span(startsAt, offsets[2]![0], offsets[2]![1]),
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
      judging: forRound(3),
      note:
        "Teams selected for Round 3 pay a participation fee of \u20B9399 per team. It covers the cost of running the event \u2014 infrastructure, the time and effort of organising it, and paying the people who do that work. Registration and Rounds 1 and 2 remain free; the fee applies only once your team is selected for Round 3. Paying it means accepting the paid event participation terms, which are linked under this block and are the same for every event.",
    },
  ],
  };
}

/**
 * Judging, one sheet per round.
 *
 * A single table across all three rounds published a total nobody is ever
 * scored out of: Round 1 is a PDF with no code behind it, and marking it on
 * "technical depth and reliability" scores a team on something it was not
 * asked for yet. Each round now totals 100 on its own, because a team is
 * ranked against the other teams in the round it is actually in.
 *
 * The three sheets are deliberately not the same shape. Round 1 is the
 * thinking, Round 2 is whether it runs, Round 3 is whether it is finished —
 * and the criteria that decide each are different questions.
 */
function seriesJudging() {
  const R1 = "Round 1 — The plan";
  const R2 = "Round 2 — The build";
  const R3 = "Round 3 — The finish";
  return [
    /* Round 1: no code exists yet. Everything here is about the thinking. */
    {
      round: R1,
      name: "Understanding of the problem statement",
      weight: "25 points",
      detail:
        "Have you read what was actually asked? Who holds this problem, what it costs them today, and which part of it you are taking on rather than all of it.",
    },
    {
      round: R1,
      name: "The proposed solution",
      weight: "25 points",
      detail:
        "Does the solution follow from the problem, or is it a product you wanted to build anyway? Is the main workflow specific enough to picture someone using it?",
    },
    {
      round: R1,
      name: "Technical plan",
      weight: "20 points",
      detail:
        "Is the stack a choice you can defend rather than a default? Have you named the hard part, and does the architecture account for it?",
    },
    {
      round: R1,
      name: "Originality of approach",
      weight: "15 points",
      detail:
        "Every team has the same brief. What is different about your reading of it, or the angle you are taking on it?",
    },
    {
      round: R1,
      name: "Feasibility and scope",
      weight: "15 points",
      detail:
        "Can this team build this in the days that are left? Scope you can finish scores higher here than scope that sounds impressive.",
    },

    /* Round 2: a judge opens the link and uses it. */
    {
      round: R2,
      name: "The core workflow runs end to end",
      weight: "30 points",
      detail:
        "A judge opens your link and completes the main journey without being talked through it. Rough edges are expected this early; a broken middle is not.",
    },
    {
      round: R2,
      name: "Technical depth and reliability",
      weight: "25 points",
      detail:
        "How well have you used what you chose? Do the integrations, data flows and AI components hold together under ordinary use?",
    },
    {
      round: R2,
      name: "Progress against the plan",
      weight: "20 points",
      detail:
        "How much of what Round 1 proposed is real rather than stubbed? Where you changed direction, is the change explained and is it the better call?",
    },
    {
      round: R2,
      name: "The three improvements you named",
      weight: "15 points",
      detail:
        "Are the three you committed to for Round 3 substantial work on the product, or cosmetic changes chosen because they are easy to deliver?",
    },
    {
      round: R2,
      name: "Usability so far",
      weight: "10 points",
      detail:
        "Can someone who did not build it find their way through the part that works? Polish is not expected yet; comprehensibility is.",
    },

    /* Round 3: is it a product. */
    {
      round: R3,
      name: "Completeness of the product",
      weight: "25 points",
      detail:
        "Are the features finished, the open ends closed and the main journeys tested? What is left undone, and did you say so?",
    },
    {
      round: R3,
      name: "The three improvements delivered",
      weight: "20 points",
      detail:
        "Measured against exactly what you named at Round 2 — not against what turned out to be easier once you started.",
    },
    {
      round: R3,
      name: "Reliability under normal use",
      weight: "20 points",
      detail:
        "Does it hold up when a judge uses it without the team steering? Bad input, an empty state and a repeated attempt all count.",
    },
    {
      round: R3,
      name: "Usability and real-world fit",
      weight: "20 points",
      detail:
        "Could the intended user work it out without a walkthrough? Is it practical in the setting it is meant for?",
    },
    {
      round: R3,
      name: "Documentation and roadmap",
      weight: "15 points",
      detail:
        "Could someone else run this from the repository? And is the next step a credible plan rather than a wish list?",
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
    "Round 2 is limited to 200 teams and Round 3 to 25 teams. Qualification is competitive: clearing a round's requirements does not by itself carry a team into the next one.",
    "Everything on each round's submission list has to arrive before that round's deadline.",
    "One submission per round per team, made by the team leader. Individual members do not submit separately, and a second entry from the same team is not counted.",
    "Missing a round's deadline ends the event for that team. There is no late window.",
    "The three major improvements named at Round 2 are what Round 3 is measured against — name substantial work, then deliver it.",
    "Judges may ask for repository access or other proof of development at any point.",
    "Organisers may remove anyone who disrupts the event or breaks community guidelines.",
    "Do not ask an organiser, judge or volunteer to break a rule, waive a requirement or make an exception in your favour. You may ask once; when the answer is no, that is the answer.",
    "Pressuring, forcing, threatening or intimidating an organiser, judge or volunteer disqualifies the whole team, not only the person who sent the message. Where an organiser, judge or volunteer reports feeling threatened, the team is removed from the event without refund.",
    "The judges' decision is final.",
    "Official numerical rankings will be awarded and announced only for the top three eligible teams unless additional positions are expressly announced.",
    "Teams outside the top three will not receive an official numerical rank.",
    "Individual scores, judging sheets, internal notes, comparative rankings and detailed scoring breakdowns will not be provided.",
    "Participants cannot demand personal feedback, re-evaluation, another presentation opportunity or comparison with another team.",
    "Participants cannot demand a winning team's project, code, repository, submission, presentation or demonstration material. It is shared only with that team's consent, and We Code Coders will not release it on request.",
    "The personal details of winners are not published or passed on. The announcement carries the team name only.",
  ],
};

/**
 * Certificates, identical across the series.
 *
 * Its own block rather than four more lines in `rewards`, because what this
 * states is a rule — one certificate per participant, at the highest level
 * reached — and a rule filed among the prizes reads as a prize.
 */
const SERIES_CERTIFICATES: EventSection = {
  kind: "list",
  label: "Certificates",
  intro:
    "Four levels, and you hold one of them: the highest you reach. Clearing a round upgrades the certificate you will be issued rather than adding another one beside it.",
  items: [
    "Round 1 Completion Certificate — for a valid Round 1 submission.",
    "Round 2 Completion Certificate — for a valid Round 2 submission.",
    "National Finalist Certificate — for finalists who make a valid Round 3 submission.",
    "Winner Certificate, naming the rank your team placed — for the winning teams.",
    "Certificates are issued separately for each completed round. Qualification for a subsequent round does not itself create eligibility for that round's certificate.",
    "Participants who complete Round 2 but withdraw from Round 3 will remain eligible only for the Round 2 Completion Certificate.",
    "Finalist and Final Round certificates require successful registration, payment where applicable, and a valid Round 3 submission.",
    "Withdrawal from Round 3 does not cancel a certificate already earned through valid participation in Round 2.",
    "Each participant receives one certificate only. You are not sent a separate certificate for every round you clear — the one you are issued is upgraded to the furthest stage you completed.",
    "Rounds 1 and 2 are judged in-house by the We Code Coders organising team, which is why those results come back quickly.",
    "The final round is judged by Inkloom. An outside panel reviewing every finalist takes longer, and it is what picks the strongest winner rather than the fastest one — final results are declared one week after the hackathon ends.",
    "Certificates are distributed within 10 days of the results being announced, not from the day the event ends.",
  ],
};

/** The three shared blocks, in the order they appear on a detail page. */
/**
 * Everything after the opening sections, for an event that publishes its own.
 *
 * It runs the same three rounds and is judged on the same rules — so it takes
 * these two and keeps its own first block.
 */
const seriesTrailingSections = (
  startsAt: string,
  offsets: RoundOffsets = DEFAULT_ROUNDS,
): EventSection[] => [seriesRounds(startsAt, offsets), SERIES_RULES, SERIES_CERTIFICATES];

const seriesSections = (
  startsAt: string,
  offsets: RoundOffsets = DEFAULT_ROUNDS,
): EventSection[] => [...seriesTrailingSections(startsAt, offsets)];

/** FAQ, identical across the series. */
function seriesFaq() {
  return [
    { q: "How does it run?", a: "Three rounds: the plan, the build, then the finish. Dates for each round go out with the brief." },
    { q: "Are problem statements provided?", a: "Yes. The organisers release the problem statement one hour before the hackathon starts, to everyone at once. There is nothing to prepare against beforehand." },
    { q: "What happens between rounds?", a: "Qualification updates and the instructions for the next stage go directly to the teams that qualify." },
    { q: "How many teams get through?", a: "Round 2 is limited to 200 teams and Round 3 to 25 teams. Meeting a round's requirements does not by itself carry you into the next one — the places are competitive." },
    { q: "Who submits for the team?", a: "The team leader, once per round. Members do not submit separately." },
    { q: "Do I need a working product in Round 1?", a: "No. Round 1 is one PDF on the official format — the problem, the users, the solution, the workflow, the features, the stack and the plan." },
    { q: "What are the three improvements in Round 2?", a: "At Round 2 you name the three major improvements you will make in Round 3. They have to be substantial work on the product, not cosmetic changes, and Round 3 is measured against delivering them." },
    { q: "Can I take part on my own?", a: "Yes. Solo entries are allowed, and so are teams of up to four." },
    { q: "Can beginners enter?", a: "Yes. The event is built for first-timers and experienced builders alike, judged on the same criteria." },
    { q: "Can my team come from different colleges?", a: "Yes. Members can be from different institutions, cities or backgrounds entirely." },
    { q: "Can I use AI tools?", a: "Yes. Disclose the significant ones in your submission." },
    { q: "Can I use something I built earlier?", a: "No. The product has to be built during the event, and submissions are checked. Disclosed reusable components are fine; a finished project is not." },
    { q: "Is deployment compulsory?", a: "From Round 2 you need a link judges can open and use. If you cannot deploy, provide a reliable executable the judges can run." },
    { q: "Are social media posts required?", a: "No. Nothing on LinkedIn, Instagram or anywhere else is part of a submission, and no video demonstration is required." },
    { q: "What certificate do I get?", a: "One certificate, at the highest stage you reach: a Round 1 Completion Certificate for a valid Round 1 submission, a Round 2 Completion Certificate for a valid Round 2 submission, a National Finalist Certificate for finalists with a valid Round 3 submission, and a Winner Certificate naming your rank if you win. Clearing a round upgrades that certificate rather than adding a second one." },
    { q: "Who judges, and when do results and certificates arrive?", a: "Rounds 1 and 2 are judged in-house by the We Code Coders organising team, so those results come back quickly. The final round is judged by Inkloom — an outside panel takes longer but picks the strongest winner, and final results are declared one week after the hackathon ends. Certificates follow within 10 days of the results being announced." },
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
    status: "past",
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
    startsAt: "2026-09-30T17:00:00+05:30",
    endsAt: "2026-09-30T19:00:00+05:30",
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
      { when: "30 Sep", what: "Join through the official link, check in, read the final instructions" },
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
      "Three rounds to turn one problem statement into a product that runs. National and online, with ₹25,000 in cash and PPO opportunities for the top three teams.",
    description: [
      "WCC Forge 48 asks for one thing: a working product. Not a deck, not a concept, not an idea you would build if you had more time — something a person can open and use by the time the last round closes.",
      "Three rounds to find a problem that genuinely exists, choose the single journey through it that matters most, and build that journey until it runs reliably. Scope is the hard part. Teams here rarely run out of ideas — they run out of decisions.",
      "Projects are judged on whether they work and whether they are worth using. A narrow product with one dependable workflow beats a broad one held together with screenshots.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
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
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is open nationally.",
    brief:
      "Take the problem statement and build the one workflow that solves it, across three rounds.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "One certificate at the highest level you reached — Round 1 completion, Round 2 completion, national finalist, or winner with your rank",
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
    judging: seriesJudging(),
    rewards: [
      "₹25,000 in cash, shared among the top three teams",
      "PPO opportunities for the top three teams",
      "100+ reward recipients across the hackathon, giveaways and mini-challenges",
      "Special awards for exceptional projects",
      "Lovable Premium, AI tools and a .XYZ domain",
      "T-shirts, stickers, pens and merchandise",
      "Workshops, technical resources and community access",
      "Winner, national finalist and round completion certificates",
      "Your project promoted through We Code Coders and its partner communities",
    ],
    sections: [
      ...seriesTrailingSections("2026-10-30T18:00:00+05:30"),
    ],
    faq: [
      { q: "Can I take part on my own?", a: "Yes. Solo entries are allowed, and so are teams of up to four." },
      { q: "Can beginners enter?", a: "Yes. The problem statement is written so that a first project and an experienced team can both find something to build in it." },
      { q: "Who submits for the team?", a: "The team leader, once per round. Members do not submit separately." },
      { q: "Does every team member have to register?", a: "Yes, individually — and everyone must use the same team name so the entries can be matched up." },
      { q: "How many teams get through?", a: "Round 2 is limited to 200 teams and Round 3 to 25 teams. Meeting a round's requirements does not by itself carry you into the next one — the places are competitive." },
      { q: "Can my team come from different colleges?", a: "Yes. Members can be from different institutions, cities or backgrounds entirely." },
      { q: "Can I use AI tools?", a: "Yes. Disclose the significant ones, along with any reused code, APIs and datasets, in your submission." },
      { q: "Can I bring an existing project?", a: "Not as it stands. The main solution has to be built during the event, and an old project resubmitted without significant new work does not qualify." },
      { q: "Is deployment compulsory?", a: "Strongly recommended. If you cannot deploy, provide a reliable executable the judges can run." },
      { q: "When are results announced?", a: "Rounds 1 and 2 are judged in-house by the organising team, so those results come back quickly. The final round is judged by Inkloom, and final results are declared one week after the hackathon ends, once every eligible submission has been reviewed. Certificates follow within 10 days of the results being announced." },
      { q: "Will everyone get a certificate?", a: "Everyone who makes a valid submission holds one certificate, at the highest round they completed — Round 1 completion, Round 2 completion, national finalist or winner. Registering without submitting does not qualify, and clearing a round upgrades your certificate rather than adding a second one." },
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
      note: "Open to teams of one to four. Registration closes 29 October at 23:59 IST, and every member registers individually on Unstop under the same team name.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9001,
    posterImage: "/posters/wcc-forge-48-v2.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Judging
    // and rules are shared with the other five.
    locked: false,
    featured: true,
    slug: "tech-circuit",
    title: "TechCircuit",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-20T10:00:00+05:30",
    endsAt: "2026-10-30T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online hackathon where students, developers and designers build functional technology products that address real problems. Three rounds, teams of one to four.",
    description: [
      "TechCircuit is a national-level online hackathon for students, developers and designers who want to build something that actually runs.",
      "The aim is not the biggest project in the room. It is the clearest possible proof that your idea works. One reliable, well-made workflow beats a pile of half-finished features almost every time.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
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
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is open nationally.",
    brief:
      "Take the problem statement, plan it, build it and finish it across three rounds.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "One certificate at the highest level you reached — Round 1 completion, Round 2 completion, national finalist, or winner with your rank",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Tue 20 Oct — Wed 21 Oct", what: "Round 1. The official PDF format goes out; the idea and the plan are due by 18:00 on the 21st." },
      { when: "Thu 22 Oct — Sun 25 Oct", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Wed 28 Oct — Fri 30 Oct", what: "Round 3. Finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Qualification updates and the instructions for the next stage go to the teams that qualify." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: seriesJudging(),
    rewards: [
      "PPO opportunities for the top three teams",
      "Incubation opportunities for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across sponsor challenges, mini-challenges and giveaways",
      "A Round 1 Completion Certificate for every valid Round 1 submission",
      "A Round 2 Completion Certificate for every valid Round 2 submission",
      "A National Finalist Certificate for finalists with a valid Round 3 submission",
      "A Winner Certificate naming the rank, for the winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-20T10:00:00+05:30", [
      [0, 1],
      [2, 5],
      [8, 10],
    ]),
    faq: seriesFaq(),
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/techcircuit-hackathon-wecodecoders-1758409",
      label: "Register on Unstop",
      note: "Open to teams of one to four. Registration closes 19 October at 23:59 IST.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9101,
    posterImage: "/posters/tech-circuit-v2.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Judging
    // and rules are shared with the other five.
    locked: false,
    featured: true,
    slug: "future-stack",
    title: "FutureStack",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-20T10:00:00+05:30",
    endsAt: "2026-10-30T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "Three rounds to turn an idea into a finished product with modern tooling. National and online, with PPO and incubation opportunities for the top three teams.",
    description: [
      "FutureStack is a national-level online hackathon for students, developers and designers who want to turn an idea into something functional.",
      "Modern tooling is encouraged and AI tools are allowed, as long as you disclose the significant ones. What is judged is whether the thing runs and whether it helps somebody.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
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
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is open nationally.",
    brief:
      "Take the problem statement and carry it from a plan to a finished product.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "One certificate at the highest level you reached — Round 1 completion, Round 2 completion, national finalist, or winner with your rank",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Tue 20 Oct — Wed 21 Oct", what: "Round 1. The official PDF format goes out; the idea and the plan are due by 18:00 on the 21st." },
      { when: "Thu 22 Oct — Sun 25 Oct", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Wed 28 Oct — Fri 30 Oct", what: "Round 3. Finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Qualification updates and the instructions for the next stage go to the teams that qualify." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: seriesJudging(),
    rewards: [
      "PPO opportunities for the top three teams",
      "Incubation opportunities for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across sponsor challenges, mini-challenges and giveaways",
      "A Round 1 Completion Certificate for every valid Round 1 submission",
      "A Round 2 Completion Certificate for every valid Round 2 submission",
      "A National Finalist Certificate for finalists with a valid Round 3 submission",
      "A Winner Certificate naming the rank, for the winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-20T10:00:00+05:30", [
      [0, 1],
      [2, 5],
      [8, 10],
    ]),
    faq: seriesFaq(),
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–6" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/futurestack-hackathon-wecodecoders-1758558",
      label: "Register on Unstop",
      note: "Open to teams of one to six. Registration closes 19 October at 23:59 IST.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9102,
    posterImage: "/posters/future-stack-v3.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Judging
    // and rules are shared with the other five.
    locked: false,
    featured: true,
    slug: "code-axis",
    title: "CodeAxis",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-20T10:00:00+05:30",
    endsAt: "2026-10-30T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online hackathon focused on practical, technology-driven solutions to problems that actually matter. Three rounds, one problem statement.",
    description: [
      "CodeAxis is a national-level online hackathon about practical solutions rather than impressive-sounding ones.",
      "A small product with one dependable workflow is a better submission than an ambitious one that cannot be demonstrated.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
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
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is open nationally.",
    brief:
      "Build a practical solution to a real problem, and finish it across three rounds.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "One certificate at the highest level you reached — Round 1 completion, Round 2 completion, national finalist, or winner with your rank",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Tue 20 Oct — Wed 21 Oct", what: "Round 1. The official PDF format goes out; the idea and the plan are due by 18:00 on the 21st." },
      { when: "Thu 22 Oct — Sun 25 Oct", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Wed 28 Oct — Fri 30 Oct", what: "Round 3. Finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Qualification updates and the instructions for the next stage go to the teams that qualify." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: seriesJudging(),
    rewards: [
      "PPO opportunities for the top three teams",
      "Incubation opportunities for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across sponsor challenges, mini-challenges and giveaways",
      "A Round 1 Completion Certificate for every valid Round 1 submission",
      "A Round 2 Completion Certificate for every valid Round 2 submission",
      "A National Finalist Certificate for finalists with a valid Round 3 submission",
      "A Winner Certificate naming the rank, for the winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-20T10:00:00+05:30", [
      [0, 1],
      [2, 5],
      [8, 10],
    ]),
    faq: seriesFaq(),
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codeaxis-hackathon-wecodecoders-1758538",
      label: "Register on Unstop",
      note: "Open to teams of one to four. Registration closes 19 October at 23:59 IST.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9103,
    posterImage: "/posters/code-axis-v2.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Judging
    // and rules are shared with the other five.
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
      "Three rounds to turn an original idea into a finished, working product. National and online, with paid internship and incubation opportunities for the top three teams.",
    description: [
      "Codex 48 is a national-level AI and full-stack online hackathon, run across three rounds — one original idea carried from a plan to a product that runs.",
      "Original means built here. Research and planning beforehand are fine; a codebase that existed last week is not, and submissions are checked.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
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
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is open nationally.",
    brief:
      "Turn an original idea into a finished product across three rounds.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "One certificate at the highest level you reached — Round 1 completion, Round 2 completion, national finalist, or winner with your rank",
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
      "100+ reward recipients across sponsor challenges, mini-challenges and giveaways",
      "A Round 1 Completion Certificate for every valid Round 1 submission",
      "A Round 2 Completion Certificate for every valid Round 2 submission",
      "A National Finalist Certificate for finalists with a valid Round 3 submission",
      "A Winner Certificate naming the rank, for the winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-24T10:00:00+05:30"),
    faq: seriesFaq(),
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codex-48-national-level-hackathon-wecodecoders-1761082",
      label: "Register on Unstop",
      note: "Open to teams of one to four.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9104,
    posterImage: "/posters/codex-48-v1.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Judging
    // and rules are shared with the other five.
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
      "Three rounds for students and young builders to develop and present a functional technology product. National and online, with paid internship and incubation opportunities for the top three teams.",
    description: [
      "CodeStar 30 is a national-level AI and full-stack online hackathon, run across three rounds.",
      "The format rewards scope discipline. Inside the problem statement you are given, build the single journey that proves your idea works rather than the five that show what it could become.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
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
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is open nationally.",
    brief:
      "Develop and present a functional product across three rounds.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "One certificate at the highest level you reached — Round 1 completion, Round 2 completion, national finalist, or winner with your rank",
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
      "100+ reward recipients across sponsor challenges, mini-challenges and giveaways",
      "A Round 1 Completion Certificate for every valid Round 1 submission",
      "A Round 2 Completion Certificate for every valid Round 2 submission",
      "A National Finalist Certificate for finalists with a valid Round 3 submission",
      "A Winner Certificate naming the rank, for the winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-25T10:00:00+05:30"),
    faq: seriesFaq(),
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codestar-30-national-level-hackathon-wecodecoders-1760472",
      label: "Register on Unstop",
      note: "Open to teams of one to four.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9105,
    posterImage: "/posters/codestar-30-v1.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Judging
    // and rules are shared with the other six.
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
      "A national online AI and coding hackathon: three rounds, one finished product. Teams of one to four, with paid internship and incubation opportunities for the top three teams.",
    description: [
      "CodeVerse India is a national-level online AI and coding hackathon, run across three rounds — one idea carried from a plan to a thing that runs.",
      "Open to undergraduates, postgraduates and students from engineering, management, arts, commerce and the sciences alike. The criteria are the same for everyone.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
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
      "Undergraduate and postgraduate students across engineering, management, arts, commerce and the sciences, alongside developers, designers, AI and no-code builders and first-timers. Registration is open nationally.",
    brief:
      "Build a working product across three rounds, against the problem statement you are given.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "One certificate at the highest level you reached — Round 1 completion, Round 2 completion, national finalist, or winner with your rank",
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
      "A Round 1 Completion Certificate for every valid Round 1 submission",
      "A Round 2 Completion Certificate for every valid Round 2 submission",
      "A National Finalist Certificate for finalists with a valid Round 3 submission",
      "A Winner Certificate naming the rank, for the winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-30T09:00:00+05:30"),
    faq: seriesFaq(),
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codeverse-india-national-level-hackathon-wecodecoders-1763003",
      label: "Register on Unstop",
      note: "Open to teams of one to four. Registration closes 29 October at 07:30 IST.",
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
    // LIVE. Part of the October 2026 series — real event, real poster. Judging
    // and rules are shared with the other five.
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
      "A national online technology hackathon: three rounds to build a working solution. Teams of one to four, with paid internship and incubation opportunities for the top three teams.",
    description: [
      "CodeHack India is a national-level online technology hackathon that asks for one thing: a working solution, planned, built and finished across three rounds.",
      "Submissions are scored on the same eight published criteria as every other event in this series, and those criteria are published here before you start.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
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
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is open nationally.",
    brief:
      "Build a working solution to the problem statement you are given, across three rounds.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "One certificate at the highest level you reached — Round 1 completion, Round 2 completion, national finalist, or winner with your rank",
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
      "A Round 1 Completion Certificate for every valid Round 1 submission",
      "A Round 2 Completion Certificate for every valid Round 2 submission",
      "A National Finalist Certificate for finalists with a valid Round 3 submission",
      "A Winner Certificate naming the rank, for the winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-28T10:00:00+05:30"),
    faq: seriesFaq(),
    stats: [
      { label: "Per team", value: "1–4" },
      { label: "Rounds", value: "3" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/p/codehack-india-national-level-hackathon-wecodecoders-1762158",
      label: "Register on Unstop",
      note: "Open to teams of one to four.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9106,
    posterImage: "/posters/codehack-india-v2.webp",
  },
  {
    /*
      LIVE. November series. Same three-round format as the October events and
      judged on the same sheets, but its rounds run on wider windows than the
      others — hence the explicit offsets rather than the default.

      No poster supplied yet, so the generated one stands in; no Unstop link
      yet either, so registration renders as "not open" rather than as a
      button that goes nowhere.
    */
    locked: false,
    featured: true,
    slug: "codenexus-india",
    title: "CodeNexus India 2026",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-11-02T10:00:00+05:30",
    endsAt: "2026-11-15T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online hackathon in three rounds: a plan, a working product, then a finished one. Teams of one to four, with ₹30,000, paid internships and incubation for the top three.",
    description: [
      "CodeNexus India 2026 is a national-level online hackathon run across three rounds. Round 1 is the proposal, Round 2 turns it into something that runs, and Round 3 decides whether it is a product.",
      "Each round is scored on its own published sheet, out of 100, and those sheets are on this page before you start.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: ["agentic ai", "full-stack", "open innovation", "online", "national", "three rounds"],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "Undergraduate and postgraduate students across engineering, management, arts, commerce and the sciences, alongside developers, designers and first-timers. Registration is open nationally.",
    brief:
      "Build a working solution to the problem statement you are given, across three rounds.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "One certificate at the highest level you reached — Round 1 completion, Round 2 completion, national finalist, or winner with your rank",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Until Mon 2 Nov, 02:00", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Mon 2 Nov — Wed 4 Nov", what: "Round 1. The official PDF format goes out; the proposal and the plan are due." },
      { when: "Fri 6 Nov — Mon 9 Nov", what: "Round 2. Turn the proposal into a product whose central workflow runs." },
      { when: "Thu 12 Nov — Sun 15 Nov", what: "Round 3. Finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Qualification updates and the instructions for the next stage go to the teams that qualify." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: seriesJudging(),
    rewards: [
      "₹30,000 in prizes, shared among the top three teams",
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "$500 in Adaption Labs credits for every eligible participant",
      "$100 in Agentverse credits for every eligible participant",
      "100+ reward recipients across the hackathon",
      "A Round 1 Completion Certificate for every valid Round 1 submission",
      "A Round 2 Completion Certificate for every valid Round 2 submission",
      "A National Finalist Certificate for finalists with a valid Round 3 submission",
      "A Winner Certificate naming the rank, for the winning teams",
    ],
    sections: seriesSections("2026-11-02T10:00:00+05:30", [
      [0, 2],
      [4, 7],
      [10, 13],
    ]),
    faq: seriesFaq(),
    stats: [
      { label: "Prize pool", value: "₹30,000" },
      { label: "Per team", value: "1–4" },
      { label: "Rounds", value: "3" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codenexus-india-2026-national-hackathon-wecodecoders-1764747",
      label: "Register on Unstop",
      note: "Open to teams of one to four. Registration closes 2 November at 02:00 IST.",
    },
    links: [
      { label: "Official WhatsApp group", href: "https://chat.whatsapp.com/LQXKCATzVwsCJDHOaeVCjf" },
    ],
    // Ink — the poster sits on navy, so the ring glow and hover tints match it.
    posterSeed: 9112,
    posterImage: "/posters/codenexus-india-v1.webp",
  },
  {
    /*
      LIVE. November series, a few days behind CodeNexus. The round windows
      are the ones on the Unstop listing, which prints them in New York time:
      Round 1 is 6 Nov 10:00 to 7 Nov 18:00, Round 2 is 8 Nov to 11 Nov and
      Round 3 is 14 Nov to 16 Nov, all IST. The listing's own summary line
      agrees — "6th November 10am - 16th November 10am".
    */
    locked: false,
    featured: true,
    slug: "codetitans-india",
    title: "CodeTitans India 2026",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-11-06T10:00:00+05:30",
    endsAt: "2026-11-16T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online hackathon in three rounds: propose it, build it, finish it. Teams of one to four, with ₹30,000, paid internships and incubation for the top three.",
    description: [
      "CodeTitans India 2026 is a national-level online hackathon run across three rounds, from a written proposal to a product someone could use.",
      "Each round is scored on its own published sheet, out of 100, and those sheets are on this page before you start.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: ["agentic ai", "full-stack", "open innovation", "online", "national", "three rounds"],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "Undergraduate and postgraduate students across engineering, management, arts, commerce and the sciences, alongside developers, designers and first-timers. Registration is open nationally.",
    brief:
      "Take the problem statement, build the one workflow that solves it, and finish it across three rounds.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the plan you started from and the roadmap you finished with",
      "One certificate at the highest level you reached — Round 1 completion, Round 2 completion, national finalist, or winner with your rank",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Until Wed 4 Nov, 20:30", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Fri 6 Nov — Sat 7 Nov", what: "Round 1. The official PDF format goes out; the proposal and the plan are due." },
      { when: "Sun 8 Nov — Wed 11 Nov", what: "Round 2. Turn the proposal into a product whose central workflow runs." },
      { when: "Sat 14 Nov — Mon 16 Nov", what: "Round 3. Finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Qualification updates and the instructions for the next stage go to the teams that qualify." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: seriesJudging(),
    rewards: [
      "₹30,000 in prizes, shared among the top three teams",
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "$500 in Adaption Labs credits for every eligible participant",
      "$100 in Agentverse credits for every eligible participant",
      "100+ reward recipients across the hackathon",
      "A Round 1 Completion Certificate for every valid Round 1 submission",
      "A Round 2 Completion Certificate for every valid Round 2 submission",
      "A National Finalist Certificate for finalists with a valid Round 3 submission",
      "A Winner Certificate naming the rank, for the winning teams",
    ],
    sections: seriesSections("2026-11-06T10:00:00+05:30", [
      [0, 1],
      [2, 5],
      [8, 10],
    ]),
    faq: seriesFaq(),
    stats: [
      { label: "Prize pool", value: "₹30,000" },
      { label: "Per team", value: "1–4" },
      { label: "Rounds", value: "3" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codetitans-india-2026-national-hackathon-wecodecoders-1766190",
      label: "Register on Unstop",
      note: "Open to teams of one to four. Registration closes 4 November at 20:30 IST.",
    },
    links: [
      { label: "Official WhatsApp group", href: "https://chat.whatsapp.com/Lr1a3omlex7Coc4tAJ8S1C" },
    ],
    // Ink. The artwork is violet, which is a burst colour and not a ground;
    // navy is the nearest ground in the table and the one the poster reads as.
    posterSeed: 9126,
    posterImage: "/posters/codetitans-india-v1.webp",
  },
  {
    /*
      LIVE. A quiz, not a hackathon — so no rounds, no problem statement and
      none of the series' shared blocks.

      The Unstop listing gave the quiz day but not the hour (its stage times
      read 01:10 to 01:11, which is a placeholder, not a sitting), so this
      carried a `startTimeNote` until the sitting was confirmed: 10:00 IST.
      The window length is the one Protocol//60 published, not a figure from
      the listing — if the paper is shorter, shorten `endsAt` with it, since
      the page prints the gap as "Runs for N hours".
    */
    locked: false,
    featured: true,
    slug: "codequest-quiz-india",
    title: "CodeQuest Quiz India 2026",
    kicker: "QUIZ — ONE SITTING",
    format: "quiz",
    status: "upcoming",
    startsAt: "2026-11-09T10:00:00+05:30",
    endsAt: "2026-11-09T12:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online quiz on agentic AI, full-stack engineering and emerging technology. One sitting, free to enter, with ₹30,000 shared among the top three.",
    description: [
      "CodeQuest Quiz India 2026 is a national online quiz for people who build. The questions span autonomous systems, the engineering behind a working product, and the technologies arriving around both.",
      "It runs in one sitting on 9 November, starting at 10:00 IST. Everyone who completes it properly gets a verifiable certificate, and the rewards go well beyond the top three.",
    ],
    forWho: "Students, developers, AI enthusiasts and anyone curious about how modern systems are built.",
    tags: ["agentic ai", "full-stack", "open innovation", "quiz", "online", "national"],
    teamSize: "Individual. Everyone registers and attempts on their own.",
    eligibility:
      "Undergraduate and postgraduate students across engineering, management, arts, commerce and the sciences, alongside developers and self-taught builders. Registration is open nationally.",
    brief: "One sitting at 10:00, three subject areas, and a leaderboard at the end of it.",
    deliverables: [
      "One timed attempt, submitted before the clock runs out",
    ],
    schedule: [
      { when: "Until Sat 7 Nov, 15:00", what: "Registration open. Join the official channel for the joining link and the final instructions." },
      { when: "Mon 9 Nov, 10:00", what: "Quiz day. One attempt, inside the official window." },
      { when: "After", what: "Responses validated, the leaderboard reviewed, results announced and certificates issued." },
    ],
    judging: [
      { name: "Total score", detail: "The primary ranking. Everything below is used to separate people who tie." },
      { name: "Correct answers", detail: "How many you got right across the paper." },
      { name: "Accuracy", detail: "Right answers against attempted ones, across the whole quiz." },
      { name: "Completion time", detail: "Used as a tie-breaker, alongside designated tie-breaker questions where needed." },
    ],
    rewards: [
      "₹30,000 in prizes, shared among the top three",
      "n8n Pro plans for the top three",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "$500 in Adaption Labs credits for every eligible participant",
      "A verifiable digital certificate for everyone who completes it properly, one per participant, within 10 days of the results being announced",
      "100+ reward recipients across prizes, challenges and giveaways",
    ],
    sections: [
      {
        kind: "columns",
        label: "What the quiz covers",
        intro:
          "Three areas, weighted evenly. The recommended reading goes out in the official channel before the quiz.",
        items: [
          {
            code: "01",
            name: "Agentic AI and autonomous systems",
            points: [
              "How agents plan and use tools",
              "Orchestration and multi-agent work",
              "Keeping a human in control",
              "Where autonomy fails in practice",
            ],
          },
          {
            code: "02",
            name: "Full-Stack Product Engineering",
            points: [
              "Front end, back end and the plumbing between",
              "APIs, services and data models",
              "Authentication and permissions",
              "Shipping something that stays up",
            ],
          },
          {
            code: "03",
            name: "Open Innovation and emerging technology",
            points: [
              "What is arriving and what it changes",
              "Choosing the right tool for a problem",
              "Trade-offs people get wrong",
              "Reading a system you did not build",
            ],
          },
        ],
      },
      {
        kind: "list",
        label: "Rules",
        items: [
          "One attempt per person. Everyone sits it on their own.",
          "Duplicate, manipulated or suspicious entries may be disqualified.",
          "Finish within the official window.",
          "Report technical problems immediately through the official support channel.",
          "Organisers may review activity and response patterns to keep the event fair.",
          "Do not ask an organiser or volunteer to break a rule, waive a requirement or make an exception in your favour. You may ask once; when the answer is no, that is the answer.",
          "Pressuring, forcing, threatening or intimidating an organiser or volunteer removes you from the event. Where an organiser or volunteer reports feeling threatened, the entry is disqualified.",
          "Breaking the rules can cost you your leaderboard position, rewards and certificate.",
          "The organisers' decision on eligibility, ranking and disqualification is final.",
          "Official rankings will be awarded and announced only for the top three eligible participants unless additional positions are expressly announced.",
          "Participants outside the top three will not receive an official rank.",
          "Individual scores, answer sheets, internal notes, comparative rankings and detailed scoring breakdowns will not be provided.",
          "Participants cannot demand personal feedback, re-evaluation, another attempt or comparison with another participant.",
          "The personal details of winners are not published or passed on. The leaderboard carries the announced name only.",
        ],
      },
    ],
    faq: [
      { q: "Is it free?", a: "Yes. Registration costs nothing." },
      { q: "Is this a quiz or a hackathon?", a: "A quiz, in one sitting. There is nothing to build and nothing to submit beforehand." },
      { q: "When exactly does it start?", a: "10:00 IST on 9 November. The joining link goes out in the official group ahead of the day." },
      { q: "Can beginners take part?", a: "Yes. Recommended reading goes out in the official channel before the quiz." },
      { q: "Will everyone get a certificate?", a: "Everyone who registers, joins through the official link, completes and submits the quiz, follows the rules and passes the integrity checks. One certificate per participant, distributed within 10 days of the results being announced. Registering alone does not qualify." },
      { q: "When are results announced?", a: "After the responses are validated and the leaderboard is reviewed. Timelines are shared through the official channel." },
    ],
    stats: [
      { label: "Prize pool", value: "₹30,000" },
      { label: "Entry fee", value: "₹0" },
      { label: "Attempts", value: "1" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      note: "Free to enter, individually. Registration closes 7 November at 15:00 IST. The Unstop link goes here once it is live.",
    },
    links: [
      { label: "Official WhatsApp group", href: "https://chat.whatsapp.com/Kiibri82NXEDIOmNhd9URn" },
    ],
    // Ink — lime and orange are the accents, the ground underneath is navy.
    posterSeed: 9130,
    posterImage: "/posters/codequest-quiz-india-v1.webp",
  },
];
