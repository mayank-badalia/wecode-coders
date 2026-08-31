import { events } from "@/data/events";
import { site } from "@/data/site";
import type { Event, SiteData } from "./types";

/*
  The single seam over event content.

  No component may import src/data directly — that is an ESLint error. When a
  backend eventually replaces the static files, only the bodies of these
  functions change, and call sites are already shaped to cope.
*/

export function getAllEvents(): Event[] {
  return [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function getEventBySlug(slug: string): Event | undefined {
  return getAllEvents().find((e) => e.slug === slug);
}

export function getUpcomingEvents(): Event[] {
  return getAllEvents().filter((e) => e.status === "upcoming");
}

export function getPastEvents(): Event[] {
  return getAllEvents().filter((e) => e.status === "past");
}

/** The next event in the list, wrapping at the end. Used by "next event" links. */
export function getAdjacentEvent(slug: string): Event | undefined {
  const all = getAllEvents();
  const i = all.findIndex((e) => e.slug === slug);
  return i === -1 ? undefined : all[(i + 1) % all.length];
}

export function getSite(): SiteData {
  return site;
}
