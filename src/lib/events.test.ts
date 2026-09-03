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

  it("is sorted chronologically", () => {
    const dates = published.map((e) => e.startsAt);
    expect([...dates].sort()).toEqual(dates);
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
});
