"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

/**
 * `/events` is a locked controller with nothing to scroll to, so it carries no
 * footer. Every other route gets the same one.
 */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/events") return null;
  return <Footer />;
}
