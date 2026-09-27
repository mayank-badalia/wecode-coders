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

  it("leads every role with its pay", () => {
    // The pay is a field of its own rather than a bullet, precisely so it
    // cannot drift back down into a list of nine other things.
    for (const role of roles) {
      expect(role.pay.headline.length, role.anchor).toBeGreaterThan(0);
      expect(role.pay.detail.length, role.anchor).toBeGreaterThan(0);
    }
  });

  it("ties every payment to the milestone that unlocks it", () => {
    /*
      The page states pay plainly — ₹10,000 a month — and that is deliberate.
      What each statement must carry is the milestone it depends on: five
      approved events, a registration target, a first approved campaign.

      A bare "you will be paid" with no gate attached is the thing to catch.
      It is not a hedge the test is looking for; it is the condition that
      makes the sentence true, and the reason someone can check whether they
      have met it.
    */
    const GATE =
      /\bonce\b|\bafter\b|\bwhen\b|\bclear\b|\bcomplete\b|\bapproved\b|milestone|target|sign(ed)? off|reviewed|\bonly\b/i;
    const MONEY = /\bpaid\b|\bpay\b|\bpayment\b|\bsalar|\bstipend|₹|\$|\d+%/i;

    const programme = getProgramme();
    const claims = [
      // Headline and gate are one sentence on the page — "₹10,000 a month"
      // sits directly above "once you clear your milestone" — so they are
      // checked as the unit the reader sees, not as two loose strings.
      `${programme.pay.headline} ${programme.pay.gate}`,
      programme.pay.detail,
      ...roles.map((r) => `${r.pay.headline} ${r.pay.detail}`),
      ...roles.flatMap((r) => r.benefits),
      ...programme.conditions,
      // `support` is deliberately absent: those are sponsor perks the
      // organiser hands to the participants at their event — "$100 in Inkloom
      // credits" is not money reaching the organiser, and reading it as a pay
      // claim is what made this test fail on its first run.
    ].filter((line) => MONEY.test(line));

    expect(claims.length).toBeGreaterThan(0);
    for (const claim of claims) {
      expect(claim, `payment with no milestone attached: ${claim}`).toMatch(GATE);
    }
  });

  it("scopes every sponsor perk to the events that actually carry it", () => {
    /*
      Not pay, but still a promise. Sponsors vary from one hackathon to the
      next, so a partner perk listed flat would commit every event to every
      partner.

      Only items naming a third party need the scope. "Event-planning
      guidance" is something we provide on every event and needs no caveat —
      requiring one of it was this test overreaching on its first run.
    */
    const THIRD_PARTY = /inkloom|adaption|n8n|red bull|\.xyz|miro|lovable|sponsor/i;
    const SCOPED = /\bon events\b|where|eligible|subject to|depends?|varies/i;
    for (const role of roles) {
      for (const item of role.support?.items ?? []) {
        if (!THIRD_PARTY.test(item)) continue;
        expect(item, `unscoped partner perk: ${item}`).toMatch(SCOPED);
      }
    }
  });

  it("does not tell an applicant the pay might never arrive", () => {
    // The old page opened on "fixed salaries are not guaranteed", which reads
    // as a list of reasons not to apply. The milestone is the condition now,
    // and nothing restates it as doubt.
    const DISCOURAGING =
      /not guaranteed|no(t)? automatic|performance-based (programme|community)|fixed salaries/i;
    const programme = getProgramme();
    const everything = [
      programme.premise,
      programme.pay.headline,
      programme.pay.gate,
      programme.pay.detail,
      programme.onboarding.detail,
      ...programme.conditions,
      ...roles.flatMap((r) => [r.summary, r.pay.headline, r.pay.detail, ...r.benefits]),
    ];
    for (const line of everything) {
      expect(line, `discouraging line: ${line}`).not.toMatch(DISCOURAGING);
    }
  });
});

describe("programme", () => {
  const programme = getProgramme();

  it("puts a number on the pay, not a description of it", () => {
    // "You may become eligible for monetary support" is not an answer. A
    // figure and the milestone that unlocks it is.
    expect(programme.pay.headline).toMatch(/₹\s?[\d,]+/);
    expect(programme.pay.gate.length).toBeGreaterThan(0);
    expect(programme.pay.detail).toMatch(/milestone|five approved events|registration target/i);
  });

  it("says what happens after someone is selected", () => {
    // An offer letter and a walk-through, so "selected" is not the end of the
    // page's usefulness to the person reading it.
    expect(programme.onboarding.detail).toMatch(/offer letter/i);
    expect(programme.onboarding.detail).toMatch(/shared with you|selected/i);
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
