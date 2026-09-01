// PLACEHOLDER — replace with real content.
//
// Every record below is invented so the layout, the horizontal rail and the
// events ring have something true-shaped to hold. No real person, partner
// organisation, sponsor, or verified outcome is named anywhere in this file.
// The prose is written in the voice the site should have — edit it freely.
//
// To add an event: copy a record, give it a unique `slug` and a unique
// `posterSeed`, and it appears everywhere automatically. To use a real
// poster image instead of the generated one, set `posterImage` to a path
// under /public. Nothing else needs changing.
//
// `place` is intentionally blank: the site does not advertise whether an
// event is online or in person. Fill it in only when there is a specific
// location worth naming, and it will appear wherever it is relevant.
//
// The Event type requires the fields a visitor needs before deciding to come
// — brief, deliverables, team size, eligibility. An event cannot be published
// half-described, because a page that answers nothing is worse than no page.

import type { Event } from "@/lib/types";

export const events: Event[] = [
  {
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
      "There are no judges because judging turns builders into pitch-writers, and we would rather have thirty rough things that exist than three polished things that do not. There is no prize pool for the same reason.",
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
      { name: "No judging", detail: "There are no judges. Judging turns builders into pitch-writers, and we would rather have thirty rough things that exist than three polished things that do not." },
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
