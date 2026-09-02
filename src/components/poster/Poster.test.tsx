import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PublicEvent } from "@/lib/types";
import { Poster } from "./Poster";

/*
  Fixtures, not the live event set.

  These assert what the generated composition does with a title and a seed,
  and a locked event deliberately carries neither. Every event in src/data is
  locked at the moment, so reading from there left this suite with nothing to
  render — the generator is worth testing whether or not anything is currently
  published, so it gets its own inputs.
*/
const published = (slug: string, title: string, posterSeed: number): PublicEvent =>
  ({
    locked: false,
    slug,
    title,
    posterSeed,
    kicker: "WORKSHOP — ONE EVENING",
    format: "workshop",
    status: "upcoming",
    startsAt: "2026-09-19T10:00:00+05:30",
    endsAt: "2026-09-19T16:00:00+05:30",
    mode: "in-person",
  }) as PublicEvent;

const events: PublicEvent[] = [
  published("fixture-one", "Fixture One", 3),
  published("fixture-two", "Fixture Two", 11),
  published("fixture-three", "Fixture Three", 27),
  published("fixture-four", "Fixture Four", 41),
];

describe("Poster", () => {
  it("renders the event title as real text", () => {
    const e = events[0]!;
    const { container } = render(<Poster event={e} />);
    expect(container.textContent).toContain("FIXTURE ONE");
  });

  it("is deterministic — the same event renders identically twice", () => {
    const e = events[0]!;
    const a = render(<Poster event={e} />).container.innerHTML;
    const b = render(<Poster event={e} />).container.innerHTML;
    expect(a).toBe(b);
  });

  it("differs between events with different seeds", () => {
    const a = render(<Poster event={events[0]!} />).container.innerHTML;
    const b = render(<Poster event={events[1]!} />).container.innerHTML;
    expect(a).not.toBe(b);
  });

  it("produces more than one ground colour across a spread of seeds", () => {
    const grounds = new Set(
      events.map((e) => {
        const { container } = render(<Poster event={e} />);
        return (container.firstElementChild as HTMLElement).style.backgroundColor;
      }),
    );
    expect(grounds.size).toBeGreaterThan(1);
  });

  it("prefers a supplied poster image over the generated composition", () => {
    const e = { ...events[0]!, posterImage: "/brand/logo.svg" };
    const { container } = render(<Poster event={e} />);
    expect(container.querySelector("img")).not.toBeNull();
  });

  it("carries the burst class so the scoped palette resolves", () => {
    const { container } = render(<Poster event={events[0]!} />);
    expect((container.firstElementChild as HTMLElement).className).toContain("burst");
  });
});
