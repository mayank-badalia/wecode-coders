"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";
import { gsap } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { useReveal } from "@/components/motion/useReveal";

export function AboutMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useReveal(root, { start: "top 88%", stagger: 0.06 });

  useGSAP(
    () => {
      if (reduced) return;
      const grid = root.current?.querySelector<HTMLElement>(".about-tiles");
      if (!grid) return;

      const tiles = gsap.utils.toArray<HTMLElement>(".about-tile", grid);
      const setters = tiles.map((tile) => ({
        tile,
        x: gsap.quickTo(tile, "x", { duration: 0.6, ease: "power3.out" }),
        y: gsap.quickTo(tile, "y", { duration: 0.6, ease: "power3.out" }),
        r: gsap.quickTo(tile, "rotation", { duration: 0.6, ease: "power3.out" }),
      }));

      // Tiles scatter away from the pointer by an amount that falls off with
      // distance. Driven by quickTo rather than a per-frame ticker, so there
      // is no extra callback competing with the scroll clock.
      const onMove = (e: PointerEvent) => {
        const rect = grid.getBoundingClientRect();
        setters.forEach(({ tile, x, y, r }) => {
          const t = tile.getBoundingClientRect();
          const dx = t.left + t.width / 2 - e.clientX;
          const dy = t.top + t.height / 2 - e.clientY;
          const dist = Math.hypot(dx, dy);
          const reach = Math.max(rect.width, rect.height) * 0.35;
          const force = Math.max(0, 1 - dist / reach);
          x(dx * 0.08 * force);
          y(dy * 0.08 * force);
          r(dx * 0.01 * force);
        });
      };

      const onLeave = () => setters.forEach(({ x, y, r }) => { x(0); y(0); r(0); });

      grid.addEventListener("pointermove", onMove);
      grid.addEventListener("pointerleave", onLeave);
      return () => {
        grid.removeEventListener("pointermove", onMove);
        grid.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: root, dependencies: [reduced] },
  );

  return <div ref={root}>{children}</div>;
}
