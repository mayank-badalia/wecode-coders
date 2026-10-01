import { describe, expect, it } from "vitest";
import {
  eventDurationHours,
  formatEventDate,
  formatEventDuration,
  formatEventTime,
} from "./format";

describe("formatEventDate", () => {
  it("uses the stated offset when deciding what day it is", () => {
    // 2026-11-14T23:00+05:30 is still the 14th locally, though it is the
    // 13th in UTC. The date shown must be the local one.
    expect(formatEventDate("2026-11-14T23:00:00+05:30", "2026-11-14T23:30:00+05:30")).toMatch(/14/);
  });

  it("collapses a same-day event to one date", () => {
    const s = formatEventDate("2026-09-12T10:00:00Z", "2026-09-12T18:00:00Z");
    expect(s).toMatch(/12/);
    expect(s).not.toMatch(/—/);
  });

  it("renders a multi-day event as a range", () => {
    const s = formatEventDate("2026-09-12T10:00:00Z", "2026-09-13T18:00:00Z");
    expect(s).toMatch(/12/);
    expect(s).toMatch(/13/);
    expect(s).toMatch(/—/);
  });
});

describe("formatEventTime", () => {
  it("renders 24-hour time", () => {
    expect(formatEventTime("2026-09-12T18:30:00Z")).toMatch(/^\d{2}:\d{2}$/);
  });

  it("renders the time in the offset the event states, not UTC", () => {
    // An event starting at 09:00 in India starts at 09:00 for the people
    // attending it. Formatting in UTC showed 03:30, which is simply wrong.
    expect(formatEventTime("2026-11-14T09:00:00+05:30")).toBe("09:00");
    expect(formatEventTime("2026-11-14T18:30:00+05:30")).toBe("18:30");
  });

  it("still handles a plain Z timestamp", () => {
    expect(formatEventTime("2026-11-14T09:00:00Z")).toBe("09:00");
  });

  it("handles a negative offset", () => {
    expect(formatEventTime("2026-11-14T09:00:00-04:00")).toBe("09:00");
  });
});

describe("eventDurationHours", () => {
  it("computes whole hours", () => {
    expect(eventDurationHours("2026-09-12T10:00:00Z", "2026-09-13T22:00:00Z")).toBe(36);
  });

  it("is zero for an instant", () => {
    expect(eventDurationHours("2026-09-12T10:00:00Z", "2026-09-12T10:00:00Z")).toBe(0);
  });
});

describe("formatEventDuration", () => {
  const start = "2026-10-20T10:00:00+05:30";
  const after = (hours: number) =>
    formatEventDuration(
      start,
      new Date(new Date(start).getTime() + hours * 3_600_000).toISOString(),
    );

  it("keeps hours for anything under two days", () => {
    expect(after(30)).toBe("30 hours");
    expect(after(47)).toBe("47 hours");
  });

  it("switches to days once hours stop being useful", () => {
    // A twelve-day hackathon printed "288 hours", which is accurate and says
    // nothing at all to the person reading it.
    expect(after(48)).toBe("3 days");
    expect(after(288)).toBe("13 days");
  });

  it("counts days inclusively, the way the events are published", () => {
    /*
      The three-round events run from D to D + 11 and are published as twelve
      calendar days. That is 264 elapsed hours; dividing by 24 gives eleven
      and contradicts the rest of the listing.
    */
    expect(after(11 * 24)).toBe("12 days");
  });
});
