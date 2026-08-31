"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "./gsap";
import { useReducedMotion } from "./MotionProvider";

type CounterProps = {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
};

/**
 * Counts up when its section enters.
 *
 * The final value is what renders on the server, so the number is correct
 * with JavaScript disabled and for crawlers; the count-down-then-up only
 * happens after mount. The aria-label carries the target so a screen reader
 * hears the figure rather than a stream of changing digits.
 */
export function Counter({ to, suffix = "", duration = 1.6, className }: CounterProps) {
  const root = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current?.querySelector<HTMLElement>(".counter-value");
      if (!el || reduced) return;

      const proxy = { v: 0 };
      el.textContent = "0";

      const tween = gsap.to(proxy, {
        v: to,
        duration,
        ease: "wccOut",
        onUpdate: () => {
          el.textContent = String(Math.round(proxy.v));
        },
        scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        el.textContent = String(to);
      };
    },
    { scope: root, dependencies: [to, duration, reduced] },
  );

  return (
    <span ref={root} className={className} aria-label={`${to}${suffix}`}>
      <span className="counter-value" aria-hidden="true">
        {to}
      </span>
      {suffix}
    </span>
  );
}
