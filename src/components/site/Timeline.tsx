"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { Arrow } from "./Arrow";

const STEPS = [
  {
    index: "01",
    now: "You have been meaning to start something for months.",
    next: "Show up",
  },
  {
    index: "02",
    now: "You are building alone and it is slower than it should be.",
    next: "Find your people",
  },
  {
    index: "03",
    now: "You have ideas, screenshots, and half a repo.",
    next: "Build something real",
  },
  {
    index: "04",
    now: "It works on your machine and nowhere else.",
    next: "Ship it publicly",
  },
  {
    index: "05",
    now: "Nobody can see what you can actually do.",
    next: "Leave with proof",
  },
];

export function Timeline() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || reduced) return;

      const path = el.querySelector<SVGPathElement>(".timeline-spine");
      const cleanups: Array<() => void> = [];

      if (path) {
        const draw = gsap.fromTo(
          path,
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 65%",
              end: "bottom 85%",
              scrub: 0.6,
            },
          },
        );
        cleanups.push(() => {
          draw.scrollTrigger?.kill();
          draw.kill();
        });
      }

      // Each node fires on its own geometry rather than at an offset inside a
      // shared timeline, so a node pops exactly when the drawn line reaches it
      // at any viewport height.
      gsap.utils.toArray<HTMLElement>(".timeline-node").forEach((node) => {
        const cap = node.querySelector(".timeline-cap");
        const text = node.querySelectorAll(".timeline-reveal");

        const tl = gsap.timeline({
          scrollTrigger: { trigger: node, start: "top 70%", once: true },
        });
        if (cap) {
          tl.from(cap, { scale: 0, autoAlpha: 0, duration: 0.5, ease: "back.out(2)" });
        }
        tl.from(text, { yPercent: 60, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, "-=0.25");

        cleanups.push(() => {
          tl.scrollTrigger?.kill();
          tl.kill();
        });
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section
      ref={root}
      style={{
        position: "relative",
        zIndex: 2,
        padding: "clamp(5rem, 14vh, 10rem) clamp(1.25rem, 4vw, 3rem) 0",
        maxWidth: "min(1680px, 92vw)",
        margin: "0 auto",
      }}
    >
      <p
        style={{
          margin: "0 0 clamp(3rem, 8vh, 5rem)",
          paddingBottom: "1.1rem",
          borderBottom: "1px solid var(--color-paper-2)",
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.65rem, 1vw, 0.78rem)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-ink-60)",
        }}
      >
        [ 03 ] // Where you are, and where you go
      </p>

      <div style={{ position: "relative" }}>
        {/*
          The spine. A gentle S rather than a straight rule, and its stroke is
          a gradient because a plain stroke tween cannot express a colour that
          changes along the path.
        */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 1000"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: 120,
            height: "100%",
            transform: "translateX(-50%)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <defs>
            <linearGradient id="timeline-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#131C33" />
              <stop offset="0.5" stopColor="#D2543F" />
              <stop offset="1" stopColor="#4B3BF0" />
            </linearGradient>
          </defs>
          <path
            className="timeline-spine"
            d="M50 0 C 78 140, 22 260, 50 400 C 78 540, 22 660, 50 800 C 68 900, 44 950, 50 1000"
            fill="none"
            stroke="url(#timeline-gradient)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {STEPS.map((step, i) => (
          <div
            key={step.index}
            className="timeline-node"
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: "clamp(1rem, 4vw, 3.5rem)",
              minHeight: "clamp(9rem, 20vh, 15rem)",
            }}
          >
            {/*
              Sides stay fixed: where you are is always the quiet mono column
              on the left, where you go is always the loud editorial column on
              the right. Alternating which side held which lost exactly the
              contrast the section exists to make. Only the cap's arrow
              direction alternates, for rhythm.
            */}
            <p
              className="timeline-reveal timeline-now"
              style={{
                gridColumn: 1,
                margin: 0,
                textAlign: "right",
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(0.68rem, 0.95vw, 0.8rem)",
                lineHeight: 1.6,
                color: "var(--color-ink-60)",
              }}
            >
              {step.now}
            </p>

            <span
              className="timeline-cap"
              style={{
                gridColumn: 2,
                display: "grid",
                placeItems: "center",
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--color-paper)",
                border: "1px solid var(--color-paper-2)",
                color: "var(--color-terracotta)",
              }}
            >
              <Arrow
                direction={i % 2 === 0 ? "right" : "down-right"}
                style={{ width: 18, height: 18 }}
              />
            </span>

            <div style={{ gridColumn: 3, textAlign: "left" }}>
              <p
                className="timeline-reveal"
                style={{
                  margin: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(0.6rem, 0.85vw, 0.72rem)",
                  letterSpacing: "0.16em",
                  color: "var(--color-ink-60)",
                }}
              >
                {step.index}
              </p>
              <p
                className="timeline-reveal"
                style={{
                  margin: "0.15em 0 0",
                  fontFamily: "var(--font-editorial)",
                  fontSize: "clamp(1.8rem, 4.2vw, 3.6rem)",
                  fontWeight: 800,
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                  color: "var(--color-terracotta)",
                }}
              >
                {step.next}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
