import { EventRail } from "@/components/site/EventRail";
import { Hero } from "@/components/site/Hero";
import { Manifesto } from "@/components/site/Manifesto";
import { TapeStack } from "@/components/site/TapeStack";
import { Timeline } from "@/components/site/Timeline";

export default function Home() {
  return (
    <main style={{ position: "relative", zIndex: 2 }}>
      <Hero />
      <TapeStack />
      <Manifesto />
      <EventRail />
      <Timeline />
    </main>
  );
}
