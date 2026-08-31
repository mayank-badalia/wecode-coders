import { Hero } from "@/components/site/Hero";

export default function Home() {
  return (
    <main style={{ position: "relative", zIndex: 2 }}>
      <Hero />
      {/* Tape stack, manifesto, event rail and timeline land next. */}
      <section style={{ height: "60vh" }} />
    </main>
  );
}
