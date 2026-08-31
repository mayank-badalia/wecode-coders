#!/usr/bin/env node
/*
  Crawls every internal link reachable from the site root and fails on any that
  does not resolve.

  Also fails on stub links — href="#", empty hrefs, and javascript: — because
  a placeholder link is a broken link wearing a disguise. The requirement is
  that this site ships no dead ends, so the fix for a failure here is to remove
  the link, not to invent a page for it.

  Usage: node scripts/check-links.mjs [baseUrl]
*/
const BASE = process.argv[2] ?? "http://localhost:3000";

const seen = new Set();
const queue = ["/"];
const problems = [];
const externals = new Set();

const HREF = /<a\b[^>]*?href="([^"]*)"/gi;

while (queue.length > 0) {
  const path = queue.shift();
  if (!path || seen.has(path)) continue;
  seen.add(path);

  let res;
  try {
    res = await fetch(BASE + path);
  } catch (err) {
    problems.push(`${path} — request failed: ${String(err)}`);
    continue;
  }

  if (!res.ok) {
    problems.push(`${path} — HTTP ${res.status}`);
    continue;
  }

  const html = await res.text();
  for (const [, href] of html.matchAll(HREF)) {
    const value = href.trim();

    if (value === "" || value === "#" || value.startsWith("javascript:")) {
      problems.push(`${path} — stub link href="${value}"`);
      continue;
    }
    if (/^(https?:)?\/\//i.test(value)) {
      externals.add(value);
      continue;
    }
    if (value.startsWith("mailto:") || value.startsWith("tel:")) continue;

    const clean = value.split("#")[0]?.split("?")[0] ?? "";
    if (clean.startsWith("/") && !seen.has(clean)) queue.push(clean);
  }
}

console.log(`check-links: crawled ${seen.size} internal pages`);
if (externals.size > 0) {
  console.log(`  ${externals.size} external link(s), not fetched:`);
  for (const e of externals) console.log(`    ${e}`);
}

if (problems.length > 0) {
  console.error("\ncheck-links: problems found:");
  for (const p of problems) console.error("  " + p);
  console.error("\nRemove the link rather than adding a page for it.");
  process.exit(1);
}

console.log("check-links: ok — no dead or stub internal links");
