import { describe, expect, it } from "vitest";
import { eventDurationHours, formatEventDate, formatEventTime } from "./format";

describe("formatEventDate", () => {
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
});

describe("eventDurationHours", () => {
  it("computes whole hours", () => {
    expect(eventDurationHours("2026-09-12T10:00:00Z", "2026-09-13T22:00:00Z")).toBe(36);
  });

  it("is zero for an instant", () => {
    expect(eventDurationHours("2026-09-12T10:00:00Z", "2026-09-12T10:00:00Z")).toBe(0);
  });
});
