/*
  Certificates, and what makes one verifiable.

  A PDF that says "verified" on it verifies nothing. The only thing that makes
  a certificate checkable is a public record on a domain we control: the holder
  shows an id, a stranger opens /verify/<id> on wecodecoders.in, and sees who it
  was issued to and for what. Everything here exists to make that lookup honest.

  The records themselves live in src/data/certificates/<event>.json, committed
  to the repo. That is deliberate: the git history becomes the issuance log, so
  when a certificate was created is provable rather than asserted.
*/

export type CertificateRole = "participant" | "finalist" | "winner";

export type Certificate = {
  /** Public, unguessable, printed on the certificate. */
  id: string;
  /** As it should appear on the certificate. */
  name: string;
  /** Event slug — must match a record in src/data/events.ts. */
  event: string;
  role: CertificateRole;
  /** ISO date. Not a timestamp: the day is all anyone needs. */
  issuedAt: string;
  /** Shown on the verify page when present. */
  teamName?: string;
  /*
    Which seat the holder had on that team.

    A team hackathon certificate that says only "with team X" leaves the
    reader guessing what the holder actually did, and the one person who
    organised the team has nothing to show for it. The submission form asks
    this directly, so it is recorded rather than inferred.
  */
  teamRole?: "leader" | "member";
  /*
    Where the team finished among the placed teams, 1 being first.

    Every finalist is placed, not only the three that are announced: the group
    post carries the top three and nothing else, while each team's own position
    reaches it privately and is printed here. That split is the whole point of
    the field — a position this record carries is not a position the event
    published.

    It is optional because most certificates have none to carry: a round
    completion and a participation certificate place nobody. Absent means
    unplaced, and the sheet simply omits the clause.
  */
  position?: number;
  /*
    How many teams were placed, so the number above can be read.

    "7th" alone invites the reader to guess the field size, and a reader who
    guesses low makes the holder look worse than they did. Optional for the
    same reason, and the sheet drops the "of N" half rather than the whole
    clause when it is missing.
  */
  positionOf?: number;
  /*
    The craft the holder was responsible for, as they declared it.

    Short and structured, which is what lets it sit on the sheet whole: the
    submission form offers a fixed set (Backend, Frontend, AI / ML, Design /
    UI-UX, Product / Research, Presentation / Demo) and a free text box, so
    most records hold one to three of those words. It answers "what were you
    on the team for", which the contribution below then evidences.
  */
  roles?: string[];
  /*
    What this holder actually did, in their own words from their submission.

    A team certificate that names only the team is worth the same to every
    member, including the one who did nothing. From the three-round events
    onward every member submits their own entry stating the role they held
    and the part they built, which is what makes this printable — and what
    makes the certificate worth something to the person holding it.

    Stored whole. The sheet has room for a few lines and trims what will not
    fit (see CONTRIBUTION_LINE_LIMIT), but the record keeps every word the
    holder wrote so /verify shows the full statement the trim came from.
    Truncating on the way in would destroy the only copy.
  */
  contribution?: string;
  /*
    What the certificate actually says the holder did.

    Kept on the certificate rather than derived from the event record, because
    the two are not always the same thing: this batch is a sponsored challenge
    that ran inside WCC Launchpad 30 on its own days, so taking the title and
    dates off the parent event printed a date nine days in the future.
  */
  award?: {
    /** Headline of the thing taken part in. It is the line that is set large. */
    title: string;
    /** Where it sits — e.g. the parent event. Set beneath the title. */
    context?: string;
    /*
      What the thing was, in the holder's own terms: "36-hour challenge",
      "15 questions".

      This was `duration` plus a `kind` noun, which worked only while every
      record came from a hackathon — a hackathon has a length, and a quiz has
      a number of questions, and forcing the second into the first printed
      "a 15-minute quiz" on something that was fifteen questions long. One
      free descriptor says the true thing in both cases.
    */
    detail?: string;
    /*
      The day the thing was actually held — not the day the certificate was
      issued, which is usually later and is what `issuedAt` records.

      A certificate that only carries its issue date makes the holder look
      like they did the work on a day they did not.
    */
    heldOn?: string;
    /*
      The closing day, when the thing ran across more than one.

      A 36-hour hackathon that started on a Saturday and finished on a Sunday
      is not something that happened "on 4 October". Without this the sheet
      has to pick one of the two days and silently drop the other.
    */
    heldThrough?: string;
  };
};

/*
  No 0/O, 1/I/L. Someone reads this id off a PDF and types it into a phone, or
  reads it down a call — the characters that get confused are simply absent
  rather than leniently parsed, so there is one spelling of every id.
*/
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const RANDOM_LENGTH = 6;

