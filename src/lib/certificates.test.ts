import { describe, expect, it } from "vitest";
import {
  CERTIFICATE_ID_PATTERN,
  findCertificate,
  generateCertificateId,
  isCertificateId,
  normaliseName,
  allCertificates,
} from "./certificates";
import { events } from "@/data/events";

describe("certificate ids", () => {
  it("never emits characters that get misread off a printed page", () => {
    // A deterministic sweep of the whole alphabet, not a lucky sample.
    let i = 0;
    const ids = Array.from({ length: 200 }, () =>
      generateCertificateId("L30", () => ((i++ * 37) % 100) / 100),
    );
    for (const id of ids) {
      expect(id).toMatch(CERTIFICATE_ID_PATTERN);
      expect(id.slice(4)).not.toMatch(/[01OIL]/);
    }
  });

  it("is random, not sequential — the whole point of the scheme", () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateCertificateId("L30")));
    // Sequential ids would collide constantly at this sample size; random ones
    // essentially never do across 31^6.
    expect(ids.size).toBe(500);
  });

  it("rejects ids that are not ours, including path traversal", () => {
    for (const bad of [
      "",
      "L30",
      "L30-",
      "L30-7QK4M",       // too short
      "L30-7QK4M22",     // too long
      "L30-7QK4MO",      // O is excluded from the alphabet
      "../../etc/passwd",
      "L30-7QK4M2/../..",
      "L30 7QK4M2",      // no separator
    ]) {
      expect(isCertificateId(bad), `should reject: ${JSON.stringify(bad)}`).toBe(false);
    }
  });

  it("accepts a valid id however it was typed", () => {
    // Read off a PDF and typed back in, case and spacing are not the user's
    // problem — but nothing else is forgiven.
    for (const good of ["L30-7QK4M2", "l30-7qk4m2", "  L30-7QK4M2  "]) {
      expect(isCertificateId(good), `should accept: ${JSON.stringify(good)}`).toBe(true);
    }
  });

  it("looks up nothing for an unknown id rather than throwing", () => {
    expect(findCertificate("L30-ZZZZZZ")).toBeNull();
    expect(findCertificate("nonsense")).toBeNull();
  });
});

describe("normaliseName", () => {
  it("fixes shouting", () => {
    expect(normaliseName("RITESH KOLEY")).toBe("Ritesh Koley");
    expect(normaliseName("MD RASHID IQBAL KHAN")).toBe("Md Rashid Iqbal Khan");
  });

  it("fixes all-lowercase, which is the same accident the other way", () => {
    expect(normaliseName("karan dnyandeo ghorpade")).toBe("Karan Dnyandeo Ghorpade");
    expect(normaliseName("aditi sharma")).toBe("Aditi Sharma");
  });

  it("collapses a surname pasted twice", () => {
    expect(normaliseName("Sakshi Pandey Pandey")).toBe("Sakshi Pandey");
    expect(normaliseName("Amulya s Amulya s s")).toBe("Amulya s Amulya s");
  });

  it("tidies whitespace", () => {
    expect(normaliseName("  Aditi   Sharma ")).toBe("Aditi Sharma");
  });

  it("leaves intentional casing alone", () => {
    // These are real spellings, not caps-lock accidents. Touching them would
    // put a wrong name on someone's certificate.
    expect(normaliseName("Ronan McDonald")).toBe("Ronan McDonald");
    expect(normaliseName("Ana de Souza")).toBe("Ana de Souza");
    expect(normaliseName("Yuvanraj K S")).toBe("Yuvanraj K S");
  });

  it("keeps hyphens and apostrophes cased correctly when re-casing", () => {
    expect(normaliseName("JEAN-LUC O'BRIEN")).toBe("Jean-Luc O'Brien");
  });

  it("returns empty for empty input rather than throwing", () => {
    expect(normaliseName("   ")).toBe("");
  });
});

