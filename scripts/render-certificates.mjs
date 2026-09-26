#!/usr/bin/env node
/*
  Render certificates to PDF from the committed records.

  One HTML template per event under src/certificates/<event>.html, rendered by
  Playwright. That is why a new hackathon costs a stylesheet rather than a
  pipeline: the renderer never changes, only the design does.

  Long names are the failure mode worth guarding. "Joshitha Surya Tejaswini
  Bandaru" is a real entry in the Launchpad registrations and will not fit a
  box sized for "Amit Kumar". The name is measured in the page and stepped down
  until it fits its two-line box, rather than being allowed to overflow or
  being set small enough for the worst case and leaving everyone else tiny.

  Run with tsx, not node — it imports the shared helpers from
  src/lib/certificates.ts and only tsx resolves the "@/" path alias.

  Usage:
    npx tsx scripts/render-certificates.mjs <event-slug> [--out=dir] [--only=ID] [--limit=N] [--png]
*/
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";
import QRCode from "qrcode";
import { formatEventDate } from "../src/lib/format.ts";

const args = process.argv.slice(2);
const eventSlug = args.find((a) => !a.startsWith("--"));
const flag = (n, d) => args.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=") ?? d;
const outDir = flag("out", join("dist", "certificates", eventSlug ?? ""));
const only = flag("only", null);
const limit = Number(flag("limit", "0"));
// PNG is for previewing a design and for sharing; PDF is what gets issued.
const asPng = args.includes("--png");

const SITE = process.env.WCC_SITE ?? "https://wecodecoders.in";

if (!eventSlug) {
  console.error("usage: npx tsx scripts/render-certificates.mjs <event-slug> [--out=dir] [--only=ID] [--limit=N]");
  process.exit(1);
}

const storePath = join("src", "data", "certificates", `${eventSlug}.json`);
const templatePath = join("src", "certificates", `${eventSlug}.html`);
for (const [what, p] of [["records", storePath], ["template", templatePath]]) {
  if (!existsSync(p)) { console.error(`No ${what} at ${p}`); process.exit(1); }
}

const template = readFileSync(templatePath, "utf8");
let certs = JSON.parse(readFileSync(storePath, "utf8"));
if (only) certs = certs.filter((c) => c.id.toUpperCase() === only.toUpperCase());
if (limit > 0) certs = certs.slice(0, limit);
if (!certs.length) { console.error("Nothing to render."); process.exit(1); }

// Event facts come from the same records the site renders, so a certificate
// can never disagree with the event page about its own dates.
const { events } = await import("../src/data/events.ts");
const event = events.find((e) => e.slug === eventSlug);
if (!event) { console.error(`No event "${eventSlug}" in src/data/events.ts`); process.exit(1); }

const ROLE_COPY = { participant: "a participant", finalist: "a finalist", winner: "a winner" };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1123, height: 794 } });

let done = 0;
const failed = [];

for (const cert of certs) {
  const verifyUrl = `${SITE}/verify/${cert.id}`;
  try {
    const qr = await QRCode.toDataURL(verifyUrl, { margin: 0, width: 400, color: { dark: "#142139ff", light: "#00000000" } });

    const html = template
      .replaceAll("{{NAME}}", esc(cert.name))
      .replaceAll("{{ROLE}}", esc(ROLE_COPY[cert.role] ?? cert.role))
      .replaceAll("{{EVENT}}", esc(event.title))
      .replaceAll("{{DATES}}", esc(formatEventDate(event.startsAt, event.endsAt)))
      .replaceAll("{{ISSUED}}", esc(cert.issuedAt))
      .replaceAll("{{ID}}", esc(cert.id))
      .replaceAll("{{VERIFY_URL}}", esc(verifyUrl.replace(/^https?:\/\//, "")))
      .replaceAll("{{QR}}", qr);

    await page.setContent(html, { waitUntil: "load" });

    /*
      Step the name down until it fits two lines of its own box. Measured in
      the page after layout, because how many lines a name takes depends on
      the font, the tracking and the words — not on its character count.
    */
    const finalSize = await page.evaluate(() => {
      const el = document.querySelector(".name");
      if (!el) return null;
      const lineHeight = () => parseFloat(getComputedStyle(el).lineHeight);
      const lines = () => Math.round(el.getBoundingClientRect().height / lineHeight());
      let pt = 46;
      while (lines() > 2 && pt > 18) {
        pt -= 2;
        el.style.setProperty("--name-size", `${pt}pt`);
      }
      return pt;
    });

    if (asPng) {
      await page.screenshot({ path: join(outDir, `${cert.id}.png`), fullPage: false });
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
    if (done === 1 || done % 25 === 0) {
      console.log(`  ${done}/${certs.length}  ${cert.id}  ${cert.name} (${finalSize}pt)`);
    }
  } catch (err) {
    failed.push(`${cert.id}: ${err.message}`);
  }
}

await browser.close();
console.log(`\nRendered ${done}/${certs.length} to ${outDir}`);
for (const f of failed) console.log(`  FAIL ${f}`);
