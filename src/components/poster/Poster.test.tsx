import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getAllEvents } from "@/lib/events";
import { Poster } from "./Poster";

// Published events only: a locked one has no title to assert against, which
// is the entire point of it.
const events = getAllEvents().filter((e) => !e.locked);

describe("Poster", () => {
  it("renders the event title as real text", () => {
    const e = events[0]!;
    const { container } = render(<Poster event={e} />);
    expect(container.textContent).toContain(e.title.toUpperCase());
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

  it("produces more than one ground colour across the real event set", () => {
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
