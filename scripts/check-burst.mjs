#!/usr/bin/env node
/*
  Enforces the 70/30 editorial-to-maximalism ratio structurally.

  The burst palette (violet, pink, lime) is only permitted inside the burst
  zones listed in the design spec, section 4.1. Everywhere else the site is
  paper / ink / terracotta. Taste drifts over a long build; a check does not.

  If this fails on a file you believe should be allowed, the question to ask
  is whether that surface really is one of the spec's burst zones — not
  whether the list should grow.
*/
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = "src";
const TOKENS = /--violet|--pink|--lime|#4B3BF0|#F5C9D0|#C9F73D/i;

const ALLOWED = [
  "src/components/site/Loader",
  "src/components/site/TapeStack",
  "src/components/site/Footer",
  "src/components/site/EventRail",
  "src/components/site/NavOverlay",
  "src/components/site/BurstBreak",
  "src/components/site/Timeline",
  "src/components/motion/Transition",
  "src/components/canvas/",
  "src/components/poster/",
  "src/app/about/",
  "src/app/events/",
  "src/app/globals.css",
];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const violations = walk(ROOT)
  .filter((p) => /\.(tsx?|css)$/.test(p))
  .map((p) => relative(".", p).split(sep).join("/"))
  .filter((p) => !ALLOWED.some((a) => p.startsWith(a)))
  .filter((p) => TOKENS.test(readFileSync(p, "utf8")));

if (violations.length > 0) {
  console.error("check-burst: burst colours used outside an allowed zone (spec 4.1):");
  for (const v of violations) console.error("  " + v);
  console.error("\nUse paper / ink / terracotta here, or move the surface into a burst zone.");
  process.exit(1);
}

console.log("check-burst: ok");
