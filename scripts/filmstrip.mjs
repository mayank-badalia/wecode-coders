#!/usr/bin/env node
/*
  Usage: node scripts/filmstrip.mjs /events events-ring [steps]

  Scrolls the route in steps, waits for the frame to settle at each, and
  writes PNGs to .filmstrips/<name>/NN.png.

  This exists because a Playwright fullPage screenshot never fires
  ScrollTrigger — it renders every scroll reveal in its hidden start state and
  the page looks blank or broken. A full-page shot is not valid evidence about
  this site. Always judge motion from a filmstrip.
*/
import { chromium } from "@playwright/test";
import { mkdirSync, rmSync } from "node:fs";

const [route = "/", name = "shot", steps = "12", width = "1440", height = "900"] =
  process.argv.slice(2);

const n = Number(steps);
const dir = `.filmstrips/${name}`;
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width), height: Number(height) },
});

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(3200); // let any loader finish

const docHeight = await page.evaluate(
  () => document.documentElement.scrollHeight,
);
const span = Math.max(0, docHeight - Number(height));

for (let i = 0; i < n; i++) {
  const y = n === 1 ? 0 : (span * i) / (n - 1);
  await page.evaluate((to) => {
    // Drive the real scroll position. Lenis reads this and ScrollTrigger
    // follows, which a fullPage capture never does.
    window.scrollTo({ top: to, behavior: "instant" });
  }, y);
  await page.waitForTimeout(750);
  await page.screenshot({
    path: `${dir}/${String(i).padStart(2, "0")}.png`,
  });
}

await browser.close();

console.log(`filmstrip: ${n} frames in ${dir} (page height ${docHeight}px)`);
if (errors.length > 0) {
  console.error(`\n${errors.length} console/page error(s):`);
  for (const e of [...new Set(errors)].slice(0, 10)) console.error("  " + e);
  process.exit(1);
}
