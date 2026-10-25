// REAL. Every record here is an announced event with a real poster.
//
// Five of them run the same three-round format and share their rounds,
// judging and rules from the SERIES_ constants below: tech-circuit,
// future-stack, code-axis, codex-48 and codestar-30.
//
// Nine more run a single window and share the sprint_ helpers instead:
// wcc-forge-48, codeverse-india, codehack-india, codenexus-india,
// codetitans-india and code-conqueror-india over forty-eight hours;
// codepunethinkers, codersinpune and codefrontier over thirty-six. One
// problem statement, one window, one submission, and a certificate for every
// participant who files an entry. codequest-quiz-india is a quiz sat inside
// an eight-hour window. They are the same hackathons; what changed is the
// shape, not the promise behind it.
//
// What any of this costs, in one place. A three-round event charges
// ROUND_3_FEE per team, once, and only from a team selected for Round 3 —
// registering and Rounds 1 and 2 are free. Every single-round event is free
// from start to finish. There is no third case, and nothing else on this site
// asks anyone for money. Both halves of that rule are printed on each event's
// own page, written out in src/app/terms/page.tsx, and pinned by
// src/lib/events.test.ts.
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
 * The one fee anything on this site charges, written once.
 *
 * ₹399 per team, due once, and only from a team selected for Round 3 of a
 * three-round event. Registering and Rounds 1 and 2 are free, and every
 * single-round event is free throughout.
 *
 * A constant because the amount now appears in a round note, a rule, an FAQ
 * answer, the stats strip and the line under the register button. Those five
 * have to agree: a reader who finds two different numbers on one page
 * believes the lower one, and is right to.
 */
const ROUND_3_FEE = "\u20B9399";

/**
 * The three rounds.
 *
 * Deliberately silent about what happens in the gaps between rounds. The
 * judging intervals are internal; what an entrant needs to know is that
 * the Round 1 and Round 2 result is emailed to every team either way,
 * selected or not, and that is all this says.
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
 * Every event runs 2 days / 3 days / 3 days. What differs is the gap: the
 * default leaves two clear days before each of the later rounds, while the
 * compact shape opens Round 2 the morning after Round 1 closes and keeps the
 * longer break only before the final. The offsets are a parameter rather than
 * a constant because the dates printed on a round card have to be the ones a
 * team is actually working to.
 */
type RoundOffsets = readonly (readonly [number, number])[];
const DEFAULT_ROUNDS: RoundOffsets = [
  [0, 1],
  [4, 6],
  [9, 11],
];

/** Round 2 opens the day after Round 1 closes. */
const COMPACT_ROUNDS: RoundOffsets = [
  [0, 1],
  [2, 4],
  [7, 9],
];

