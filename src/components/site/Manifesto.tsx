"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { formatEventDate } from "@/lib/format";
import type { PublicEvent, SiteData } from "@/lib/types";
import { Arrow } from "./Arrow";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "clamp(0.62rem, 0.9vw, 0.74rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const NOTES = [
  "No application form. No screening call. If you turn up, you are in.",
  "Every event ends with something that exists in public, with your name on it.",
];

/*
  Three specific ideas, in order: what this is, what it runs, why it differs.
  A public site should not carry filler in place of an explanation.
*/
const COLUMNS = [
  {
    label: "What it is",
    body: "A community that runs events, not a course and not a cohort. Nobody teaches at you. You arrive with something unfinished, you work on it in a room full of people doing the same, and you leave having shown it.",
  },
  {
    label: "What we run",
    body: "Hackathons with a deadline and a deployed URL at the end. Workshops that start from an empty file. Build nights with no agenda at all. Demo days where the only rule is that it has to actually run.",
  },
  {
    label: "Why it is different",
    body: "Most events optimise for the people who are already confident. These deliberately do not. Half the places at a beginner event are held for first-timers, and the experienced half know that going in.",
  },
];

type ManifestoProps = {
  site: SiteData;
  /** Only ever an announced event; a locked one is never advertised here. */
  next?: PublicEvent & { locked: false };
  lockedCount: number;
};

