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

/** The five that still run three rounds. */
const threeRound = published.filter((e) =>
  e.sections?.some((sec) => sec.label === ROUNDS_LABEL),
);

/** The ones that run a single window, of whatever length. */
const sprints = published.filter((e) => Boolean(windowBlock(e)));

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
      Nine hackathons run one window rather than three rounds. Three promises
      changed at once — one window, no fee at any stage, and a certificate for
      every participant who files an entry — and any one of them is easy to
      half-undo while editing a single record. This pins the set and all three.
    */
    expect(sprints.map((e) => e.slug).sort()).toEqual([
      "code-conqueror-india",
      "codefrontier",
      "codehack-india",
      "codenexus-india",
      "codepunethinkers",
      "codersinpune",
      "codetitans-india",
      "codeverse-india",
      "wcc-forge-48",
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

  it("promises a position to the top three and to nobody else", () => {
    /*
      The announcement is three team names and a link to what each of them
      built. Nothing else is placed: no ranking list, no leaderboard position
      by email, and no certificate below winner carrying a placing.

      Worth a guard because the copy was wrong in one direction for months —
      it promised every finalist its own position, by email and printed on the
      certificate, which the certificate template has never printed. A promise
      the renderer cannot keep is the one to catch here.
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

      expect(words, `${e.slug} promises a placing to a non-winner`).not.toMatch(
        /where (your|the|it) team placed|where it placed|your own position comes to you|names your position|the certificate prints it|yours reaches you|and it is printed on the certificate/i,
      );
      // And the thing that replaced it has to actually be said somewhere.
      expect(words, `${e.slug} never says only the top three are placed`).toMatch(
        /only the top three are placed/i,
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
    expect(sprints.length).toBeGreaterThanOrEqual(9);
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

      Scoped to the live events that take no fee: the three-round five charge
      for Round 3 and are excluded, and a finished event is not recruiting.
    */
    const free = published.filter(
      (e) => e.status !== "past" && !threeRound.includes(e),
    );
    expect(free.length).toBeGreaterThanOrEqual(10);

    for (const e of free) {
      const fee = e.stats?.find((st) => st.label === "Entry fee");
      expect(fee?.value, `${e.slug} does not print its entry fee`).toBe("Free");
      // And the line under the register button opens with it.
      expect(e.registration?.note ?? "", `${e.slug}'s note does not lead with it`).toMatch(
        /^Free to enter/,
      );
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
    expect(series).toHaveLength(5);

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
