"use client";

import { useRef, type ReactNode } from "react";
import { useReveal } from "@/components/motion/useReveal";

/*
  Reveal scope for /hiring.

  Deliberately thinner than AboutMotion: this page is read, not browsed. Every
  section is a list somebody is checking their own situation against, so the
  only motion is the shared reveal — nothing here should move while a reader is
  part-way down a list of conditions.
*/
export function HiringMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useReveal(root, { start: "top 90%", stagger: 0.05 });

  return <div ref={root}>{children}</div>;
}
