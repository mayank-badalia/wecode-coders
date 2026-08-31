import type { Metadata } from "next";
import Link from "next/link";
import { EventsExperience } from "@/components/canvas/EventsExperience";
import { getAllEvents } from "@/lib/events";
import { formatEventDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Events — We Code Coders",
  description:
    "Hackathons, workshops, build nights and demo days. Everything we run, and what each one is for.",
};

export default function EventsPage() {
  const events = getAllEvents();

  return (
    <>
      <EventsExperience events={events} />

      {/*
        A real, statically rendered list of every event, behind the canvas.

        It is visually hidden but present in the DOM and in the accessibility
        tree, so the route works with no JavaScript and no WebGL at all, and
        crawlers see genuine links rather than an empty canvas element.
      */}
      <nav aria-label="All events" className="visually-hidden">
        <h1>Events</h1>
        <ul>
          {events.map((e) => (
            <li key={e.slug}>
              <Link href={`/events/${e.slug}`}>
                {e.title} — {formatEventDate(e.startsAt, e.endsAt)}, {e.venue.city}.{" "}
                {e.summary}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