function seriesRounds(
  startsAt: string,
  offsets: RoundOffsets = DEFAULT_ROUNDS,
  terms: SeriesTerms = {},
): EventSection {
  // Filtered from seriesJudging rather than written out again: one source for
  // the criteria, so a weight cannot be right in the round and wrong in the
  // event's own table.
  const forRound = (n: number) =>
    seriesJudging().filter((j) => j.round.startsWith(`Round ${n}`)).map(({ name, detail, weight }) => ({ name, detail, weight }));

  /* Who submits, said in the intro where nobody can miss it. */
  const whoSubmits =
    terms.submission === "individual"
      ? `Every participant submits. The project is filed once per member rather than once per team: each person makes their own entry for the round, names the role they held on it — ${ROLE_SET} — and writes in their own words the part they built. Those two answers are what your certificate prints, so a member who files nothing has nothing recorded and is not issued one.`
      : "One submission per round per team, made by the team leader — not one per member.";

  /* And the two fields that only the member themselves can answer. */
  const ownRole =
    terms.submission === "individual"
      ? [
          "Your own role on the project, and the part you built, in your own words — these are the two lines your certificate prints",
        ]
      : [];

  return {
  kind: "columns",
  variant: "tabs",
  label: "How the three rounds run",
  intro:
    `Three rounds, each asking for something the last did not. The problem statement is released by the organisers one hour before the event begins, so every team starts from the same brief at the same moment. Round 1 and Round 2 results are sent to every team by email, whether or not the team has been selected — you hear from us either way — and the teams that go through receive the instructions for the next stage in the same email. ${whoSubmits} No promotional posts, no social links and no video demonstrations are required; only the documents and project links listed here.`,
  items: [
    {
      code: "01",
      meta: span(startsAt, offsets[0]![0], offsets[0]![1]),
      name: "Round 1 — The plan",
      blurb:
        "Two days to make the case for what you are going to build. One PDF, on the format we provide: the problem, who has it, how you intend to solve it, what you will build and in what order. This round is the thinking — you are judged on how clear, original, feasible and promising the plan is, and the code comes in the rounds that follow. More than 1,000 teams are in this round and every one of them competes; 300 go through to Round 2.",
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
        ...ownRole,
      ],
      judging: forRound(1),
    },
    {
      code: "02",
      meta: span(startsAt, offsets[1]![0], offsets[1]![1]),
      name: "Round 2 — The build",
      blurb:
        "Three days to build what you proposed. The central workflow and the essential features from Round 1 have to run end to end: a judge opens your link and uses the product. Rough edges are expected this early — a broken core is not. 300 teams reach this round, and 100 of them go through to the final.",
      points: [
        "A link to the functioning project",
        "The source-code repository",
        "An updated project PDF",
        "The list of features you completed",
        "Technology and implementation details",
        "An explanation of anything you changed from the original proposal",
        "The three major improvements you will make in Round 3 — substantial work on the product, not cosmetic tweaks, and you are judged on delivering them",
        ...ownRole,
      ],
      judging: forRound(2),
      note:
        terms.certificates === "finalists"
          ? "Rounds 1 and 2 are qualifying rounds and carry no certificate, including for taking part. If your team qualifies for Round 3 and decides not to take part, nothing is issued — the certificate is earned in the final round."
          : "If your team qualifies for Round 3 and decides not to take part, you keep a Round 2 Completion Certificate. Stopping here does not cancel what you earned — it is the only certificate you will be issued, and it is not upgraded later.",
    },
    {
      code: "03",
      meta: span(startsAt, offsets[2]![0], offsets[2]![1]),
      name: "Round 3 — The finish",
      blurb:
        "Three days to turn something that works into something people would use. Finish the features you left open, tighten the interface, repair the faults you already know about, test the main journeys and write the documentation. Round 2 proved the idea runs; this round decides whether it is a product. 100 teams reach the final round, and three of them win.",
      points: [
        "The final working project link",
        "The final source-code repository",
        "The final product PDF",
        "The complete list of features",
        "A technical architecture and implementation summary",
        "The improvements you completed after Round 2, including the three you named",
        "Testing details",
        "A product roadmap and future development plan",
        ...ownRole,
      ],
      judging: forRound(3),
      note:
        `Teams selected for Round 3 pay a participation fee of ${ROUND_3_FEE} per team \u2014 one payment for the whole team, not one each. It covers the cost of running the event: infrastructure, the time and effort of organising it, and paying the people who do that work. Registering and Rounds 1 and 2 are free, and this is the only payment anywhere in this event. It falls due only once your team is selected for Round 3, so a team that is not selected pays nothing at all. Paying it means accepting the event participation terms, which are linked under this block and are the same for every event.`,
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
 *
 * One detail varies: what the winners' announcement links to. The series links
 * the repository; Forge 48 ships a deployed product, so it links that instead.
 */
const seriesRules = (
  winnerLink = "the GitHub repository of what each of them built",
  terms: SeriesTerms = {},
): EventSection => ({
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
    `Registering is free and so are Rounds 1 and 2. The only money this event asks for is the Round 3 participation fee of ${ROUND_3_FEE} per team, charged once and only to teams selected for that round \u2014 not to be judged, and not to be certified. Nobody from We Code Coders will ask you for any other payment, at any other stage, through any other channel.`,
    "Every participant belongs to one team only.",
    "The project must be the team's own work.",
    "Plagiarised, copied or misleading submissions are disqualified.",
    "Respect software licences, intellectual property and user privacy.",
    "Projects must not promote illegal, harmful or discriminatory activity.",
    "More than 1,000 teams start in Round 1 and all of them compete. Round 2 is limited to 300 teams, Round 3 to 100, and three teams win. Qualification is competitive: clearing a round's requirements does not by itself carry a team into the next one.",
    "Everything on each round's submission list has to arrive before that round's deadline.",
    ...(terms.submission === "individual"
      ? [
          "One submission per participant per round, not one per team. Every member files their own entry for the same project, names the role they held on it and states the part they built; a second entry from the same person is not counted.",
          "A participant who files no entry of their own is not recorded as having taken part in that round, and is not issued a certificate for it, even where the team's project was submitted by somebody else.",
        ]
      : [
          "One submission per round per team, made by the team leader. Individual members do not submit separately, and a second entry from the same team is not counted.",
        ]),
    "Missing a round's deadline ends the event for that team. There is no late window.",
    "The three major improvements named at Round 2 are what Round 3 is measured against — name substantial work, then deliver it.",
    "Judges may ask for repository access or other proof of development at any point.",
    "Organisers may remove anyone who disrupts the event or breaks community guidelines.",
    "Do not ask an organiser, judge or volunteer to break a rule, waive a requirement or make an exception in your favour. You may ask once; when the answer is no, that is the answer.",
    "Pressuring, forcing, threatening or intimidating an organiser, judge or volunteer disqualifies the whole team, not only the person who sent the message. Where an organiser, judge or volunteer reports feeling threatened, the team is removed from the event without refund.",
    "The judges' decision is final.",
    `Results go up in the official group: the three winning team names, along with ${winnerLink}. No participant's personal details, and nothing further from a team's submission, are shared or passed on unless we have that team's consent.`,
    "Only the top three are placed. The three winning teams are named with a link to what each of them built, and their certificates print the rank; no other team is given a position, no ranking list is published, and no certificate below winner carries a placing.",
    "Scores, judging sheets, internal notes and comparative breakdowns are not shared, and there is no personal feedback, re-evaluation or second presentation.",
  ],
});

/**
 * Which certificates an event issues.
 *
 * "rounds" issues one certificate at the highest stage a participant reached,
 * from Round 1 upwards. "finalists" issues one only for the final round:
 * Rounds 1 and 2 qualify a team to go further and earn nothing in themselves.
 *
 * It is a per-event decision because the two schemes promise different things
 * to the same 1,000 teams, and the promise has to be the one that event made.
 */
type CertificateScheme = "rounds" | "finalists";

/**
 * Who files a submission.
 *
 * "leader" is one entry per team, sent by the team leader. "individual" is one
 * entry per participant: the same team project, filed by each member with the
 * role they held and the part they built.
 *
 * The second is not red tape. A team certificate that names only the team is
 * worth the same to every member, including the one who did nothing — so the
 * certificate prints the role and the contribution its holder declared, and
 * those two fields have to come from the holder. See `roles` and
 * `contribution` in src/lib/certificates.ts, which have expected them since
 * the three-round events began.
 */
type SubmissionMode = "leader" | "individual";

/**
 * The roles the submission form offers.
 *
 * One copy, because three blocks name them and the certificate prints them.
 * The same list is documented beside the `roles` field in
 * src/lib/certificates.ts, which is what receives them.
 */
const ROLE_SET =
  "Backend, Frontend, AI / ML, Design / UI-UX, Product / Research or Presentation / Demo";

/**
 * The two promises that differ between events in the series.
 *
 * An object rather than two more positional arguments: "finalists" and
 * "individual" are both bare strings, and a call site reading
 * seriesSections(date, offsets, "finalists", "individual") is one transposition
 * away from promising the wrong thing on the wrong page.
 */
type SeriesTerms = {
  /** Which certificates the event issues. Defaults to "rounds". */
  certificates?: CertificateScheme;
  /** Who submits. Defaults to "leader". */
  submission?: SubmissionMode;
};

/**
 * Certificates for the series.
 *
 * Its own block rather than more lines in `rewards`, because what this states
 * is a rule — who is issued a certificate and who is not — and a rule filed
 * among the prizes reads as a prize.
 *
 * The last three items are the same under either scheme: who judges, how fast,
 * and when the certificate arrives.
 */
const seriesCertificates = (terms: SeriesTerms = {}): EventSection => ({
  kind: "list",
  label: "Certificates",
  intro:
    terms.certificates === "finalists"
      ? "One certificate, earned in the final round. Rounds 1 and 2 are qualifying rounds: clearing them carries your team forward, and nothing is issued for them."
      : "Four levels, and you hold one of them: the highest you reach. Clearing a round upgrades the certificate you will be issued rather than adding another one beside it.",
  items: [
    ...(terms.submission === "individual"
      ? [
          "Your certificate names the role you declared and the part you built, in the words you submitted them in. That is why every member files their own entry rather than one per team, and why a member with no entry of their own is not issued a certificate.",
        ]
      : []),
    ...(terms.certificates === "finalists"
      ? [
          "National Finalist Certificate — for finalists who make a valid Round 3 submission. It records that your team reached the final round; it does not print a position.",
          "Winner Certificate, naming the rank — first, second or third — for the three winning teams.",
          "No certificate is issued for Round 1 or Round 2, including for taking part. A team that is not selected for the final round, or that is selected and does not take part, is not issued one.",
          "Only the top three are placed. The group announcement carries those three team names and a link to what they built, and their certificates print the rank — first, second or third. No other team is told a position, and none is printed on its certificate.",
          "A certificate requires successful registration, payment where applicable, and a valid Round 3 submission. Qualifying for the final round does not by itself earn one.",
          "Each participant receives one certificate only.",
        ]
      : [
          "Round 1 Completion Certificate — for a valid Round 1 submission.",
          "Round 2 Completion Certificate — for a valid Round 2 submission.",
          "National Finalist Certificate — for finalists who make a valid Round 3 submission. It records that your team reached the final round; it does not print a position.",
          "Winner Certificate, naming the rank — first, second or third — for the three winning teams.",
          "Only the top three are placed. The group announcement carries those three team names and a link to what they built, and their certificates print the rank — first, second or third. No other team is told a position, and none is printed on its certificate.",
          "Certificates are issued separately for each completed round. Qualification for a subsequent round does not itself create eligibility for that round's certificate.",
          "Participants who complete Round 2 but withdraw from Round 3 will remain eligible only for the Round 2 Completion Certificate.",
          "Finalist and Final Round certificates require successful registration, payment where applicable, and a valid Round 3 submission.",
          "Withdrawal from Round 3 does not cancel a certificate already earned through valid participation in Round 2.",
          "Each participant receives one certificate only. You are not sent a separate certificate for every round you clear — the one you are issued is upgraded to the furthest stage you completed.",
        ]),
    "Rounds 1 and 2 are judged in-house by the We Code Coders organising team, which is why those results come back quickly. Every team that submitted is emailed its result for those rounds, selected or not.",
    "The final round is judged by Inkloom. An outside panel reviewing every finalist takes longer, and it is what picks the strongest winner rather than the fastest one — final results are declared one week after the hackathon ends.",
    "Certificates are distributed within 10 days of the results being announced, not from the day the event ends.",
  ],
});

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
  winnerLink?: string,
  terms: SeriesTerms = {},
): EventSection[] => [
  seriesRounds(startsAt, offsets, terms),
  seriesRules(winnerLink, terms),
  seriesCertificates(terms),
];

const seriesSections = (
  startsAt: string,
  offsets: RoundOffsets = DEFAULT_ROUNDS,
  terms: SeriesTerms = {},
): EventSection[] => [...seriesTrailingSections(startsAt, offsets, undefined, terms)];

/** FAQ for the series. The certificate and submission answers differ by terms. */
function seriesFaq(terms: SeriesTerms = {}) {
  return [
    { q: "How does it run?", a: "Three rounds: the plan, the build, then the finish. Dates for each round go out with the brief." },
    { q: "What does it cost?", a: `Registering is free, and so are Rounds 1 and 2. Only teams selected for Round 3 pay a participation fee of ${ROUND_3_FEE} per team \u2014 one payment for the whole team, not one each \u2014 and that is the only payment anywhere in the event: nothing to be judged, and nothing to be certified. A team that is not selected for Round 3 pays nothing at all.` },
    { q: "Are problem statements provided?", a: "Yes. The organisers release the problem statement one hour before the hackathon starts, to everyone at once. There is nothing to prepare against beforehand." },
    { q: "What happens between rounds?", a: "Every team that submitted is emailed its result, selected or not — you do not have to guess, and you do not have to wait for a group post. The teams that go through get the instructions for the next stage in the same email." },
    { q: "How many teams get through?", a: "More than 1,000 teams start in Round 1 and every one of them competes. 300 go through to Round 2, 100 to the final round, and three teams win. Meeting a round's requirements does not by itself carry you into the next one — the places are competitive." },
    terms.submission === "individual"
      ? { q: "Who submits for the team?", a: `Everybody, separately. Each member files their own entry for the same project every round, names the role they held — ${ROLE_SET} — and says what they built. Nobody submits on anyone else's behalf, and a member who files no entry is not recorded as having taken part and is not issued a certificate.` }
      : { q: "Who submits for the team?", a: "The team leader, once per round. Members do not submit separately." },
    { q: "Do I need a working product in Round 1?", a: "No. Round 1 is one PDF on the official format — the problem, the users, the solution, the workflow, the features, the stack and the plan." },
    { q: "What are the three improvements in Round 2?", a: "At Round 2 you name the three major improvements you will make in Round 3. They have to be substantial work on the product, not cosmetic changes, and Round 3 is measured against delivering them." },
    { q: "Can I take part on my own?", a: "Yes. Solo entries are allowed, and so are teams of up to four." },
    { q: "Can beginners enter?", a: "Yes. The event is built for first-timers and experienced builders alike, judged on the same criteria." },
    { q: "Can my team come from different colleges?", a: "Yes. Members can be from different institutions, cities or backgrounds entirely." },
    { q: "Can I use AI tools?", a: "Yes. Disclose the significant ones in your submission." },
    { q: "Can I use something I built earlier?", a: "No. The product has to be built during the event, and submissions are checked. Disclosed reusable components are fine; a finished project is not." },
    { q: "Is deployment compulsory?", a: "From Round 2 you need a link judges can open and use. If you cannot deploy, provide a reliable executable the judges can run." },
    { q: "Are social media posts required?", a: "No. Nothing on LinkedIn, Instagram or anywhere else is part of a submission, and no video demonstration is required." },
    {
      q: "What certificate do I get?",
      a:
        terms.certificates === "finalists"
          ? "Only the final round earns one: a National Finalist Certificate for a valid Round 3 submission, or a Winner Certificate naming your rank if you finish in the top three. A finalist certificate does not print a position — only the three winners are placed. Rounds 1 and 2 are qualifying rounds, and they carry no certificate, not even for taking part."
          : "One certificate, at the highest stage you reach: a Round 1 Completion Certificate for a valid Round 1 submission, a Round 2 Completion Certificate for a valid Round 2 submission, a National Finalist Certificate for finalists with a valid Round 3 submission, and a Winner Certificate naming your rank if you finish in the top three. Only the three winners are placed; no other certificate carries a position. Clearing a round upgrades that certificate rather than adding a second one.",
    },
    { q: "Where are results announced?", a: "In the official group: the three winning team names, along with the GitHub repository of what each of them built. That is the whole announcement. Only those three are placed — no ranking list goes up, no other team is given a position, and no certificate below winner prints one. Nobody's personal details are shared without their consent." },
    { q: "Who judges, and when do results and certificates arrive?", a: "Rounds 1 and 2 are judged in-house by the We Code Coders organising team, so those results come back quickly — and every team that submitted is emailed its Round 1 and Round 2 result, selected or not, without a score or a position. The final round is judged by Inkloom — an outside panel takes longer but picks the strongest winner, and final results are declared one week after the hackathon ends. Certificates follow within 10 days of the results being announced." },
  ];
}

/*
  The 48-hour build.

  Five of the hackathons do not run rounds at all: the problem statement lands
  an hour before the clock starts, teams build for forty-eight hours, and one
  submission from the team leader is what gets judged. There is nothing to
  clear first and nothing to pay at any stage.

  Written once here for the same reason the three-round series is — the five
  make an identical promise, and the only way that stays true while one record
  is edited is for there to be a single copy to edit. What differs per event
  stays on the record: the dates, the rewards, the poster, and where the
  winners' announcement points.

  "sprint" is the single 48-hour window, as against the series' three rounds.
*/

/**
 * How long the window is.
 *
 * Most of these run forty-eight hours; the three HackWithPune events run
 * thirty-six. The copy spells the number out mid-sentence while the block
 * label and the kicker print the digits, so the window carries both forms
 * rather than being formatted at every mention.
 */
type SprintWindow = { hours: number; words: string };
const H48: SprintWindow = { hours: 48, words: "forty-eight hours" };
const H36: SprintWindow = { hours: 36, words: "thirty-six hours" };

/** The block label, which is also what the test suite keys this format on. */
const sprintLabel = (w: SprintWindow) => `How the ${w.hours} hours run`;

/**
 * The organiser's own promise about results and certificates.
 *
 * Everything else about a single-window build is identical across the events
 * that run one; this is not. We Code Coders has Inkloom judge, declares
 * results a week after the event and sends certificates within ten days of
 * that announcement. HackWithPune publishes fifteen days from the end of the
 * event and names no judge, so nothing here may claim one for them.
 */
type SprintDelivery = {
  /** The closing lines of the certificates block. */
  certificates: string[];
  /** The FAQ answer to when results and certificates arrive. */
  faq: string;
};

const WCC_DELIVERY: SprintDelivery = {
  certificates: [
    "Submissions are judged by Inkloom, as every event in this series is, and final results are declared one week after the hackathon ends.",
    "Certificates are distributed within 10 days of the results being announced, not from the day the event ends.",
  ],
  faq: "Submissions are judged by Inkloom, and final results are declared one week after the hackathon ends, once every eligible submission has been reviewed. Certificates follow within 10 days of the results being announced.",
};

const HWP_DELIVERY: SprintDelivery = {
  certificates: [
    "Prizes and certificates are released within 15 days of the event ending, which is the window HackWithPune publishes for this hackathon.",
  ],
  faq: "HackWithPune releases the prizes and the certificates within 15 days of the event ending, and announces the results in the official group before that.",
};

/**
 * Judging: one sheet, out of 100.
 *
 * The three-round sheets cannot be reused here. There is no plan submitted
 * before the code, so "progress against the plan" has nothing to measure
 * against, and a team is ranked once rather than three times. These criteria
 * carry no `round`, which is what puts them in the event's own table on the
 * detail page rather than inside a round panel.
 */
function sprintJudging() {
  return [
    {
      name: "Understanding of the problem statement",
      weight: "20 points",
      detail:
        "Have you read what was actually asked? Who holds this problem, what it costs them today, and which part of it you took on rather than all of it.",
    },
    {
      name: "The solution, and whether it runs",
      weight: "25 points",
      detail:
        "A judge opens your link and completes the main journey without being talked through it. Forty-eight hours is short, so rough edges are expected — a broken middle is not.",
    },
    {
      name: "Technical depth and reliability",
      weight: "20 points",
      detail:
        "How well have you used what you chose? Do the integrations, data flows and AI components hold together under ordinary use?",
    },
    {
      name: "Originality of approach",
      weight: "15 points",
      detail:
        "Every team has the same brief. What is different about your reading of it, or the angle you took on it?",
    },
    {
      name: "Usability and real-world fit",
      weight: "12 points",
      detail:
        "Could the intended user work it out without a walkthrough? Is it practical in the setting it is meant for?",
    },
    {
      name: "Documentation and what comes next",
      weight: "8 points",
      detail:
        "Could someone else run this from the repository? And is the next step a credible plan rather than a wish list?",
    },
  ];
}

/** What the window asks for, and what arrives at the end of it. */
const sprintBuild = (w: SprintWindow): EventSection => ({
  kind: "list",
  label: sprintLabel(w),
  intro:
    `One problem statement, ${w.words}, and an entry from every person who built. The problem statement is released by the organisers an hour before the clock starts, so every team begins from the same brief at the same moment. There are no qualifying rounds and nothing to clear first. Every participant submits: the project is filed once per member rather than once per team, and each person names the role they held on it — ${ROLE_SET} — and writes in their own words the part they built. Those two answers are what your certificate prints, so a member who files nothing has nothing recorded and is not issued one. Taking part is free from start to finish. No promotional posts, no social links and no video demonstrations are required; only the documents and project links listed here.`,
  items: [
    "A link to the working project, which a judge must be able to open and use without being talked through it",
    "The source-code repository, with whatever access judges need to read it",
    "A project PDF on the official format: the problem as you read it, who has it, your solution and the workflow through it",
    "The list of features you completed, and anything you knowingly left undone",
    "The technology stack, and a short summary of how it is put together",
    "Testing notes for the main journeys",
    "Where the product would go next, if you carried on with it",
    "Team and participant details",
    "Your own role on the project, and the part you built, in your own words — these are the two lines your certificate prints",
  ],
});

/**
 * Rules for the 48-hour build.
 *
 * Rules 1 to 3 are the anti-backdating rules and they are deliberately blunt,
 * for the reason given above seriesRules: a hackathon that cannot say this
 * plainly loses the teams who respected the clock. They state that the
 * checking happens and stop there — naming the signals would be a checklist
 * for defeating them.
 */
const sprintRules = (
  w: SprintWindow,
  winnerLink = "the GitHub repository of what each of them built",
): EventSection => ({
  kind: "list",
  label: "Rules",
  numbered: true,
  items: [
    `The product must be built inside the official hackathon window — the ${w.words} this event runs for. Work that existed before the clock started does not count.`,
    "We verify this. Submissions are checked, judges may ask a team to evidence that the work was done inside the window, and we do not discuss how those checks are run.",
    "A project found to have been built before the event does not win, however good it is. There is no partial credit for this and no appeal.",
    "You may research, plan and discuss ideas before the event. Thinking is not building.",
    "Existing libraries, APIs, frameworks and open-source components are allowed.",
    "Templates or code you wrote earlier must be clearly disclosed in the submission.",
    "Only work done during the event counts towards judging.",
    "AI, no-code and low-code tools are allowed, and the significant ones must be disclosed.",
    "Taking part is free. There is no participation fee at any stage of this event, nothing to pay to be judged or certified, and nobody from We Code Coders will ask you for money.",
    "Every participant belongs to one team only.",
    "The project must be the team's own work.",
    "Plagiarised, copied or misleading submissions are disqualified.",
    "Respect software licences, intellectual property and user privacy.",
    "Projects must not promote illegal, harmful or discriminatory activity.",
    "One submission per participant, not one per team. Every member files their own entry for the same project, names the role they held on it and states the part they built; a second entry from the same person is not counted.",
    "A participant who files no entry of their own is not recorded as having taken part, and is not issued a certificate, even where the team's project was submitted by somebody else.",
    `Everything on the submission list has to arrive before the ${w.words} are up. There is no late window.`,
    "Judges may ask for repository access or other proof of development at any point.",
    "Organisers may remove anyone who disrupts the event or breaks community guidelines.",
    "Do not ask an organiser, judge or volunteer to break a rule, waive a requirement or make an exception in your favour. You may ask once; when the answer is no, that is the answer.",
    "Pressuring, forcing, threatening or intimidating an organiser, judge or volunteer disqualifies the whole team, not only the person who sent the message.",
    "The judges' decision is final.",
    `Results go up in the official group: the three winning team names, along with ${winnerLink}. No participant's personal details, and nothing further from a team's submission, are shared or passed on unless we have that team's consent.`,
    "Only the top three are placed. The three winning teams are named with a link to what each of them built, and their certificates print the rank; no other team is given a position, no ranking list is published, and no certificate below winner carries a placing.",
    "Scores, judging sheets, internal notes and comparative breakdowns are not shared, and there is no personal feedback, re-evaluation or second presentation.",
  ],
});

/**
 * Certificates for the 48-hour build.
 *
 * One round means one promise, and it is the simplest the site makes: build
 * something and submit it inside the window, and you are certified. Its own
 * block rather than more lines in `rewards`, because what this states is a
 * rule — who is issued a certificate and who is not — and a rule filed among
 * the prizes reads as a prize.
 */
const sprintCertificates = (
  w: SprintWindow,
  delivery: SprintDelivery = WCC_DELIVERY,
): EventSection => ({
  kind: "list",
  label: "Certificates",
  intro:
    `One certificate, and everyone who builds gets one. Every participant who files a valid entry of their own inside the ${w.words} is issued a certificate — you do not have to place, and there is nothing to pay for it.`,
  items: [
    "A Certificate of Participation, for every member who files a valid entry of their own inside the window.",
    "A Winner Certificate naming the rank — first, second or third — for the three winning teams.",
    "Registering is not taking part. A participant who files no entry of their own, or whose entry is not valid, is not issued a certificate — including where the rest of the team submitted.",
    "Your certificate names the role you declared and the part you built, in the words you submitted them in. That is why every member files their own entry rather than one per team.",
    "Each participant receives one certificate only: a winning team's members are issued the Winner Certificate rather than both.",
    "Only the top three are placed. The group announcement carries those three team names and a link to what they built, and their certificates print the rank — first, second or third. No other team is told a position, and none is printed on its certificate.",
    ...delivery.certificates,
  ],
});

/** The three blocks, in the order they appear on a detail page. */
const sprintSections = (
  w: SprintWindow,
  winnerLink?: string,
  delivery: SprintDelivery = WCC_DELIVERY,
): EventSection[] => [
  sprintBuild(w),
  sprintRules(w, winnerLink),
  sprintCertificates(w, delivery),
];

/** FAQ for a single-window build. */
function sprintFaq(
  w: SprintWindow,
  winnerLink = "the GitHub repository of what each of them built",
  delivery: SprintDelivery = WCC_DELIVERY,
) {
  return [
    { q: "How does it run?", a: `One window, ${w.words} long. The problem statement lands an hour before it opens, you build, and you submit once before it closes. There are no qualifying rounds.` },
    { q: "Is it free?", a: "Yes. Registration is free, taking part is free, and there is no participation fee at any stage — not to be judged, and not to be certified." },
    { q: "Are problem statements provided?", a: "Yes. The organisers release the problem statement one hour before the hackathon starts, to everyone at once. There is nothing to prepare against beforehand." },
    { q: "Who submits for the team?", a: `Everybody, separately. Each member files their own entry for the same project before the window closes, names the role they held — ${ROLE_SET} — and says what they built. Nobody submits on anyone else's behalf, and a member who files no entry is not recorded as having taken part and is not issued a certificate.` },
    { q: "Will everyone get a certificate?", a: `Everyone who builds and files their own entry, yes. Every member who makes a valid submission inside the ${w.words} is issued a Certificate of Participation, and the winning teams are issued a Winner Certificate naming their rank instead. Registering without submitting does not earn one, and neither does leaving the submission to a teammate.` },
    { q: "Can I take part on my own?", a: "Yes. Solo entries are allowed, and so are teams of up to four." },
    { q: "Can beginners enter?", a: "Yes. The event is built for first-timers and experienced builders alike, judged on the same criteria." },
    { q: "Can my team come from different colleges?", a: "Yes. Members can be from different institutions, cities or backgrounds entirely." },
    { q: "Can I use AI tools?", a: "Yes. Disclose the significant ones in your submission." },
    { q: "Can I use something I built earlier?", a: "No. The product has to be built during the window, and submissions are checked. Disclosed reusable components are fine; a finished project is not." },
    { q: "Is deployment compulsory?", a: "You need a link judges can open and use. If you cannot deploy, provide a reliable executable the judges can run." },
    { q: "Are social media posts required?", a: "No. Nothing on LinkedIn, Instagram or anywhere else is part of a submission, and no video demonstration is required." },
    { q: "Where are results announced?", a: `In the official group: the three winning team names, along with ${winnerLink}. That is the whole announcement. Only those three are placed — no ranking list goes up, no other team is given a position, and a Certificate of Participation does not print one. Nobody's personal details are shared without their consent.` },
    { q: "When do results and certificates arrive?", a: delivery.faq },
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

/**
 * Billing for the HackWithPune events.
 *
 * The organiser line is theirs. No We Code Coders role is claimed on them:
 * carrying a listing is not a partnership, and billing one that has not been
 * agreed would be a claim about a relationship rather than a credit. The
 * credit providers the listings name — Inkloom, Adaption and .XYZ — are in
 * each event's rewards, where those listings put them.
 */
const HWP_SPONSORS = [
  { name: "HackWithPune", role: "Organised by" },
  { name: "Unstop", role: "Official event partner", logo: "/sponsors/unstop.png" },
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
      { label: "Entry fee", value: "Free" },
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
    kicker: "HACKATHON — 48 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-30T10:00:00+05:30",
    endsAt: "2026-11-01T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "Forty-eight hours to turn one problem statement into a product that runs. National, online and free to enter, with ₹25,000 in cash and PPO opportunities for the top three teams.",
    description: [
      "WCC Forge 48 asks for one thing: a working product. Not a deck, not a concept, not an idea you would build if you had more time — something a person can open and use by the time the forty-eight hours are up.",
      "One window, one problem statement, and one submission at the end of it. Read the brief, choose the single journey through it that matters most, and build that journey until it runs reliably. Scope is the hard part. Teams here rarely run out of ideas — they run out of decisions.",
      "Projects are judged on whether they work and whether they are worth using. A narrow product with one dependable workflow beats a broad one held together with screenshots.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
    forWho: "Students, developers, designers, AI builders and first-time hackers.",
    tags: [
      "agentic ai",
      "digital twins",
      "human-computer interaction",
      "online",
      "product building",
    ],
    teamSize: "1 to 4. Every member registers individually under the same team name.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is open nationally.",
    brief:
      "Take the problem statement and build the one workflow that solves it, in forty-eight hours.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the problem as you read it, what you built, and where it would go next",
      "A certificate for every member who files their own submission inside the 48 hours",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Before it starts", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Fri 30 Oct, 09:00", what: "The problem statement and the official PDF format go out, to everyone at the same moment." },
      { when: "Fri 30 Oct, 10:00", what: "The forty-eight hours open. Build the one workflow that solves it." },
      { when: "Sun 1 Nov, 10:00", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: sprintJudging(),
    rewards: [
      "₹25,000 in cash, shared among the top three teams",
      "PPO opportunities for the top three teams",
      "100+ reward recipients across the hackathon, giveaways and mini-challenges",
      "Special awards for exceptional projects",
      "Lovable Premium, AI tools and a .XYZ domain",
    ],
    sections: sprintSections(H48, "the live URL of what each of them built"),
    faq: [
      ...sprintFaq(H48, "the live URL of what each of them built"),
      { q: "Does every team member have to register?", a: "Yes, individually — and everyone must use the same team name so the entries can be matched up." },
      { q: "How is the cash split?", a: "Across the top three teams. The exact split is announced before the hackathon begins." },
      { q: "Are the PPO opportunities guaranteed?", a: "No. They are subject to the recruiting partner's own eligibility requirements and selection process." },
    ],
    stats: [
      { label: "Hours to build", value: "48" },
      { label: "Cash prize", value: "₹25,000" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
      { label: "Entry fee", value: "Free" },
    ],
    sponsors: [
      { name: "Inkloom", role: "Title sponsor", logo: "/sponsors/inkloom.png" },
      { name: "Unstop", role: "Official event partner", logo: "/sponsors/unstop.png" },
      { name: ".XYZ", role: "Domain partner", logo: "/sponsors/xyz.png" },
    ],
    registration: {
      href: "https://unstop.com/p/wcc-forge-48-wecodecoders-1756040",
      label: "Register on Unstop",
      note: "Free to enter, for teams of one to four. Registration closes 29 October at 23:59 IST. Every member registers individually on Unstop under the same team name, and files their own submission.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9001,
    posterImage: "/posters/wcc-forge-48-v2.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Judging
    // and rules are shared with the other four.
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
      "A national online hackathon where students, developers and designers build functional technology products that address real problems. Three rounds, teams of one to four. Free to enter, with a ₹399 per-team fee only at Round 3.",
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
      "One certificate at the highest level you reached — Round 1 completion, Round 2 completion, national finalist, or winner with the rank on it",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Tue 20 Oct — Wed 21 Oct", what: "Round 1. The official PDF format goes out; the idea and the plan are due by 18:00 on the 21st." },
      { when: "Thu 22 Oct — Sun 25 Oct", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Wed 28 Oct — Fri 30 Oct", what: "Round 3. Finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Every team is emailed its Round 1 and Round 2 result, selected or not. Teams that go through receive the instructions for the next stage with it." },
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
      "A National Finalist Certificate, with no position on it, for finalists with a valid Round 3 submission",
      "A Winner Certificate naming the rank, for the three winning teams",
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
      { label: "Rounds 1–2", value: "Free" },
      { label: "Round 3 fee / team", value: "₹399" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/techcircuit-hackathon-wecodecoders-1758409",
      label: "Register on Unstop",
      note: "Teams of one to four. Registering and Rounds 1 and 2 are free; only teams selected for Round 3 pay ₹399 per team. Registration closes 19 October at 23:59 IST.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9101,
    posterImage: "/posters/tech-circuit-v2.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Judging
    // and rules are shared with the other four.
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
      "Three rounds to turn an idea into a finished product with modern tooling. National and online, with PPO and incubation opportunities for the top three teams. Free to enter, with a ₹399 per-team fee only at Round 3.",
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
      "One certificate at the highest level you reached — Round 1 completion, Round 2 completion, national finalist, or winner with the rank on it",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Tue 20 Oct — Wed 21 Oct", what: "Round 1. The official PDF format goes out; the idea and the plan are due by 18:00 on the 21st." },
      { when: "Thu 22 Oct — Sun 25 Oct", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Wed 28 Oct — Fri 30 Oct", what: "Round 3. Finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Every team is emailed its Round 1 and Round 2 result, selected or not. Teams that go through receive the instructions for the next stage with it." },
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
      "A National Finalist Certificate, with no position on it, for finalists with a valid Round 3 submission",
      "A Winner Certificate naming the rank, for the three winning teams",
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
      { label: "Rounds 1–2", value: "Free" },
      { label: "Round 3 fee / team", value: "₹399" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–6" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/futurestack-hackathon-wecodecoders-1758558",
      label: "Register on Unstop",
      note: "Teams of one to six. Registering and Rounds 1 and 2 are free; only teams selected for Round 3 pay ₹399 per team. Registration closes 19 October at 23:59 IST.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9102,
    posterImage: "/posters/future-stack-v3.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Judging
    // and rules are shared with the other four.
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
      "A national online hackathon focused on practical, technology-driven solutions to problems that actually matter. Three rounds, one problem statement. Free to enter, with a ₹399 per-team fee only at Round 3.",
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
      "One certificate at the highest level you reached — Round 1 completion, Round 2 completion, national finalist, or winner with the rank on it",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Tue 20 Oct — Wed 21 Oct", what: "Round 1. The official PDF format goes out; the idea and the plan are due by 18:00 on the 21st." },
      { when: "Thu 22 Oct — Sun 25 Oct", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Wed 28 Oct — Fri 30 Oct", what: "Round 3. Finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Every team is emailed its Round 1 and Round 2 result, selected or not. Teams that go through receive the instructions for the next stage with it." },
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
      "A National Finalist Certificate, with no position on it, for finalists with a valid Round 3 submission",
      "A Winner Certificate naming the rank, for the three winning teams",
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
      { label: "Rounds 1–2", value: "Free" },
      { label: "Round 3 fee / team", value: "₹399" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codeaxis-hackathon-wecodecoders-1758538",
      label: "Register on Unstop",
      note: "Teams of one to four. Registering and Rounds 1 and 2 are free; only teams selected for Round 3 pay ₹399 per team. Registration closes 19 October at 23:59 IST.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9103,
    posterImage: "/posters/code-axis-v2.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Judging
    // and rules are shared with the other four.
    locked: false,
    featured: true,
    slug: "codex-48",
    title: "Codex 48",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-24T10:00:00+05:30",
    endsAt: "2026-11-02T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "Three rounds to turn an original idea into a finished, working product. National and online, with paid internship and incubation opportunities for the top three teams. Free to enter, with a ₹399 per-team fee only at Round 3.",
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
      "A National Finalist certificate if you reach the final round, or a Winner certificate naming the rank if you finish in the top three — Rounds 1 and 2 carry none",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Before it starts", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Sat 24 Oct — Sun 25 Oct", what: "Round 1. The official PDF format goes out; two days to submit the idea and the plan." },
      { when: "Mon 26 Oct — Wed 28 Oct", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Sat 31 Oct — Mon 2 Nov", what: "Round 3. Three days to finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Every team is emailed its Round 1 and Round 2 result, selected or not. Teams that go through receive the instructions for the next stage with it." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: seriesJudging(),
    rewards: [
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across sponsor challenges, mini-challenges and giveaways",
      "A National Finalist Certificate, with no position on it, for finalists with a valid Round 3 submission",
      "A Winner Certificate naming the rank, for the three winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-24T10:00:00+05:30", COMPACT_ROUNDS, {
      certificates: "finalists",
      submission: "individual",
    }),
    faq: seriesFaq({ certificates: "finalists", submission: "individual" }),
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Rounds 1–2", value: "Free" },
      { label: "Round 3 fee / team", value: "₹399" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codex-48-national-level-hackathon-wecodecoders-1761082",
      label: "Register on Unstop",
      note: "Teams of one to four. Registering and Rounds 1 and 2 are free; only teams selected for Round 3 pay ₹399 per team. Every member registers individually and files their own submission.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9104,
    posterImage: "/posters/codex-48-v1.webp",
  },
  {
    // LIVE. Part of the October 2026 series — real event, real poster. Judging
    // and rules are shared with the other four.
    locked: false,
    featured: true,
    slug: "codestar-30",
    title: "CodeStar 30",
    kicker: "HACKATHON — 3 ROUNDS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-24T10:00:00+05:30",
    endsAt: "2026-11-02T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "Three rounds for students and young builders to develop and present a functional technology product. National and online, with paid internship and incubation opportunities for the top three teams. Free to enter, with a ₹399 per-team fee only at Round 3.",
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
      "A National Finalist certificate if you reach the final round, or a Winner certificate naming the rank if you finish in the top three — Rounds 1 and 2 carry none",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Before it starts", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Sat 24 Oct — Sun 25 Oct", what: "Round 1. The official PDF format goes out; two days to submit the idea and the plan." },
      { when: "Mon 26 Oct — Wed 28 Oct", what: "Round 2. Three days to turn the proposal into a product whose central workflow runs." },
      { when: "Sat 31 Oct — Mon 2 Nov", what: "Round 3. Three days to finish it — including the three improvements you named." },
      { when: "Between rounds", what: "Every team is emailed its Round 1 and Round 2 result, selected or not. Teams that go through receive the instructions for the next stage with it." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: seriesJudging(),
    rewards: [
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across sponsor challenges, mini-challenges and giveaways",
      "A National Finalist Certificate, with no position on it, for finalists with a valid Round 3 submission",
      "A Winner Certificate naming the rank, for the three winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: seriesSections("2026-10-24T10:00:00+05:30", COMPACT_ROUNDS, {
      certificates: "finalists",
      submission: "individual",
    }),
    faq: seriesFaq({ certificates: "finalists", submission: "individual" }),
    stats: [
      { label: "Rounds", value: "3" },
      { label: "Rounds 1–2", value: "Free" },
      { label: "Round 3 fee / team", value: "₹399" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codestar-30-national-level-hackathon-wecodecoders-1760472",
      label: "Register on Unstop",
      note: "Teams of one to four. Registering and Rounds 1 and 2 are free; only teams selected for Round 3 pay ₹399 per team. Every member registers individually and files their own submission.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9105,
    posterImage: "/posters/codestar-30-v1.webp",
  },
  {
    // LIVE. One of the five 48-hour builds — real event, real poster. The
    // submission list, rules, certificates and judging are shared with the
    // other four.
    locked: false,
    featured: true,
    slug: "codeverse-india",
    title: "CodeVerse India",
    kicker: "HACKATHON — 48 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-30T10:00:00+05:30",
    endsAt: "2026-11-01T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online AI and coding hackathon: forty-eight hours, one finished product. Free to enter, teams of one to four, with paid internship and incubation opportunities for the top three teams.",
    description: [
      "CodeVerse India is a national-level online AI and coding hackathon, run in a single forty-eight-hour window — one problem statement carried from an empty repository to a thing that runs.",
      "Open to undergraduates, postgraduates and students from engineering, management, arts, commerce and the sciences alike. The criteria are the same for everyone.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "online",
      "national",
      "48 hours",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "Undergraduate and postgraduate students across engineering, management, arts, commerce and the sciences, alongside developers, designers, AI and no-code builders and first-timers. Registration is open nationally.",
    brief:
      "Build a working product in forty-eight hours, against the problem statement you are given.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the problem as you read it, what you built, and where it would go next",
      "A certificate for every member who files their own submission inside the 48 hours",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Until Thu 29 Oct, 07:30", what: "Registration open. Form a team of one to four and join the official group." },
      { when: "Fri 30 Oct, 09:00", what: "The problem statement and the official PDF format go out, to everyone at the same moment." },
      { when: "Fri 30 Oct, 10:00", what: "The forty-eight hours open. Build the one workflow that solves it." },
      { when: "Sun 1 Nov, 10:00", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: sprintJudging(),
    rewards: [
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "100+ reward recipients across the hackathon",
      "A certificate for every participant who files their own submission inside the 48 hours",
      "A Winner Certificate naming the rank, for the three winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: sprintSections(H48),
    faq: sprintFaq(H48),
    stats: [
      { label: "Hours to build", value: "48" },
      { label: "Reward recipients", value: "100+" },
      { label: "Per team", value: "1–4" },
      { label: "Entry fee", value: "Free" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codeverse-india-national-level-hackathon-wecodecoders-1763003",
      label: "Register on Unstop",
      note: "Free to enter, for teams of one to four. Registration closes 29 October at 07:30 IST. Every member registers individually and files their own submission.",
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
    // LIVE. One of the five 48-hour builds — real event, real poster. The
    // submission list, rules, certificates and judging are shared with the
    // other four.
    locked: false,
    featured: true,
    slug: "codehack-india",
    title: "CodeHack India",
    kicker: "HACKATHON — 48 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-28T10:00:00+05:30",
    endsAt: "2026-10-30T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online technology hackathon: forty-eight hours to build a working solution. Free to enter, teams of one to four, with paid internship and incubation opportunities for the top three teams.",
    description: [
      "CodeHack India is a national-level online technology hackathon that asks for one thing: a working solution, planned, built and finished inside forty-eight hours.",
      "Submissions are scored on the six published criteria below, and they are on this page before you start.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: [
      "agentic ai",
      "full-stack",
      "online",
      "national",
      "48 hours",
    ],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "School and college students, developers, designers, AI and no-code builders, first-timers and early-stage teams. Registration is open nationally.",
    brief:
      "Build a working solution to the problem statement you are given, in forty-eight hours.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the problem as you read it, what you built, and where it would go next",
      "A certificate for every member who files their own submission inside the 48 hours",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Before it starts", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Wed 28 Oct, 09:00", what: "The problem statement and the official PDF format go out, to everyone at the same moment." },
      { when: "Wed 28 Oct, 10:00", what: "The forty-eight hours open. Build the one workflow that solves it." },
      { when: "Fri 30 Oct, 10:00", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: sprintJudging(),
    rewards: [
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "A certificate for every participant who files their own submission inside the 48 hours",
      "A Winner Certificate naming the rank, for the three winning teams",
      "A functional product you can put on a résumé or in a portfolio",
    ],
    sections: sprintSections(H48),
    faq: sprintFaq(H48),
    stats: [
      { label: "Per team", value: "1–4" },
      { label: "Hours to build", value: "48" },
      { label: "Entry fee", value: "Free" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/p/codehack-india-national-level-hackathon-wecodecoders-1762158",
      label: "Register on Unstop",
      note: "Free to enter, for teams of one to four. Every member registers individually and files their own submission.",
    },
    // Chosen so the generated ground is "paper", matching the artwork the
    // hover tint and the ring's glow are pulled from.
    posterSeed: 9106,
    posterImage: "/posters/codehack-india-v2.webp",
  },
  {
    /*
      LIVE. November series, and one of the five 48-hour builds: one problem
      statement, one window, one submission, no fee, and a certificate for
      every participant whose team submits. The submission list, rules,
      certificates and judging are shared with the other four.
    */
    locked: false,
    featured: true,
    slug: "codenexus-india",
    title: "CodeNexus India 2026",
    kicker: "HACKATHON — 48 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-11-02T10:00:00+05:30",
    endsAt: "2026-11-04T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online hackathon in a single forty-eight-hour window: one problem statement, one working product. Free to enter, teams of one to four, with ₹30,000 in prizes, paid internships and incubation for the top three.",
    description: [
      "CodeNexus India 2026 is a national-level online hackathon run in one forty-eight-hour window. The problem statement lands an hour before the clock starts, and what you submit at the end of it is what decides whether you built a product.",
      "Submissions are scored on one published sheet, out of 100, and it is on this page before you start.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: ["agentic ai", "full-stack", "online", "national", "48 hours"],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "Undergraduate and postgraduate students across engineering, management, arts, commerce and the sciences, alongside developers, designers and first-timers. Registration is open nationally.",
    brief:
      "Build a working solution to the problem statement you are given, in forty-eight hours.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the problem as you read it, what you built, and where it would go next",
      "A certificate for every member who files their own submission inside the 48 hours",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Until Mon 2 Nov, 02:00", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Mon 2 Nov, 09:00", what: "The problem statement and the official PDF format go out, to everyone at the same moment." },
      { when: "Mon 2 Nov, 10:00", what: "The forty-eight hours open. Build the one workflow that solves it." },
      { when: "Wed 4 Nov, 10:00", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: sprintJudging(),
    rewards: [
      "₹30,000 in prizes, shared among the top three teams — awarded as cash, as AI or platform credits, or as a combination of them",
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "$500 in Adaption Labs credits for every eligible participant",
      "$100 in Agentverse credits for every eligible participant",
      "100+ reward recipients across the hackathon",
      "A certificate for every participant who files their own submission inside the 48 hours",
      "A Winner Certificate naming the rank, for the three winning teams",
    ],
    sections: sprintSections(H48),
    faq: sprintFaq(H48),
    stats: [
      { label: "Prize pool", value: "₹30,000" },
      { label: "Per team", value: "1–4" },
      { label: "Hours to build", value: "48" },
      { label: "Entry fee", value: "Free" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codenexus-india-2026-national-hackathon-wecodecoders-1764747",
      label: "Register on Unstop",
      note: "Free to enter, for teams of one to four. Registration closes 2 November at 02:00 IST. Every member registers individually and files their own submission.",
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
      LIVE. November series, a few days behind CodeNexus, and one of the five
      48-hour builds: one problem statement, one window, one submission, no
      fee, and a certificate for every participant whose team submits. The
      Unstop listing still prints the old three-round windows and has to be
      corrected to 6 Nov 10:00 — 8 Nov 10:00 IST.
    */
    locked: false,
    featured: true,
    slug: "codetitans-india",
    title: "CodeTitans India 2026",
    kicker: "HACKATHON — 48 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-11-06T10:00:00+05:30",
    endsAt: "2026-11-08T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online hackathon in one forty-eight-hour window: read the brief, build it, ship it. Free to enter, teams of one to four, with ₹30,000 in prizes, paid internships and incubation for the top three.",
    description: [
      "CodeTitans India 2026 is a national-level online hackathon run in a single forty-eight-hour window, from a problem statement to a product someone could use.",
      "Submissions are scored on one published sheet, out of 100, and it is on this page before you start.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: ["agentic ai", "full-stack", "online", "national", "48 hours"],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "Undergraduate and postgraduate students across engineering, management, arts, commerce and the sciences, alongside developers, designers and first-timers. Registration is open nationally.",
    brief:
      "Take the problem statement, build the one workflow that solves it, and finish it inside forty-eight hours.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the problem as you read it, what you built, and where it would go next",
      "A certificate for every member who files their own submission inside the 48 hours",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Until Wed 4 Nov, 20:30", what: "Registration open. Form a team of one to four and join the official channel." },
      { when: "Fri 6 Nov, 09:00", what: "The problem statement and the official PDF format go out, to everyone at the same moment." },
      { when: "Fri 6 Nov, 10:00", what: "The forty-eight hours open. Build the one workflow that solves it." },
      { when: "Sun 8 Nov, 10:00", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: sprintJudging(),
    rewards: [
      "₹30,000 in prizes, shared among the top three teams — awarded as cash, as AI or platform credits, or as a combination of them",
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "$500 in Adaption Labs credits for every eligible participant",
      "$100 in Agentverse credits for every eligible participant",
      "100+ reward recipients across the hackathon",
      "A certificate for every participant who files their own submission inside the 48 hours",
      "A Winner Certificate naming the rank, for the three winning teams",
    ],
    sections: sprintSections(H48),
    faq: sprintFaq(H48),
    stats: [
      { label: "Prize pool", value: "₹30,000" },
      { label: "Per team", value: "1–4" },
      { label: "Hours to build", value: "48" },
      { label: "Entry fee", value: "Free" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      href: "https://unstop.com/hackathons/codetitans-india-2026-national-hackathon-wecodecoders-1766190",
      label: "Register on Unstop",
      note: "Free to enter, for teams of one to four. Registration closes 4 November at 20:30 IST. Every member registers individually and files their own submission.",
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
      LIVE. Announced on Unstop as a three-round event and cut to one 48-hour
      window, like the five before it: one problem statement, one entry per
      participant, nothing to pay, and a certificate for everyone who files
      one. The start is the one on the listing — 28 October at 10:00 — so the
      window closes on the 30th.

      No poster artwork yet, so the generated one stands in, and no Unstop URL
      in hand: registration renders as "not open" rather than as a button that
      goes nowhere. The listing also prints three tracks; this event issues a
      problem statement instead, as the rest of the series does.
    */
    locked: false,
    featured: true,
    slug: "code-conqueror-india",
    title: "Code Conqueror India 2026",
    kicker: "HACKATHON — 48 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-10-28T10:00:00+05:30",
    endsAt: "2026-10-30T10:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online hackathon in one forty-eight-hour window: one problem statement, one working product. Free to enter, teams of one to four, with ₹30,000 in prizes, paid internships and incubation for the top three.",
    description: [
      "Code Conqueror India 2026 is a national-level online hackathon run in a single forty-eight-hour window. The problem statement lands an hour before the clock starts, and what you submit at the end of it is what is judged.",
      "Submissions are scored on one published sheet, out of 100, and it is on this page before you start.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: ["agentic ai", "full-stack", "online", "national", "48 hours"],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "Undergraduate and postgraduate students across engineering, management, arts, commerce and the sciences, alongside developers, designers, AI and no-code builders and first-timers. Registration is open nationally.",
    brief:
      "Build a working solution to the problem statement you are given, in forty-eight hours.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the problem as you read it, what you built, and where it would go next",
      "A certificate for every member who files their own submission inside the 48 hours",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Until Mon 26 Oct, 23:59", what: "Registration open. Form a team of one to four and join the official group." },
      { when: "Wed 28 Oct, 09:00", what: "The problem statement and the official PDF format go out, to everyone at the same moment." },
      { when: "Wed 28 Oct, 10:00", what: "The forty-eight hours open. Build the one workflow that solves it." },
      { when: "Fri 30 Oct, 10:00", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: sprintJudging(),
    rewards: [
      "₹30,000 in prizes, shared among the top three teams — awarded as cash, as AI or platform credits, or as a combination of them",
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "A complimentary .XYZ domain for every participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "$500 in Adaption Labs credits for every eligible participant",
      "100+ reward recipients across the hackathon",
      "A certificate for every participant who files their own submission inside the 48 hours",
      "A Winner Certificate naming the rank, for the three winning teams",
    ],
    sections: sprintSections(H48),
    faq: sprintFaq(H48),
    stats: [
      { label: "Prize pool", value: "₹30,000" },
      { label: "Hours to build", value: "48" },
      { label: "Per team", value: "1–4" },
      { label: "Entry fee", value: "Free" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      note: "Free to enter, for teams of one to four. Registration closes 26 October at 23:59 IST. Every member registers individually and files their own submission. The Unstop link goes here once we have it.",
    },
    links: [
      { label: "Official WhatsApp group", href: "https://chat.whatsapp.com/FSZw2YHzBfoIJJty4L2j1Q" },
    ],
    // Paper. No artwork supplied, so the generated poster is what shows.
    posterSeed: 9109,
  },
  {
    /*
      LIVE. A quiz, not a hackathon — so no rounds, no problem statement and
      none of the series' shared blocks.

      It is not a sitting at a fixed minute any more: the paper opens at 10:00
      IST and closes at 18:00, and a participant sits it once at whatever
      point inside those eight hours suits them. The paper itself is fifteen
      questions and takes about fifteen minutes, which is the number the copy
      leads with — "Runs for 8 hours" on the spec list is the window, and
      every other mention has to make the difference obvious or a reader will
      block out an afternoon for a quarter of an hour's work.
    */
    locked: false,
    featured: true,
    slug: "codequest-quiz-india",
    title: "CodeQuest Quiz India 2026",
    kicker: "QUIZ — 15 QUESTIONS",
    format: "quiz",
    status: "upcoming",
    startsAt: "2026-11-03T10:00:00+05:30",
    endsAt: "2026-11-03T18:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A national online quiz on agentic AI, full-stack engineering and emerging technology. Fifteen questions, about fifteen minutes, sat once inside an eight-hour window. Free to enter, with ₹30,000 in prizes shared among the top three.",
    description: [
      "CodeQuest Quiz India 2026 is a national online quiz for people who build. The questions span autonomous systems, the engineering behind a working product, and the technologies arriving around both.",
      "The paper opens at 10:00 IST on 3 November and closes at 18:00. It is fifteen questions and takes about fifteen minutes, so the eight hours are there to let you choose when to sit down rather than to be spent on it. Everyone who completes it properly gets a verifiable certificate, and the rewards go well beyond the top three.",
    ],
    forWho: "Students, developers, AI enthusiasts and anyone curious about how modern systems are built.",
    tags: ["agentic ai", "full-stack", "quiz", "online", "national"],
    teamSize: "Individual. Everyone registers and attempts on their own.",
    eligibility:
      "Undergraduate and postgraduate students across engineering, management, arts, commerce and the sciences, alongside developers and self-taught builders. Registration is open nationally.",
    brief: "Fifteen questions across three subject areas, sat once inside an eight-hour window.",
    deliverables: [
      "One attempt at fifteen questions, submitted before the window closes",
    ],
    schedule: [
      { when: "Before the quiz", what: "Registration open. Join the official channel for the joining link, the deadline and the final instructions." },
      { when: "Tue 3 Nov, 10:00", what: "The paper opens. Fifteen questions, about fifteen minutes; sit it whenever suits you before it closes." },
      { when: "Tue 3 Nov, 18:00", what: "The paper closes. An attempt not submitted by then does not count." },
      { when: "After", what: "Responses validated, the leaderboard reviewed, results announced and certificates issued." },
    ],
    judging: [
      { name: "Total score", detail: "The primary ranking. Everything below is used to separate people who tie." },
      { name: "Correct answers", detail: "How many you got right across the paper." },
      { name: "Accuracy", detail: "Right answers against attempted ones, across the whole quiz." },
      { name: "Completion time", detail: "Used as a tie-breaker, alongside designated tie-breaker questions where needed." },
    ],
    rewards: [
      "₹30,000 in prizes, shared among the top three — awarded as cash, as AI or platform credits, or as a combination of them",
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
          "Fifteen questions across three areas, weighted evenly. The recommended reading goes out in the official channel before the quiz.",
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
            name: "Emerging technology",
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
          "Entering is free. There is no fee at any stage of this quiz, nothing to pay to be marked or certified, and nobody from We Code Coders will ask you for money.",
          "Duplicate, manipulated or suspicious entries may be disqualified.",
          "Begin and finish inside the eight-hour window, 10:00 to 18:00 IST. The paper takes about fifteen minutes; the window is wide so you can choose your moment, not so you can take all day over it.",
          "Report technical problems immediately through the official support channel.",
          "Organisers may review activity and response patterns to keep the event fair.",
          "Do not ask an organiser or volunteer to break a rule, waive a requirement or make an exception in your favour. You may ask once; when the answer is no, that is the answer.",
          "Pressuring, forcing, threatening or intimidating an organiser or volunteer removes you from the event. Where an organiser or volunteer reports feeling threatened, the entry is disqualified.",
          "Breaking the rules can cost you your leaderboard position, rewards and certificate.",
          "The organisers' decision on eligibility, ranking and disqualification is final.",
          "Results go up in the official group: the three winning names. No participant's personal details are shared or passed on unless we have their consent.",
          "Only the top three are placed. The group announcement names those three, and their certificates print the rank. No other participant is given a leaderboard position, by email or on a certificate.",
          "Scores, answer sheets, internal notes and comparative breakdowns are not shared, and there is no personal feedback, re-evaluation or second attempt.",
        ],
      },
    ],
    faq: [
      { q: "Is it free?", a: "Yes. Registration costs nothing." },
      { q: "Is this a quiz or a hackathon?", a: "A quiz, in one sitting. There is nothing to build and nothing to submit beforehand." },
      { q: "When exactly does it start?", a: "The paper opens at 10:00 IST on 3 November and closes at 18:00. One attempt, at any point in between. The joining link goes out in the official group ahead of the day." },
      { q: "How long does it take?", a: "Fifteen questions, about fifteen minutes on average. The eight-hour window is there so you can pick your moment — it is not eight hours of quiz." },
      { q: "Can beginners take part?", a: "Yes. Recommended reading goes out in the official channel before the quiz." },
      { q: "Will everyone get a certificate?", a: "Everyone who registers, joins through the official link, completes and submits the quiz, follows the rules and passes the integrity checks. One certificate per participant, distributed within 10 days of the results being announced. Registering alone does not qualify." },
      { q: "When are results announced?", a: "After the responses are validated and the leaderboard is reviewed. Timelines are shared through the official channel." },
      { q: "Where are results announced?", a: "In the official group: the three winning names, and nothing further. Only those three are placed — no leaderboard goes up, no other participant is given a position, and no certificate below winner prints one. Nobody's personal details are shared without their consent." },
    ],
    stats: [
      { label: "Questions", value: "15" },
      { label: "Typical time", value: "15 min" },
      { label: "Window", value: "8 hours" },
      { label: "Prize pool", value: "₹30,000" },
      { label: "Entry fee", value: "Free" },
    ],
    sponsors: SERIES_SPONSORS,
    registration: {
      note: "Free to enter, individually. Registration closes before the sitting; the deadline goes out in the official channel, and the Unstop link goes here once it is live.",
    },
    links: [
      { label: "Official WhatsApp group", href: "https://chat.whatsapp.com/Kiibri82NXEDIOmNhd9URn" },
    ],
    // Ink — lime and orange are the accents, the ground underneath is navy.
    posterSeed: 9130,
    posterImage: "/posters/codequest-quiz-india-v1.webp",
  },
  /*
    The HackWithPune hackathons.

    Three events by another organiser, carried here. They run the same single
    window as the We Code Coders builds — one problem statement an hour before
    the clock, an entry from every participant with the role they held, free
    throughout, a certificate for everyone who files one — but over thirty-six
    hours rather than forty-eight, which is the length their own listings run,
    and with HackWithPune's promise on when prizes and certificates arrive.

    All three were announced on Unstop for other dates and moved to 3 and 4
    November. Their registration deadlines are still tied to the old dates and
    have to be reset on Unstop, so none is printed here, and no Unstop URL is
    in hand for any of them. Their listings also print three tracks; these
    pages issue a problem statement instead.
  */
  {
    locked: false,
    slug: "codepunethinkers",
    title: "CodePuneThinkers Hackathon",
    kicker: "HACKATHON — 36 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-11-03T10:00:00+05:30",
    endsAt: "2026-11-04T22:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A HackWithPune hackathon: thirty-six hours, one problem statement, one working product. Free to enter, teams of one to four, with ₹30,000 in prizes, paid internships and incubation for the top three.",
    description: [
      "CodePuneThinkers is an online hackathon run by HackWithPune in a single thirty-six-hour window. The problem statement lands an hour before the clock starts, and what you submit at the end of it is what is judged.",
      "Submissions are scored on one published sheet, out of 100, and it is on this page before you start.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: ["agentic ai", "full-stack", "online", "36 hours"],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "Undergraduate and postgraduate students across engineering, management, arts, commerce and the sciences. Registration is open online.",
    brief:
      "Build a working solution to the problem statement you are given, in thirty-six hours.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the problem as you read it, what you built, and where it would go next",
      "A certificate for every member who files their own submission inside the 36 hours",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Before it starts", what: "Registration open. Form a team of one to four and join the official group." },
      { when: "Tue 3 Nov, 09:00", what: "The problem statement and the official PDF format go out, to everyone at the same moment." },
      { when: "Tue 3 Nov, 10:00", what: "The thirty-six hours open. Build the one workflow that solves it." },
      { when: "Wed 4 Nov, 22:00", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: sprintJudging(),
    rewards: [
      "₹30,000 in prizes, shared among the top three teams — awarded as cash, as AI or platform credits, or as a combination of them",
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "Letters of recommendation for the top three teams",
      "A complimentary .XYZ domain for every eligible participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "$500 in Adaption credits for every eligible participant",
      "A certificate for every participant who files their own submission inside the 36 hours",
      "A Winner Certificate naming the rank, for the three winning teams",
    ],
    sections: sprintSections(H36, undefined, HWP_DELIVERY),
    faq: sprintFaq(H36, undefined, HWP_DELIVERY),
    stats: [
      { label: "Prize pool", value: "₹30,000" },
      { label: "Hours to build", value: "36" },
      { label: "Per team", value: "1–4" },
      { label: "Entry fee", value: "Free" },
    ],
    sponsors: HWP_SPONSORS,
    registration: {
      note: "Free to enter, for teams of one to four. Every member registers individually and files their own submission. The Unstop link and the registration deadline go here once they are confirmed.",
    },
    links: [
      { label: "Official WhatsApp group", href: "https://chat.whatsapp.com/Dh7bUhHKdpG7UGZ4fr85Ka" },
    ],
    // Ink. No artwork supplied, so the generated poster is what shows.
    posterSeed: 9205,
  },
  {
    locked: false,
    slug: "codersinpune",
    title: "CodersInPune Hackathon",
    kicker: "HACKATHON — 36 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-11-03T10:00:00+05:30",
    endsAt: "2026-11-04T22:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A HackWithPune hackathon: thirty-six hours from one problem statement to a product that runs. Free to enter, teams of one to four, with ₹30,000 in prizes, paid internships and incubation for the top three.",
    description: [
      "CodersInPune is an online hackathon run by HackWithPune in a single thirty-six-hour window, from a problem statement to something a person can open and use.",
      "Submissions are scored on one published sheet, out of 100, and it is on this page before you start.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: ["agentic ai", "full-stack", "online", "36 hours"],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "Open online to students, developers, designers, AI and no-code builders and first-timers, in teams of one to four.",
    brief:
      "Build a working solution to the problem statement you are given, in thirty-six hours.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the problem as you read it, what you built, and where it would go next",
      "A certificate for every member who files their own submission inside the 36 hours",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Before it starts", what: "Registration open. Form a team of one to four and join the official group." },
      { when: "Tue 3 Nov, 09:00", what: "The problem statement and the official PDF format go out, to everyone at the same moment." },
      { when: "Tue 3 Nov, 10:00", what: "The thirty-six hours open. Build the one workflow that solves it." },
      { when: "Wed 4 Nov, 22:00", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: sprintJudging(),
    rewards: [
      "₹30,000 in prizes, shared among the top three teams — awarded as cash, as AI or platform credits, or as a combination of them",
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "Letters of recommendation for the top three teams",
      "A complimentary .XYZ domain for every eligible participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "$500 in Adaption credits for every eligible participant",
      "Expert-led workshops",
      "100+ reward recipients across the hackathon",
      "A certificate for every participant who files their own submission inside the 36 hours",
      "A Winner Certificate naming the rank, for the three winning teams",
    ],
    sections: sprintSections(H36, undefined, HWP_DELIVERY),
    faq: sprintFaq(H36, undefined, HWP_DELIVERY),
    stats: [
      { label: "Prize pool", value: "₹30,000" },
      { label: "Hours to build", value: "36" },
      { label: "Per team", value: "1–4" },
      { label: "Entry fee", value: "Free" },
    ],
    sponsors: HWP_SPONSORS,
    registration: {
      note: "Free to enter, for teams of one to four. Every member registers individually and files their own submission. The Unstop link and the registration deadline go here once they are confirmed.",
    },
    links: [
      { label: "Official WhatsApp group", href: "https://chat.whatsapp.com/LLeWA6XWTjR5kMKxLeUvR9" },
    ],
    // Ink. No artwork supplied, so the generated poster is what shows.
    posterSeed: 9206,
  },
  {
    locked: false,
    slug: "codefrontier",
    title: "CodeFrontier Hackathon",
    kicker: "HACKATHON — 36 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-11-03T10:00:00+05:30",
    endsAt: "2026-11-04T22:00:00+05:30",
    mode: "online",
    venue: { name: "Details sent to everyone who registers", place: "" },
    summary:
      "A HackWithPune hackathon: thirty-six hours, one problem statement, one finished product. Free to enter, teams of one to four, with ₹30,000 in prizes, paid internships and incubation for the top three.",
    description: [
      "CodeFrontier is an online hackathon run by HackWithPune in a single thirty-six-hour window. One problem statement, one submission from each member who built, and a product at the end of it.",
      "Submissions are scored on one published sheet, out of 100, and it is on this page before you start.",
    ],
    emphasis:
      "The problem statement is issued by the organisers one hour before the hackathon starts. Everyone receives it at the same time, and every team builds against the same brief.",
    forWho: "Students, developers, designers and first-time builders.",
    tags: ["agentic ai", "full-stack", "online", "36 hours"],
    teamSize: "1 to 4. Every participant belongs to one team only.",
    eligibility:
      "Undergraduate and postgraduate students across engineering, management, arts, commerce, the sciences, law and medicine. Registration is open online.",
    brief:
      "Build a working solution to the problem statement you are given, in thirty-six hours.",
    deliverables: [
      "A product that runs, and a repository anyone can open",
      "The thinking written down: the problem as you read it, what you built, and where it would go next",
      "A certificate for every member who files their own submission inside the 36 hours",
      "Something to show that is yours rather than a tutorial's",
    ],
    schedule: [
      { when: "Before it starts", what: "Registration open. Form a team of one to four and join the official group." },
      { when: "Tue 3 Nov, 09:00", what: "The problem statement and the official PDF format go out, to everyone at the same moment." },
      { when: "Tue 3 Nov, 10:00", what: "The thirty-six hours open. Build the one workflow that solves it." },
      { when: "Wed 4 Nov, 22:00", what: "Submissions close. Everything on the list is in, or it is not." },
      { when: "After the event", what: "Final results once the submitted projects and participant eligibility have been verified." },
    ],
    judging: sprintJudging(),
    rewards: [
      "₹30,000 in prizes, shared among the top three teams — awarded as cash, as AI or platform credits, or as a combination of them",
      "Paid internship opportunities for the top three teams",
      "Incubation and product-development support for the top three teams",
      "Letters of recommendation for the top three teams",
      "A complimentary .XYZ domain for every eligible participant",
      "$100 in Inkloom AI credits for every eligible participant",
      "$500 in Adaption credits for every eligible participant",
      "Expert-led workshops",
      "100+ reward recipients across the hackathon",
      "A certificate for every participant who files their own submission inside the 36 hours",
      "A Winner Certificate naming the rank, for the three winning teams",
    ],
    sections: sprintSections(H36, undefined, HWP_DELIVERY),
    faq: sprintFaq(H36, undefined, HWP_DELIVERY),
    stats: [
      { label: "Prize pool", value: "₹30,000" },
      { label: "Hours to build", value: "36" },
      { label: "Per team", value: "1–4" },
      { label: "Entry fee", value: "Free" },
    ],
    sponsors: HWP_SPONSORS,
    registration: {
      note: "Free to enter, for teams of one to four. Every member registers individually and files their own submission. The Unstop link and the registration deadline go here once they are confirmed.",
    },
    links: [
      { label: "Official WhatsApp group", href: "https://chat.whatsapp.com/IdQJEKGLGSrB5FGpdCAcVQ" },
    ],
    // Paper. No artwork supplied, so the generated poster is what shows.
    posterSeed: 9208,
  },
];
