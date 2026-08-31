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
  /** Where it exits to as the visitor scrolls past. */
  exitX: number;
  exitY: number;
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

  They peel away in different directions as the visitor scrolls — the moment
  the package opens.
*/
const TAPES: Tape[] = [
  {
    bg: "var(--color-ink)",
    fg: "var(--blush)",
    speed: 62,
    direction: 1,
    top: 12,
    rotate: -4.5,
    exitX: -14,
    exitY: -34,
    copy: <Run>We Code Coders — Independent builder culture</Run>,
  },
  {
    bg: "var(--blush)",
    fg: "var(--color-ink)",
    speed: 44,
    direction: -1,
    top: 19.5,
    rotate: 3.5,
    exitX: 16,
    exitY: -22,
    copy: <Run>Online events — Pune events — Open briefs</Run>,
  },
  {
    bg: "var(--acid)",
    fg: "var(--color-ink)",
    speed: 88,
    direction: 1,
    top: 70,
    rotate: -2.5,
    exitX: -20,
    exitY: 26,
    copy: <Run>Build — Break — Learn — Ship — Repeat</Run>,
  },
  {
    bg: "var(--signal)",
    fg: "var(--color-paper)",
    speed: 56,
    direction: -1,
    top: 79,
    rotate: 4.5,
    exitX: 22,
    exitY: 34,
    copy: <Run>Mini challenges — Mentors — Tools — Feedback</Run>,
  },
  {
    bg: "var(--color-paper-2)",
    fg: "var(--color-ink)",
    speed: 72,
    direction: 1,
    top: 88,
    rotate: -3,
    exitX: -10,
    exitY: 44,
    copy: <Run>New events entering the system</Run>,
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

      // Peel: each tape leaves in its own direction, so the seal breaks apart
      // rather than fading out as one block.
      const peel = gsap.timeline({
        scrollTrigger: {
          trigger: el.parentElement ?? el,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      tapes.forEach((tape, i) => {
        peel.to(
          tape,
          {
            xPercent: Number(tape.dataset.exitX),
            yPercent: Number(tape.dataset.exitY),
            rotate: Number(tape.dataset.rotate) * 2.4,
            autoAlpha: 0,
            ease: "none",
          },
          i * 0.04,
        );
      });

      // A restrained pointer parallax, so the tapes sit in front of the type
      // rather than on it.
      const depth = tapes.map((t, i) => (i % 2 === 0 ? 1 : -1) * (6 + i * 2));
      const setters = tapes.map((t) => gsap.quickTo(t, "x", { duration: 0.8, ease: "power3.out" }));

      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        setters.forEach((set, i) => set(nx * (depth[i] ?? 8)));
      };
      window.addEventListener("pointermove", onMove);

      return () => {
        window.removeEventListener("pointermove", onMove);
        peel.scrollTrigger?.kill();
        peel.kill();
      };
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
        zIndex: 3,
        pointerEvents: "none",
        overflow: "clip",
      }}
    >
      {TAPES.map((tape, i) => (
        <div
          key={i}
          className="tape"
          data-exit-x={tape.exitX}
          data-exit-y={tape.exitY}
          data-rotate={tape.rotate}
          style={{
            position: "absolute",
            top: `${tape.top}%`,
            left: "-14%",
            width: "128%",
            transform: `rotate(${tape.rotate}deg)`,
            boxShadow: "0 2px 14px rgba(20,33,57,0.12)",
            pointerEvents: "auto",
          }}
        >
          <Marquee
            speed={tape.speed}
            direction={tape.direction}
            // Negative rise sends the content up-and-right as x decreases,
            // so each tape reads as travelling diagonally from the bottom
            // left toward the top right rather than sliding flat.
            rise={tape.direction === 1 ? -0.12 : 0.12}
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
