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

      const hide = () => {
        if (!active) return;
        active = null;
        gsap.to(el, { scale: 0, autoAlpha: 0, duration: 0.28, ease: "power2.in" });
      };

      const show = (target: Element) => {
        active = target;
        if (label) label.textContent = target.getAttribute("data-cursor") ?? "";
        // Each event carries its own accent, so the bubble picks up the colour
        // of the thing being hovered rather than being one flat red everywhere.
        const accent = target.getAttribute("data-cursor-color");
        gsap.to(el, {
          scale: 1,
          autoAlpha: 1,
          backgroundColor: accent ?? "var(--color-signal)",
          color: target.getAttribute("data-cursor-ink") ?? "#F3EFE5",
          duration: 0.35,
          ease: "back.out(1.7)",
        });
      };

      const onMove = (e: PointerEvent) => {
        toX(e.clientX);
        toY(e.clientY);

        /*
          Resolved from the point under the pointer rather than from
          event.target. The rail cards sit under a full-bleed wash and the
          events canvas swallows the target entirely, so target-based matching
          left the bubble showing after the pointer had already left.
        */
        const under = document.elementFromPoint(e.clientX, e.clientY);
        const hit = under?.closest("[data-cursor]") ?? null;

        // An element can opt out while it is not actually interactive.
        const live = hit && hit.getAttribute("data-cursor-active") !== "false" ? hit : null;

        if (live === active) return;
        if (live) show(live);
        else hide();
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      // Leaving the window or tabbing away must not strand the bubble.
      window.addEventListener("pointerdown", onMove, { passive: true });
      document.addEventListener("pointerleave", hide);
      window.addEventListener("blur", hide);

      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onMove);
        document.removeEventListener("pointerleave", hide);
        window.removeEventListener("blur", hide);
      };
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
