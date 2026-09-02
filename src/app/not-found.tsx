import { TransitionLink } from "@/components/motion/TransitionLink";
import { Arrow } from "@/components/site/Arrow";

export default function NotFound() {
  return (
    <main
      style={{
        position: "relative",
        zIndex: 2,
        minHeight: "80svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(6rem, 16vh, 10rem) clamp(1.25rem, 4vw, 3rem)",
        maxWidth: "min(1680px, 92vw)",
        margin: "0 auto",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.72rem, 1vw, 0.78rem)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-ink-60)",
        }}
      >
        [ 404 ] // Nothing here
      </p>

      <h1
        style={{
          margin: "0.3em 0 0",
          fontFamily: "var(--font-editorial)",
          fontSize: "clamp(2.6rem, 9vw, 7rem)",
          fontWeight: 900,
          lineHeight: 0.95,
          letterSpacing: "-0.02em",
          maxWidth: "16ch",
        }}
      >
        This one did not{" "}
        <span style={{ fontStyle: "italic", fontWeight: 300, color: "var(--color-signal)" }}>
          ship
        </span>
        .
      </h1>

      <p
        style={{
          margin: "1.4em 0 0",
          fontFamily: "var(--font-editorial)",
          fontSize: "clamp(1.05rem, 1.5vw, 1.35rem)",
          lineHeight: 1.55,
          maxWidth: "48ch",
          color: "var(--color-ink-60)",
        }}
      >
        The page you asked for does not exist. It may never have, or it may have moved.
      </p>

      <div style={{ display: "flex", gap: "2rem", marginTop: "2.5rem", flexWrap: "wrap" }}>
        {[
          { label: "Home", href: "/" },
          { label: "Events", href: "/events" },
          { label: "About", href: "/about" },
        ].map((l) => (
          <TransitionLink
            key={l.href}
            href={l.href}
            label={l.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6em",
              color: "var(--color-ink)",
              textDecoration: "none",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              borderBottom: "1px solid currentColor",
              paddingBottom: "0.3em",
            }}
          >
            {l.label}
            <Arrow style={{ width: 15, height: 15 }} />
          </TransitionLink>
        ))}
      </div>
    </main>
  );
}
