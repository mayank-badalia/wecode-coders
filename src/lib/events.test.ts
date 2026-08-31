import { describe, expect, it } from "vitest";
import {
  getAdjacentEvent,
  getAllEvents,
  getEventBySlug,
  getPastEvents,
  getSite,
  getUpcomingEvents,
} from "./events";

describe("events seam", () => {
  it("returns every event", () => {
    expect(getAllEvents().length).toBeGreaterThanOrEqual(5);
  });

  it("has unique slugs", () => {
    const slugs = getAllEvents().map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique poster seeds so posters differ", () => {
    const seeds = getAllEvents().map((e) => e.posterSeed);
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
    const dates = getAllEvents().map((e) => e.startsAt);
    expect([...dates].sort()).toEqual(dates);
  });

  it("every event carries the fields the detail page renders", () => {
    for (const e of getAllEvents()) {
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

  it("only links out to real, absolute URLs", () => {
    for (const s of getSite().socials) {
      expect(s.href).toMatch(/^https?:\/\//);
      expect(s.label).toBeTruthy();
    }
  });
});