export function Manifesto({ site, next, lockedCount }: ManifestoProps) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || reduced) return;

      const quote = el.querySelector<HTMLElement>(".manifesto-quote");
      const cleanups: Array<() => void> = [];

      if (quote) {
        document.fonts.ready.then(() => {
          const split = new SplitText(quote, { type: "words,lines", mask: "lines" });
          if (!split.words) return;

          const tween = gsap.from(split.words, {
            yPercent: 112,
            duration: 0.9,
            ease: "wccOut",
            stagger: 0.028,
            scrollTrigger: { trigger: quote, start: "top 84%", once: true },
          });

          /*
            Each word arrives in ink and turns signal red, and stays red.

            A background-clip: text gradient was tried first and rendered
            nothing: SplitText re-wraps the text into child spans, which
            inherit color: transparent but not the parent's background, so the
            headline disappeared entirely. Animating colour per word survives
            the split and reads better anyway.
          */
          /*
            Literal colours, not var(--token).

            GSAP parses colour values itself and cannot interpolate a CSS
            custom property — handed var(--color-ink) it had nothing to tween
            between, so the words simply never changed. These two values are
            the same ink and signal red defined in globals.css.
          */
          const wipe = gsap.fromTo(
            split.words,
            { color: "#142139" },
            {
              color: "#ED1C24",
              duration: 0.9,
              ease: "power2.out",
              stagger: 0.045,
              delay: 0.25,
              scrollTrigger: { trigger: quote, start: "top 84%", once: true },
            },
          );

          cleanups.push(() => {
            tween.scrollTrigger?.kill();
            tween.kill();
            wipe.scrollTrigger?.kill();
            wipe.kill();
            split.revert();
          });
        });
      }

      // The column rules draw downward as the section arrives.
      gsap.utils.toArray<HTMLElement>(".manifesto-rule").forEach((rule, i) => {
        const t = gsap.from(rule, {
          scaleY: 0,
          transformOrigin: "top center",
          duration: 0.9,
          ease: "wcc",
          delay: i * 0.09,
          scrollTrigger: { trigger: rule, start: "top 88%", once: true },
        });
        cleanups.push(() => {
          t.scrollTrigger?.kill();
          t.kill();
        });
      });

      gsap.utils.toArray<HTMLElement>(".manifesto-col").forEach((col, i) => {
        const t = gsap.from(col, {
          y: 26,
          autoAlpha: 0,
          duration: 0.85,
          ease: "wccOut",
          delay: i * 0.08,
          scrollTrigger: { trigger: col, start: "top 88%", once: true },
        });
        cleanups.push(() => {
          t.scrollTrigger?.kill();
          t.kill();
        });
      });

      gsap.utils.toArray<HTMLElement>(".manifesto-note").forEach((note, i) => {
        const t = gsap.from(note, {
          autoAlpha: 0,
          x: 14,
          duration: 0.75,
          ease: "wccOut",
          scrollTrigger: { trigger: note, start: `top ${92 - i * 5}%`, once: true },
        });
        cleanups.push(() => {
          t.scrollTrigger?.kill();
          t.kill();
        });
      });

      const flare = ScrollTrigger.create({
        trigger: el,
        start: "top 70%",
        once: true,
        onEnter: () => {
          gsap.to(document.documentElement, {
            "--grid-opacity": 0.42,
            duration: 0.4,
            onComplete: () =>
              gsap.to(document.documentElement, { "--grid-opacity": 0.14, duration: 0.7, delay: 0.2 }),
          });
        },
      });
      cleanups.push(() => flare.kill());

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
        padding: "clamp(1rem, 2.5vh, 2rem) clamp(1.25rem, 4vw, 3rem) clamp(5rem, 14vh, 9rem)",
        maxWidth: "min(1680px, 92vw)",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "1rem",
          paddingBottom: "1.1rem",
          borderBottom: "1px solid var(--color-ink)",
          ...mono,
          color: "var(--color-ink-60)",
        }}
      >
        <span>[ 01 ] // What this is</span>
      </div>

      {/*
        A short, hard-broken headline. The previous version ran a long sentence
        at display size and split it mid-clause — "a funnel. We" — which is the
        one thing an editorial layout must not do.
      */}
      {/*
        The orientation rail: what this is, what is next, and a way in.

        It used to sit at the foot of the hero, stranded under the headline
        with a screen of dead space between it and the section it belonged to.
        Here it reads in the order a visitor needs it — the section announces
        itself, then answers the obvious questions.
      */}
      <div className="manifesto-rail" data-reveal>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-body)",
            fontSize: "clamp(1rem, 1.25vw, 1.2rem)",
            lineHeight: 1.55,
            maxWidth: "44ch",
          }}
        >
          We Code Coders runs focused events where curious people meet a deadline,
          form a team, and turn unfinished ideas into visible work.
        </p>

        {next ? (
          <div>
            <p style={{ ...mono, margin: 0, color: "var(--color-ink-40)" }}>Next event</p>
            <p
              style={{
                margin: "0.35em 0 0",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.15rem, 1.8vw, 1.6rem)",
                textTransform: "uppercase",
                letterSpacing: "0.01em",
              }}
            >
              {next.title}
            </p>
            <p style={{ ...mono, margin: "0.3em 0 0", color: "var(--color-ink-60)" }}>
              {formatEventDate(next.startsAt, next.endsAt)}
              {next.venue.place ? ` — ${next.venue.place}` : ""}
            </p>
          </div>
        ) : lockedCount > 0 ? (
          <div>
            <p style={{ ...mono, margin: 0, color: "var(--color-ink-40)" }}>Next event</p>
            <p
              style={{
                margin: "0.35em 0 0",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.15rem, 1.8vw, 1.6rem)",
                textTransform: "uppercase",
              }}
            >
              Not announced yet
            </p>
          </div>
        ) : null}

        <TransitionLink
          href="/events"
          label="Events"
          className="hero-cta"
          style={{
            ...mono,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.7em",
            padding: "0.95em 1.4em",
            background: "var(--color-ink)",
            color: "var(--color-paper)",
            textDecoration: "none",
            whiteSpace: "nowrap",
            alignSelf: "start",
          }}
        >
          Explore events
          <Arrow style={{ width: 15, height: 15 }} />
        </TransitionLink>
      </div>

      <p
        style={{
          ...mono,
          margin: "clamp(3rem, 8vh, 5rem) 0 0",
          color: "var(--color-ink-40)",
        }}
      >
        {site.reach} — since {site.foundedYear}
      </p>

      <blockquote
        className="manifesto-quote"
        style={{
          margin: "clamp(1.4rem, 4vh, 2.6rem) 0 0",
          maxWidth: "18ch",
          fontFamily: "var(--font-editorial)",
          fontSize: "clamp(2.6rem, 7.5vw, 6.2rem)",
          lineHeight: 0.98,
          letterSpacing: "-0.028em",
          color: "var(--color-ink)",
        }}
      >
        Not another place to watch people build.
      </blockquote>

      <p
        style={{
          margin: "0.6em 0 0",
          maxWidth: "20ch",
          fontFamily: "var(--font-editorial)",
          fontStyle: "italic",
          fontSize: "clamp(2rem, 5.4vw, 4.4rem)",
          lineHeight: 1.02,
          letterSpacing: "-0.02em",
          color: "var(--color-ink-40)",
        }}
      >
        A place to build beside them.
      </p>

      <div
        className="manifesto-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "clamp(1.5rem, 4vw, 3.5rem)",
          marginTop: "clamp(3.5rem, 10vh, 6rem)",
        }}
      >
        {COLUMNS.map((col, i) => (
          <div key={col.label} className="manifesto-col" style={{ position: "relative", paddingLeft: "1.4rem" }}>
            <span
              className="manifesto-rule"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 0,
                top: "0.35em",
                bottom: "0.2em",
                width: 1,
                background: "var(--color-ink-40)",
              }}
            />
            <p style={{ ...mono, margin: 0, color: "var(--color-signal)" }}>
              {String(i + 1).padStart(2, "0")} — {col.label}
            </p>
            <p
              style={{
                margin: "0.9em 0 0",
                fontFamily: "var(--font-body)",
                fontSize: "clamp(0.92rem, 1.05vw, 1.05rem)",
                lineHeight: 1.6,
                color: "var(--color-ink)",
              }}
            >
              {col.body}
            </p>
          </div>
        ))}
      </div>

      <ul
        style={{
          listStyle: "none",
          margin: "clamp(3rem, 8vh, 5rem) 0 0",
          padding: "1.4rem 0 0",
          borderTop: "1px solid var(--color-paper-2)",
          display: "grid",
          gap: "0.9em",
        }}
      >
        {NOTES.map((n) => (
          <li
            key={n}
            className="manifesto-note"
            style={{
              ...mono,
              display: "flex",
              alignItems: "baseline",
              gap: "0.8em",
              color: "var(--color-ink-60)",
              letterSpacing: "0.08em",
              textTransform: "none",
              fontSize: "clamp(0.72rem, 0.95vw, 0.85rem)",
            }}
          >
            <Arrow style={{ width: 13, height: 13, color: "var(--color-signal)", flexShrink: 0 }} />
            {n}
          </li>
        ))}
      </ul>

    </section>
  );
}
