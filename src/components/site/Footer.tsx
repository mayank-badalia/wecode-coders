"use client";

import { useGSAP } from "@gsap/react";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { getSite } from "@/lib/events";
import { Arrow } from "./Arrow";
import { LocalClock } from "./LocalClock";
import { Logo } from "./Logo";

/*
  These ids name the letters that CARRY the arrow flourishes — the C of
  "Code", and the C, R and S of "Coders" — not separate arrow paths. They are
  full letterforms and must always end up filled; they are only singled out so
  they can be drawn last, which is what makes the mark feel like it fires shut.
*/
const ARROW_LETTER_IDS = [
  "#footer-top-c-arrow",
  "#footer-bottom-c-arrow",
  "#footer-bottom-r-arrow",
  "#footer-bottom-s-arrow",
];

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const site = getSite();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const letters = gsap.utils.toArray<SVGPathElement>(".footer-logo .logo-letter");
      if (letters.length === 0) return;

      if (reduced) {
        gsap.set(letters, { autoAlpha: 1, drawSVG: "100%" });
        return;
      }

      const arrowLetters = ARROW_LETTER_IDS.map((id) =>
        el.querySelector<SVGPathElement>(id),
      ).filter((p): p is SVGPathElement => p !== null);
      const plainLetters = letters.filter((l) => !arrowLetters.includes(l));

      // Draw the outline first, then flood the fill, then fire the arrows —
      // the same three-phase construction the loader uses, so the mark is
      // built the same way wherever it appears.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });

      tl.set(letters, { fillOpacity: 0, stroke: "var(--pink)", strokeWidth: 2 })
        .fromTo(
          plainLetters,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.9, stagger: { from: "center", amount: 0.5 } },
        )
        .to(plainLetters, { fillOpacity: 1, duration: 0.5, stagger: 0.03 }, "-=0.25")
        .fromTo(
          arrowLetters,
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.5, ease: "power2.out", stagger: 0.07 },
          "-=0.35",
        )
        .to(arrowLetters, { fillOpacity: 1, duration: 0.35, stagger: 0.05 }, "-=0.2")
        // Every letter ends filled and unstroked — the end state is the plain
        // wordmark, so nothing depends on the animation having run.
        .to(letters, { strokeWidth: 0, duration: 0.3 }, "-=0.2");

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        ScrollTrigger.refresh();
      };
    },
    { scope: root, dependencies: [reduced] },
  );

  const monoRow = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.78rem",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  };

  return (
    <footer
      ref={root}
      className="burst"
      data-nav-theme="dark"
      style={{
        position: "relative",
        zIndex: 2,
        background: "var(--violet)",
        color: "var(--pink)",
        padding: "clamp(4rem, 10vw, 9rem) clamp(1.25rem, 4vw, 3rem) 0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(2rem, 6vw, 6rem)",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.2rem, 7vw, 5.5rem)",
            fontVariationSettings: "'wdth' 108, 'wght' 800",
            lineHeight: 0.94,
            textTransform: "uppercase",
            maxWidth: "12ch",
          }}
        >
          {site.tagline}
        </p>

        <nav aria-label="Footer" style={{ display: "flex", gap: "clamp(2rem, 5vw, 4rem)" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, ...monoRow }}>
            {[
              { label: "Events", href: "/events" },
              { label: "About", href: "/about" },
            ].map((l) => (
              <li key={l.href} style={{ marginBottom: "0.7em" }}>
                <TransitionLink
                  href={l.href}
                  label={l.label}
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5em",
                  }}
                >
                  <Arrow style={{ width: 14, height: 14 }} />
                  {l.label}
                </TransitionLink>
              </li>
            ))}
          </ul>

          {/*
            Rendered only when there are real, reachable URLs to link to. An
            empty socials array is the correct state today, and this site
            ships no dead links.
          */}
          {site.socials.length > 0 && (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, ...monoRow }}>
              {site.socials.map((s) => (
                <li key={s.href} style={{ marginBottom: "0.7em" }}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5em",
                    }}
                  >
                    <Arrow direction="up-right" style={{ width: 14, height: 14 }} />
                    {s.label}
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
          marginTop: "clamp(3rem, 8vw, 6rem)",
          paddingTop: "1.2rem",
          borderTop: "1px solid color-mix(in srgb, var(--pink) 35%, transparent)",
          opacity: 0.85,
          ...monoRow,
        }}
      >
        <LocalClock timezone={site.timezone} city={site.city} />
        <span>
          Est. {site.foundedYear} — {site.city}, {site.country}
        </span>
      </div>

      {/*
        The finale, but bounded. At full width the wordmark is ~0.67 of the
        viewport wide in height and swallows the whole screen, leaving the
        fixed nav sitting pink-on-pink and illegible. Capping it keeps a
        violet margin for the nav and still lands as the closing gesture.
      */}
      <div
        style={{
          marginTop: "clamp(3rem, 7vw, 6rem)",
          paddingBottom: "clamp(1.5rem, 3vw, 3rem)",
          height: "min(42vh, 30vw)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Logo
          className="footer-logo"
          idPrefix="footer"
          tone="brand"
          decorative
          style={{ height: "100%", width: "auto" }}
        />
      </div>
    </footer>
  );
}
