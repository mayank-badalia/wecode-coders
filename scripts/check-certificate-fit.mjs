#!/usr/bin/env node
/*
  Prove no certificate is quietly cropped.

  The sheet is a fixed A4 landscape with a fixed credits band and a fixed
  footer, so the body between them is the only block that can grow — and it
  is `overflow: hidden`, which means content that does not fit is simply not
  printed. There is no error, no warning, and the PDF looks fine until you
  notice a sentence stops mid-word. It has happened twice.

  Names, team names, role lists and contributions all vary per holder, so one
  eyeballed sample proves nothing about the other 498. This renders every
  record in a store and measures the body's children against the space it has.

  scrollHeight is not the measure: the browser clamps it at clientHeight, so
  it can prove overflow but never headroom. The children are summed instead,
  which is why "tightest fit" is a number worth watching — at 0 the next font
  substitution crops somebody.

  The site has to be running.

  Usage:
    npx tsx scripts/check-certificate-fit.mjs <store> [--base=http://localhost:3000]
*/
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const store = process.argv.find((a, i) => i > 1 && !a.startsWith("--"));
const base = process.argv.find((a) => a.startsWith("--base="))?.split("=")[1] ?? "http://localhost:3000";
if (!store) { console.error("usage: npx tsx scripts/check-certificate-fit.mjs <store> [--base=URL]"); process.exit(1); }
const certs = JSON.parse(readFileSync(`src/data/certificates/${store}.json`, "utf8"));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
const bad = [];
let worst = { id: null, slack: Infinity };
for (const [i, c] of certs.entries()) {
  await p.goto(`${base}/verify/${c.id}/print`, { waitUntil: "domcontentloaded" });
  await p.emulateMedia({ media: "print" });
  await p.evaluate(() => document.fonts.ready);
  const m = await p.evaluate(() => {
    const body = document.querySelector(".cert-body");
    const cs = getComputedStyle(body);
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    // scrollHeight is clamped at clientHeight, so it can only prove overflow,
    // never headroom. Sum the children instead.
    let need = 0;
    let prevMargin = 0;
    for (const el of body.children) {
      const c = getComputedStyle(el);
      const mt = parseFloat(c.marginTop), mb = parseFloat(c.marginBottom);
      need += el.getBoundingClientRect().height + Math.max(mt, prevMargin) ;
      prevMargin = mb;
    }
    need += prevMargin + pad;
    return { need: Math.round(need), have: Math.round(body.getBoundingClientRect().height) };
  });
  const slack = m.have - m.need;
  if (slack < worst.slack) worst = { id: c.id, slack, ...m };
  if (slack < 0) bad.push(`${c.id} over by ${-slack}px (${c.name} / ${(c.contribution||"").length} chars)`);
  if (i % 50 === 0) process.stdout.write(`\r${i}/${certs.length} over=${bad.length}   `);
}
console.log(`\nchecked ${certs.length}; clipped ${bad.length}`);
bad.slice(0, 20).forEach((x) => console.log("  ", x));
console.log("tightest fit:", JSON.stringify(worst));
await b.close();
process.exit(bad.length === 0 && worst.slack > 0 ? 0 : 1);
