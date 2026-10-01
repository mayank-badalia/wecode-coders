#!/usr/bin/env node
/*
  Issue certificates from a registration CSV.

  Idempotent on (email, event): running it twice does not give anyone a second
  certificate, and re-running after adding rows only issues the new ones. That
  matters because the store is committed — a duplicate would be a second valid
  id for the same person, and there would be no way to tell which is "the" one.

  Names are normalised through the same function the site uses, so what is
  printed matches what /verify shows, character for character.

  Run it with tsx, not node: it imports the shared helpers from
  src/lib/certificates.ts, and only tsx resolves the "@/" path alias.

  Usage:
    npx tsx scripts/issue-certificates.mjs <csv> <event-slug> <id-prefix>
        [--role=participant] [--award=path.json] [--write]

  --award points at a JSON file holding the award block every record in this
  run carries: what the certificate says the holder did, which is not always
  the event it is filed under. Without it the records have no citation, and
  certificates.test.ts fails the build rather than letting a blank one ship.

  --store names the file to write, when it should not be the event slug. One
  event can run two things people hold separate certificates for: Protocol//60
  had a pre-quiz, and 52 of the 86 who sat it also sat the main quiz. The
  no-double-issue check below is keyed on email within one store, so filing
  both under protocol-60.json would silently skip those 52 — including two of
  the three pre-quiz winners. Separate stores, one record each, same event.

  Without --write it prints what it would do and changes nothing.
*/
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { normaliseName, generateCertificateId, isCertificateId } from "../src/lib/certificates.ts";

const [csvPath, eventSlug, prefix] = process.argv.slice(2);
const flags = process.argv.slice(2).filter((a) => a.startsWith("--"));
const write = flags.includes("--write");
const role = (flags.find((f) => f.startsWith("--role="))?.split("=")[1] ?? "participant").trim();
const awardPath = flags.find((f) => f.startsWith("--award="))?.split("=").slice(1).join("=").trim();
const storeName = (flags.find((f) => f.startsWith("--store="))?.split("=")[1] ?? "").trim();

if (!csvPath || !eventSlug || !prefix) {
  console.error("usage: npx tsx scripts/issue-certificates.mjs <csv> <event-slug> <id-prefix> [--role=participant] [--write]");
  process.exit(1);
}
if (!["participant", "finalist", "winner"].includes(role)) {
  console.error(`unknown role "${role}" — use participant, finalist or winner`);
  process.exit(1);
}

/* Minimal CSV reader: quoted fields, embedded commas and doubled quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

const raw = readFileSync(csvPath, "utf8").replace(/^﻿/, "");
const [header, ...dataRows] = parseCsv(raw);
const col = (name) => header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());

/*
  Column names differ by source: Unstop exports "Candidate's Name", a Google
  Form exports whatever the question was called, usually numbered ("2. Full
  Name"). Rather than a flag per source, match on what the header contains.
*/
const clean = (h) => h.trim().toLowerCase().replace(/^\d+[.)]\s*/, "").replace(/\s+/g, " ");

/*
  Needles are tried in priority order, each against every column, exact match
  before substring. Scanning columns in the outer loop instead put the name of
  the *hackathon* on every certificate: "1. ENTER THE NAME OF THE
  HACKATHON/COMPETITION" contains "name" and came first in the file.
*/
const findCol = (...needles) => {
  for (const n of needles) {
    const exact = header.findIndex((h) => clean(h) === n);
    if (exact !== -1) return exact;
  }
  for (const n of needles) {
    const partial = header.findIndex((h) => clean(h).includes(n) && !NOT_A_PERSON.test(clean(h)));
    if (partial !== -1) return partial;
  }
  return -1;
};

// Columns that contain "name" but never a person's.
const NOT_A_PERSON = /hackathon|competition|event|project|team|repo|user|company|college/;

const iName = findCol("candidate's name", "full name", "name");
const iEmail = findCol("candidate's email", "email address", "email");
const iTeam = header.findIndex((h) => clean(h) === "team name");
// Optional. "leader" or "member" — what the holder's own submission said.
const iTeamRole = header.findIndex((h) => clean(h) === "team role");
if (iName === -1 || iEmail === -1) {
  console.error(`Could not find name and email columns. Header was:\n  ${header.join("\n  ")}`);
  process.exit(1);
}
console.log(`name column      ${header[iName]}`);
console.log(`email column     ${header[iEmail]}`);
console.log(`team column      ${iTeam === -1 ? "(none)" : header[iTeam]}`);

let award = null;
if (awardPath) {
  if (!existsSync(awardPath)) { console.error(`No award file at ${awardPath}`); process.exit(1); }
  award = JSON.parse(readFileSync(awardPath, "utf8"));
  if (!award?.title) { console.error(`${awardPath} has no "title"`); process.exit(1); }
  console.log(`award            ${award.title}${award.heldOn ? `, held ${award.heldOn}` : ""}`);
}

const storePath = join("src", "data", "certificates", `${storeName || eventSlug}.json`);
if (storeName) console.log(`store            ${storePath}`);
const existing = existsSync(storePath) ? JSON.parse(readFileSync(storePath, "utf8")) : [];

// Issued-to is keyed by email so a re-run is a no-op, and ids are checked for
// collisions against everything already issued for this event.
const byEmail = new Map(existing.map((c) => [String(c.email ?? "").toLowerCase(), c]));
const usedIds = new Set(existing.map((c) => c.id));

const issuedAt = new Date().toISOString().slice(0, 10);
const added = [];
const skipped = [];

for (const r of dataRows) {
  const email = (r[iEmail] ?? "").trim().toLowerCase();
  const name = normaliseName(r[iName] ?? "");
  if (!email || !name) { skipped.push(`${email || "(no email)"}: missing name or email`); continue; }
  if (byEmail.has(email)) { skipped.push(`${email}: already has ${byEmail.get(email).id}`); continue; }

  let id;
  do { id = generateCertificateId(prefix); } while (usedIds.has(id));
  usedIds.add(id);

  const team = iTeam === -1 ? "" : (r[iTeam] ?? "").trim();
  const rawTeamRole = iTeamRole === -1 ? "" : (r[iTeamRole] ?? "").trim().toLowerCase();
  if (rawTeamRole && !["leader", "member"].includes(rawTeamRole)) {
    throw new Error(`unknown team role ${JSON.stringify(rawTeamRole)} for ${email}`);
  }
  const cert = {
    id, name, email, event: eventSlug, role, issuedAt,
    ...(team ? { teamName: team } : {}),
    ...(rawTeamRole ? { teamRole: rawTeamRole } : {}),
    ...(award ? { award } : {}),
  };
  if (!isCertificateId(id)) throw new Error(`generated an id that fails validation: ${id}`);
  added.push(cert);
  byEmail.set(email, cert);
}

console.log(`csv rows         ${dataRows.length}`);
console.log(`already issued   ${skipped.filter((s) => s.includes("already has")).length}`);
console.log(`unusable rows    ${skipped.filter((s) => s.includes("missing")).length}`);
console.log(`to issue         ${added.length}`);
for (const a of added.slice(0, 5)) console.log(`   ${a.id}  ${a.name}`);
if (added.length > 5) console.log(`   … and ${added.length - 5} more`);

if (!write) {
  console.log("\nDry run — nothing written. Re-run with --write to issue.");
  process.exit(0);
}

const merged = [...existing, ...added];
writeFileSync(storePath, JSON.stringify(merged, null, 2) + "\n");
console.log(`\nWrote ${merged.length} certificates to ${storePath}`);
