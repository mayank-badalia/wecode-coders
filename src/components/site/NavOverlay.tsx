"use client";

import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "@/components/motion/gsap";
import { useLenis, useReducedMotion } from "@/components/motion/MotionProvider";
import { Arrow } from "./Arrow";

type NavOverlayProps = {
  open: boolean;
  onClose: () => void;
  links: readonly { index: string; label: string; href: string }[];
};

export function NavOverlay({ open, onClose, links }: NavOverlayProps) {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reduced = useReducedMotion();

  // Smooth scroll must stop while the overlay is up, or the page drifts
  // behind it.
  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
    return () => lenis.start();
  }, [open, lenis]);

  // Escape closes, and focus is trapped while open.
  useEffect(() => {
    if (!open) return;

    const el = root.current;
    const focusables = el
      ? Array.from(
          el.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
        )
      : [];
    focusables[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || focusables.length === 0) return;

      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const items = gsap.utils.toArray<HTMLElement>(".overlay-item");

      if (reduced) {
        gsap.set(el, { autoAlpha: open ? 1 : 0 });
        gsap.set(items, { yPercent: 0, autoAlpha: 1 });
        return;
      }

      if (open) {
        gsap.set(el, { autoAlpha: 1 });
        gsap
          .timeline()
          .fromTo(
            el,
            { clipPath: "inset(0 0 0 100%)" },
            { clipPath: "inset(0 0 0 0%)", duration: 0.6, ease: "wcc" },
          )
          .fromTo(
            items,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.7, stagger: 0.06 },
            0.22,
          );
      } else {
        gsap
          .timeline()
          .to(items, { yPercent: -110, duration: 0.35, stagger: 0.03 })
          .to(
            el,
            { clipPath: "inset(0 0 0 100%)", duration: 0.45, ease: "wcc" },
            0.1,
          )
          .set(el, { autoAlpha: 0 });
      }
    },
    { dependencies: [open, reduced], scope: root },
  );

  return (
    <div
      ref={root}
      className="burst"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "var(--violet)",
        color: "var(--pink)",
        visibility: "hidden",
        opacity: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(1.5rem, 6vw, 5rem)",
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        style={{
          position: "absolute",
          top: "clamp(1rem, 2.2vw, 1.8rem)",
          right: "clamp(1rem, 4vw, 3rem)",
          background: "none",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          fontFamily: "var(--font-mono)",
          fontSize: "0.85rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Close
      </button>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {links.map((l) => (
          <li key={l.href} style={{ overflow: "hidden" }}>
            <Link
              href={l.href}
              onClick={onClose}
              className="overlay-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3em",
                textDecoration: "none",
                color: "inherit",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3rem, 12vw, 9rem)",
                fontVariationSettings: "'wdth' 105, 'wght' 800",
                lineHeight: 1.02,
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.16em",
                  opacity: 0.65,
                  alignSelf: "flex-start",
                  paddingTop: "1.2em",
                }}
              >
                {l.index}
              </span>
              {l.label}
              <Arrow
                direction="up-right"
                style={{ width: "0.32em", height: "0.32em", opacity: 0.8 }}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
