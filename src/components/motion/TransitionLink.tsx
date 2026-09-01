"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
  const { playExit, isBusy } = useTransition();

  return (
    <Link
      href={href}
      onNavigate={(e) => {
        /*
          Clicking the link for the page you are already on used to play the
          exit, push the same route, and then wait forever for a reveal that
          is driven by the pathname changing — leaving the panel covering the
          page. There is nothing to transition to, so scroll to the top and
          stop.
        */
        if (href === pathname) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

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
