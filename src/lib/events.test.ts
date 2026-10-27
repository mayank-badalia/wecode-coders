import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { events as rawEvents } from "@/data/events";
import type { Event } from "./types";
import {
  getAdjacentEvent,
  getAllEvents,
  getEventBySlug,
  getLockedCount,
  getNextAnnouncedEvent,
  getPastEvents,
  getSite,
  getUpcomingEvents,
  toPublic,
} from "./events";

/** Everything the seam is allowed to publish. */
const published = getAllEvents().filter((e) => !e.locked);

/**
 * The events that are handed a problem statement: the three-round series and
 * the 48-hour builds.
 *
 * Keyed on the block each format publishes rather than on a list of slugs, so
 * an event joining either format is covered without editing this file. Both
 * formats issue a brief an hour before the start, which is the opposite of
 * WCC Launchpad 30 — it runs on tracks and hands out nothing.
 */
const ROUNDS_LABEL = "How the three rounds run";
/** "How the 48 hours run", "How the 36 hours run" — the window is a parameter. */
const WINDOW_LABEL = /^How the (\d+) hours run$/;
const windowBlock = (e: (typeof published)[number]) =>
  e.sections?.find((sec) => WINDOW_LABEL.test(sec.label));

const briefed = published.filter(
  (e) => e.sections?.some((sec) => sec.label === ROUNDS_LABEL) || Boolean(windowBlock(e)),
);

/** The eleven that run three rounds. */
const threeRound = published.filter((e) =>
  e.sections?.some((sec) => sec.label === ROUNDS_LABEL),
);

/** The ones that run a single window, of whatever length. */
const sprints = published.filter((e) => Boolean(windowBlock(e)));

/**
 * The quiz, which runs three rounds of its own.
 *
 * Its own label and its own set, because it shares the series' terms and
 * none of its copy: three papers rather than three builds, sat alone rather
 * than in a team, and a fee charged per participant. Folding it into
 * `threeRound` would make every assertion there a branch.
 */
const QUIZ_ROUNDS_LABEL = "How the three quiz rounds run";
const quizzes = published.filter((e) =>
  e.sections?.some((sec) => sec.label === QUIZ_ROUNDS_LABEL),
);

