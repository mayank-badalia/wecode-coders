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

      const total = weighted.reduce(
        (sum, j) => sum + Number.parseInt(j.weight ?? "0", 10),
        0,
      );
      expect(total, `${e.slug} totals ${total}`).toBe(100);
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

    for (const e of published) {
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

  /*
    The series is judged on identical criteria, which is a promise made to
    entrants who pick between two events on the same weekend. Shared constants
    make that true today; this keeps it true after someone edits one record.
  */
  it("judges the October series on identical criteria", () => {
    const series = published.filter((e) => e.posterSeed >= 9101 && e.posterSeed <= 9106);
    expect(series).toHaveLength(6);

    const shape = (e: (typeof series)[number]) =>
      JSON.stringify((e.judging ?? []).map((j) => [j.name, j.weight]));
    expect(new Set(series.map(shape)).size).toBe(1);

    // Three tracks, the same three, and no others.
    for (const e of series) {
      const tracks = e.sections?.find((sec) => sec.label === "Tracks");
      expect(tracks?.kind, e.slug).toBe("columns");
      if (tracks?.kind !== "columns") continue;
      expect(tracks.items.map((i) => i.name)).toEqual([
        "Agentic AI",
        "Full-Stack Product Engineering",
        "Open Innovation",
      ]);
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
      expect(tracks.intro, e.slug).toMatch(/choose one track/i);
      expect(tracks.intro, e.slug).toMatch(/your own\s+problem/i);
      expect(tracks.intro, e.slug).toMatch(/not a problem statement/i);
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

  it("tells the series it must build inside the hackathon window", () => {
    const series = published.filter((e) => e.posterSeed >= 9101 && e.posterSeed <= 9106);
    for (const e of series) {
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
