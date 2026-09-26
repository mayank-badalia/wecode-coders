#!/usr/bin/env node
/*
  Checks every route at every breakpoint that matters.

  Fails on the three things that actually break a layout on a phone: content
  wider than the viewport, text too small to read, and tap targets smaller
  than a fingertip. Run against a server that is already up.
*/
import { chromium } from "@playwright/test";

const SIZES = [
  { name: "iPhone SE", w: 375, h: 667, touch: true },
  { name: "iPhone 15", w: 393, h: 852, touch: true },
  { name: "Pixel 8", w: 412, h: 915, touch: true },
  { name: "iPad mini", w: 768, h: 1024, touch: true },
  { name: "iPad Pro", w: 1024, h: 1366, touch: true },
  { name: "Laptop", w: 1440, h: 900, touch: false },
  { name: "Desktop", w: 1920, h: 1080, touch: false },
  { name: "Ultrawide", w: 2560, h: 1080, touch: false },
];

/*
  Detail routes are read off /events rather than written out here.

  A hardcoded slug is a route that quietly stops existing the moment an event
  is locked — the whole set is locked right now — and the check then reports a
  broken 404 page as a broken layout. The events page carries a real link per
  event, locked or not, so it always names routes that exist.
*/
async function detailRoutes(page, base) {
  await page.goto(`${base}/events`, { waitUntil: "domcontentloaded" });
  const hrefs = await page.$$eval('a[href^="/events/"]', (as) =>
    [...new Set(as.map((a) => a.getAttribute("href")).filter(Boolean))],
  );
  const locked = hrefs.find((h) => /\/locked-\d+$/.test(h));
  const published = hrefs.find((h) => !/\/locked-\d+$/.test(h));
  // One of each kind when both exist; whatever exists otherwise.
  return [published, locked].filter(Boolean);
}

/*
  /verify is here because the certificate lookup is the one page a stranger
  reaches from a phone camera, having scanned a QR off a printed certificate.
  It is the most likely of all our routes to be seen on a small screen first.
  The [id] result page is covered by a known-bad id, which renders the
  not-found state — same layout, no dependency on a record existing.
*/
const ROUTES = ["/", "/events", "/about", "/hiring", "/verify", "/verify/L30-ZZZZZZ"];
const MIN_FONT = 11;
const MIN_TAP = 40;

const browser = await chromium.launch();
const problems = [];

const probe = await browser.newPage();
const routes = [...ROUTES, ...(await detailRoutes(probe, "http://localhost:3000"))];
await probe.close();

for (const size of SIZES) {
  const context = await browser.newContext({
    viewport: { width: size.w, height: size.h },
    hasTouch: size.touch,
    isMobile: size.touch,
    deviceScaleFactor: size.touch ? 2 : 1,
  });

  for (const route of routes) {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 90)));

    await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
    await page
      .waitForFunction(() => {
        const el = document.querySelector(".loader-root");
        return !el || getComputedStyle(el).display === "none";
      }, { timeout: 8000 })
      .catch(() => {});
    await page.waitForTimeout(1500);

    const report = await page.evaluate(
      ({ minFont, minTap }) => {
        const doc = document.documentElement;
        const overflow = doc.scrollWidth - doc.clientWidth;

        // Which elements actually stick out past the right edge.
        const culprits = [...document.querySelectorAll("body *")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.right > doc.clientWidth + 2 && getComputedStyle(el).position !== "fixed";
          })
          .slice(0, 4)
          .map((el) => `${el.tagName}.${(el.className || "").toString().split(" ")[0]}`);

        const tiny = [...document.querySelectorAll("p, span, a, li, dt, dd, h1, h2, h3")]
          // Decorative repeated text — the marquee strips — is not reading
          // material and is hidden from assistive tech; it is allowed to be
          // smaller than body copy.
          .filter((el) => !el.closest("[aria-hidden='true']"))
          .filter((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return false;
            if (!el.textContent?.trim()) return false;
            return parseFloat(getComputedStyle(el).fontSize) < minFont;
          })
          .slice(0, 4)
          .map((el) => `${el.tagName}@${getComputedStyle(el).fontSize}`);

        const smallTaps = [...document.querySelectorAll("a[href], button")]
          // The crawler list is visually hidden by design — it exists for
          // assistive tech and search engines, never for a fingertip.
          .filter((el) => !el.closest(".visually-hidden"))
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && (r.height < minTap || r.width < minTap);
          })
          .slice(0, 4)
          .map((el) => {
            const r = el.getBoundingClientRect();
            return `${(el.textContent || "").trim().slice(0, 14)}(${Math.round(r.width)}x${Math.round(r.height)})`;
          });

        return { overflow, culprits, tiny, smallTaps };
      },
      { minFont: MIN_FONT, minTap: MIN_TAP },
    );

    const label = `${size.name.padEnd(10)} ${String(size.w).padStart(4)}px ${route}`;
    if (report.overflow > 2) problems.push(`${label} — overflows by ${report.overflow}px: ${report.culprits.join(", ")}`);
    if (report.tiny.length) problems.push(`${label} — text under ${MIN_FONT}px: ${report.tiny.join(", ")}`);
    if (size.touch && report.smallTaps.length) problems.push(`${label} — tap targets under ${MIN_TAP}px: ${report.smallTaps.join(", ")}`);
    if (errors.length) problems.push(`${label} — ${[...new Set(errors)][0]}`);

    await page.close();
  }
  await context.close();
}

await browser.close();

if (problems.length > 0) {
  console.error(`check-responsive: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(`check-responsive: ok — ${SIZES.length} sizes x ${routes.length} routes`);