describe("events seam", () => {
  it("returns every event", () => {
    expect(getAllEvents().length).toBeGreaterThanOrEqual(5);
  });

  it("has unique slugs", () => {
    const slugs = getAllEvents().map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique poster seeds so posters differ", () => {
    const seeds = published.map((e) => e.posterSeed);
    expect(new Set(seeds).size).toBe(seeds.length);
  });

  it("finds an event by slug and misses cleanly", () => {
    const first = getAllEvents()[0]!;
    expect(getEventBySlug(first.slug)?.slug).toBe(first.slug);
    expect(getEventBySlug("nope")).toBeUndefined();
  });

  it("partitions upcoming and past exhaustively", () => {
    expect(getUpcomingEvents().length + getPastEvents().length).toBe(
      getAllEvents().length,
    );
  });

  it("wraps around for the adjacent event", () => {
    const all = getAllEvents();
    expect(getAdjacentEvent(all[all.length - 1]!.slug)?.slug).toBe(all[0]!.slug);
  });

  it("returns undefined for the adjacent of an unknown slug", () => {
    expect(getAdjacentEvent("nope")).toBeUndefined();
  });

  it("is sorted chronologically within each group", () => {
    // Across groups it deliberately is not: a featured event leads even when
    // an unfeatured one starts earlier. Within a group, dates still rule.
    const featured = rawEvents.filter((e) => e.featured).map((e) => e.slug);
    const group = (e: (typeof published)[number]) =>
      featured.includes(e.slug) ? 0 : 1;

    for (const g of [0, 1]) {
      const dates = published.filter((e) => group(e) === g).map((e) => e.startsAt);
      expect([...dates].sort(), `group ${g}`).toEqual(dates);
    }
  });

  it("leads with the featured events, then the rest, then anything locked", () => {
    /*
      A visitor's first card, and the ring's first focus, must be the thing
      the community is actually pushing — not an event from earlier in the
      month, and never a padlock.
    */
    const featured = new Set(rawEvents.filter((e) => e.featured).map((e) => e.slug));
    const ranks = getAllEvents().map((e) =>
      e.locked ? 2 : featured.has(e.slug) ? 0 : 1,
    );
    expect([...ranks].sort()).toEqual(ranks);

    // Something has to be featured, or the flag is dead and the lead slot is
    // whatever happens to be earliest.
    expect(featured.size).toBeGreaterThan(0);
    expect(ranks[0]).toBe(0);
  });

  it("scores every event out of 100, and scores none of them on posts", () => {
    /*
      The showcase posts are mandatory and unscored. They were worth 5, which
      meant a team could lose marks on the product and make them back on a
      caption; now every point on the sheet is for the thing that was built,
      and the rules are what require the posts.

      The total matters because the weights are published. Taking a criterion
      out without moving its points would quietly rescale everyone's score.
    */
    for (const e of published) {
      if (!e.judging) continue;

      for (const j of e.judging) {
        expect(
          `${j.name} ${j.detail}`,
          `${e.slug} scores posts: ${j.name}`,
        ).not.toMatch(/linkedin|instagram|storytelling|showcase post/i);
      }

      /*
        Protocol//60 is a quiz and publishes its criteria without weights, by
        design — see the `weight` field on the Event type. A table either
        publishes weights or it does not; a half-weighted one would print a
        total nobody can act on.
      */
      const weighted = e.judging.filter((j) => j.weight);
      if (weighted.length === 0) continue;
      expect(weighted.length, `${e.slug} weights only some criteria`).toBe(
        e.judging.length,
      );

      /*
        Totalled per round, not per event. The series scores each round on its
        own sheet, so three rounds of 100 is correct and a flat sum of 300 is
        a number nobody is ever scored out of — which is what this assertion
        caught the moment the sheets were split.

        Events with no rounds fall into a single unnamed group, so the rule is
        the same one either way: every sheet a team is ranked on totals 100.
      */
      const rounds = new Set(weighted.map((j) => j.round));
      for (const round of rounds) {
        const sheet = weighted.filter((j) => j.round === round);
        const total = sheet.reduce((sum, j) => sum + Number.parseInt(j.weight ?? "0", 10), 0);
        expect(total, `${e.slug} ${round ?? "(no round)"} totals ${total}`).toBe(100);
      }
    }
  });

  it("scores each round on questions that round actually asks", () => {
    /*
      The point of splitting the sheets. Round 1 is a PDF with no code behind
      it, so marking it on whether the product runs scores a team on something
      it has not been asked for; Round 3 is the finish, so it has to be marked
      on what was delivered rather than on what was proposed.
    */
    const series = published.filter((e) =>
      e.sections?.some((sec) => sec.label === "How the three rounds run"),
    );
    expect(series.length).toBeGreaterThanOrEqual(5);

    for (const e of series) {
      const sheet = (round: string) =>
        (e.judging ?? []).filter((j) => (j.round ?? "").startsWith(round));
      const text = (round: string) =>
        sheet(round).map((j) => `${j.name} ${j.detail}`).join(" ");

      for (const r of ["Round 1", "Round 2", "Round 3"]) {
        expect(sheet(r).length, `${e.slug} has no ${r} sheet`).toBeGreaterThan(0);
      }

      // Round 1 cannot be scored on a running product; nothing is built yet.
      expect(text("Round 1"), `${e.slug} marks Round 1 on a running product`).not.toMatch(
        /runs end to end|reliability under|deployed|uptime/i,
      );
      // And it has to be scored on reading the brief it was given.
      expect(text("Round 1"), e.slug).toMatch(/problem statement/i);
      // Round 3 is measured against what was promised at Round 2.
      expect(text("Round 3"), `${e.slug} does not check the named improvements`).toMatch(
        /improvements delivered|named at Round 2/i,
      );
    }
  });

  it("still requires the posts it no longer scores", () => {
    /*
      Dropping them from judging must not quietly drop them from the ask.

      Only for events that ask: Forge 48 never wanted showcase posts and has
      no rule about them, which is correct and not something to enforce onto
      every event on the site.
    */
    for (const e of published) {
      const asks = e.deliverables.some((d) => /linkedin|instagram/i.test(d));
      if (!asks) continue;
      const rules = e.sections?.find((sec) => sec.label === "Rules");
      expect(rules?.kind, `${e.slug} asks for posts but publishes no rules`).toBe(
        "list",
      );
      if (rules?.kind !== "list") continue;
      expect(rules.items.join(" "), e.slug).toMatch(/showcase posts/i);
    }
  });

  it("dates every round from the event's own start, in order, inside its window", () => {
    /*
      The rounds used to sit on one fixed set of offsets, and this test named
      them. CodeNexus and CodeTitans were scheduled with wider windows, so the
      offsets are a parameter now and naming them here would fail on a
      correct schedule.

      What has to hold either way: the dates printed on a round card are that
      event's, they run in order, and they fall inside the event's own window.
      A round dated outside it, or Round 3 before Round 2, is the real bug.
    */
    const series = published.filter((e) =>
      e.sections?.some((sec) => sec.label === "How the three rounds run"),
    );
    expect(series.length).toBeGreaterThanOrEqual(5);

    // "2 Nov — 4 Nov" -> the two dates it names, in the event's own year.
    const parse = (meta: string, year: number) =>
      meta.split("—").map((part) => {
        const d = new Date(`${part.trim()} ${year} 12:00:00 GMT+0530`);
        expect(Number.isNaN(d.getTime()), `unparseable round date: ${part}`).toBe(false);
        return d.getTime();
      });

    for (const e of series) {
      const rounds = e.sections?.find((sec) => sec.label === "How the three rounds run");
      if (rounds?.kind !== "columns") continue;

      const start = new Date(e.startsAt);
      const end = new Date(e.endsAt);
      const year = Number(
        new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Asia/Kolkata" }).format(start),
      );

      let previous = 0;
      for (const [i, item] of rounds.items.entries()) {
        expect(item.meta, `${e.slug} round ${i + 1} has no dates`).toBeTruthy();
        const days = parse(item.meta!, year);

        for (const day of days) {
          // Day granularity, so compare against the calendar days at each end.
          expect(day, `${e.slug} round ${i + 1} starts before the event`).toBeGreaterThanOrEqual(
            new Date(start).setHours(0, 0, 0, 0),
          );
          expect(day, `${e.slug} round ${i + 1} runs past the event`).toBeLessThanOrEqual(
            new Date(end).setHours(23, 59, 59, 999),
          );
        }

        expect(days[0]!, `${e.slug} round ${i + 1} ends before it begins`).toBeLessThanOrEqual(days.at(-1)!);
        expect(days[0]!, `${e.slug} round ${i + 1} starts before round ${i}`).toBeGreaterThan(previous);
        previous = days.at(-1)!;
      }
    }
  });

  it("puts the problem-statement line where it cannot be skimmed", () => {
    // People arrive wanting to know what they are building. Every briefed
    // event answers that in its own field, so it renders apart from the body
    // copy rather than inside a paragraph someone scrolls past.
    expect(briefed.length).toBeGreaterThanOrEqual(10);
    for (const e of briefed) {
      expect(e.emphasis, e.slug).toBeTruthy();
      expect(e.emphasis, e.slug).toMatch(/problem statement/i);
    }
  });

  it("gives every three-round event one certificate scheme, and only one", () => {
    /*
      The eleven do not all certify the same thing, and that is deliberate.
      The five announced as three rounds upgrade a certificate at every round
      cleared, Round 1 included, and they are running now with that promise
      already made. The six announced as a single window, and given three
      rounds afterwards, certify from Round 2: Round 1 of those is a filter
      on a field of more than a thousand teams, and a completion certificate
      for clearing a filter is worth little to the person holding it.

      What must never happen is a page that carries both promises, or
      neither — a reader deciding whether Round 1 is worth their weekend
      gets one answer or no page at all. So this pins the two sets and
      asserts every page is exclusive, in the block a reader goes to for it
      and in the lists that answer it before they get there.
    */
    const upgraded = ["code-axis", "codestar-30", "codex-48", "future-stack", "tech-circuit"];
    const fromRoundTwo = [
      "codefrontier",
      "codenexus-india",
      "codepunethinkers",
      "codersinpune",
      "codetitans-india",
      "wcc-forge-48",
    ];
    expect(threeRound.map((e) => e.slug).sort()).toEqual(
      [...upgraded, ...fromRoundTwo].sort(),
    );

    for (const e of threeRound) {
      const certs = e.sections?.find((sec) => sec.label === "Certificates");
      expect(certs?.kind, `${e.slug} has no certificates block`).toBe("list");
      if (certs?.kind !== "list") continue;

      const promise = `${certs.intro ?? ""} ${certs.items.join(" ")}`;
      /*
        Both schemes now say "the highest you reach", so the narrower phrase
        has to be tested first and subtracted from the wider one — testing
        them independently made every from-Round-2 page match both.
      */
      const fromTwo = /start from Round 2/i.test(promise);
      const upgrades = /the highest you reach/i.test(promise) && !fromTwo;
      expect([upgrades, fromTwo], `${e.slug} states no certificate scheme`).toContain(true);
      expect(upgrades && fromTwo, `${e.slug} states both schemes`).toBe(false);

      /* Everything a reader meets before the block itself has to agree. */
      const words = [
        ...e.deliverables,
        ...(e.rewards ?? []),
        ...(e.faq ?? []).map((f) => `${f.q} ${f.a}`),
        promise,
      ].join(" ");

      if (upgraded.includes(e.slug)) {
        expect(upgrades, `${e.slug} should upgrade a certificate per round`).toBe(true);
        expect(words, `${e.slug} does not issue a Round 1 certificate`).toMatch(
          /Round 1 Completion Certificate/,
        );
        expect(words, `${e.slug} does not say the certificate is upgraded`).toMatch(
          /upgraded to the furthest stage/i,
        );
        expect(words, `${e.slug} says a round carries no certificate`).not.toMatch(
          /carry no certificate|carry none/i,
        );
      } else {
        expect(fromTwo, `${e.slug} should certify from Round 2`).toBe(true);
        // Said casually and only as a start: certificates begin at Round 2.
        // Round 1 is not mentioned in connection with a certificate at all.
        expect(words, `${e.slug} does not say certificates start at Round 2`).toMatch(
          /start from Round 2/i,
        );
        expect(words, `${e.slug} talks about a Round 1 certificate`).not.toMatch(
          /Round 1 (carries|is a qualifying)|no certificate (is issued )?for Round 1/i,
        );
        expect(words, `${e.slug} does not issue a Round 2 certificate`).toMatch(
          /Round 2 Completion Certificate/,
        );
        // Round 1 is the one that earns nothing here.
        expect(words, `${e.slug} still promises a Round 1 certificate`).not.toMatch(
          /Round 1 Completion Certificate/,
        );
      }
    }
  });

  it("keeps seventy-two hours in each build round of a converted event", () => {
    /*
      These six ran a single window of 36 or 48 hours until they were given
      three rounds. The grid they moved onto keeps the build time rather than
      halving it: Round 1 from the start to 18:00 the next day, its result
      that day; Round 2 at 10:00 the morning after for seventy-two hours, its
      result the day it closes; two clear days; Round 3 for seventy-two hours.
      Eleven days end to end.

      Asserted on the schedule a team reads rather than on the offsets
      constant, because the constant being right is not the promise — the
      dates and times printed on the page are.
    */
    const converted = [
      "wcc-forge-48",
      "codenexus-india",
      "codetitans-india",
      "codepunethinkers",
      "codersinpune",
      "codefrontier",
    ];

    for (const slug of converted) {
      const e = published.find((x) => x.slug === slug);
      expect(e, `${slug} is not published`).toBeTruthy();
      if (!e) continue;

      const days = (new Date(e.endsAt).getTime() - new Date(e.startsAt).getTime()) / 86_400_000;
      expect(days, `${slug} runs ${days} days`).toBe(11);
      expect(e.kicker, slug).toMatch(/3 ROUNDS/);

      const schedule = (e.schedule ?? []).map((r) => `${r.when} ${r.what}`).join(" ");
      expect(
        schedule.match(/seventy-two hours/gi)?.length,
        `${slug} does not run two seventy-two-hour rounds`,
      ).toBe(2);
      expect(schedule, `${slug} does not close Round 1 at 18:00`).toMatch(/due by 18:00/);
      expect(schedule, `${slug} does not promise the Round 1 result that day`).toMatch(
        /result is emailed the same day/,
      );
      expect(schedule, `${slug} does not promise the Round 2 result on the day it closes`).toMatch(
        /emailed the day it closes/,
      );
      expect(schedule, `${slug} does not leave two clear days before the final`).toMatch(
        /Two clear days/,
      );
    }
  });

  it("asks every three-round event for the same three rounds", () => {
    /*
      The twelve-day events promise entrants an identical structure, so the
      rounds block is shared and this proves it stayed shared. It also pins
      the two things most easily lost in an edit: that Round 2 asks for the
      three major improvements, and that a submission comes from the team
      leader rather than from each member.
    */
    const series = published.filter((e) =>
      e.sections?.some((sec) => sec.label === "How the three rounds run"),
    );
    expect(series.length).toBeGreaterThanOrEqual(5);

    for (const e of series) {
      const rounds = e.sections?.find((sec) => sec.label === "How the three rounds run");
      expect(rounds?.kind, e.slug).toBe("columns");
      if (rounds?.kind !== "columns") continue;

      expect(rounds.items.map((i) => i.code), e.slug).toEqual(["01", "02", "03"]);
      /*
        Who submits, and when the brief lands — asserted by meaning, not by
        phrase. Both have flipped once already (per-member submission, then
        back to the leader; no problem statement, then one issued an hour
        before), and each time a test pinned to the old sentence failed on the
        deliberate change rather than on a regression.
      */
      /*
        Who submits: stated one way or the other, and never both. Three events
        take one entry per team from the leader; Codex 48 and CodeStar 30 take
        one from every member. Asserted by meaning rather than by phrase, for
        the reason above — this sentence has now flipped twice.
      */
      const leaderModel = /one submission per round per team, made by the team leader/i.test(
        rounds.intro ?? "",
      );
      const individualModel = /every participant submits/i.test(rounds.intro ?? "");
      expect(
        [leaderModel, individualModel],
        `${e.slug} does not say who submits`,
      ).toContain(true);
      expect(
        leaderModel && individualModel,
        `${e.slug} says both the leader and every member submit`,
      ).toBe(false);
      expect(rounds.intro, e.slug).toMatch(/problem statement/i);
      expect(rounds.intro, e.slug).toMatch(/hour before/i);

      const round2 = rounds.items[1];
      expect(round2?.points.join(" "), e.slug).toMatch(/three major improvements/i);
      expect(round2?.points.join(" "), e.slug).toMatch(/not cosmetic/i);

      /*
        Long enough to run three rounds with gaps, short enough to still be a
        hackathon. The span varies by schedule: nine days on the compact grid,
        where Round 2 opens the morning after Round 1 closes, up to a fortnight
        on the widest. Hence a range rather than the single number it used to
        be — that number failed on a correctly scheduled event.
      */
      const days =
        (new Date(e.endsAt).getTime() - new Date(e.startsAt).getTime()) / 86_400_000;
      expect(Math.round(days), `${e.slug} runs ${Math.round(days)} days`).toBeGreaterThanOrEqual(9);
      expect(Math.round(days), `${e.slug} runs ${Math.round(days)} days`).toBeLessThanOrEqual(16);
    }
  });

  it("runs every single-window build as one free window, with a certificate for everyone who submits", () => {
    /*
      Three hackathons run one window rather than three rounds. There were
      nine: six were given three rounds and a Round 3 fee, and the three left
      are the ones whose windows open too soon to change the shape on anybody.

      Three promises hold for those three — one window, no fee at any stage,
      and a certificate for every participant who files an entry — and any
      one of them is easy to half-undo while editing a single record. This
      pins the set and all three. The set matters most: a converted event that
      kept its window block would be advertising both shapes at once.
    */
    expect(sprints.map((e) => e.slug).sort()).toEqual([
      "code-conqueror-india",
      "codehack-india",
      "codeverse-india",
    ]);

    for (const e of sprints) {
      /*
        Three numbers have to agree: the timestamps, the kicker and the block
        label. The window became a parameter when the HackWithPune events
        arrived at thirty-six hours, and a page that says 36 in its heading
        while running 48 on the clock is the failure that creates.
      */
      const hours =
        (new Date(e.endsAt).getTime() - new Date(e.startsAt).getTime()) / 3_600_000;
      expect([36, 48], `${e.slug} runs ${hours}h`).toContain(hours);
      expect(windowBlock(e)?.label, e.slug).toBe(`How the ${hours} hours run`);
      expect(e.kicker, e.slug).toMatch(new RegExp(`\\b${hours} HOURS\\b`));

      // No rounds: no tabs block, and nothing left on the sheet that scores a
      // team per round.
      expect(
        e.sections?.some((sec) => sec.kind === "columns" && sec.variant === "tabs"),
        `${e.slug} still publishes round tabs`,
      ).toBeFalsy();
      for (const j of e.judging ?? []) expect(j.round, e.slug).toBeUndefined();

      const words = [
        e.summary,
        e.brief,
        ...e.description,
        ...e.deliverables,
        ...(e.rewards ?? []),
        ...(e.faq ?? []).flatMap((f) => `${f.q} ${f.a}`),
        ...(e.schedule ?? []).map((r) => `${r.when} ${r.what}`),
        ...(e.sections ?? []).flatMap((sec) =>
          sec.kind === "list"
            ? [sec.intro ?? "", ...sec.items]
            : [sec.intro ?? "", ...sec.items.flatMap((i) => [i.blurb ?? "", i.note ?? "", ...i.points])],
        ),
      ].join(" ");

      /*
        Nothing may survive that sends a team looking for a round that is not
        there, or waiting on a result between rounds that do not exist. Only
        the phrases that assert a round: "no qualifying rounds" is the copy
        doing its job, so the word alone is not the test.
      */
      expect(words, `${e.slug} still mentions a later round`).not.toMatch(
        /Round [123]\b|three rounds|between rounds|next round/i,
      );

      /*
        Free, and said plainly. A fee note is also what the detail page reads
        to decide whether to print "this event has a paid round", so a stray
        rupee sign in a round note would re-advertise a fee that is gone.
      */
      for (const sec of e.sections ?? []) {
        if (sec.kind !== "columns") continue;
        for (const item of sec.items) {
          expect(item.note ?? "", `${e.slug} still carries a fee note`).not.toContain("\u20B9");
        }
      }
      expect(words, `${e.slug} never says it is free`).toMatch(
        /free to enter|free from start to finish|no participation fee|registration is free/i,
      );

      /*
        The certificate promise, in the block a reader goes to for it. Asserted
        on meaning rather than phrasing: it has to say that submitting inside
        the window is what earns one.
      */
      const certs = e.sections?.find((sec) => sec.label === "Certificates");
      expect(certs?.kind, e.slug).toBe("list");
      if (certs?.kind !== "list") continue;
      const promise = `${certs.intro ?? ""} ${certs.items.join(" ")}`;
      expect(promise, `${e.slug} does not promise everyone a certificate`).toMatch(
        /every (member|participant)[^.]*valid (submission|entry)/i,
      );
    }
  });

  it("places every finalist privately and announces only the top three", () => {
    /*
      Every finalist is placed and told where it finished, at the certificate
      distribution and printed on its certificate. The group post carries the
      top three only — their names, their ranks, and a link to what they
      built — and no full ranking list goes up.

      This guard once ran the other way, forbidding the promise, because the
      certificate template had no position to print and a promise the renderer
      cannot keep is the one worth catching. The renderer now prints it:
      `position` and `positionOf` on the record, `placement()` for the
      spelling, set on the sheet and on the verify page. So the guard is
      inverted rather than deleted — the copy and the template have to move
      together, and the test is what holds them together.
    */
    for (const e of published) {
      // Protocol//60 ran and its certificates are issued; its top-60
      // leaderboard is a record of what happened, not a promise to anyone.
      if (e.status === "past") continue;

      const words = [
        e.summary,
        e.brief,
        ...e.description,
        ...e.deliverables,
        ...(e.rewards ?? []),
        ...(e.faq ?? []).flatMap((f) => `${f.q} ${f.a}`),
        ...(e.schedule ?? []).map((r) => r.what),
        ...(e.sections ?? []).flatMap((sec) =>
          sec.kind === "list"
            ? [sec.intro ?? "", ...sec.items]
            : [sec.intro ?? "", ...sec.items.flatMap((i) => [i.blurb ?? "", i.note ?? "", ...i.points])],
        ),
      ].join(" ");

      /*
        A full ordering is never published. The pages all say so themselves,
        so the check is that any mention of one is a denial rather than an
        offer — matching the promise directly would also match the sentence
        ruling it out, which is how this assertion failed the first time.
      */
      if (/ranking list|leaderboard/i.test(words)) {
        expect(words, `${e.slug} raises a ranking list without ruling it out`).toMatch(
          /no (full )?ranking list|no leaderboard/i,
        );
      }
      /*
        Either promise is fine, but the page has to make one of them: the
        three-round events place every finalist, and a single-window event
        places only its top three. Saying neither leaves a reader guessing
        whether their own result is coming.
      */
      expect(words, `${e.slug} says nothing about who is placed`).toMatch(
        /every finalist is placed|only the top three are placed/i,
      );
    }
  });

  it("takes an entry from every participant, with their role, outside the first three", () => {
    /*
      TechCircuit, FutureStack and CodeAxis still take one entry per team from
      the team leader. Every other live hackathon takes one from each member,
      naming the role they held and the part they built.

      That is not paperwork for its own sake: those two fields are what the
      certificate prints, and they can only come from the holder (see `roles`
      and `contribution` in src/lib/certificates.ts). A team entry leaves the
      member who did nothing holding the same document as the member who built
      it, which is the failure this guards.
    */
    const leaderOnly = ["tech-circuit", "future-stack", "code-axis"];
    let checked = 0;

    for (const e of published) {
      if (e.status === "past" || e.format !== "hackathon") continue;
      checked += 1;

      const words = [
        ...(e.faq ?? []).flatMap((f) => `${f.q} ${f.a}`),
        ...(e.sections ?? []).flatMap((sec) =>
          sec.kind === "list"
            ? [sec.intro ?? "", ...sec.items]
            : [sec.intro ?? "", ...sec.items.flatMap((i) => [i.blurb ?? "", i.note ?? "", ...i.points])],
        ),
      ].join(" ");

      if (leaderOnly.includes(e.slug)) {
        expect(words, `${e.slug} should still submit through the team leader`).toMatch(
          /made by the team leader/i,
        );
        expect(words, `${e.slug} should not ask every member to submit`).not.toMatch(
          /every participant submits/i,
        );
        continue;
      }

      expect(words, `${e.slug} does not ask every participant to submit`).toMatch(
        /every participant submits|one submission per participant/i,
      );
      expect(words, `${e.slug} does not ask for the role each member held`).toMatch(
        /the role (you|they) held/i,
      );
      // And it has to say what happens to the member who leaves it to a
      // teammate, which is the question this change creates.
      expect(words, `${e.slug} does not say a member with no entry is not certified`).toMatch(
        /files no entry[^.]*not issued a certificate|not recorded as having taken part/i,
      );
    }

    expect(checked, "no hackathons were checked").toBeGreaterThanOrEqual(10);
  });

  it("opens every single-window build at 10:00 IST", () => {
    /*
      One start time across the format, so a team entering two of them is not
      working to two different clocks. Forge 48 opened at 18:00 and CodeVerse
      at 09:00, which also made their windows close in the evening — the end
      is derived from the start, so this pins both ends with one assertion.
    */
    expect(sprints.length).toBeGreaterThanOrEqual(3);
    const clock = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });

    for (const e of sprints) {
      expect(clock.format(new Date(e.startsAt)), `${e.slug} does not open at 10:00`).toBe(
        "10:00",
      );
    }
  });

  it("asks a single-window build for no money at all", () => {
    /*
      The fee belongs to Round 3 of a three-round event and nowhere else.
      These events are free throughout, and the guard is on the whole page
      rather than on the round note the detail page reads, because a fee named
      in a reward line or an FAQ answer is just as much a charge.
    */
    for (const e of sprints) {
      const words = [
        e.summary,
        e.brief,
        ...e.description,
        ...e.deliverables,
        ...(e.rewards ?? []),
        ...(e.faq ?? []).flatMap((f) => `${f.q} ${f.a}`),
        ...(e.schedule ?? []).map((r) => r.what),
        e.registration?.note ?? "",
        ...(e.sections ?? []).flatMap((sec) =>
          sec.kind === "list"
            ? [sec.intro ?? "", ...sec.items]
            : [sec.intro ?? "", ...sec.items.flatMap((i) => [i.blurb ?? "", i.note ?? "", ...i.points])],
        ),
      ].join(" ");

      expect(words, `${e.slug} charges a fee`).not.toMatch(
        /participation fee of|fee of \u20B9|\u20B9\s?\d+ per team|pay a participation fee/i,
      );
    }
  });

  it("prints the entry fee on every event that does not charge one", () => {
    /*
      Free was true for months and said only in the rules, the certificates
      block and the FAQ — three places a reader reaches by scrolling. The
      question arrives before any of them, so it belongs in the stats strip at
      the top of the page, and this is what keeps it there.

      Scoped to the live events that take no fee: the eleven three-round
      events charge for Round 3 and are excluded, the quiz charges for its own
      Round 3, and a finished event is not recruiting. That leaves the three
      single-window builds.
    */
    const free = published.filter(
      (e) => e.status !== "past" && !threeRound.includes(e) && !quizzes.includes(e),
    );
    expect(free.length).toBeGreaterThanOrEqual(3);

    for (const e of free) {
      const fee = e.stats?.find((st) => st.label === "Entry fee");
      expect(fee?.value, `${e.slug} does not print its entry fee`).toBe("Free");
      // And the line under the register button opens with it.
      expect(e.registration?.note ?? "", `${e.slug}'s note does not lead with it`).toMatch(
        /^Free to enter/,
      );
    }
  });

  it("names the Round 3 fee in every place a reader decides from", () => {
    /*
      The mirror of the two tests above, and the reason they were not enough.
      A free event said so in the stats strip, under the register button, in
      its rules and in its FAQ; a three-round event said nothing anywhere
      except one collapsed round panel, which is the one place a reader
      deciding whether to enter does not look.

      Three rounds and one fee go together, so this pins what is free in the
      strip, the fee and what is free under the button, an answer to the
      question in the FAQ, and the amount on the round that charges it — plus
      that the page never quotes a second, different figure anywhere, since a
      page carrying two fees is worse than one carrying none.

      The fee itself is no longer a tile in the strip: five places still name
      it before a reader can reach the round panel — the summary, the note
      under the register button, the FAQ, rules item 9 and Round 3 — so the
      original worry, a fee hiding in one collapsed panel, cannot return. The
      strip keeps "Rounds 1–2 / Free", which is the half of it a reader
      deciding whether to enter actually needs.
    */
    expect(threeRound.length).toBe(11);

    for (const e of threeRound) {
      expect(
        e.stats?.find((st) => st.label.startsWith("Round 3 fee")),
        `${e.slug} still prices the fee in the stats strip`,
      ).toBeUndefined();
      expect(
        e.stats?.find((st) => st.label === "Rounds 1\u20132"),
        `${e.slug} still advertises that the first two rounds are free`,
      ).toBeUndefined();

      const note = e.registration?.note ?? "";
      expect(note, `${e.slug}'s note talks about paying`).not.toMatch(/\bfee\b|\bpay\b|\u20B9/);

      expect((e.faq ?? []).find((f) => /cost|fee/i.test(f.q)), `${e.slug} still has a cost question`).toBeUndefined();

      const words = [
        e.summary,
        ...(e.faq ?? []).flatMap((f) => `${f.q} ${f.a}`),
        e.registration?.note ?? "",
        ...(e.sections ?? []).flatMap((sec) =>
          sec.kind === "list"
            ? [sec.intro ?? "", ...sec.items]
            : [sec.intro ?? "", ...sec.items.flatMap((i) => [i.blurb ?? "", i.note ?? "", ...i.points])],
        ),
      ].join(" ");

      // The amount is stated once, on the round that charges it, and nowhere
      // else on the page: the summary, the note, the rules and the FAQ say a
      // fee exists and point at Round 3.
      const own = (e.sections ?? []).flatMap((sec) =>
        sec.kind === "columns" ? sec.items.map((i) => i.note ?? "") : [],
      ).filter((n) => n.includes("\u20B9399"));
      expect(own.length, `${e.slug} does not carry the fee on the round that charges it`).toBe(1);
      expect(own[0], `${e.slug}'s Round 3 does not say who pays`).toMatch(/\u20B9399 per team/);
      expect(
        words.split("\u20B9399").length,
        `${e.slug} prints the fee outside Round 3`,
      ).toBe(own[0]!.split("\u20B9399").length);

      // The detail page reads the amount off the paid round's note, so the
      // sentence beside the terms link only appears while that note has it.
      const roundNotes = (e.sections ?? []).flatMap((sec) =>
        sec.kind === "columns" ? sec.items.map((i) => i.note ?? "") : [],
      );
      expect(
        roundNotes.filter((n) => n.includes("\u20B9399")).length,
        `${e.slug} does not carry the fee on the round that charges it`,
      ).toBe(1);
    }
  });

  it("runs the quiz as three papers, and charges for the last one only", () => {
    /*
      The quiz was one sitting inside an eight-hour window, free throughout.
      It now runs the hackathons' three rounds — a qualifier, a cut, a paid
      final — on a grid of its own: each round is one paper of fifteen
      questions, open 10:00 to 18:00 IST on its day, and the attempt itself
      takes about fifteen minutes.

      Two numbers on that page can be wrong in a way that costs somebody
      money or a day. The fee is \u20B9299 and it is per participant, not the
      \u20B9399 per team a hackathon charges, because nobody sits this one in a
      team. And eight hours is the window rather than the length of the
      paper, so the page has to keep saying which.
    */
    expect(quizzes.length).toBe(1);

    for (const e of quizzes) {
      const rounds = e.sections?.find((sec) => sec.label === QUIZ_ROUNDS_LABEL);
      expect(rounds?.kind, `${e.slug} has no rounds block`).toBe("columns");
      if (rounds?.kind !== "columns") continue;
      expect(rounds.variant, `${e.slug} does not open one round at a time`).toBe("tabs");
      expect(rounds.items.length, `${e.slug} does not run three rounds`).toBe(3);

      /* One day each, and each one says when its window shuts. */
      for (const item of rounds.items) {
        expect(item.meta ?? "", `${e.slug} ${item.code} is not dated to one day`).toMatch(
          /^\d{1,2} \w{3}$/,
        );
        expect(
          `${item.blurb ?? ""} ${item.points.join(" ")}`,
          `${e.slug} ${item.code} does not say when its window closes`,
        ).toContain("18:00");
      }

      const words = [
        e.summary,
        e.brief,
        ...e.description,
        ...e.deliverables,
        ...(e.faq ?? []).flatMap((f) => `${f.q} ${f.a}`),
        ...(e.schedule ?? []).map((r) => r.what),
        e.registration?.note ?? "",
        ...(e.sections ?? []).flatMap((sec) =>
          sec.kind === "list"
            ? [sec.intro ?? "", ...sec.items]
            : [sec.intro ?? "", ...sec.items.flatMap((i) => [i.blurb ?? "", i.note ?? "", ...i.points])],
        ),
      ].join(" ");

      // Every amount this page attaches to the word "fee", or to a person,
      // has to be the same amount — and never charged to a team.
      const quoted = [
        ...words.matchAll(/fee of \u20B9\s?([\d,]+)/g),
        ...words.matchAll(/\u20B9\s?([\d,]+) per[- ]participant/g),
      ].map((m) => m[1]);
      // Stated once, on Round 3, and nowhere else on the page.
      expect(new Set(quoted), `${e.slug} quotes more than one fee`).toEqual(new Set(["299"]));
      const round3 = (e.sections ?? []).flatMap((sec) =>
        sec.kind === "columns" ? sec.items.map((i) => i.note ?? "") : [],
      ).find((n) => n.includes("\u20B9299")) ?? "";
      expect(
        words.split("\u20B9299").length,
        `${e.slug} prints the fee outside Round 3`,
      ).toBe(round3.split("\u20B9299").length);
      expect(words, `${e.slug} charges its fee per team`).not.toMatch(
        /\u20B9\s?[\d,]+ per[- ]team/,
      );

      // The funnel: more than a thousand sit Round 1, 500 reach Round 2, 50 the final.
      expect(words, `${e.slug} does not state the funnel`).toMatch(
        /1,000 people[^.]*500[^.]*Round 2[^.]*50[^.]*Round 3/,
      );
      expect(
        e.stats?.find((st) => st.label === "Registration")?.value,
        `${e.slug} does not say registration is free`,
      ).toBe("Free");

      // The strip says what is free; it no longer says the event is.
      expect(
        e.stats?.find((st) => st.label === "Rounds 1\u20132"),
        `${e.slug} still advertises that the first two rounds are free`,
      ).toBeUndefined();
      expect(
        e.stats?.find((st) => st.label === "Entry fee"),
        `${e.slug} still advertises a free entry fee`,
      ).toBeUndefined();

      const note = e.registration?.note ?? "";
      expect(note, `${e.slug}'s note talks about paying`).not.toMatch(/\bfee\b|\bpay\b|\u20B9/);

      expect((e.faq ?? []).find((f) => /cost|fee/i.test(f.q)), `${e.slug} still has a cost question`).toBeUndefined();

      // The detail page reads the amount off the paid round's note, so the
      // fee has to sit on exactly one round: the one that charges it.
      const roundNotes = (e.sections ?? []).flatMap((sec) =>
        sec.kind === "columns" ? sec.items.map((i) => i.note ?? "") : [],
      );
      expect(
        roundNotes.filter((n) => n.includes("\u20B9299")).length,
        `${e.slug} does not carry the fee on the round that charges it`,
      ).toBe(1);

      // Eight hours is the window. Fifteen minutes is the paper.
      expect(words, `${e.slug} lets the window read as the paper`).toMatch(
        /not eight hours of quiz/,
      );
      expect(words, `${e.slug} does not say how long the paper takes`).toMatch(
        /about fifteen minutes/,
      );

      // One certificate, at the highest round reached.
      const certs = e.sections?.find((sec) => sec.label === "Certificates");
      expect(certs?.kind, `${e.slug} has no certificates block`).toBe("list");
      if (certs?.kind !== "list") continue;
      const promise = `${certs.intro ?? ""} ${certs.items.join(" ")}`;
      expect(promise, `${e.slug} does not say which certificate you hold`).toMatch(
        /the highest round you complete/,
      );
      expect(promise, `${e.slug} does not cap it at one`).toMatch(/one certificate only/i);
    }
  });

  it("does not sell a prize pool as cash", () => {
    /*
      A number against a currency symbol reads as cash everywhere else, so
      "Prize pool: \u20B930,000" was being read as thirty thousand rupees in
      hand. The pool is a stated total value and can be paid as cash, as
      credits, or as a mix of them, so the words beside the number have to say
      which it could be — and nothing on those pages may call it cash,
      since the two events that really do promise cash say "cash prize".
    */
    const pooled = published.filter((e) => e.stats?.some((st) => st.label === "Prize pool"));
    expect(pooled.length).toBeGreaterThanOrEqual(7);

    for (const e of pooled) {
      expect(
        (e.rewards ?? []).join(" "),
        `${e.slug} does not say what its pool is made of`,
      ).toMatch(/as cash, as AI or platform credits, or as a combination/);

      const words = [e.summary, e.brief, ...e.description, ...(e.rewards ?? [])].join(" ");
      expect(words, `${e.slug} calls its pool cash`).not.toMatch(/in cash/);
    }
  });

  it("never publishes the judging intervals", () => {
    // The gaps between rounds are internal. Entrants are told only that
    // qualification updates reach the teams that qualify.
    for (const e of published) {
      const words = [
        ...(e.schedule ?? []).map((r) => `${r.when} ${r.what}`),
        ...(e.sections ?? []).flatMap((sec) =>
          sec.kind === "list"
            ? [sec.intro ?? "", ...sec.items]
            : [sec.intro ?? "", ...sec.items.flatMap((i) => [i.blurb ?? "", ...i.points])],
        ),
      ].join(" ");
      expect(words, e.slug).not.toMatch(/internal judging|judging days?\b/i);
    }
  });

  it("asks no event for social posts or a video demo", () => {
    /*
      Was scoped to the three-round events while WCC Launchpad 30 and Forge 48
      still asked for a demo video and showcase posts. Neither does now, so
      the rule covers everything — there is no event this is allowed on.
    */
    for (const e of published) {
      const words = [
        ...e.deliverables,
        ...(e.rewards ?? []),
        ...(e.sections ?? []).flatMap((sec) =>
          sec.kind === "list" ? sec.items : sec.items.flatMap((i) => i.points),
        ),
        ...(e.judging ?? []).map((j) => `${j.name} ${j.detail}`),
        /*
          The FAQ is deliberately absent. "Are social media posts required?
          No. Nothing on LinkedIn, Instagram or anywhere else is part of a
          submission" is the answer people come looking for — naming them in
          order to rule them out is the opposite of asking for them.
        */
      ].join(" ");
      expect(words, e.slug).not.toMatch(
        /linkedin|instagram|showcase post|demo video|demonstration video|social post/i,
      );
    }
  });

  it("runs for as long as its kicker says it does", () => {
    /*
      "Runs for" on a detail page is computed from startsAt and endsAt, not
      from the kicker — so a window that disagrees with the label publishes
      both numbers on the same page. Five events said HACKATHON — 48 HOURS
      while their timestamps spanned 56, because they ran 10:00 to 18:00 two
      days later.
    */
    for (const e of published) {
      const claimed = /(\d+)\s*HOURS/i.exec(e.kicker);
      if (!claimed) continue;
      const hours =
        (new Date(e.endsAt).getTime() - new Date(e.startsAt).getTime()) / 3_600_000;
      expect(hours, `${e.slug} says ${claimed[1]}h`).toBe(Number(claimed[1]));
    }
  });

  it("agrees with itself about team size", () => {
    // FutureStack takes teams of six and everything else takes four. The
    // number appears in teamSize, in the stats strip, in the schedule and in
    // the registration note, and a page that contradicts the poster beside it
    // is worse than one that says nothing.
    for (const e of published) {
      const max = /1 to (\d+)/.exec(e.teamSize)?.[1];
      if (!max) continue;
      const stat = e.stats?.find((x) => x.label === "Per team")?.value;
      if (stat) expect(stat, e.slug).toBe(`1\u2013${max}`);

      const words: Record<string, string> = { "4": "four", "6": "six" };
      const word = words[max];
      const prose = [
        e.registration?.note ?? "",
        ...(e.schedule ?? []).map((r) => r.what),
      ].join(" ");
      if (word && /one to (four|six)/.test(prose)) {
        expect(prose, e.slug).not.toMatch(
          new RegExp(`one to (?!${word})(four|six)`),
        );
      }
    }
  });

  it("publishes no locked events at all today", () => {
    // The placeholder run is gone. This is not a permanent rule — it records
    // that nothing is currently held back, so the vacuous leak tests below
    // are vacuous for a known reason rather than a forgotten one.
    expect(getLockedCount()).toBe(0);
    expect(getAllEvents().every((e) => !e.locked)).toBe(true);
  });

  it("every published event carries the fields the detail page renders", () => {
    for (const e of published) {
      expect(e.title).toBeTruthy();
      expect(e.summary).toBeTruthy();
      expect(e.kicker).toBeTruthy();
      expect(e.forWho).toBeTruthy();
      expect(e.description.length).toBeGreaterThan(0);
      expect(e.tags.length).toBeGreaterThan(0);
      expect(new Date(e.startsAt).toString()).not.toBe("Invalid Date");
      expect(new Date(e.endsAt).getTime()).toBeGreaterThanOrEqual(
        new Date(e.startsAt).getTime(),
      );
    }
  });

  it("publishes nothing at all about a locked event", () => {
    const locked = rawEvents.filter((e) => e.locked);
    if (locked.length === 0) return;

    /*
      The strongest check available: serialise everything the seam hands out
      and assert that no locked event's own words appear anywhere in it. This
      is what would ship in the HTML and the JSON payload, so if a title, a
      date or a sentence of the brief survives here, it is visible in devtools.
    */
    const payload = JSON.stringify(getAllEvents());

    for (const secret of locked) {
      const candidates = [
        secret.title,
        secret.slug,
        secret.kicker,
        secret.summary,
        secret.brief,
        secret.startsAt,
        secret.endsAt,
        secret.venue.name,
        ...secret.description,
        ...secret.tags,
      ];

      /*
        Only values unique to this event prove anything. Some fields are
        shared boilerplate across every record — the venue line, for one — so
        finding those in the payload says nothing about whether the locked
        event leaked, and asserting on them fails for the wrong reason.
      */
      const unique = candidates.filter(
        (value) =>
          value &&
          !rawEvents.some(
            (other) => other !== secret && JSON.stringify(other).includes(value),
          ),
      );

      expect(unique.length).toBeGreaterThan(0);
      for (const value of unique) {
        expect(payload).not.toContain(value);
      }
    }
  });

  it("gives locked events an opaque slug derived from position, not title", () => {
    for (const e of getAllEvents()) {
      if (e.locked) expect(e.slug).toMatch(/^locked-\d+$/);
    }
  });

  it("does not invite anyone to register for a finished event", () => {
    /*
      Marking an event `past` used to change only its sort position, so
      Protocol//60 kept a live "Register on Unstop" button after it had run —
      a link that works and takes you somewhere that no longer wants you.
      The detail page hides the band for a past event; this is the guard on
      the data side, so a finished event cannot carry a live href at all.
    */
    for (const e of published) {
      if (e.status !== "past") continue;
      expect(e.registration?.href, `${e.slug} still links to registration`).toBeUndefined();
    }
  });

  it("never suggests a finished event as the next one", () => {
    // Protocol//60 kept being offered from the page before it after it had
    // run. A reader following "next event" should land on something they can
    // still enter.
    for (const e of published) {
      const next = getAdjacentEvent(e.slug);
      if (!next || next.locked) continue;
      expect(next.status, `${e.slug} suggests ${next.slug}`).not.toBe("past");
      expect(next.slug, e.slug).not.toBe(e.slug);
    }
  });

  it("never advertises a locked event as the next one", () => {
    const next = getNextAnnouncedEvent();
    if (next) expect(next.locked).toBe(false);
  });

  it("counts locked events without exposing them", () => {
    expect(getLockedCount()).toBe(rawEvents.filter((e) => e.locked).length);
  });

  it("points every poster image at a file that exists", () => {
    /*
      A typo here is silent: next/image renders nothing, the rail card and the
      ring both go blank, and no build step complains. The published events are
      the ones with real artwork, so the path is worth checking against disk.
    */
    for (const e of published) {
      if (!e.posterImage) continue;
      expect(e.posterImage.startsWith("/")).toBe(true);
      expect(existsSync(join(process.cwd(), "public", e.posterImage))).toBe(true);
    }
  });

  it("never publishes a registration link that goes nowhere", () => {
    // An absent href is the deliberate "not open yet" state and renders as
    // text; a present one has to be somewhere a browser can actually go.
    for (const e of published) {
      const href = e.registration?.href;
      if (href !== undefined) expect(href).toMatch(/^https?:\/\//);
    }
  });

  it("does not print an unannounced start time as though it were fixed", () => {
    for (const e of published) {
      if (!e.startTimeNote) continue;
      expect(e.startTimeNote.trim().length).toBeGreaterThan(0);
      // The timestamp still has to be real so the event sorts into place.
      expect(new Date(e.startsAt).toString()).not.toBe("Invalid Date");
    }
  });

  it("only links out to real, absolute URLs", () => {
    for (const s of getSite().socials) {
      expect(s.href).toMatch(/^https?:\/\//);
      expect(s.label).toBeTruthy();
    }
    // Event links are rendered as anchors on the detail page, so a relative
    // or empty href there is a dead link the crawler cannot see.
    for (const e of published) {
      for (const l of e.links ?? []) {
        expect(l.href, e.slug).toMatch(/^https?:\/\//);
        expect(l.label, e.slug).toBeTruthy();
      }
    }
  });

  /*
    We do not issue problem statements, and no page may suggest otherwise.

    A team that arrives expecting a brief has already lost the first fifteen
    points, which are awarded for finding a real problem and evidencing it.
    This scans every published word for copy that promises one, while leaving
    alone the legitimate uses — asking a team to *submit* the problem it chose,
    or saying outright that none are given.
  */
  it("never promises that problem statements will be provided", () => {
    const PROMISED =
      /problem statements? (?:will be|are|is|shall be)\s+(?:given|provided|shared|released|announced|revealed|sent|assigned|issued|published)|(?:we|organisers?|judges?) (?:will )?(?:give|provide|share|release|announce|assign|issue)\s+(?:the |a |you )?problem statements?/i;
    // "No problem statements are issued" is the opposite of a promise, so a
    // negated sentence is checked no further. Sentence-level, not line-level:
    // a "no" three sentences away must not excuse a promise.
    const NEGATED = /\b(?:no|not|never|none|without|nobody)\b/i;
    const sentences = (line: string) => line.split(/(?<=[.!?])\s+/);

    const words = (e: (typeof published)[number]): string[] => [
      e.summary,
      e.brief,
      e.forWho,
      e.eligibility,
      ...e.description,
      ...e.deliverables,
      ...(e.rewards ?? []),
      ...(e.faq ?? []).flatMap((f) => [f.q, f.a]),
      ...(e.schedule ?? []).map((r) => r.what),
      ...(e.judging ?? []).map((j) => j.detail),
      ...(e.sections ?? []).flatMap((sec) =>
        sec.kind === "list"
          ? [sec.label, sec.intro ?? "", ...sec.items]
          : [sec.label, sec.intro ?? "", ...sec.items.flatMap((i) => [i.name, i.blurb ?? "", ...i.points])],
      ),
    ];

    /*
      The three-round series and the 48-hour builds DO issue a problem
      statement, an hour before the start, so promising one there is correct.
      The guard still matters for every other event: WCC Launchpad 30 runs on
      tracks and hands out nothing, and that is the case someone breaks by
      copying series copy across.
    */
    const guarded = published.filter((e) => !briefed.includes(e));
    expect(guarded.map((e) => e.slug)).toContain("wcc-launchpad-30");

    for (const e of guarded) {
      for (const line of words(e)) {
        for (const sentence of sentences(line)) {
          if (NEGATED.test(sentence)) continue;
          expect(
            sentence,
            `${e.slug} promises a problem statement: ${sentence}`,
          ).not.toMatch(PROMISED);
        }
      }
    }
  });

  it("tells every briefed event when the problem statement arrives", () => {
    // The flip side of the guard above: the ten that do issue one have to say
    // so, and say when, or entrants turn up expecting to bring their own.
    expect(briefed.length).toBeGreaterThanOrEqual(10);
    for (const e of briefed) {
      expect(e.emphasis, e.slug).toMatch(/problem statement/i);
      expect(e.emphasis, e.slug).toMatch(/hour before/i);
      // And no leftover instruction to go and find your own.
      expect(e.emphasis, e.slug).not.toMatch(/nobody hands you|bring a problem/i);
    }
  });

  /*
    The series is judged on identical criteria, which is a promise made to
    entrants who pick between two events on the same weekend. Shared constants
    make that true today; this keeps it true after someone edits one record.
  */
  it("judges the three-round series on identical criteria", () => {
    const series = threeRound;
    expect(series).toHaveLength(11);

    const shape = (e: (typeof series)[number]) =>
      JSON.stringify((e.judging ?? []).map((j) => [j.name, j.weight]));
    expect(new Set(series.map(shape)).size).toBe(1);

    /*
      And no tracks. The series used to publish three and ask entrants to
      choose one; it issues a single problem statement now, so a Tracks block
      on any of them is leftover copy that contradicts the brief.
    */
    for (const e of series) {
      expect(e.sections?.find((sec) => sec.label === "Tracks"), e.slug).toBeUndefined();
    }
  });

  /*
    The rules must say the checking happens without saying how.

    Listing the signals we look at is a checklist for defeating them, so the
    method stays off the site. This is the guard on that: it fails if anyone
    reintroduces the specifics while editing the rule.
  */
  it("promises no feedback to teams", () => {
    /*
      Judges do not write anything back to entrants. The copy used to say
      scores and written feedback went to every team that submitted, which is
      a commitment nobody is in a position to honour across a national
      hackathon — and an unanswered promise is worse than never making it.
    */
    for (const e of published) {
      const words = [
        e.summary,
        ...e.description,
        ...(e.rewards ?? []),
        ...(e.schedule ?? []).map((r) => r.what),
        ...(e.faq ?? []).flatMap((f) => [f.q, f.a]),
        ...e.deliverables,
      ].join(" ");
      expect(words, e.slug).not.toMatch(/feedback/i);
    }
  });

  it("tells every entrant to choose a track and bring their own problem", () => {
    // The tracks block is where this is explained, so every event that
    // publishes tracks has to explain it the same way.
    for (const e of published) {
      const tracks = e.sections?.find((sec) => sec.label === "Tracks");
      if (!tracks) continue;
      expect(tracks.intro, e.slug).toBeTruthy();
      /*
        Asserted on meaning rather than phrasing. Both of these have been
        reworded more than once, and a test that pins the sentence fails on
        every edit while proving nothing about what it says.
      */
      // One track, chosen by the entrant.
      expect(tracks.intro, e.slug).toMatch(/\b(pick|choose) one track\b/i);
      // A track is not a brief.
      expect(tracks.intro, e.slug).toMatch(/not a (brief|problem statement)/i);
      // And the problem is theirs to bring.
      expect(tracks.intro, e.slug).toMatch(
        /we do not set the problem|found yourself|define your own|identify your own problem/i,
      );
    }
  });

  it("never publishes how backdating is detected", () => {
    const METHOD = /commit history|git log|file timestamps?|build logs?|deployment logs?|package metadata|hosting records|repository timestamps?/i;
    for (const e of published) {
      const text = [
        ...(e.faq ?? []).map((f) => f.a),
        ...e.description,
        ...(e.sections ?? []).flatMap((sec) => (sec.kind === "list" ? sec.items : [])),
      ].join(" ");
      expect(text, e.slug).not.toMatch(METHOD);
    }
  });

  it("tells every hackathon it must build inside the hackathon window", () => {
    // Both formats say it in the same words: the three-round events about
    // their rounds, the 48-hour builds about their one window.
    expect(briefed.length).toBeGreaterThanOrEqual(10);
    for (const e of briefed) {
      const rules = e.sections?.find((sec) => sec.label === "Rules");
      expect(rules?.kind, e.slug).toBe("list");
      if (rules?.kind !== "list") continue;
      const text = rules.items.join(" ");
      expect(text, e.slug).toMatch(/inside the official hackathon window/i);
      // The deterrent only works if the page says the checking happens.
      expect(text, e.slug).toMatch(/we verify this|submissions are checked/i);
    }
  });

  /*
    The redaction itself, tested on a synthetic record.

    Every other locked test in this file reads src/data, and nothing there is
    locked any more — so they all pass by having nothing to check. This one
    feeds toPublic a fully-written locked event and asserts none of it comes
    back out, which keeps the "locked events must not leak" rule genuinely
    enforced while the data happens to contain none.
  */
  it("strips a locked event to an opaque placeholder", () => {
    const secret: Event = {
      locked: true,
      slug: "unannounced-thing",
      title: "Hexadecimal Sunrise",
      kicker: "HACKATHON — SECRET",
      format: "hackathon",
      status: "upcoming",
      startsAt: "2027-03-01T10:00:00+05:30",
      endsAt: "2027-03-02T10:00:00+05:30",
      mode: "online",
      venue: { name: "A room nobody has been told about", place: "Pune" },
      summary: "A summary that must never reach a browser.",
      description: ["Paragraph one.", "Paragraph two."],
      forWho: "People who do not know yet",
      tags: ["confidential"],
      teamSize: "1 to 4",
      eligibility: "Anyone",
      brief: "The brief is the most sensitive line here.",
      deliverables: ["A thing"],
      posterSeed: 12345,
    };

    const redacted = toPublic(secret, 3);

    expect(redacted.locked).toBe(true);
    // Position survives, because ordering needs it. Nothing else does.
    expect(redacted).toEqual({ locked: true, slug: "locked-4", order: 3 });

    const payload = JSON.stringify(redacted);
    for (const leak of [
      secret.title,
      secret.summary,
      secret.brief,
      secret.kicker,
      secret.venue.name,
      secret.venue.place,
      secret.forWho,
      secret.startsAt,
      ...secret.description,
      ...secret.tags,
    ]) {
      expect(payload, `leaked: ${leak}`).not.toContain(leak);
    }
    // The real slug is the giveaway a title-derived placeholder would carry.
    expect(payload).not.toContain(secret.slug);
  });
});
