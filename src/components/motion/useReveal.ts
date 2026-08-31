"use client";

import { useGSAP } from "@gsap/react";
import type { RefObject } from "react";
import { gsap } from "./gsap";
import { useReducedMotion } from "./MotionProvider";

type RevealOptions = {
  selector?: string;
  stagger?: number;
  start?: string;
  y?: number;
};

/**
 * The house reveal: elements rise and fade in as their section enters.
 *
 * Used for anything that is not flowing text (cards, rules, metadata rows).
 * Flowing text uses <SplitLines>, which masks per line instead.
 */
export function useReveal(
  scope: RefObject<HTMLElement | null>,
  { selector = "[data-reveal]", stagger = 0.08, start = "top 82%", y = 28 }: RevealOptions = {},
) {
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      const targets = gsap.utils.toArray<HTMLElement>(selector);
      if (targets.length === 0) return;

      const tween = gsap.from(targets, {
        y,
        autoAlpha: 0,
        duration: 0.9,
        ease: "wccOut",
        stagger,
        scrollTrigger: { trigger: scope.current, start, once: true },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope, dependencies: [reduced, selector, stagger, start, y] },
  );
}
