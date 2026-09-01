"use client";

import { useGSAP } from "@gsap/react";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { Arrow } from "./Arrow";
import { Logo } from "./Logo";
import { NavOverlay } from "./NavOverlay";

const LINKS = [
  { index: "01", label: "Events", href: "/events" },
  { index: "02", label: "About", href: "/about" },
] as const;

/** A label that rolls up on hover: one line out, its echo in. */
function RollLink({
  index,
  label,
  href,
}: {
  index: string;
  label: string;
  href: string;
}) {
  const root = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const layers = gsap.utils.toArray<HTMLElement>(".roll-layer");
      if (layers.length < 2) return;

      const splits = layers.map(
        (l) => new SplitText(l, { type: "chars", charsClass: "roll-char" }),
      );
      const [outChars, inChars] = splits.map((s) => s.chars);
      if (!outChars || !inChars) return;

      gsap.set(inChars, { yPercent: 100 });

      const tl = gsap
        .timeline({ paused: true })
        .to(outChars, { yPercent: -100, duration: 0.4, stagger: 0.02 }, 0)
        .to(inChars, { yPercent: 0, duration: 0.4, stagger: 0.02 }, 0);

      const el = root.current;
      if (!el) return;
      const enter = () => tl.play();
      const leave = () => tl.reverse();
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
      el.addEventListener("focus", enter);
      el.addEventListener("blur", leave);

      return () => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
        el.removeEventListener("focus", enter);
        el.removeEventListener("blur", leave);
        splits.forEach((s) => s.revert());
      };
    },
    { scope: root },
  );

  return (
    <TransitionLink
      ref={root}
      href={href}
      label={label}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "0.5em",
        textDecoration: "none",
        color: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.62em",
          opacity: 0.7,
        }}
      >
        {index}
      </span>
      <span
        style={{
          position: "relative",
          display: "block",
          overflow: "hidden",
          lineHeight: 1.1,
        }}
      >
        {/* The second layer is aria-hidden so the label is announced once. */}
        <span className="roll-layer" style={{ display: "block" }}>
          {label}
        </span>
        <span
          className="roll-layer"
          aria-hidden="true"
          style={{
            display: "block",
            position: "absolute",
            inset: 0,
            color: "currentColor",
            opacity: 0.55,
          }}
        >
          {label}
        </span>
      </span>
    </TransitionLink>
  );
}

export function Nav() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  /*
    Nav colour is driven by whatever is actually beneath the bar.

    Two techniques were tried and rejected. mix-blend-mode: difference
    produces a muddy olive over saturated violet rather than an inversion,
    because the blend is per-channel arithmetic and not a perceptual flip.
    Pre-positioned ScrollTriggers per section then went stale: they are
    created at mount, before the event rail's pin exists, so every position
    below the pin is wrong and the nav latched to the wrong theme.

    Hit-testing the point under the bar is immune to both. It costs one
    elementsFromPoint per frame and is always correct regardless of pinning,
    refresh order or dynamically added sections.
  */
  useGSAP(() => {
    let current = false;

    const sample = () => {
      const probe = document.elementFromPoint(24, 40);
      const dark = probe?.closest("[data-nav-theme='dark']") != null;
      if (dark !== current) {
        current = dark;
        setOnDark(dark);
      }
    };

    gsap.ticker.add(sample);
    return () => gsap.ticker.remove(sample);
  }, []);

  useGSAP(
    () => {
      const wordmark = root.current?.querySelector(".nav-wordmark");
      const glyph = root.current?.querySelector(".nav-glyph");
      if (!wordmark || !glyph) return;

      gsap.set(glyph, { autoAlpha: 0, scale: 0.6 });

      /*
        Past the first screen the two-line lockup collapses to the arrow glyph.

        This is a cross-fade rather than a MorphSVG tween: morphing twelve
        letterforms into a single arrow produces an unreadable smear at nav
        size, and legibility beats technique. The arrow is the logo's own
        motif, so the substitution still reads as the same mark.
      */
      const tl = gsap
        .timeline({ paused: true })
        .to(wordmark, { autoAlpha: 0, scale: 0.7, duration: 0.35 }, 0)
        .to(glyph, { autoAlpha: 1, scale: 1, duration: 0.35 }, 0.1);

      const trigger = ScrollTrigger.create({
        start: "60vh top",
        onEnter: () => tl.play(),
        onLeaveBack: () => tl.reverse(),
      });

      return () => {
        trigger.kill();
        tl.kill();
      };
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <>
      {/*
        Keeps the fixed bar legible where body copy scrolls beneath it. Hidden
        over dark grounds, where a paper-coloured gradient reads as a haze
        across the top of the image rather than as nothing at all.
      */}
      <div className="nav-scrim" aria-hidden="true" style={{ opacity: onDark ? 0 : 1 }} />
      <header
        ref={root}
        className={onDark ? "burst" : undefined}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "clamp(1rem, 2.2vw, 1.8rem) clamp(1rem, 4vw, 3rem)",
          color: onDark ? "var(--signal)" : "var(--color-ink)",
          transition: "color 350ms ease",
          pointerEvents: "none",
          mixBlendMode: "normal",
        }}
      >
        <TransitionLink
          href="/"
          label="Home"
          aria-label="We Code Coders, home"
          style={{ position: "relative", display: "block", pointerEvents: "auto", width: 132, height: 44 }}
        >
          <span className="nav-wordmark" style={{ position: "absolute", inset: 0, display: "block" }}>
            <Logo tone="current" idPrefix="nav" decorative className="h-full w-auto" />
          </span>
          <span
            className="nav-glyph"
            style={{
              position: "absolute",
              left: 0,
              top: 2,
              display: "block",
              width: 40,
              height: 40,
            }}
          >
            <Arrow direction="up-right" strokeWidth={2} style={{ width: "100%", height: "100%" }} />
          </span>
        </TransitionLink>

        <nav
          aria-label="Primary"
          style={{
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "baseline",
            gap: "clamp(1.4rem, 3.4vw, 3rem)",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(0.85rem, 1.15vw, 1.05rem)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            pointerEvents: "auto",
          }}
        >
          <span className="nav-links">
            {LINKS.map((l) => (
              <RollLink key={l.href} {...l} />
            ))}
          </span>

          <button
            ref={menuButton}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-haspopup="dialog"
            style={{
              background: "none",
              border: "none",
              padding: "0.3em 0",
              color: "inherit",
              font: "inherit",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5em",
            }}
          >
            Menu
            <Arrow direction="down" style={{ width: 16, height: 16 }} />
          </button>
        </nav>
      </header>

      <NavOverlay
        open={open}
        onClose={() => {
          setOpen(false);
          menuButton.current?.focus();
        }}
        links={LINKS}
      />
    </>
  );
}
