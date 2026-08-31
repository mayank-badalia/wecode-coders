"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { getSite } from "@/lib/events";
import { Arrow } from "./Arrow";
import { hasLoaderFinished, LOADER_DONE_EVENT } from "./Loader";
import { Logo } from "./Logo";

/** One masked line. The mask is the parent; the child is what moves. */
function Line({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.08em" }}>
      <span className="hero-line" style={{ display: "block", ...style }}>
        {children}
      </span>
    </span>
  );
}

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
      const build = el.querySelector<HTMLElement>(".hero-build");
      const ghost = el.querySelector<HTMLElement>(".hero-ghost");
      const cue = el.querySelector<HTMLElement>(".hero-cue");
      const kicker = el.querySelector<HTMLElement>(".hero-kicker");

      // The scroll-linked width morph runs regardless of the entrance, and is
      // the one piece that must survive reduced motion being toggled.
      const widthTrigger =
        outlined && !reduced
          ? gsap.to(outlined, {
              "--wdth": 110,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
            })
          : null;

      const parallax =
        ghost && !reduced
          ? gsap.to(ghost, {
              yPercent: 15,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
            })
          : null;

      if (reduced) {
        return () => {
          widthTrigger?.scrollTrigger?.kill();
          parallax?.scrollTrigger?.kill();
        };
      }

      const tl = gsap.timeline({ paused: true });

      tl.from(lines, { yPercent: 110, duration: 1, ease: "wccOut", stagger: 0.09 })
        // "Build" settles its WONK axis: the italic arrives warped and relaxes.
        .fromTo(build, { "--wonk": 1 }, { "--wonk": 0, duration: 0.7 }, 0.2)
        // The outlined line is live text, not an SVG path, so DrawSVG does not
        // apply — it is revealed with a clip-path sweep instead.
        .fromTo(
          outlined,
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "wcc" },
          0.35,
        )
        .from(kicker, { autoAlpha: 0, y: -12, duration: 0.6 }, 0.5)
        .from(cue, { autoAlpha: 0, y: -14, duration: 0.6 }, 0.9);

      if (cue) {
        gsap.to(cue, {
          y: 10,
          duration: 1,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 1.6,
        });
      }

      const start = () => tl.play();
      if (hasLoaderFinished()) start();
      else window.addEventListener(LOADER_DONE_EVENT, start, { once: true });

      return () => {
        window.removeEventListener(LOADER_DONE_EVENT, start);
        tl.kill();
        widthTrigger?.scrollTrigger?.kill();
        parallax?.scrollTrigger?.kill();
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
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(6rem, 14vh, 10rem) clamp(1.25rem, 4vw, 3rem) clamp(3rem, 8vh, 6rem)",
        overflow: "hidden",
        zIndex: 2,
      }}
    >
      {/* Oversized ghost mark, parallaxing behind the type. */}
      <div
        className="hero-ghost"
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-10%",
          left: "-20%",
          width: "140vw",
          opacity: 0.05,
          pointerEvents: "none",
        }}
      >
        <Logo idPrefix="ghost" tone="ink" decorative style={{ width: "100%", height: "auto" }} />
      </div>

      <p
        className="hero-kicker"
        style={{
          position: "relative",
          margin: "0 0 auto",
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.65rem, 1vw, 0.8rem)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-ink-60)",
        }}
      >
        [ {site.name} ] // Community of builders — {site.city}, {site.country}
      </p>

      <h1
        style={{
          position: "relative",
          margin: "0",
          lineHeight: 0.92,
          letterSpacing: "-0.02em",
        }}
      >
        <Line
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: "clamp(3.2rem, 13vw, 11rem)",
            fontWeight: 900,
          }}
        >
          <span
            className="hero-build"
            style={{
              fontStyle: "italic",
              fontWeight: 300,
              color: "var(--color-terracotta)",
              fontVariationSettings: "'WONK' var(--wonk, 0), 'SOFT' 0",
              // The italic's exit stroke reaches well past its advance width,
              // so a word space alone leaves "Build" touching "in".
              marginRight: "0.14em",
            }}
          >
            Build
          </span>{" "}
          in
        </Line>

        <Line
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: "clamp(3.2rem, 13vw, 11rem)",
            fontWeight: 900,
            paddingLeft: "14%",
          }}
        >
          public.
        </Line>

        <Line style={{ marginTop: "0.1em" }}>
          <span
            className="hero-outlined"
            style={{
              display: "block",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.1rem, 9.2vw, 7.6rem)",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
              color: "transparent",
              WebkitTextStroke: "1.5px var(--color-ink)",
              fontVariationSettings: "'wdth' var(--wdth, 75)",
            }}
          >
            Leave with proof.
          </span>
        </Line>
      </h1>

      <div
        className="hero-cue"
        style={{
          position: "relative",
          marginTop: "auto",
          paddingTop: "clamp(2rem, 6vh, 4rem)",
          display: "flex",
          alignItems: "center",
          gap: "0.7em",
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.65rem, 1vw, 0.8rem)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-ink-60)",
        }}
      >
        <Arrow direction="down" style={{ width: 18, height: 18 }} />
        Scroll
      </div>
    </section>
  );
}
