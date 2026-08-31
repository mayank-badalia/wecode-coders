import { Logo } from "@/components/site/Logo";

// Placeholder home page. The real composition — hero, tape stack, manifesto,
// event rail, timeline — arrives across checkpoints 2 and 3.
export default function Home() {
  return (
    <main style={{ padding: "6rem 4rem", position: "relative", zIndex: 2 }}>
      <Logo className="w-full" tone="ink" />
    </main>
  );
}
