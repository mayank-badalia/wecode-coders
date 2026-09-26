import { describe, expect, it } from "vitest";
import { applicationsOpen, getProgramme, getRoles } from "./roles";

/*
  These are not shape tests for their own sake.

  This is the one page on the site that makes commitments to a reader about
  work they might do unpaid, so the things worth locking down are the honest
  ones: that no role reads as a salaried job, that nothing conditional loses
  its condition, and that the apply button cannot appear without a form behind
  it. A cosmetic edit should be free; quietly turning "may be eligible" into a
  promise should not be.
*/

describe("roles", () => {
  const roles = getRoles();

  it("publishes every role with the substance a reader needs to decide", () => {
    expect(roles.length).toBeGreaterThan(0);
    for (const role of roles) {
      expect(role.title.length).toBeGreaterThan(0);
      expect(role.summary.length).toBeGreaterThan(0);
      expect(role.responsibilities.length).toBeGreaterThan(0);
      expect(role.benefits.length).toBeGreaterThan(0);
    }
  });

  it("gives each role a unique, url-safe anchor", () => {
    // The anchors are shared links (/hiring#organiser). A duplicate would send
    // two roles to the same place; a space or capital would break the jump.
    const anchors = roles.map((r) => r.anchor);
    expect(new Set(anchors).size).toBe(anchors.length);
    for (const anchor of anchors) expect(anchor).toMatch(/^[a-z0-9-]+$/);
  });

  it("never states pay as a certainty", () => {
    /*
      Every mention of money on this page is conditional, and it has to stay
      that way. The programme pays nothing by default: an unhedged sentence
      about payment is a promise the community has not made.
    */
    // "only" counts: a sentence that narrows what qualifies is not a promise.
    const HEDGE =
      /\bmay\b|\bonly\b|eligible|not guaranteed|not automatic|selected|depend|subject to|when .*(allow|budget|approved|included)/i;
    const MONEY = /\bpaid\b|\bpayment\b|\bsalar|\bstipend|\brevenue\b|monetary|\$|\d+%|%–|%-/i;

    const claims = [
      ...roles.flatMap((r) => [...r.benefits, ...(r.support?.items ?? []), ...(r.milestones ?? [])]),
      ...getProgramme().conditions,
      getProgramme().compensation,
    ].filter((line) => MONEY.test(line));

    expect(claims.length).toBeGreaterThan(0);
    for (const claim of claims) {
      expect(claim, `unhedged money claim: ${claim}`).toMatch(HEDGE);
    }
  });
});

describe("programme", () => {
  const programme = getProgramme();

  it("states the pay position and the duration before any benefit is listed", () => {
    expect(programme.compensation).toMatch(/not guaranteed/i);
    // "Continues based on performance" — not a fixed three- or six-month term.
    const duration = programme.commitment.find((c) => /duration/i.test(c.label));
    expect(duration?.detail).toMatch(/performance/i);
  });

  it("keeps the suggested hours a suggestion", () => {
    const hours = programme.commitment.find((c) => /hour/i.test(c.label));
    expect(hours?.detail).toMatch(/suggest/i);
    expect(hours?.detail).not.toMatch(/\brequired\b|\bmust\b|\bminimum\b/i);
  });

  it("carries both selection rounds", () => {
    expect(programme.rounds).toHaveLength(2);
    expect(programme.rounds[0]?.items?.length).toBeGreaterThan(0);
  });

  it("only reports applications open when there is a form to open", () => {
    // The guard the page's CTA hangs off. If this ever returns true with no
    // href, /hiring renders a button that links nowhere and check-links fails.
    expect(applicationsOpen()).toBe(Boolean(programme.application.href));
    if (applicationsOpen()) expect(programme.application.href).toMatch(/^https:\/\//);
  });

  it("always explains where applications are taken, open or not", () => {
    expect(programme.application.note.length).toBeGreaterThan(0);
  });
});