describe("the issued store", () => {
  /*
    These guard the records themselves, not the helpers.

    The store is committed and public: every id in it is a live URL on
    wecodecoders.in, and a duplicate or a malformed id is a certificate that
    either verifies as the wrong person or fails to verify at all. Both are
    worse than a build failure.
  */
  const certs = allCertificates();

  it("issues at least one certificate per event store", () => {
    expect(certs.length).toBeGreaterThan(0);
    const byEvent = new Set(certs.map((c) => c.event));
    expect(byEvent.size).toBeGreaterThan(1);
  });

  it("gives every record a well-formed, unique id", () => {
    const ids = certs.map((c) => c.id);
    expect(new Set(ids).size, "duplicate certificate id").toBe(ids.length);
    for (const c of certs) expect(isCertificateId(c.id), `bad id: ${c.id}`).toBe(true);
  });

  it("points every record at a real event", () => {
    // A record naming an event that does not exist verifies to a citation
    // nobody can check against anything.
    const slugs = new Set(events.map((e) => e.slug));
    for (const c of certs) {
      expect(slugs.has(c.event), `${c.id} names unknown event ${c.event}`).toBe(true);
    }
  });

  it("finds every issued certificate by its own id", () => {
    for (const c of certs) expect(findCertificate(c.id)?.name).toBe(c.name);
  });

  it("never describes a quiz in a hackathon's terms", () => {
    /*
      A hackathon has a length and a quiz has a number of questions, and the
      award used to carry only a duration — so Protocol//60 printed "a
      15-minute quiz" on something that was fifteen questions long.

      Checked against the event's own format rather than a list of slugs, so
      the next quiz is covered the day it is added.
    */
    for (const c of certs) {
      const event = events.find((e) => e.slug === c.event);
      if (event?.format !== "quiz" || !c.award?.detail) continue;
      expect(
        c.award.detail,
        `${c.id} describes a quiz as "${c.award.detail}"`,
      ).not.toMatch(/challenge|hackathon|\bhour|\bminute/i);
    }
  });

  it("says when the thing was held, not only when it was issued", () => {
    /*
      The issue date is almost always later than the event — these were issued
      on 1 October for a quiz held on 30 September. A certificate carrying
      only the former quietly misdates the holder's own work.
    */
    for (const c of certs) {
      const event = events.find((e) => e.slug === c.event);
      // Only where the award IS the event; a sub-event's date is its own.
      if (!event || (c.award?.title && c.award.title !== event.title)) continue;
      expect(c.award?.heldOn, `${c.id} does not say when it was held`).toBeTruthy();
    }
  });

  it("never dates a certificate before the thing it certifies", () => {
    /*
      This is the check that caught Protocol//60: the event was recorded as
      3 October while its certificates were dated 1 October, so the store
      asserted that people had sat a quiz that had not happened yet — and the
      verify page would have printed both dates, side by side, for anyone who
      looked.

      Only records whose award *is* the event are compared against it. The
      Launchpad batch is for the Inkloom Pre-Hackathon, a sponsored challenge
      that ran inside WCC Launchpad 30 on its own earlier days, and its dates
      legitimately precede the parent event — the same distinction the `award`
      field exists to express. The first version of this test did not make it
      and failed on all 55 of those.
    */
    for (const c of certs) {
      const event = events.find((e) => e.slug === c.event);
      if (!event) continue;
      const awardIsTheEvent = !c.award?.title || c.award.title === event.title;
      // `heldOn` is the award's own day and beats the parent event's start.
      const held = c.award?.heldOn
        ? new Date(`${c.award.heldOn}T00:00:00+05:30`)
        : awardIsTheEvent
          ? new Date(event.startsAt)
          : null;
      if (!held) continue;

      const issued = new Date(`${c.issuedAt}T23:59:59+05:30`);
      expect(
        issued.getTime() >= held.getTime(),
        `${c.id} is dated ${c.issuedAt}, before ${held.toISOString()}`,
      ).toBe(true);
    }
  });

  it("issues nothing in the future", () => {
    // Whatever the award is, a certificate dated after today certifies
    // something that has not happened.
    const today = Date.now();
    for (const c of certs) {
      const issued = new Date(`${c.issuedAt}T00:00:00+05:30`).getTime();
      expect(issued <= today, `${c.id} is dated ${c.issuedAt}, in the future`).toBe(true);
    }
  });

  it("gives an individual event's certificates no team name", () => {
    // Protocol//60 is attempted alone. "with team X" on one of those is a
    // detail someone would have to explain away to whoever they showed it to.
    for (const c of certs) {
      const event = events.find((e) => e.slug === c.event);
      if (!event || !/individual/i.test(event.teamSize ?? "")) continue;
      expect(c.teamName, `${c.id} carries a team on an individual event`).toBeUndefined();
    }
  });
});
