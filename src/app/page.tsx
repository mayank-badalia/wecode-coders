import { Logo } from "@/components/site/Logo";

// Placeholder home page. The real composition — hero, tape stack, manifesto,
// event rail, timeline — arrives across checkpoints 2 and 3.
export default function Home() {
  return (
    <main style={{ position: "relative", zIndex: 2 }}>
      <section style={{ padding: "8rem 4rem 4rem" }}>
        <Logo className="w-full" tone="ink" idPrefix="home" />
      </section>
      <section style={{ height: "120vh" }} />
    </main>
  );
}
