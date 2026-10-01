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

  it("never calls a quiz a challenge", () => {
    /*
      The citation reads "a {duration} {kind}". `kind` defaults to "challenge"
      because every record used to come from a hackathon — so a quiz that
      forgets to set it prints "a 15-minute challenge", which is not what the
      holder sat. Checked against the event's own format rather than a list of
      slugs, so a new quiz is covered the day it is added.
    */
    for (const c of certs) {
      const event = events.find((e) => e.slug === c.event);
      if (event?.format !== "quiz") continue;
      if (!c.award?.duration) continue;
      expect(c.award.kind, `${c.id} prints a quiz as a "${c.award.kind ?? "challenge"}"`).toBe(
        "quiz",
      );
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
