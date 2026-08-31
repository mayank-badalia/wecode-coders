import { Hero } from "@/components/site/Hero";
import { TapeStack } from "@/components/site/TapeStack";

export default function Home() {
  return (
    <main style={{ position: "relative", zIndex: 2 }}>
      <Hero />
      <TapeStack />
      {/* Manifesto, event rail and timeline land next. */}
      <section style={{ height: "60vh" }} />
    </main>
  );
}
