import { describe, expect, it } from "vitest";
import {
  CERTIFICATE_ID_PATTERN,
  findCertificate,
  generateCertificateId,
  isCertificateId,
  normaliseName,
} from "./certificates";

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
