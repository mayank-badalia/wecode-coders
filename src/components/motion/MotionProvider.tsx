"use client";

import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gsap, ScrollTrigger } from "./gsap";

const ReducedMotionContext = createContext(false);

/** True when the visitor has asked for reduced motion. */
export const useReducedMotion = () => useContext(ReducedMotionContext);

// Re-exported so no other module imports Lenis directly — there is exactly
// one instance and it lives here.
export { useLenis };

export function MotionProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduced) return;

    /*
      THE raf. Lenis runs with autoRaf:false and is driven from the GSAP
      ticker so smooth scroll and every animation share one clock. A second
      requestAnimationFrame loop anywhere in this app causes scroll drift
      that is extremely hard to trace back to its cause later — every other
      component that needs a per-frame callback must use gsap.ticker.add.
    */
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const lenis = lenisRef.current?.lenis;
    lenis?.on("scroll", ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(update);
      lenis?.off("scroll", ScrollTrigger.update);
    };
  }, [reduced]);

  return (
    <ReducedMotionContext.Provider value={reduced}>
      {!reduced && (
        <ReactLenis
          root
          options={{ autoRaf: false, lerp: 0.1, wheelMultiplier: 1 }}
          ref={lenisRef}
        />
      )}
      {children}
    </ReducedMotionContext.Provider>
  );
}
