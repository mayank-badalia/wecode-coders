"use client";

import { useEffect } from "react";
import { useTransition } from "@/components/motion/TransitionProvider";

/**
 * Remounts on every navigation, which is what makes it the right place to run
 * the reveal half of the page transition.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const { playEnter } = useTransition();

  useEffect(() => {
    playEnter();
  }, [playEnter]);

  return children;
}
