"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "./gsap";
import { useReducedMotion } from "./MotionProvider";

/*
  A cursor bubble that appears over anything declaring data-cursor.

  The label comes from the element itself, so an event card says OPEN and the
  ring says DRAG without this component knowing anything about either. The
  native cursor is never hidden — replacing it entirely breaks text selection
  and makes the site feel broken on a trackpad; this rides alongside it.
*/
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || reduced) return;
      if (window.matchMedia("(pointer: coarse)").matches) return;

      const label = el.querySelector<HTMLElement>(".cursor-label");
      const toX = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
      const toY = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

      gsap.set(el, { scale: 0, autoAlpha: 0, xPercent: -50, yPercent: -50 });

      let active: Element | null = null;

      const onMove = (e: PointerEvent) => {
        toX(e.clientX);
        toY(e.clientY);

        const hit = (e.target as Element | null)?.closest("[data-cursor]") ?? null;
        if (hit === active) return;
        active = hit;

        if (hit) {
          if (label) label.textContent = hit.getAttribute("data-cursor") ?? "";
          gsap.to(el, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(1.7)" });
        } else {
          gsap.to(el, { scale: 0, autoAlpha: 0, duration: 0.25, ease: "power2.in" });
        }
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 80,
        pointerEvents: "none",
        display: "grid",
        placeItems: "center",
        width: "6.4rem",
        height: "6.4rem",
        borderRadius: "50%",
        background: "var(--color-signal)",
        color: "var(--color-paper)",
        visibility: "hidden",
        opacity: 0,
        mixBlendMode: "normal",
      }}
    >
      <span
        className="cursor-label"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.62rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      />
    </div>
  );
}
