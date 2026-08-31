#!/usr/bin/env node
// Usage: node scripts/shot.mjs /route out.png [width] [height]
// Single above-the-fold screenshot with fonts settled. For anything
// scroll-driven use scripts/filmstrip.mjs instead — a static shot cannot
// prove a ScrollTrigger fired.
import { chromium } from "@playwright/test";

const [route = "/", out = "shot.png", w = "1440", h = "1000"] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

// Wait for the loader to finish rather than guessing a delay, then let the
// page's own entrance timeline settle.
await page
  .waitForFunction(() => {
    const el = document.querySelector(".loader-root");
    return !el || getComputedStyle(el).display === "none";
  }, { timeout: 8000 })
  .catch(() => {});
await page.waitForTimeout(1800);
await page.screenshot({ path: out });
await browser.close();
console.log("shot ->", out);
