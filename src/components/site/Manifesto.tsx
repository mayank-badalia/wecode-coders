"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { Counter } from "@/components/motion/Counter";
import { gsap, ScrollTrigger, SplitText } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { getSite } from "@/lib/events";
import { Arrow } from "./Arrow";

/*
  Marginalia. Deliberately not aligned to the main column's baseline grid —
  print footnotes are not, and the slight misregistration is what makes the
  page read as typeset rather than laid out in a grid system.
*/
const NOTES = [
  { top: "6%", text: "No application. No screening. If you turn up, you are in." },
  { top: "34%", text: "Every event ends with something that exists in public." },
  { top: "63%", text: "We do not do prizes. Prizes turn builders into pitch-writers." },
];

export function Manifesto() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const site = getSite();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      if (reduced) return;

      const quote = el.querySelector<HTMLElement>(".manifesto-quote");
      const notes = gsap.utils.toArray<HTMLElement>(".manifesto-note");
      const cleanups: Array<() => void> = [];

      if (quote) {
        document.fonts.ready.then(() => {
          const split = new SplitText(quote, {
            type: "words,lines",
            mask: "lines",
          });
          const words = split.words;
          if (!words) return;

          const tween = gsap.from(words, {
            yPercent: 110,
            duration: 0.9,
            ease: "wccOut",
            stagger: 0.03,
            scrollTrigger: { trigger: quote, start: "top 82%", once: true },
          });

          // SOFT rises as the quote arrives, so the terminals soften into place.
          const soft = gsap.fromTo(
            quote,
            { "--soft": 0 },
            {
              "--soft": 60,
              duration: 1.4,
              scrollTrigger: { trigger: quote, start: "top 82%", once: true },
            },
          );

          cleanups.push(() => {
            tween.scrollTrigger?.kill();
            tween.kill();
            soft.scrollTrigger?.kill();
            soft.kill();
            split.revert();
          });
        });
      }

      // Each note gets its own trigger at a different start, so they arrive
      // out of step rather than as one block.
      notes.forEach((note, i) => {
        const tween = gsap.from(note, {
          autoAlpha: 0,
          y: 18,
          duration: 0.8,
          ease: "wccOut",
          scrollTrigger: { trigger: note, start: `top ${92 - i * 6}%`, once: true },
        });
        cleanups.push(() => {
          tween.scrollTrigger?.kill();
          tween.kill();
        });
      });

      // The grid asserts itself briefly as the section arrives, then recedes.
      const gridFlare = ScrollTrigger.create({
        trigger: el,
        start: "top 70%",
        once: true,
        onEnter: () => {
          gsap.to(document.documentElement, {
            "--grid-opacity": 0.45,
            duration: 0.4,
            onComplete: () =>
              gsap.to(document.documentElement, {
                "--grid-opacity": 0.15,
                duration: 0.6,
                delay: 0.2,
              }),
          });
        },
      });
      cleanups.push(() => gridFlare.kill());

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
        padding: "clamp(5rem, 16vh, 11rem) clamp(1.25rem, 4vw, 3rem)",
        maxWidth: "min(1680px, 92vw)",
        margin: "0 auto",
      }}
    >
      <p
        style={{
          margin: "0 0 clamp(2.5rem, 6vh, 4rem)",
          paddingBottom: "1.1rem",
          borderBottom: "1px solid var(--color-paper-2)",
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.65rem, 1vw, 0.78rem)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-ink-60)",
        }}
      >
        [ 01 ] // What this is
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 7fr) minmax(0, 4fr)",
          gap: "clamp(2rem, 6vw, 6rem)",
          alignItems: "start",
        }}
        className="manifesto-grid"
      >
        <blockquote
          className="manifesto-quote"
          style={{
            margin: 0,
            fontFamily: "var(--font-editorial)",
            fontSize: "clamp(1.6rem, 3.6vw, 3.4rem)",
            fontWeight: 400,
            lineHeight: 1.12,
            letterSpacing: "-0.015em",
            fontVariationSettings: "'SOFT' var(--soft, 0), 'opsz' 120",
          }}
        >
          {site.manifesto[0]}
        </blockquote>

        <div style={{ position: "relative", minHeight: "100%" }}>
          {NOTES.map((n) => (
            <p
              key={n.text}
              className="manifesto-note"
              style={{
                position: "relative",
                top: n.top,
                margin: "0 0 2.2em",
                paddingLeft: "1.6em",
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(0.68rem, 0.95vw, 0.8rem)",
                lineHeight: 1.65,
                color: "var(--color-ink-60)",
              }}
            >
              <Arrow
                style={{
                  position: "absolute",
                  left: 0,
                  top: "0.35em",
                  width: 13,
                  height: 13,
                  color: "var(--color-terracotta)",
                }}
              />
              {n.text}
            </p>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "clamp(1rem, 4vw, 3rem)",
          marginTop: "clamp(4rem, 12vh, 8rem)",
          paddingTop: "1.4rem",
          borderTop: "1px solid var(--color-paper-2)",
        }}
      >
        {site.stats.map((s) => (
          <div key={s.label}>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.4rem, 7vw, 5.5rem)",
                fontVariationSettings: "'wdth' 78, 'wght' 800",
                lineHeight: 1,
              }}
            >
              <Counter to={Number(s.value)} />
            </p>
            <p
              style={{
                margin: "0.6em 0 0",
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(0.65rem, 0.9vw, 0.76rem)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-ink-60)",
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
