import { EventRail } from "@/components/site/EventRail";
import { Hero } from "@/components/site/Hero";
import { Manifesto } from "@/components/site/Manifesto";
import { Timeline } from "@/components/site/Timeline";

export default function Home() {
  return (
    <main style={{ position: "relative", zIndex: 2 }}>
      {/* TapeStack is rendered inside Hero: it lies across the fold rather
          than sitting as a band beneath it. */}
      <Hero />
      <Manifesto />
      <EventRail />
      <Timeline />
    </main>
  );
}
