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

  it("states both certificate schemes, and sends the reader to the event page", () => {
    /*
      This clause has now been wrong in both directions. It described only the
      finalists-only scheme while three events upgraded a certificate at each
      round; then it described only the round-wise one, on the morning six
      single-window events were given three rounds. Those six now certify
      from Round 2 — Round 1 of a field of a thousand teams is a filter, and
      a certificate for clearing a filter is worth little — while the five
      running events still certify every round, Round 1 included.

      Both are real, so the page states both and says where to find out which
      applies — that line is what a participant is pointed at in a dispute,
      and it cannot name one scheme as though it were the only one.
    */
    expect(source).toMatch(/issues certificates in one of two ways/);
    expect(source).toMatch(/stated in the certificates block on its own page/);
    expect(source).toMatch(/upgrades that certificate rather than adding a second one/);
    expect(source).toMatch(/The second starts certifying from Round 2/);
    // The scheme that skips Round 1 still has to name the round it starts at.
    expect(source).toMatch(/Round 2 Completion Certificate/);
    expect(source).not.toMatch(/Round 1 is a qualifying round and carries no certificate/);
  });

  it("states what the quiz charges, which is not what a hackathon charges", () => {
    /*
      The quiz was free and single-round for months, and is now three rounds
      with a fee of its own. That fee is ₹299 and it is per participant, not
      per team — the quiz is sat alone and there is no team to divide it
      across — so a page stating only ₹399 per team is wrong about it twice.
    */
    expect(source).toMatch(/₹299 per participant/);
    expect(source).toMatch(/sat individually/);
    // And it is no longer an example of a single-round event.
    expect(source).not.toMatch(/the quiz’s sitting/);
    expect(source).not.toMatch(/the quiz’s eight/);
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
