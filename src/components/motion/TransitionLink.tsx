"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import { useTransition, type FromRect } from "./TransitionProvider";

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "onNavigate"> & {
  href: string;
  /** Shown on the five repeated lines during the transition. */
  label: string;
  /** Grow the panel from this rect instead of wiping up from the bottom. */
  getFromRect?: () => FromRect | undefined;
  children: ReactNode;
};

export function TransitionLink({
  href,
  label,
  getFromRect,
  children,
  ...rest
}: TransitionLinkProps) {
  const router = useRouter();
  const { playExit, isBusy } = useTransition();

  return (
    <Link
      href={href}
      onNavigate={(e) => {
        // Guards a double click: without this, two overlapping transitions
        // queue and the overlay can be left stranded over the page.
        if (isBusy()) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        void playExit(label, getFromRect?.()).then(() => router.push(href));
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
