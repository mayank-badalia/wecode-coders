"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { Logo } from "./Logo";

export const LOADER_DONE_EVENT = "wcc:loader-done";
const SESSION_KEY = "wcc:seen";
const COLUMNS = 6;

/*
  Module-scope latch. The hero mounts at the same time as the loader and needs
  to know whether the signal has already fired — otherwise, on a repeat visit
  where the loader never runs, the hero would wait for an event that already
  happened and never animate in.
*/
let loaderDone = false;
export const hasLoaderFinished = () => loaderDone;

export function signalLoaderDone() {
  if (loaderDone) return;
  loaderDone = true;
  window.dispatchEvent(new Event(LOADER_DONE_EVENT));
}

/** The letters carrying the arrow flourishes — full letterforms, drawn last. */
const ARROW_LETTER_IDS = [
  "#loader-top-c-arrow",
  "#loader-bottom-c-arrow",
  "#loader-bottom-r-arrow",
  "#loader-bottom-s-arrow",
];

/*
  Run before first paint, from the document head.

  The loader cannot decide whether to render by reading sessionStorage during
  render: the server has no sessionStorage, so server and client would disagree
  and React would report a hydration mismatch. Nor can it decide in an effect
  without the violet panel flashing for one frame on every repeat visit.

  So the markup is always rendered — identical on server and client — and this
  script stamps the root element before paint. CSS hides the panel instantly
  when it is not wanted, and the component reads the same attribute to decide
  whether to animate.
*/
export const LOADER_PREPAINT_SCRIPT = `
(function () {
  try {
    var seen = sessionStorage.getItem(${JSON.stringify(SESSION_KEY)});
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduce) document.documentElement.setAttribute("data-wcc-seen", "1");
    else sessionStorage.setItem(${JSON.stringify(SESSION_KEY)}, "1");
  } catch (e) {
    document.documentElement.setAttribute("data-wcc-seen", "1");
  }
})();
`;

export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const skip =
        reduced ||
        document.documentElement.getAttribute("data-wcc-seen") === "1";

      if (skip) {
        signalLoaderDone();
        return;
      }

      const el = root.current;
      if (!el) return;

      const letters = gsap.utils.toArray<SVGPathElement>(".loader-logo .logo-letter");
      const arrowLetters = ARROW_LETTER_IDS.map((id) =>
        el.querySelector<SVGPathElement>(id),
      ).filter((p): p is SVGPathElement => p !== null);
      const plainLetters = letters.filter((l) => !arrowLetters.includes(l));
      const columns = gsap.utils.toArray<HTMLElement>(".loader-column");
      const counter = el.querySelector<HTMLElement>(".loader-counter");

      const tl = gsap.timeline({
        onComplete: () => gsap.set(el, { display: "none" }),
      });

      // Phase 1 — DRAW. Outlines stroke on from the centre of the wordmark out.
      tl.set(letters, {
        fillOpacity: 0,
        stroke: "var(--pink)",
        strokeWidth: 2,
        drawSVG: "0%",
      })
        .to(plainLetters, {
          drawSVG: "100%",
          duration: 0.9,
          stagger: { from: "center", amount: 0.5 },
        })
        // Phase 2 — FLOOD. Fill arrives out of order, so it reads as ink
        // soaking in rather than a single wipe.
        .to(
          plainLetters,
          {
            fillOpacity: 1,
            duration: 0.5,
            stagger: { each: 0.05, from: "random" },
          },
          "-=0.3",
        )
        // Phase 3 — FIRE. The arrow letters land last, with a small overshoot.
        .to(
          arrowLetters,
          { drawSVG: "100%", duration: 0.5, stagger: 0.07, ease: "power2.out" },
          "-=0.35",
        )
        .to(
          arrowLetters,
          { fillOpacity: 1, duration: 0.35, stagger: 0.05, ease: "back.out(2)" },
          "-=0.2",
        )
        .to(letters, { strokeWidth: 0, duration: 0.3 }, "-=0.2");

      if (counter) {
        const count = { v: 0 };
        tl.to(
          count,
          {
            v: 100,
            duration: 1.9,
            ease: "power1.inOut",
            onUpdate: () => {
              counter.textContent = String(Math.round(count.v)).padStart(2, "0");
            },
          },
          0,
        );
      }

      // Phase 4 — EXIT. Six columns clear upward. The hero is already running
      // underneath by the time the first one lifts.
      tl.add(() => signalLoaderDone(), ">-0.1").to(
        columns,
        {
          yPercent: -100,
          duration: 0.7,
          stagger: 0.06,
          ease: "expo.inOut",
        },
        ">-0.1",
      );

      /*
        Escape hatch. If a font or the SVG never resolves, the visitor must
        still get the site. The loader can never be allowed to trap anyone.
      */
      const bail = window.setTimeout(() => {
        tl.progress(1);
        signalLoaderDone();
      }, 4000);

      return () => {
        window.clearTimeout(bail);
        tl.kill();
      };
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <div
      ref={root}
      className="burst loader-root"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      {/* The columns are the ground; they lift away to reveal the page. */}
      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        {Array.from({ length: COLUMNS }, (_, i) => (
          <div
            key={i}
            className="loader-column"
            style={{ flex: 1, background: "var(--violet)" }}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          padding: "0 6vw",
        }}
      >
        <Logo
          className="loader-logo"
          idPrefix="loader"
          tone="brand"
          decorative
          style={{ width: "min(62vw, 70vh)", height: "auto" }}
        />
      </div>

      <span
        className="loader-counter"
        style={{
          position: "absolute",
          left: "clamp(1rem, 4vw, 3rem)",
          bottom: "clamp(1rem, 4vw, 3rem)",
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(2rem, 6vw, 4rem)",
          color: "var(--pink)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        00
      </span>
    </div>
  );
}
