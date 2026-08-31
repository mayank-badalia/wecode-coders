"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { gsap, ScrollTrigger } from "./gsap";
import { useLenis, useReducedMotion } from "./MotionProvider";

const LINE_COUNT = 5;

export type FromRect = { top: number; left: number; width: number; height: number };

type TransitionApi = {
  playExit: (label: string, fromRect?: FromRect) => Promise<void>;
  playEnter: () => void;
  isBusy: () => boolean;
};

const TransitionContext = createContext<TransitionApi | null>(null);

export function useTransition(): TransitionApi {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be used inside <TransitionProvider>");
  return ctx;
}

/*
  The page transition.

  Not the View Transitions API: the choreography here is five independently
  masked lines of the destination's name, which CSS-only view transitions do
  not express cleanly, and a GSAP timeline is seekable and therefore testable.
*/
export function TransitionProvider({ children }: { children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const linesWrap = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const lenis = useLenis();
  const reduced = useReducedMotion();

  const setLabel = useCallback((label: string) => {
    const nodes = linesWrap.current?.querySelectorAll<HTMLElement>(".transition-line");
    nodes?.forEach((n) => {
      n.textContent = label;
    });
  }, []);

  const playExit = useCallback(
    (label: string, fromRect?: FromRect) => {
      const el = panel.current;
      if (!el) return Promise.resolve();

      busy.current = true;
      setLabel(label);
      lenis?.stop();

      const lines = el.querySelectorAll<HTMLElement>(".transition-line");

      if (reduced) {
        return new Promise<void>((resolve) => {
          gsap.set(el, { visibility: "visible", clipPath: "none" });
          gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, onComplete: resolve });
        });
      }

      return new Promise<void>((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve });

        gsap.set(el, { visibility: "visible", autoAlpha: 1 });

        if (fromRect) {
          /*
            Arriving from an event card: the panel starts at the card's exact
            on-screen rect and grows to full bleed, so the navigation reads as
            the card itself opening rather than as an unrelated wipe.
          */
          gsap.set(el, {
            clipPath: "none",
            top: fromRect.top,
            left: fromRect.left,
            width: fromRect.width,
            height: fromRect.height,
            borderRadius: 18,
          });
          tl.to(el, {
            top: 0,
            left: 0,
            width: "100vw",
            height: "100svh",
            borderRadius: 0,
            duration: 0.6,
            ease: "wcc",
          });
        } else {
          gsap.set(el, {
            top: 0,
            left: 0,
            width: "100vw",
            height: "100svh",
            borderRadius: 0,
          });
          tl.fromTo(
            el,
            { clipPath: "inset(100% 0 0 0)" },
            { clipPath: "inset(0% 0 0 0)", duration: 0.65, ease: "wcc" },
          );
        }

        tl.fromTo(
          lines,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.55, stagger: 0.05, ease: "wccOut" },
          0.25,
        );
      });
    },
    [lenis, reduced, setLabel],
  );

  const playEnter = useCallback(() => {
    const el = panel.current;
    if (!el) return;

    // Nothing to reveal if no exit ran — a first load, for instance.
    if (getComputedStyle(el).visibility === "hidden") {
      busy.current = false;
      return;
    }

    const lines = el.querySelectorAll<HTMLElement>(".transition-line");

    const finish = () => {
      gsap.set(el, { visibility: "hidden", autoAlpha: 0, clipPath: "inset(100% 0 0 0)" });
      busy.current = false;
      lenis?.start();
      /*
        Refreshed once, after the panel has fully cleared. Refreshing while it
        is still moving measures the wrong layout and corrupts every pinned
        trigger on the incoming page.
      */
      ScrollTrigger.refresh();
    };

    if (reduced) {
      gsap.to(el, { autoAlpha: 0, duration: 0.15, onComplete: finish });
      return;
    }

    gsap
      .timeline({ onComplete: finish })
      .to(lines, { yPercent: -110, duration: 0.45, stagger: 0.04, ease: "wcc" })
      .to(
        el,
        { clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: "wcc" },
        0.12,
      );
  }, [lenis, reduced]);

  /*
    Back and forward do not fire a link's onNavigate, so no exit ever runs for
    them. Playing the panel in and straight back out keeps history navigation
    feeling deliberate instead of snapping, without pretending a click
    happened.
  */
  useEffect(() => {
    const onPop = () => {
      const el = panel.current;
      if (!el || busy.current) return;
      busy.current = true;
      setLabel("");
      gsap.set(el, {
        visibility: "visible",
        autoAlpha: 1,
        clipPath: "inset(0% 0 0 0)",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100svh",
        borderRadius: 0,
      });
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [setLabel]);

  const api = useMemo<TransitionApi>(
    () => ({ playExit, playEnter, isBusy: () => busy.current }),
    [playExit, playEnter],
  );

  return (
    <TransitionContext.Provider value={api}>
      {children}

      <div
        ref={panel}
        className="burst"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100svh",
          zIndex: 90,
          background: "var(--violet)",
          color: "var(--pink)",
          visibility: "hidden",
          opacity: 0,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          clipPath: "inset(100% 0 0 0)",
        }}
      >
        <div ref={linesWrap}>
          {Array.from({ length: LINE_COUNT }, (_, i) => (
            <div key={i} style={{ overflow: "hidden" }}>
              <div
                className="transition-line"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.2rem, 13vh, 9rem)",
                  fontVariationSettings: "'wdth' 96, 'wght' 900",
                  lineHeight: 1.02,
                  textTransform: "uppercase",
                  letterSpacing: "-0.01em",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
