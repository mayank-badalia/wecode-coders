"use client";

import { Marquee } from "@/components/motion/Marquee";
import { Arrow } from "./Arrow";

/**
 * The single maximalist interruption on an otherwise editorial page.
 *
 * Exactly one of these belongs on /about — it is the only place that page is
 * permitted burst colour, and its force comes from being the only one.
 */
export function BurstBreak({ line }: { line: string }) {
  const tape = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "1.1em",
        padding: "0 1.1em",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-mono)",
        fontSize: "clamp(0.6rem, 0.95vw, 0.82rem)",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
      }}
    >
      No gatekeeping <Arrow style={{ width: 13, height: 13 }} /> No prizes{" "}
      <Arrow style={{ width: 13, height: 13 }} /> No pitch decks{" "}
      <Arrow style={{ width: 13, height: 13 }} />
    </span>
  );

  return (
    <section
      className="burst"
      data-nav-theme="dark"
      style={{
        position: "relative",
        zIndex: 2,
        background: "var(--color-ink)",
        color: "var(--blush)",
        padding: "clamp(5rem, 16vh, 11rem) clamp(1.25rem, 4vw, 3rem)",
        margin: "clamp(4rem, 12vh, 8rem) 0",
        overflowX: "clip",
        isolation: "isolate",
      }}
    >
      {/* halftone */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.22,
          backgroundImage:
            "radial-gradient(circle, var(--acid) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      <p
        style={{
          position: "relative",
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.2rem, 9vw, 8rem)",
          fontWeight: 700,
          lineHeight: 0.92,
          textTransform: "uppercase",
          letterSpacing: "-0.02em",
          color: "transparent",
          WebkitTextStroke: "1.5px var(--blush)",
          maxWidth: "16ch",
        }}
      >
        {line}
      </p>

      {/*
        Two bars crossing at opposing angles, kept below the headline. Tape
        over a poster is the right gesture, but the first pass ran straight
        through "LEAVE WITH" and cost the line its legibility.
      */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "6%",
          display: "grid",
          gap: "1.2rem",
        }}
      >
        <Marquee
          speed={55}
          direction={1}
          liftOnHover={false}
          style={{
            background: "var(--acid)",
            color: "var(--color-ink)",
            padding: "0.6em 0",
            transform: "rotate(-4deg) scale(1.08)",
          }}
        >
          {tape}
          {tape}
          {tape}
        </Marquee>
        <Marquee
          speed={80}
          direction={-1}
          liftOnHover={false}
          style={{
            background: "var(--blush)",
            color: "var(--color-ink)",
            padding: "0.6em 0",
            transform: "rotate(3deg) scale(1.08)",
          }}
        >
          {tape}
          {tape}
          {tape}
        </Marquee>
      </div>
    </section>
  );
}
