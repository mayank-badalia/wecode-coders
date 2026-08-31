"use client";

import { useGSAP } from "@gsap/react";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText } from "./gsap";
import { useReducedMotion } from "./MotionProvider";

type SplitLinesProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** "lines" for headings, "words" for long copy that should arrive by phrase. */
  type?: "lines" | "words";
  stagger?: number;
  /** ScrollTrigger start. Omit to play immediately on mount. */
  start?: string;
  delay?: number;
};

/*
  Masked reveal for flowing text.

  Three failure modes this exists to prevent:

  1. Splitting before webfonts load measures the fallback face, so the line
     breaks are computed for the wrong metrics and jump when the real font
     arrives. Hence the await on document.fonts.ready.
  2. Not re-splitting on resize leaves the text broken for the old width.
  3. Not reverting on unmount leaves SplitText's generated DOM behind, which
     compounds across route changes.
*/
export function SplitLines({
  children,
  as: Tag = "p",
  className,
  type = "lines",
  stagger = 0.09,
  start = "top 80%",
  delay = 0,
}: SplitLinesProps) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      // The end state is the default state: if anything below fails, the text
      // is simply visible. Nothing is gated behind the animation.
      if (reduced) return;

      let split: SplitText | null = null;
      let tween: gsap.core.Tween | null = null;
      let cancelled = false;
      let resizeTimer = 0;

      const build = () => {
        split?.revert();
        if (cancelled) return;

        split = new SplitText(el, {
          type: type === "lines" ? "lines" : "words,lines",
          mask: "lines",
          linesClass: "split-line",
        });

        const targets = type === "lines" ? split.lines : split.words;
        if (!targets || targets.length === 0) return;

        tween?.kill();
        tween = gsap.from(targets, {
          yPercent: 110,
          duration: 0.9,
          ease: "wccOut",
          stagger,
          delay,
          ...(start
            ? { scrollTrigger: { trigger: el, start, once: true } }
            : {}),
        });
      };

      document.fonts.ready.then(() => {
        if (!cancelled) build();
      });

      const onResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(build, 200);
      };
      window.addEventListener("resize", onResize);

      return () => {
        cancelled = true;
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
        tween?.kill();
        split?.revert();
      };
    },
    { scope: root, dependencies: [reduced, type, stagger, start, delay] },
  );

  // Narrowed to a concrete intrinsic for JSX's benefit. A polymorphic `as`
  // cannot be typed against every element's ref signature at once, and
  // leaving it open makes JSX infer children as never.
  const Element = Tag as "p";

  return (
    <Element ref={root as React.RefObject<HTMLParagraphElement>} className={className}>
      {children}
    </Element>
  );
}