/*
  Random, never sequential.

  A sequential scheme (WCC-001, WCC-002) means anyone holding one certificate
  can guess a hundred more, and every guess passes our own verification. That
  turns the verify page from proof into decoration. 31^6 is about 887 million,
  so guessing is not worth anyone's afternoon.
*/
export function generateCertificateId(prefix: string, random = Math.random): string {
  let out = "";
  for (let i = 0; i < RANDOM_LENGTH; i++) {
    out += ALPHABET[Math.floor(random() * ALPHABET.length)];
  }
  return `${prefix}-${out}`;
}

export const CERTIFICATE_ID_PATTERN = new RegExp(
  `^[A-Z0-9]{2,6}-[${ALPHABET}]{${RANDOM_LENGTH}}$`,
);

/** Cheap shape check before touching the store — and it rejects path tricks. */
export const isCertificateId = (value: string) =>
  CERTIFICATE_ID_PATTERN.test(value.trim().toUpperCase());

/* ------------------------------------------------ printing a record */

/*
  1 -> "1st", 11 -> "11th", 23 -> "23rd".

  Teens are the whole difference: 11, 12 and 13 take "th" although they end in
  1, 2 and 3, and a hundred finalists reach every one of them.
*/
export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  const unit = n % 10;
  return `${n}${unit === 1 ? "st" : unit === 2 ? "nd" : unit === 3 ? "rd" : "th"}`;
}

/*
  "7th of 100" — the half-sentence both the sheet and the verify page print.

  One function because the two were going to drift: the sheet said "placed 7th"
  and the page said "Position 7", and a holder comparing the document against
  its own record should not have to work out that those are the same fact.
*/
export function placement(cert: Pick<Certificate, "position" | "positionOf">): string | null {
  if (typeof cert.position !== "number" || !Number.isFinite(cert.position)) return null;
  if (cert.position < 1) return null;
  const of = cert.positionOf;
  const sized = typeof of === "number" && Number.isFinite(of) && of >= cert.position;
  return sized ? `${ordinal(cert.position)} of ${of}` : ordinal(cert.position);
}

/*
  How much of a contribution the sheet can hold.

  It is set at 0.78em inside a 36em measure, which is about 75 characters a
  line, and there is room for three of them before the footer rule starts
  moving. Submissions run to 2,380 characters, so something has to give: the
  record keeps every word (the verify page prints it in full, and the QR on
  the sheet points there), and only the printed copy is cut.
*/
export const CONTRIBUTION_LINE_LIMIT = 150;

