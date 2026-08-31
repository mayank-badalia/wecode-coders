"use client";

import { Marquee } from "@/components/motion/Marquee";
import { getSite } from "@/lib/events";
import { Arrow } from "./Arrow";
import { Logo } from "./Logo";

type Bar = {
  bg: string;
  fg: string;
  speed: number;
  direction: 1 | -1;
  rotate: number;
  /** Vertical padding, so a bar carrying the wordmark can be taller. */
  pad: string;
  content: React.ReactNode;
};

const cell: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "1.1em",
  padding: "0 1.1em",
  whiteSpace: "nowrap",
  fontFamily: "var(--font-mono)",
  fontSize: "clamp(0.65rem, 1.05vw, 0.9rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

function Repeat({ times, children }: { times: number; children: React.ReactNode }) {
  return (
    <>
      {Array.from({ length: times }, (_, i) => (
        <span key={i} style={cell}>
          {children}
        </span>
      ))}
    </>
  );
}

/*
  Five overlapping bars, tilted at opposing angles, sitting across the seam
  between the hero and the manifesto so the page reads as taped shut.

  They are aria-hidden: the content is decorative repetition of facts stated
  properly elsewhere, and a screen reader announcing it five times over would
  be noise. Marquee sets aria-hidden itself.
*/
export function TapeStack() {
  const site = getSite();

  const bars: Bar[] = [
    {
      bg: "var(--violet)",
      fg: "var(--pink)",
      speed: 70,
      direction: 1,
      rotate: -1.8,
      pad: "0.8em 0",
      content: (
        <Repeat times={4}>
          Hackathons <Arrow style={{ width: 13, height: 13 }} /> Workshops{" "}
          <Arrow style={{ width: 13, height: 13 }} /> Build nights{" "}
          <Arrow style={{ width: 13, height: 13 }} /> Demo days
        </Repeat>
      ),
    },
    {
      bg: "var(--color-paper)",
      fg: "var(--color-ink)",
      speed: 45,
      direction: -1,
      rotate: 1.1,
      pad: "0.8em 0",
      content: (
        <Repeat times={4}>
          Est. {site.foundedYear} — {site.city}, {site.country} — Open to all — No
          gatekeeping
        </Repeat>
      ),
    },
    {
      bg: "var(--lime)",
      fg: "var(--color-ink)",
      speed: 95,
      direction: 1,
      rotate: -0.7,
      pad: "0.8em 0",
      content: (
        <Repeat times={4}>
          {site.stats.map((s) => `${s.value} ${s.label}`).join("  /  ")}
        </Repeat>
      ),
    },
    {
      bg: "var(--color-ink)",
      fg: "var(--pink)",
      speed: 60,
      direction: -1,
      rotate: 1.6,
      pad: "0.55em 0",
      content: (
        <Repeat times={8}>
          <Logo
            idPrefix="tape"
            tone="current"
            decorative
            style={{ height: "2.7em", width: "auto" }}
          />
          <Arrow style={{ width: 15, height: 15 }} />
        </Repeat>
      ),
    },
    {
      bg: "var(--pink)",
      fg: "var(--violet)",
      speed: 80,
      direction: 1,
      rotate: -1.1,
      pad: "0.8em 0",
      content: (
        <Repeat times={5}>
          <Arrow direction="up-right" style={{ width: 14, height: 14 }} /> Build in
          public <Arrow direction="up-right" style={{ width: 14, height: 14 }} /> Leave
          with proof
        </Repeat>
      ),
    },
  ];

  return (
    <div
      className="burst"
      style={{
        position: "relative",
        zIndex: 3,
        // The bars are rotated, so they overhang horizontally. Clipping on x
        // only keeps that from producing a horizontal scrollbar, without
        // clipping the vertical overlap that makes them read as a stack.
        overflowX: "clip",
        padding: "clamp(3rem, 9vh, 7rem) 0",
      }}
    >
      {bars.map((bar, i) => (
        <Marquee
          key={i}
          speed={bar.speed}
          direction={bar.direction}
          style={{
            background: bar.bg,
            color: bar.fg,
            padding: bar.pad,
            // scale covers the corners the rotation would otherwise expose.
            transform: `rotate(${bar.rotate}deg) scale(1.05)`,
            // Bars kiss rather than swallow: enough overlap to read as a
            // stack, not so much that one bar's text sits under another's.
            marginTop: i === 0 ? 0 : "-0.35em",
            position: "relative",
            boxShadow: "0 1px 0 rgba(0,0,0,0.10), 0 -1px 0 rgba(0,0,0,0.06)",
          }}
        >
          {bar.content}
        </Marquee>
      ))}
    </div>
  );
}
