"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

/**
 * Chooses the footer treatment for the current route.
 *
 * The home page closes on the full logo finale. Every other route gets the
 * compact strip — and `/events` gets no footer at all, because that page is a
 * locked controller with nothing to scroll to.
 */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/events") return null;
  return <Footer finale={pathname === "/"} />;
}
