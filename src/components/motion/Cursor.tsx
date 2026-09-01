"use client";

import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { gsap } from "./gsap";
import { useReducedMotion } from "./MotionProvider";

export type CursorTarget = { label: string; color: string; ink: string };

const CURSOR_EVENT = "wcc:cursor";

/**
 * Point the cursor bubble at something directly.
 *
 * DOM elements declare `data-cursor` and are picked up by hit-testing, but a
 * WebGL scene has no DOM to hit-test — the canvas is one element and the
 * posters inside it are not. Routing canvas hover through attributes made the
 * bubble appear a whole mouse-move late, because the attributes were written
 * after the move that should have shown it. This is called straight from the
 * raycast instead.
 */
export function setCursorTarget(target: CursorTarget | null) {
  window.dispatchEvent(new CustomEvent(CURSOR_EVENT, { detail: target }));
}

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
  const pathname = usePathname();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || reduced) return;
      if (window.matchMedia("(pointer: coarse)").matches) return;

      // Whatever the previous route left behind is not valid here.
      gsap.set(el, { scale: 0, autoAlpha: 0 });

      const label = el.querySelector<HTMLElement>(".cursor-label");
      const toX = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
      const toY = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

      gsap.set(el, { scale: 0, autoAlpha: 0, xPercent: -50, yPercent: -50 });

      /*
        Tracked by signature, not by element identity.

        On the events page a single stage element carries the cursor
        attributes and rewrites them as the pointer moves between posters. An
        identity check saw the same element both times and short-circuited, so
        the bubble kept whichever colour it happened to open with.
      */
      let active: string | null = null;
      /** True while a scene is driving the bubble directly. */
      let forced = false;

      const signatureOf = (t: Element) =>
        [
          t.getAttribute("data-cursor"),
          t.getAttribute("data-cursor-color"),
          t.getAttribute("data-cursor-ink"),
        ].join("|");

      const hide = () => {
        if (active === null) return;
        active = null;
        forced = false;
        gsap.to(el, { scale: 0, autoAlpha: 0, duration: 0.28, ease: "power2.in" });
      };

      const show = (target: Element, signature: string) => {
        const first = active === null;
        active = signature;
        if (label) label.textContent = target.getAttribute("data-cursor") ?? "";
        // Each event carries its own accent, so the bubble picks up the colour
        // of the thing being hovered rather than being one flat red everywhere.
        const accent = target.getAttribute("data-cursor-color");
        gsap.to(el, {
          scale: 1,
          autoAlpha: 1,
          backgroundColor: accent ?? "#ED1C24",
          color: target.getAttribute("data-cursor-ink") ?? "#F3EFE5",
          // Opening pops; moving between two things just recolours.
          duration: first ? 0.35 : 0.25,
          ease: first ? "back.out(1.7)" : "power2.out",
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

        // A scene driving the bubble directly wins over hit-testing.
        if (forced) return;

        const signature = live ? signatureOf(live) : null;
        if (signature === active) return;
        if (live && signature) show(live, signature);
        else hide();
      };

      // Direct targeting, used by the WebGL scene.
      const onTarget = (e: Event) => {
        const target = (e as CustomEvent<CursorTarget | null>).detail;
        if (!target) {
          forced = false;
          hide();
          return;
        }

        forced = true;
        const signature = ["forced", target.label, target.color].join("|");
        if (signature === active) return;
        const first = active === null;
        active = signature;
        if (label) label.textContent = target.label;
        gsap.to(el, {
          scale: 1,
          autoAlpha: 1,
          backgroundColor: target.color,
          color: target.ink,
          duration: first ? 0.35 : 0.25,
          ease: first ? "back.out(1.7)" : "power2.out",
        });
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      // Leaving the window or tabbing away must not strand the bubble.
      window.addEventListener("pointerdown", onMove, { passive: true });
      document.addEventListener("pointerleave", hide);
      window.addEventListener("blur", hide);
      window.addEventListener(CURSOR_EVENT, onTarget);

      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onMove);
        document.removeEventListener("pointerleave", hide);
        window.removeEventListener("blur", hide);
        window.removeEventListener(CURSOR_EVENT, onTarget);
      };
    },
    /*
      Rebuilt on every route change.

      The element the bubble was tracking is gone once the page changes, but
      the bubble itself lives in the layout and survived — so it stayed on
      screen, following the pointer with a label for something that no longer
      existed. Re-running clears it and starts fresh.
    */
    { scope: root, dependencies: [reduced, pathname] },
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
