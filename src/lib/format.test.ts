import { describe, expect, it } from "vitest";
import { eventDurationHours, formatEventDate, formatEventTime } from "./format";

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
