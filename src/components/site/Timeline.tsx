"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, SplitText } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { Arrow } from "./Arrow";

const STEPS = [
  { now: "You have been meaning to start something for months.", next: "Discover a brief" },
  { now: "The brief is open and the date is on a page like this one.", next: "Choose your event" },
  { now: "You are building alone and it is slower than it should be.", next: "Find your people" },
  { now: "You have ideas, screenshots, and half a repo.", next: "Build under a deadline" },
  { now: "It works on your machine and nowhere else.", next: "Submit the work" },
  { now: "Nobody has told you what is actually wrong with it.", next: "Present and hear back" },
  { now: "Nobody can see what you can do.", next: "Leave with proof" },
];

/*
  Inverted from the rest of the home page on purpose.

  The journey is the one section that should feel like a different place — the
  page turns to ink, the type goes up in scale, and the steps arrive as a
  numbered ladder rather than as a thin rule with small labels beside it.
*/
export function Timeline() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || reduced) return;

      const cleanups: Array<() => void> = [];
      const head = el.querySelector<HTMLElement>(".timeline-head");

      if (head) {
        document.fonts.ready.then(() => {
          const split = new SplitText(head, { type: "words,lines", mask: "lines" });
          if (!split.words) return;
          const t = gsap.from(split.words, {
            yPercent: 115,
            duration: 0.95,
            ease: "wccOut",
            stagger: 0.05,
            scrollTrigger: { trigger: head, start: "top 82%", once: true },
          });
          cleanups.push(() => {
            t.scrollTrigger?.kill();
            t.kill();
            split.revert();
          });
        });
      }

      // The rail fills downward as the visitor descends it.
      const rail = el.querySelector<HTMLElement>(".timeline-fill");
      if (rail) {
        const t = gsap.fromTo(
          rail,
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: "top center",
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 75%", scrub: 0.7 },
          },
        );
        cleanups.push(() => {
          t.scrollTrigger?.kill();
          t.kill();
        });
      }

      gsap.utils.toArray<HTMLElement>(".timeline-step").forEach((step) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: step, start: "top 78%", once: true },
        });

        tl.from(step.querySelector(".timeline-num"), {
          xPercent: -40,
          autoAlpha: 0,
          duration: 0.6,
          ease: "wccOut",
        })
          .from(
            step.querySelector(".timeline-next"),
            { yPercent: 60, autoAlpha: 0, duration: 0.8, ease: "wccOut" },
            "-=0.4",
          )
          .from(
            step.querySelector(".timeline-now"),
            { autoAlpha: 0, y: 12, duration: 0.6 },
            "-=0.5",
          )
          .from(
            step.querySelector(".timeline-dot"),
            { scale: 0, duration: 0.5, ease: "back.out(2.4)" },
            "-=0.6",
          );

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
      className="burst"
      data-nav-theme="dark"
      style={{
        position: "relative",
        zIndex: 2,
        background: "var(--color-ink)",
        color: "var(--color-paper)",
        padding: "clamp(5rem, 14vh, 9rem) clamp(1.25rem, 4vw, 3rem) clamp(4rem, 10vh, 7rem)",
        overflow: "hidden",
      }}
    >
      {/* Halftone, so the ink ground is not a flat slab. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.14,
          backgroundImage: "radial-gradient(circle, var(--signal) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      <div style={{ position: "relative", maxWidth: "min(1680px, 92vw)", margin: "0 auto" }}>
        <p
          style={{
            margin: 0,
            paddingBottom: "1.1rem",
            borderBottom: "1px solid rgba(243,239,229,0.25)",
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.72rem, 0.9vw, 0.74rem)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
          [ 03 ] // The journey
        </p>

        <h2
          className="timeline-head"
          style={{
            margin: "clamp(2rem, 6vh, 3.5rem) 0 clamp(3rem, 9vh, 5rem)",
            fontFamily: "var(--font-editorial)",
            fontSize: "clamp(2.6rem, 8vw, 6.4rem)",
            lineHeight: 0.98,
            letterSpacing: "-0.028em",
            maxWidth: "14ch",
          }}
        >
          You are here.{" "}
          <span style={{ fontStyle: "italic", color: "var(--signal)" }}>
            Where will you leave?
          </span>
        </h2>

        <ol style={{ listStyle: "none", margin: 0, padding: 0, position: "relative" }}>
          {/* The rail, and the accent that fills it as you descend. */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "calc(clamp(2.6rem, 5vw, 4.2rem) - 1px)",
              top: 0,
              bottom: 0,
              width: 2,
              background: "rgba(243,239,229,0.16)",
            }}
          />
          <span
            className="timeline-fill"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "calc(clamp(2.6rem, 5vw, 4.2rem) - 1px)",
              top: 0,
              bottom: 0,
              width: 2,
              background: "linear-gradient(to bottom, var(--signal), var(--acid))",
            }}
          />

          {STEPS.map((step, i) => (
            <li
              key={step.next}
              className="timeline-step"
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "clamp(2.6rem, 5vw, 4.2rem) minmax(0, 1fr)",
                gap: "clamp(1rem, 3vw, 2.5rem)",
                padding: "clamp(1.4rem, 4vh, 2.6rem) 0",
              }}
            >
              <span
                className="timeline-num"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(0.72rem, 0.9vw, 0.74rem)",
                  letterSpacing: "0.14em",
                  opacity: 0.55,
                  paddingTop: "0.6em",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <span
                className="timeline-dot"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "calc(clamp(2.6rem, 5vw, 4.2rem) - 7px)",
                  top: "calc(clamp(1.4rem, 4vh, 2.6rem) + 0.75em)",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background:
                    i === STEPS.length - 1 ? "var(--acid)" : "var(--signal)",
                }}
              />

              <div className="timeline-body" style={{ paddingLeft: "clamp(1rem, 2vw, 1.6rem)" }}>
                <p
                  className="timeline-next"
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    // The last step is the destination, so it is the largest.
                    fontSize:
                      i === STEPS.length - 1
                        ? "clamp(2.4rem, 8vw, 6rem)"
                        : "clamp(1.4rem, 3.4vw, 2.6rem)",
                    lineHeight: 1.02,
                    textTransform: "uppercase",
                    letterSpacing: "-0.01em",
                    color:
                      i === STEPS.length - 1 ? "var(--acid)" : "var(--color-paper)",
                  }}
                >
                  {step.next}
                </p>
                <p
                  className="timeline-now"
                  style={{
                    margin: "0.5em 0 0",
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.6em",
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(0.72rem, 0.92vw, 0.8rem)",
                    lineHeight: 1.55,
                    opacity: 0.6,
                    maxWidth: "58ch",
                  }}
                >
                  <Arrow style={{ width: 12, height: 12, flexShrink: 0 }} />
                  {step.now}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
