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
    What the certificate actually says the holder did.

    Kept on the certificate rather than derived from the event record, because
    the two are not always the same thing: this batch is a sponsored challenge
    that ran inside WCC Launchpad 30 on its own days, so taking the title and
    dates off the parent event printed a date nine days in the future.
  */
  award?: {
    /** Headline of the thing taken part in. */
    title: string;
    /** Where it sits — e.g. the parent event. */
    context?: string;
    /** "36-hour". Printed as part of the citation. */
    duration?: string;
    /*
      The noun the duration qualifies — "challenge", "quiz", "sprint".

      Hardcoding "challenge" was fine while every record came from a
      hackathon. Protocol//60 is a quiz, and "a 15-minute challenge" is
      simply not what the holder sat.
    */
    kind?: string;
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

import participantsLaunchpad from "@/data/certificates/wcc-launchpad-30.json";
import quizProtocol60 from "@/data/certificates/protocol-60.json";

/*
  Imported statically rather than read from disk so the verify page can be
  prerendered and the whole set ships as part of the bundle for that route.
  A new event means one more import here.
*/
const STORES: Record<string, Certificate[]> = {
  "wcc-launchpad-30": participantsLaunchpad as Certificate[],
  "protocol-60": quizProtocol60 as Certificate[],
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
