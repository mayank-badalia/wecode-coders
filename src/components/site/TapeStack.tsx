"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { Marquee } from "@/components/motion/Marquee";
import { gsap } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { Arrow } from "./Arrow";

type Tape = {
  bg: string;
  fg: string;
  speed: number;
  direction: 1 | -1;
  /** Vertical position across the hero, in % of the section height. */
  top: number;
  rotate: number;
  copy: React.ReactNode;
};

const cell: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "1.1em",
  padding: "0 1.1em",
  whiteSpace: "nowrap",
  fontFamily: "var(--font-mono)",
  fontSize: "clamp(0.52rem, 0.72vw, 0.66rem)",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

function Run({ children }: { children: React.ReactNode }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={cell}>
          {children}
          <Arrow style={{ width: 13, height: 13, flexShrink: 0 }} />
        </span>
      ))}
    </>
  );
}

/*
  Five tapes laid ACROSS the hero at different heights and angles, so the
  screen reads as something sealed shut rather than a stack of bars parked at
  the bottom.

  They are deliberately thin, and positioned around the type rather than
  evenly: at even spacing with heavier bars they buried "Build in public."
  completely, which is obscuring the page rather than sealing it. Two seal
  above the headline, clear of the fixed nav; three seal below it. Only the
  outlined line is crossed, which is the partial obscuring the design wants.

  Four climb from the bottom left to the top right; the pale one crosses them,
  climbing from the bottom right to the top left. The first attempt at the
  diagonal translated the marquee track vertically, which pushed the text
  straight out of the bar's own clip and left five empty coloured strips — the
  diagonal belongs to the tape's rotation, not to the track inside it.
*/
const TAPES: Tape[] = [
  {
    bg: "var(--color-ink)",
    fg: "var(--blush)",
    speed: 62,
    direction: 1,
    top: 16,
    rotate: -5,
    copy: <Run>We Code Coders — Independent builder culture</Run>,
  },
  {
    bg: "var(--blush)",
    fg: "var(--color-ink)",
    speed: 44,
    direction: -1,
    top: 30,
    rotate: -6,
    copy: <Run>Open briefs — Anyone can enter — Nothing to pay</Run>,
  },
  {
    bg: "var(--acid)",
    fg: "var(--color-ink)",
    speed: 88,
    direction: 1,
    top: 52,
    rotate: -4.5,
    copy: <Run>Build — Break — Learn — Ship — Repeat</Run>,
  },
  {
    bg: "var(--signal)",
    fg: "var(--color-paper)",
    speed: 56,
    direction: -1,
    top: 70,
    rotate: -6.5,
    copy: <Run>Mini challenges — Mentors on call — Real feedback</Run>,
  },
  {
    bg: "var(--color-paper-2)",
    fg: "var(--color-ink)",
    speed: 72,
    direction: -1,
    /*
      The only strip crossing the other way, so the seal reads as an X rather
      than five parallel bars.

      A clockwise rotation lifts its LEFT end, and at 22% that end rose into
      the kicker line and tangled two lines of small mono type together. Set
      low enough that the raised end still clears it.
    */
    top: 38,
    rotate: 6,
    copy: <Run>New events entering the system — Wherever you are</Run>,
  },
];

export function TapeStack() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || reduced) return;

      const tapes = gsap.utils.toArray<HTMLElement>(".tape");

      /*
        The tapes hold their positions.

        They used to travel away on a scrub as the visitor scrolled, which
        read as the whole seal sliding down the page and dragging across the
        type. Sealing tape does not move once it is stuck; only the ticker
        inside each strip runs.
      */

      // A restrained pointer parallax, so the tapes sit in front of the type
      // rather than on it.
      const depth = tapes.map((t, i) => (i % 2 === 0 ? 1 : -1) * (6 + i * 2));
      const setters = tapes.map((t) => gsap.quickTo(t, "x", { duration: 0.8, ease: "power3.out" }));

      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        setters.forEach((set, i) => set(nx * (depth[i] ?? 8)));
      };
      window.addEventListener("pointermove", onMove);

      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <div
      ref={root}
      className="burst tape-layer"
      style={{
        position: "absolute",
        inset: 0,
        /*
          Behind the headline, not over it.

          The tape positions are percentages of the hero's height, so the
          relationship between a tape and the vertically centred headline
          changes with viewport height — on a tall screen they landed directly
          across "Build in public." and buried it. Sitting behind the type
          keeps the headline readable at every height while the tapes still
          cross the whole composition, and the outlined line shows them
          through its counters, which is better than either alone.
        */
        zIndex: 1,
        pointerEvents: "none",
        overflow: "clip",
      }}
    >
      {TAPES.map((tape, i) => (
        <div
          key={i}
          className="tape"
          style={{
            position: "absolute",
            top: `${tape.top}%`,
            left: "-20%",
            width: "140%",
            transform: `rotate(${tape.rotate}deg)`,
            boxShadow: "0 2px 14px rgba(20,33,57,0.12)",
            pointerEvents: "auto",
          }}
        >
          <Marquee
            speed={tape.speed}
            direction={tape.direction}
            style={{
              background: tape.bg,
              color: tape.fg,
              padding: "0.55em 0",
              // A faint fabric tooth, so they read as tape rather than as bars.
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(0,0,0,0.045) 0 1px, transparent 1px 3px)",
            }}
          >
            {tape.copy}
          </Marquee>
        </div>
      ))}
    </div>
  );
}
