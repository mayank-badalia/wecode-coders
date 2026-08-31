"use client";

/**
 * Kept so each navigation gets a fresh subtree, which resets per-page motion
 * state. The page-transition reveal is NOT run from here — it is driven by
 * the pathname inside TransitionProvider, because mount timing varies with
 * how heavy the destination page is and a fast mount raced the exit.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return children;
}
