#!/usr/bin/env node
/*
  Render certificates to PDF.

  The design is not duplicated here: this drives a browser over
  /verify/<id>/print, which renders the same <Certificate> component the verify
  page uses. A change to the artwork lands in both places at once, because
  there is only one place.

  That does mean the site has to be running. Point --base at a local
  `next start` or at production; either works.

  Usage:
    npx tsx scripts/render-certificates.mjs <event-slug> [--out=dir] [--base=http://localhost:3000]
                                            [--only=ID] [--limit=N] [--png]
*/
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const eventSlug = args.find((a) => !a.startsWith("--"));
const flag = (n, d) => args.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=") ?? d;
const outDir = flag("out", join("dist", "certificates", eventSlug ?? ""));
const base = flag("base", "http://localhost:3000").replace(/\/$/, "");
const only = flag("only", null);
const limit = Number(flag("limit", "0"));
const asPng = args.includes("--png");

if (!eventSlug) {
  console.error("usage: npx tsx scripts/render-certificates.mjs <event-slug> [--base=url] [--out=dir] [--only=ID] [--limit=N] [--png]");
  process.exit(1);
}

const storePath = join("src", "data", "certificates", `${eventSlug}.json`);
if (!existsSync(storePath)) { console.error(`No records at ${storePath}`); process.exit(1); }

let certs = JSON.parse(readFileSync(storePath, "utf8"));
if (only) certs = certs.filter((c) => c.id.toUpperCase() === only.toUpperCase());
if (limit > 0) certs = certs.slice(0, limit);
if (!certs.length) { console.error("Nothing to render."); process.exit(1); }

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
// A4 landscape at 96dpi. The print surface sizes itself off the viewport
// width, so this is what fixes the scale of everything on the sheet.
const page = await browser.newPage({ viewport: { width: 1123, height: 794 } });

/*
  Print media for both output modes. page.pdf() emulates it anyway; forcing it
  here means a --png review render shows exactly what the PDF will, rather
  than including screen-only furniture like the Save as PDF button.
*/
await page.emulateMedia({ media: "print" });

// Fail loudly on a base url that is not serving the site, rather than
// producing 55 identical pages of a 404.
const probe = await page.goto(`${base}/verify/${certs[0].id}/print`, { waitUntil: "networkidle" });
if (!probe || probe.status() !== 200) {
  console.error(`${base} did not serve the print route (status ${probe?.status()}).`);
  console.error("Start the site first:  npx next start -p 3000");
  await browser.close();
  process.exit(1);
}

let done = 0;
const failed = [];

for (const cert of certs) {
  try {
    const res = await page.goto(`${base}/verify/${cert.id}/print`, { waitUntil: "networkidle" });
    if (!res || res.status() !== 200) throw new Error(`status ${res?.status()}`);

    // The logos and the QR are images; a PDF taken before they decode comes
    // out with holes where the credits should be.
    await page.waitForFunction(() =>
      [...document.images].every((img) => img.complete && img.naturalWidth > 0),
    );

    if (asPng) {
      const el = await page.$(".cert");
      await el.screenshot({ path: join(outDir, `${cert.id}.png`) });
    } else {
      await page.pdf({
        path: join(outDir, `${cert.id}.pdf`),
        width: "297mm",
        height: "210mm",
        printBackground: true,
        pageRanges: "1",
      });
    }

    done++;
    if (done === 1 || done % 25 === 0) console.log(`  ${done}/${certs.length}  ${cert.id}  ${cert.name}`);
  } catch (err) {
    failed.push(`${cert.id}: ${err.message}`);
  }
}

await browser.close();
console.log(`\nRendered ${done}/${certs.length} to ${outDir}`);
for (const f of failed) console.log(`  FAIL ${f}`);
if (failed.length) process.exit(1);
