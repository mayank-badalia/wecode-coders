import "server-only";

import { events } from "@/data/events";
import { site } from "@/data/site";
import type { Event, PublicEvent, SiteData } from "./types";

/*
  The single seam over event content. Server-only, deliberately.

  A locked event's full record lives in src/data. If a client component
  imports this module, that whole module is pulled into the browser bundle and
  every locked event ships with it — redacted at runtime, but present in the
  JavaScript for anyone who opens devtools. Marking it server-only turns that
  into a build error instead of a silent leak, and forces redacted data to be
  passed down as props.

  No component may import src/data directly — that is an ESLint error. When a
  backend eventually replaces the static files, only the bodies of these
  functions change, and call sites are already shaped to cope.
*/

/**
 * Strips a locked event down to a placeholder.
 *
 * The redaction happens here, at the seam, rather than in each component —
 * anything that reads events gets the safe shape by construction, and there is
 * exactly one place to audit.
 */
export function toPublic(event: Event, order: number): PublicEvent {
  if (!event.locked) return { ...event, locked: false };
  return { locked: true, slug: `locked-${order + 1}`, order };
}

export function getAllEvents(): PublicEvent[] {
  /*
    Featured events lead, then everything else, then anything locked. Each
    group stays in date order.

    Chronological order alone is the wrong answer twice over. It once buried
    the announced events among seven sealed plates, so the home rail opened on
    a locked card and the ring focused one on load — the first thing a visitor
    met was a padlock. It would now open on an event from earlier in the month
    rather than on the series registration is actually open for.

    `featured` is what the community is currently pushing; it is editorial,
    and it says nothing about an event that a visitor could be misled by. The
    locked group is last because a padlock is the least useful thing to lead
    with, and grouping tells you less about its date than interleaving did.
  */
  const rank = (e: Event) => (e.locked ? 2 : e.featured ? 0 : 1);

  return [...events]
    .sort((a, b) => rank(a) - rank(b) || a.startsAt.localeCompare(b.startsAt))
    .map(toPublic);
}

/** Locked events, for places that only need to know how many are coming. */
export function getLockedCount(): number {
  return events.filter((e) => e.locked).length;
}

export function getEventBySlug(slug: string): PublicEvent | undefined {
  return getAllEvents().find((e) => e.slug === slug);
}

export function getUpcomingEvents(): PublicEvent[] {
  return getAllEvents().filter((e) => e.locked || e.status === "upcoming");
}

/** The next event that is actually announced, for "what is coming" slots. */
export function getNextAnnouncedEvent(): (PublicEvent & { locked: false }) | undefined {
  return getAllEvents().find(
    (e): e is PublicEvent & { locked: false } => !e.locked && e.status === "upcoming",
  );
}

export function getPastEvents(): PublicEvent[] {
  return getAllEvents().filter((e) => !e.locked && e.status === "past");
}

/** The next event in the list, wrapping at the end. Used by "next event" links. */
export function getAdjacentEvent(slug: string): PublicEvent | undefined {
  const all = getAllEvents();
  const i = all.findIndex((e) => e.slug === slug);
  return i === -1 ? undefined : all[(i + 1) % all.length];
}

export function getSite(): SiteData {
  return site;
}
