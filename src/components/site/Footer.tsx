"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { TransitionLink } from "@/components/motion/TransitionLink";
import type { SiteData } from "@/lib/types";
import { Arrow } from "./Arrow";
import { LocalClock } from "./LocalClock";
import { Logo } from "./Logo";

/** The letters carrying the arrow flourishes — full letterforms, drawn last. */
const ARROW_LETTER_IDS = [
  "#footer-top-c-arrow",
  "#footer-bottom-c-arrow",
  "#footer-bottom-r-arrow",
  "#footer-bottom-s-arrow",
];

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
];

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "clamp(0.72rem, 0.85vw, 0.74rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

/*
  One footer, on every route.

  There used to be two — a full logo finale on home and a compact strip
  elsewhere — and the strip read as a stray block of links rather than as the
  end of the page. This is a single closing gesture: the mark draws itself,
  its letters separate outward, and it settles back as the page ends.
*/
export function Footer({ site }: { site: SiteData }) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const letters = gsap.utils.toArray<SVGPathElement>(".footer-logo .logo-letter");
      if (letters.length === 0) return;

      if (reduced) {
        gsap.set(letters, { autoAlpha: 1, drawSVG: "100%", fillOpacity: 1 });
        return;
      }

      const arrowLetters = ARROW_LETTER_IDS.map((id) =>
        el.querySelector<SVGPathElement>(id),
      ).filter((p): p is SVGPathElement => p !== null);
      const plainLetters = letters.filter((l) => !arrowLetters.includes(l));

      /*
        Triggered on the wordmark itself, not on the footer.

        The footer's top enters the viewport a long way before the mark does,
        so the whole construction played out below the fold and was over by the
        time anyone could see it.
      */
      // The wrapper, not the <svg>: ScrollTrigger measures an SVG element
      // unreliably and the trigger simply never fired.
      const mark = el.querySelector<HTMLElement>(".footer-mark");

      /*
        Hidden immediately, not as the timeline's first step.

        The set used to live inside the timeline, which only runs once the
        trigger fires — so the wordmark sat fully drawn until the visitor
        reached it, then blanked and redrew itself in front of them. It has to
        start hidden the moment the page renders.
      */
      gsap.set(letters, { fillOpacity: 0, stroke: "var(--signal)", strokeWidth: 1.5 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: mark ?? el, start: "top 92%", once: true },
      });

      tl.fromTo(
          plainLetters,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 1, stagger: { from: "center", amount: 0.55 } },
        )
        .to(plainLetters, { fillOpacity: 1, duration: 0.5, stagger: { each: 0.04, from: "random" } }, "-=0.3")
        .fromTo(
          arrowLetters,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.55, stagger: 0.07, ease: "power2.out" },
          "-=0.35",
        )
        .to(arrowLetters, { fillOpacity: 1, duration: 0.35, stagger: 0.05 }, "-=0.2")
        .to(letters, { strokeWidth: 0, duration: 0.3 }, "-=0.2");

      /*
        Once the mark is complete the letters push apart and drift back on a
        slow scrub — the wordmark breathing rather than sitting still. Each
        letter moves by its own distance from the centre of the mark, so the
        outer letters travel furthest.
      */
      const spread = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 70%", end: "bottom bottom", scrub: 1 },
      });

      letters.forEach((letter, i) => {
        const centre = (letters.length - 1) / 2;
        const offset = (i - centre) / centre;
        spread.to(
          letter,
          { xPercent: offset * 9, yPercent: Math.abs(offset) * -4, ease: "none" },
          0,
        );
      });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        spread.scrollTrigger?.kill();
        spread.kill();
        ScrollTrigger.refresh();
      };
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <footer
      ref={root}
      className="burst"
      data-nav-theme="dark"
      style={{
        position: "relative",
        zIndex: 2,
        background: "var(--color-ink)",
        color: "var(--color-paper)",
        padding: "clamp(3.5rem, 9vw, 7rem) clamp(1.25rem, 4vw, 3rem) 0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: "clamp(2rem, 6vw, 5rem)",
          alignItems: "start",
        }}
        className="footer-top"
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-editorial)",
            fontSize: "clamp(1.8rem, 4.4vw, 3.6rem)",
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            maxWidth: "18ch",
          }}
        >
          Events end. The work, feedback and people you meet{" "}
          <span style={{ fontStyle: "italic", color: "var(--signal)" }}>should not.</span>
        </p>

        <nav aria-label="Footer">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {LINKS.map((l, i) => (
              <li key={l.href} style={{ borderTop: "1px solid rgba(243,239,229,0.22)" }}>
                <TransitionLink
                  href={l.href}
                  label={l.label}
                  className="footer-link"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1em",
                    padding: "0.85em 0",
                    color: "inherit",
                    textDecoration: "none",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "clamp(1.2rem, 2.2vw, 1.9rem)",
                    textTransform: "uppercase",
                    letterSpacing: "0.01em",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "baseline", gap: "0.7em" }}>
                    <span style={{ ...mono, opacity: 0.5, fontSize: "max(0.72rem, 0.55em)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {l.label}
                  </span>
                  <Arrow direction="up-right" style={{ width: 18, height: 18 }} />
                </TransitionLink>
              </li>
            ))}
          </ul>

          {site.socials.length > 0 && (
            <ul style={{ listStyle: "none", margin: "1.6rem 0 0", padding: 0, ...mono }}>
              {site.socials.map((soc) => (
                <li key={soc.href} style={{ marginBottom: "0.6em" }}>
                  <a
                    href={soc.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{ color: "inherit", textDecoration: "none", display: "inline-flex", gap: "0.5em" }}
                  >
                    <Arrow direction="up-right" style={{ width: 13, height: 13 }} />
                    {soc.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginTop: "clamp(2.5rem, 7vw, 5rem)",
          paddingTop: "1.1rem",
          borderTop: "1px solid rgba(243,239,229,0.22)",
          opacity: 0.75,
          ...mono,
        }}
      >
        <LocalClock timezone={site.timezone} label={site.timezoneLabel} />
        <span>
          Est. {site.foundedYear} — {site.reach}
        </span>
      </div>

      <div
        className="footer-mark"
        style={{
          marginTop: "clamp(2rem, 5vw, 3.5rem)",
          paddingBottom: "clamp(1rem, 2.5vw, 2rem)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Logo
          className="footer-logo"
          idPrefix="footer"
          tone="brand"
          decorative
          style={{ width: "min(96vw, 150vh)", height: "auto" }}
        />
      </div>
    </footer>
  );
}
