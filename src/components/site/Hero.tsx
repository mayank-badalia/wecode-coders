"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { getSite } from "@/lib/events";
import { Arrow } from "./Arrow";
import { hasLoaderFinished, LOADER_DONE_EVENT } from "./Loader";
import { TapeStack } from "./TapeStack";

function Line({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.06em" }}>
      <span className="hero-line" style={{ display: "block", ...style }}>
        {children}
      </span>
    </span>
  );
}

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "clamp(0.62rem, 0.85vw, 0.74rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const site = getSite();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const lines = gsap.utils.toArray<HTMLElement>(".hero-line");
      const outlined = el.querySelector<HTMLElement>(".hero-outlined");
      const cue = el.querySelector<HTMLElement>(".hero-cue");
      const kicker = el.querySelector<HTMLElement>(".hero-meta");

      /*
        Instrument Serif and Plex Condensed carry no variable axes, so the
        scroll-linked stretch is done with a transform instead: the outlined
        line widens horizontally as the hero leaves, which reads as the same
        gesture and costs nothing to composite.
      */
      const stretch =
        outlined && !reduced
          ? gsap.to(outlined, {
              scaleX: 1.06,
              letterSpacing: "0.02em",
              ease: "none",
              scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
            })
          : null;

      if (reduced) return () => stretch?.scrollTrigger?.kill();

      const tl = gsap.timeline({ paused: true });

      tl.from(lines, { yPercent: 112, duration: 1, ease: "wccOut", stagger: 0.08 })
        .fromTo(
          outlined,
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 1.05, ease: "wcc" },
          0.32,
        )
        .from(kicker, { autoAlpha: 0, y: -14, duration: 0.7 }, 0.55)
        .from(cue, { autoAlpha: 0, y: -12, duration: 0.6 }, 0.95);

      if (cue) {
        gsap.to(cue, {
          y: 9,
          duration: 1.1,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 1.7,
        });
      }

      const start = () => tl.play();
      if (hasLoaderFinished()) start();
      else window.addEventListener(LOADER_DONE_EVENT, start, { once: true });

      return () => {
        window.removeEventListener(LOADER_DONE_EVENT, start);
        tl.kill();
        stretch?.scrollTrigger?.kill();
        ScrollTrigger.refresh();
      };
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section
      ref={root}
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        padding:
          "clamp(6rem, 13vh, 9rem) clamp(1.25rem, 4vw, 3rem) clamp(2rem, 5vh, 3.5rem)",
        maxWidth: "min(1680px, 94vw)",
        margin: "0 auto",
        zIndex: 2,
      }}
    >
      <p
        className="hero-meta"
        style={{ ...mono, margin: 0, color: "var(--color-ink-60)", position: "relative", zIndex: 4 }}
      >
        [ {site.name} ] // Independent builder culture — {site.reach}
      </p>

      <h1
        style={{
          position: "relative",
          zIndex: 4,
          margin: "clamp(1.5rem, 5vh, 3rem) 0 0",
          alignSelf: "center",
          lineHeight: 0.9,
          letterSpacing: "-0.025em",
        }}
      >
        <Line
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: "clamp(3.4rem, 13.5vw, 11.5rem)",
          }}
        >
          <span style={{ fontStyle: "italic", color: "var(--color-signal)" }}>Build</span>{" "}
          <span>in</span>
        </Line>

        <Line
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: "clamp(3.4rem, 13.5vw, 11.5rem)",
            paddingLeft: "16%",
          }}
        >
          public.
        </Line>

        <Line style={{ marginTop: "0.08em" }}>
          <span
            className="hero-outlined"
            style={{
              display: "block",
              transformOrigin: "left center",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.2rem, 9.4vw, 7.8rem)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "-0.005em",
              color: "transparent",
              WebkitTextStroke: "1.4px var(--color-ink)",
            }}
          >
            Leave with proof.
          </span>
        </Line>
      </h1>

      <TapeStack />

      <div
        className="hero-cue"
        style={{
          ...mono,
          position: "absolute",
          left: "clamp(1.25rem, 4vw, 3rem)",
          bottom: "clamp(0.8rem, 2vh, 1.4rem)",
          zIndex: 4,
          display: "flex",
          alignItems: "center",
          gap: "0.6em",
          color: "var(--color-ink-40)",
        }}
      >
        <Arrow direction="down" style={{ width: 16, height: 16 }} />
        Scroll
      </div>
    </section>
  );
}
