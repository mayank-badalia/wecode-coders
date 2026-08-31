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
    venue: { name: "A borrowed classroom", city: "Pune", country: "India" },
    summary:
      "The first one. Nineteen people, one projector that did not work, and a rule that everybody had to show something unfinished.",
    description: [
      "There was no plan beyond a room and a date. The pitch was simple enough to fit in a message: bring the thing you have been poking at for months and are slightly embarrassed by, and talk about it for five minutes.",
      "Nineteen people came. The projector refused to cooperate, so everybody crowded around laptops instead, which turned out to be better. Two people met that night and have been building together since.",
      "We learned the format works when the work is genuinely unfinished. Polished demos make a room quiet. Broken ones make it talk.",
    ],
    forWho: "Anyone who writes code and has something half-built lying around.",
    tags: ["first", "show-and-tell", "informal"],
    stats: [
      { label: "Attended", value: "19" },
      { label: "Things shown", value: "11" },
    ],
    posterSeed: 1017,
  },
  {
    slug: "build-night-01",
    title: "Build Night 01",
    kicker: "BUILD NIGHT — FOUR HOURS",
    format: "build-night",
    status: "past",
    startsAt: "2026-03-21T17:00:00+05:30",
    endsAt: "2026-03-21T21:00:00+05:30",
    venue: { name: "A co-working floor", city: "Pune", country: "India" },
    summary:
      "No talks, no slides, no agenda. Four hours, one table, everyone working on their own thing in the same room.",
    description: [
      "The least structured thing we run, and the one people ask for most. You turn up with whatever you are working on. You work on it. Somebody nearby is stuck on something adjacent and you help them, or they help you.",
      "The only rule is that laptops face outward. If your screen is visible, someone will eventually lean over and ask what that is, and that question is the entire point of the evening.",
      "We close by going round the table and saying one sentence about what moved. Not what you finished — what moved.",
    ],
    forWho: "People who work better with other people in the room.",
    tags: ["co-working", "no-agenda", "recurring"],
    stats: [
      { label: "Attended", value: "34" },
      { label: "Laptops open", value: "34" },
    ],
    posterSeed: 2288,
  },
  {
    slug: "first-light",
    title: "First Light",
    kicker: "DEMO DAY — ONE AFTERNOON",
    format: "demo-day",
    status: "past",
    startsAt: "2026-05-09T14:00:00+05:30",
    endsAt: "2026-05-09T18:00:00+05:30",
    venue: { name: "An auditorium with bad acoustics", city: "Pune", country: "India" },
    summary:
      "Everything built across the first three months, shown in public, in one afternoon. Working software only — no mockups, no roadmaps.",
    description: [
      "One rule, enforced without sympathy: it has to run. Not a deck about what it will do. Not a Figma file. It runs on stage or it does not go on stage.",
      "That rule cost us four sign-ups in the last week and it was still the right rule. The things that did make it were rougher than their authors wanted, and much more interesting for it.",
      "Nobody judged anything. There were no prizes. People clapped for the bugs.",
    ],
    forWho: "Anyone with something that runs, and anyone who wants to see what running looks like this early.",
    tags: ["demo", "public", "no-prizes"],
    stats: [
      { label: "Projects shown", value: "16" },
      { label: "That actually ran", value: "16" },
    ],
    posterSeed: 3141,
  },
  {
    slug: "shaders-at-dawn",
    title: "Shaders at Dawn",
    kicker: "WORKSHOP — SIX HOURS",
    format: "workshop",
    status: "upcoming",
    startsAt: "2026-09-19T07:00:00+05:30",
    endsAt: "2026-09-19T13:00:00+05:30",
    venue: { name: "To be announced", city: "Pune", country: "India" },
    summary:
      "Six hours of GLSL from an empty file. No engine, no framework, no library — a quad, a fragment shader, and enough maths to draw light.",
    description: [
      "Most people meet shaders through a wrapper that hides them. This is the opposite: you start with a blank fragment shader and a full-screen quad, and you leave having drawn something you can explain line by line.",
      "We work up from signed distance fields to raymarching, stopping wherever the room wants to stop. The pace is set by whoever is furthest behind, on purpose.",
      "It starts at seven in the morning because the room is free then and because doing hard maths before breakfast is funnier than it should be.",
    ],
    forWho: "Anyone comfortable with a for-loop who has never written a shader.",
    tags: ["glsl", "webgl", "graphics", "hands-on"],
    posterSeed: 4272,
  },
  {
    slug: "type-and-motion",
    title: "Type & Motion",
    kicker: "WORKSHOP — ONE EVENING",
    format: "workshop",
    status: "upcoming",
    startsAt: "2026-10-03T18:00:00+05:30",
    endsAt: "2026-10-03T21:30:00+05:30",
    venue: { name: "To be announced", city: "Pune", country: "India" },
    summary:
      "Why most web animation looks cheap, and what typographers knew about timing a century before anyone had a browser.",
    description: [
      "An evening about the part of front-end work that gets treated as decoration and is actually craft. We take a page that animates badly and fix it, in public, arguing about every easing curve.",
      "Half the session is typography: measure, hierarchy, optical alignment, and the variable-font axes almost nobody animates. The other half is timing — why 300ms feels cheap, why stagger reads as intent, and why the best motion is the motion you do not consciously notice.",
      "Bring a page of your own that you think is nearly right. We will look at it together.",
    ],
    forWho: "Front-end developers who suspect their work looks generic and cannot say why.",
    tags: ["typography", "motion", "css", "critique"],
    posterSeed: 5390,
  },
  {
    slug: "ship-or-sink",
    title: "Ship or Sink",
    kicker: "HACKATHON — 36 HOURS",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-11-14T09:00:00+05:30",
    endsAt: "2026-11-15T21:00:00+05:30",
    venue: { name: "To be announced", city: "Pune", country: "India" },
    summary:
      "Thirty-six hours. One deployed URL at the end or you are out of the room. No slide decks, no judges, no prize pool.",
    description: [
      "The deal is blunt. You have thirty-six hours and at the end there must be a URL that a stranger can open. Not a repository. Not a video. A URL.",
      "There are no judges because judging turns builders into pitch-writers, and we would rather have thirty rough things that exist than three polished things that do not. There is no prize pool for the same reason.",
      "You can come alone. Teams form in the first hour and they form better when people arrive without one. Sleep is allowed and quietly encouraged.",
    ],
    forWho: "Anyone who can get something onto the internet in a weekend, or wants to find out if they can.",
    tags: ["hackathon", "36-hours", "deploy-or-bust", "no-judges"],
    posterSeed: 6428,
  },
  {
    slug: "no-gatekeepers",
    title: "No Gatekeepers",
    kicker: "HACKATHON — ONE WEEKEND",
    format: "hackathon",
    status: "upcoming",
    startsAt: "2026-12-12T09:00:00+05:30",
    endsAt: "2026-12-13T20:00:00+05:30",
    venue: { name: "To be announced", city: "Pune", country: "India" },
    summary:
      "A weekend build for people who have never done one. Half the room will be first-timers by design, and the other half are there to make sure they finish.",
    description: [
      "Most hackathons quietly select for people who have already done hackathons. This one selects against that. Half the places are held for people who have never entered one, and the experienced half know that going in.",
      "There is no theme and no problem statement. There is a room, a weekend, and a rule that no question is too basic to ask out loud.",
      "If you have been meaning to try one of these for two years and keep deciding you are not ready yet, this is the one to stop deciding that at.",
    ],
    forWho: "First-timers especially. Everyone else, on the condition that they help.",
    tags: ["hackathon", "beginner-friendly", "weekend"],
    posterSeed: 7536,
  },
];