/*
  "Backend, Frontend and AI / ML" — a list, not a dump of the raw field.

  The form returns them semicolon-joined, which on a document reads as
  machine output. Beyond three the tail is dropped rather than running the
  citation onto another line: the full set is on the verify page.
*/
export function listRoles(roles: string[]): string {
  const shown = roles.slice(0, 3);
  if (shown.length === 1) return shown[0]!;
  return `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
}

/*
  Cut on a boundary a reader recognises, never mid-word.

  A sentence that ends inside the limit is the cleanest cut there is — it
  reads as the whole statement rather than as something interrupted, so no
  ellipsis is needed. Failing that it falls back to the last word boundary
  and marks the cut, because a certificate that silently stops mid-thought
  is worse than one that says there is more to read.
*/
export function fitContribution(text: string): string | null {
  const clean = text.replace(/\s+/g, " ").trim();

  /*
    A tag is not a statement. Two people answered "what did YOU personally
    build" with "AI" and "Research", and one italic word floating under the
    citation reads as a layout accident rather than as their work. The answer
    is still on the verify page; it just is not set on the sheet.
  */
  if (clean.length < 12 || clean.split(" ").length < 2) return null;

  if (clean.length <= CONTRIBUTION_LINE_LIMIT) return clean;

  const head = clean.slice(0, CONTRIBUTION_LINE_LIMIT + 1);

  // The last sentence that ends inside the limit, if one gets far enough in
  // to still be worth reading. Half the limit is the floor: "AI." standing
  // alone where 200 more characters follow is a worse cut than a trimmed one.
  let sentence = -1;
  for (let i = 0; i < head.length - 1; i++) {
    if (".!?".includes(head[i]!) && /\s/.test(head[i + 1]!)) sentence = i;
  }
  if (sentence >= CONTRIBUTION_LINE_LIMIT * 0.5) return head.slice(0, sentence + 1);

  const word = head.lastIndexOf(" ");
  const cut = head.slice(0, word > 0 ? word : CONTRIBUTION_LINE_LIMIT);
  return `${cut.replace(/[,;:\u2013\u2014-]+$/, "")}…`;
}

/* ---------------------------------------------------------------- names */

/*
  Registration data is typed by hundreds of people in a hurry, and whatever
  they typed is about to be printed on something they put in front of an
  employer. The Launchpad CSV alone carries "RITESH KOLEY", "Sakshi Pandey
  Pandey" and names padded with stray spaces.

  This is deliberately conservative: it fixes only the three things that are
  unambiguously data-entry noise, and leaves every real spelling decision to a
  human. It will not touch "McDonald", "de Souza" or "K S".
*/
export function normaliseName(raw: string): string {
  const collapsed = raw.replace(/\s+/g, " ").trim();
  if (!collapsed) return "";

  /*
    Case is only corrected when it is uniform — ALL CAPS or all lower. Both are
    keyboard accidents rather than spellings, and a certificate reading "karan
    dnyandeo ghorpade" is as wrong as one reading "RITESH KOLEY".

    Anything with mixed case is left exactly as typed, which is what protects
    McDonald, de Souza and "K S". The known cost is a name like "van der berg",
    typed entirely lower case, becoming "Van Der Berg" — rarer in this data
    than the lowercase names this fixes, and still a name the holder can read.
  */
  const hasUpper = /[A-Z]/.test(collapsed);
  const hasLower = /[a-z]/.test(collapsed);
  const uniformCase = hasUpper !== hasLower;
  const cased = uniformCase
    ? collapsed
        .toLowerCase()
        .replace(/(^|[\s'-])([a-z])/g, (_, lead: string, ch: string) => lead + ch.toUpperCase())
    : collapsed;

  // "Pandey Pandey" — the surname field pasted into the name field. Only
  // immediately adjacent repeats, compared case-insensitively.
  const words = cased.split(" ");
  const deduped = words.filter(
    (word, i) => i === 0 || word.toLowerCase() !== words[i - 1]!.toLowerCase(),
  );

  return deduped.join(" ");
}

/* ------------------------------------------------------------- lookups */

import quizProtocol60 from "@/data/certificates/protocol-60.json";
import quizProtocol60Pre from "@/data/certificates/protocol-60-pre-quiz.json";
import preLaunchpad30 from "@/data/certificates/wcc-launchpad-30-pre-hackathon.json";
import preForge48 from "@/data/certificates/wcc-forge-48-pre-hackathon.json";
import preTechCircuit from "@/data/certificates/tech-circuit-pre-hackathon.json";
import preCodeAxis from "@/data/certificates/code-axis-pre-hackathon.json";
import preInkloomUnnamed from "@/data/certificates/inkloom-pre-hackathon.json";
import launchpad30 from "@/data/certificates/wcc-launchpad-30.json";

/*
  Imported statically rather than read from disk so the verify page can be
  prerendered and the whole set ships as part of the bundle for that route.
  A new batch means one more import here.

  Keys are store names, not event slugs. Usually they are the same, but one
  event can run two separate things people hold separate certificates for —
  Protocol//60 had a pre-quiz a week before the main quiz, and 52 of the 86
  who sat it also sat the main one. Those are two awards, so two records per
  person, and they cannot share a store: the issuer is idempotent on
  (email, store), which is exactly what stops a re-run issuing anyone a second
  certificate for the same thing.

  Nothing reads these keys — everything is looked up by id across the lot.
*/
const STORES: Record<string, Certificate[]> = {
  "protocol-60": quizProtocol60 as Certificate[],
  // The hackathon itself, not the pre-hackathon below it: every member
  // submitted their own entry, so these are the first records carrying the
  // holder's own role and what they personally built.
  "wcc-launchpad-30": launchpad30 as Certificate[],
  "protocol-60-pre-quiz": quizProtocol60Pre as Certificate[],
  // Four Inkloom-sponsored pre-hackathons, one store each. Same shape as the
  // pre-quiz: the award is not the event it ran under, and a person can hold
  // one from more than one of them.
  "wcc-launchpad-30-pre-hackathon": preLaunchpad30 as Certificate[],
  "wcc-forge-48-pre-hackathon": preForge48 as Certificate[],
  "tech-circuit-pre-hackathon": preTechCircuit as Certificate[],
  "code-axis-pre-hackathon": preCodeAxis as Certificate[],
  /*
    The entrants whose own submission named only "Inkloom Hackathon" — no
    event in it at all. Their certificates say exactly that, because inventing
    one of the four would be a claim about their work that nothing supports.

    The `event` slug on these records is inferred from the submission window
    and is internal bookkeeping only; it is never printed and never shown on
    the verify page, which reads the award title.
  */
  "inkloom-pre-hackathon": preInkloomUnnamed as Certificate[],
};

export function allCertificates(): Certificate[] {
  return Object.values(STORES).flat();
}

/*
  Ids pasted together.

  A plain-text email that puts a verify link at the end of one line and an id
  at the start of the next invites the mail client to join them: the link
  arrives as /verify/L30-HY7GCUL30-EZRZBS, and both halves are real
  certificates. Rather than a flat "not found", the page can offer them.
*/
export function certificatesWithin(raw: string): Certificate[] {
  const text = raw.trim().toUpperCase();
  if (!text || isCertificateId(text)) return [];
  return allCertificates().filter((c) => text.includes(c.id.toUpperCase()));
}

export function findCertificate(id: string): Certificate | null {
  if (!isCertificateId(id)) return null;
  const wanted = id.trim().toUpperCase();
  return allCertificates().find((c) => c.id.toUpperCase() === wanted) ?? null;
}
