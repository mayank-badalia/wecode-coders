"use client";

import { usePathname } from "next/navigation";
import type { SiteData } from "@/lib/types";
import { Footer } from "./Footer";

/**
 * `/events` is a locked controller with nothing to scroll to, so it carries no
 * footer. Every other route gets the same one.
 */
export function SiteFooter({ site }: { site: SiteData }) {
  const pathname = usePathname();
  if (pathname === "/events") return null;
  return <Footer site={site} />;
}
