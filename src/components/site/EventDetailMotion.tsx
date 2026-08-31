"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";
import { gsap } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { useReveal } from "@/components/motion/useReveal";

/**
 * Motion for the event detail page.
 *
 * The page itself stays a server component so its content is statically
 * rendered and indexable; only this wrapper is a client component.
 */
export function EventDetailMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useReveal(root, { start: "top 88%" });

  useGSAP(
    () => {
      if (reduced) return;
      const poster = root.current?.querySelector<HTMLElement>(".detail-poster");
      if (!poster) return;

      const tween = gsap.to(poster, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: poster.parentElement,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: root, dependencies: [reduced] },
  );

  return <div ref={root}>{children}</div>;
}
