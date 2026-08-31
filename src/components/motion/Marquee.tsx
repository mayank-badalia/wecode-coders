"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ReactNode } from "react";
import { advanceMarquee, type MarqueeState } from "@/lib/marquee";
import { gsap } from "./gsap";
import { useLenis, useReducedMotion } from "./MotionProvider";

type MarqueeProps = {
  children: ReactNode;
  /** Pixels per second at rest. */
  speed?: number;
  direction?: 1 | -1;
  className?: string;
  style?: React.CSSProperties;
  /** Pause and lift this bar above the stack while hovered. */
  liftOnHover?: boolean;
};

export function Marquee({
  children,
  speed = 60,
  direction = 1,
  className,
  style,
  liftOnHover = true,
}: MarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const velocity = useRef(0);
  const reduced = useReducedMotion();

  // Lenis reports scroll velocity every frame; the bars add it to their own
  // speed, so scrolling hard whips them and reversing scroll reverses them.
  useLenis((lenis) => {
    velocity.current = lenis.velocity * 12;
  });

  useGSAP(
    () => {
      // Under reduced motion the track is simply static. No ticker callback is
      // registered at all, rather than one that does nothing.
      if (reduced) return;

      const trackEl = track.current;
      const copy = trackEl?.firstElementChild as HTMLElement | null;
      if (!trackEl || !copy) return;

      let state: MarqueeState = { x: 0, boost: 0 };
      let trackWidth = copy.offsetWidth;

      const observer = new ResizeObserver(() => {
        trackWidth = copy.offsetWidth;
      });
      observer.observe(copy);

      let last = performance.now() / 1000;

      /*
        Driven from the GSAP ticker, which is this app's single clock. A CSS
        keyframe animation cannot take a velocity input, and a second
        requestAnimationFrame here would desynchronise from Lenis.
      */
      const tick = () => {
        const now = performance.now() / 1000;
        const dt = Math.min(now - last, 0.1); // clamp after a tab switch
        last = now;

        state = advanceMarquee(state, dt, hovered.current ? 0 : velocity.current, {
          baseSpeed: hovered.current ? 0 : speed,
          direction,
          trackWidth,
          damping: 0.6,
        });

        gsap.set(trackEl, { x: state.x });
      };

      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        observer.disconnect();
      };
    },
    { scope: root, dependencies: [speed, direction, reduced] },
  );

  return (
    <div
      ref={root}
      className={className}
      aria-hidden="true"
      onMouseEnter={() => {
        hovered.current = true;
        if (liftOnHover && root.current) root.current.style.zIndex = "10";
      }}
      onMouseLeave={() => {
        hovered.current = false;
        if (liftOnHover && root.current) root.current.style.zIndex = "";
      }}
      style={{ overflow: "hidden", width: "100%", ...style }}
    >
      <div ref={track} style={{ display: "flex", width: "max-content", willChange: "transform" }}>
        {/* Rendered twice so the wrap is seamless. */}
        <div style={{ display: "flex", flexShrink: 0 }}>{children}</div>
        <div style={{ display: "flex", flexShrink: 0 }}>{children}</div>
      </div>
    </div>
  );
}
