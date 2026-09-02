import { EventRail } from "@/components/site/EventRail";
import { Hero } from "@/components/site/Hero";
import { Manifesto } from "@/components/site/Manifesto";
import { Timeline } from "@/components/site/Timeline";
import { getAllEvents, getLockedCount, getNextAnnouncedEvent, getSite } from "@/lib/events";

/*
  Reads happen here, on the server, and the redacted results are handed down.

  The client components used to call the seam themselves, which pulled the raw
  event data — locked records included — into the browser bundle.
*/
export default function Home() {
  return (
    <main style={{ position: "relative", zIndex: 2 }}>
      {/* TapeStack is rendered inside Hero: it lies across the fold rather
          than sitting as a band beneath it. */}
      <Hero site={getSite()} />
      <Manifesto
        site={getSite()}
        next={getNextAnnouncedEvent()}
        lockedCount={getLockedCount()}
      />
      <EventRail events={getAllEvents()} />
      <Timeline />
    </main>
  );
}
