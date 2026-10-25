import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
  The terms page is static copy, so there is no function to call and nothing
  to assert about its behaviour. What goes wrong with it is the copy itself.

  It described the free events as "the five 48-hour builds", which was true
  for about a week: a 36-hour hackathon and a quiz joined them, and the page
  then named five events while nine were free. Worse, it only ever stated the
  free half as a rule — what a paid event costs, and the one round it costs it
  in, a reader had to assemble from an event page.

  These read the source and pin both halves. Copy tests are usually a waste,
  but this page is the one a participant is pointed at when there is a dispute
  about money, and a sentence that is out of date here is not a typo.
*/
const source = readFileSync(join(process.cwd(), "src/app/terms/page.tsx"), "utf8");

describe("terms page", () => {
  it("states what a three-round event charges, and the only round it charges in", () => {
    expect(source).toMatch(/₹399 per team/);
    expect(source).toMatch(/selected for Round 3/);
    expect(source).toMatch(/Rounds 1 and 2 are free/);
  });

  it("states that a single-round event charges nothing at all", () => {
    expect(source).toMatch(/single-round event/);
    expect(source).toMatch(/free from start to finish/);
    expect(source).toMatch(/charges nothing at any stage/);
  });

  it("does not describe the free events by one window length", () => {
    // "the 48-hour builds" left out the 36-hour hackathons and the quiz, and
    // the events it did name were counted in the same sentence.
    expect(source).not.toMatch(/48-hour build/);
    expect(source).not.toMatch(/five 48-hour/);
  });

  it("says what a prize pool is made of", () => {
    /*
      A number against a currency symbol reads as cash everywhere else, so
      "Prize pool: ₹30,000" was being read as thirty thousand rupees in hand.
      A pool can be cash, credits, or a mix, and section 06 has to say so
      without implying it is always both.
    */
    expect(source).toMatch(/A prize pool is a stated total value, not a promise of cash/);
    expect(source).toMatch(/AI or platform credits/);
    expect(source).toMatch(/nothing requires a pool to be part cash and part credits/);
  });

  it("does not ask a free entrant to accept by paying", () => {
    // The acceptance block read "by clicking the payment or registration
    // button and completing payment", which is not a thing a single-round
    // entrant can do, and left them unsure whether they had accepted at all.
    expect(source).not.toMatch(/and completing payment, the team leader/);
    expect(source).toMatch(/By registering/);
  });
});
