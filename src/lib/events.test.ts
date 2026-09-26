import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { events as rawEvents } from "@/data/events";
import {
  getAdjacentEvent,
  getAllEvents,
  getEventBySlug,
  getLockedCount,
  getNextAnnouncedEvent,
  getPastEvents,
  getSite,
  getUpcomingEvents,
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
    const dates = published.map((e) => e.startsAt);
    expect([...dates].sort()).toEqual(dates);
  });

  it("leads with the announced events and puts the locked run after them", () => {
    // A visitor's first card, and the ring's first focus, must be something
    // they can actually act on rather than a padlock.
    const all = getAllEvents();
    const firstLocked = all.findIndex((e) => e.locked);
    if (firstLocked === -1) return;
    expect(all.slice(firstLocked).every((e) => e.locked)).toBe(true);
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

    const total = (e: (typeof series)[number]) =>
      (e.judging ?? []).reduce((sum, j) => sum + Number.parseInt(j.weight ?? "0", 10), 0);
    for (const e of series) expect(total(e), e.slug).toBe(100);

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

  it("tells the series it must build inside the hackathon window", () => {
    const series = published.filter((e) => e.posterSeed >= 9101 && e.posterSeed <= 9106);
    for (const e of series) {
      const rules = e.sections?.find((sec) => sec.label === "Rules");
      expect(rules?.kind, e.slug).toBe("list");
      if (rules?.kind !== "list") continue;
      const text = rules.items.join(" ");
      expect(text, e.slug).toMatch(/inside the official hackathon window/i);
      // The deterrent only works if the page says the checking happens.
      expect(text, e.slug).toMatch(/commit history|timestamps|build logs/i);
    }
  });
});
