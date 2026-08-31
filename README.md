# We Code Coders

The public website for the We Code Coders community. Home, Events, Event
Detail, About. Heavily animated, editorial-first, built to be looked at.

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # types, lint, unit tests, and the 70/30 palette check
npm run build && npm run start
node scripts/check-links.mjs   # against a running server
```

---

## Read this before launching

**Every event and every community fact in `src/data/` is placeholder.** It was
written to give the layout something true-shaped to hold. It is realistic, and
it is not real.

- `src/data/events.ts` — seven invented events
- `src/data/site.ts` — invented stats, an invented founding year, an empty
  socials list

Nothing in there names a real person, a real partner organisation, or a real
outcome, and it should stay that way until you replace it with things that
actually happened. Both files open with a banner saying so.

The site currently collects no data of any kind, so it needs no cookie banner
and no privacy policy. **Adding analytics changes that.**

### Adding or editing an event

Edit `src/data/events.ts`. Copy a record, give it a unique `slug` and a unique
`posterSeed`, and it appears on the home rail, the events ring, and its own
statically generated page automatically. Nothing else needs touching.

`npm test` will tell you if two events share a slug or a seed — two events with
the same seed generate the same poster.

### Posters

Each event's poster is generated from its own data: the seed picks the ground
colour, the type treatment, the width axis, and where the arrow sits. No two
look alike and none of it is anyone else's copyrighted artwork.

To use a real poster instead, add `posterImage: "/posters/whatever.jpg"` to
that event and drop the file in `public/`. That one field overrides the whole
generated composition. You can mix real and generated freely.

---

## The four rules

Each of these has broken a build of this kind before. They are enforced, not
remembered.

1. **One Lenis, one requestAnimationFrame.** Only `MotionProvider` creates the
   Lenis instance and only it registers a frame loop; Lenis is driven from the
   GSAP ticker so scroll and animation share one clock. Anything needing a
   per-frame callback uses `gsap.ticker.add`. A second rAF causes scroll drift
   that is very hard to trace back later.
2. **One GSAP import path.** Import from `@/components/motion/gsap`, never from
   `"gsap"`. That module registers every plugin once. ESLint blocks the direct
   import — a missing registration works in dev and fails only in production.
3. **One data seam.** Components never import `src/data/*`. Reads go through
   `src/lib/events.ts`. ESLint blocks the direct import. That file is where a
   backend lands if one is ever added.
4. **Scoped triggers.** Every ScrollTrigger, timeline and Observer is created
   inside `useGSAP({ scope })`, never a bare `useEffect`. A leaked pin corrupts
   scroll position on the next page.

## The 70/30 rule

Violet, pink and lime are only allowed in the burst zones: the loader, the tape
stack, the transition panel, the nav and its overlay, a full-bleed event card,
the events page, one block on About, and the footer. Everywhere else is paper,
ink and terracotta. That ratio *is* the design.

`scripts/check-burst.mjs` fails the build if a burst colour appears anywhere
else, and it runs as part of `npm run check`. If it flags a file, the question
is whether that surface really is a burst zone — not whether the list should
grow.

## Verifying animation

**A full-page Playwright screenshot is not valid evidence about this site.** It
never fires ScrollTrigger, so every scroll reveal renders in its hidden start
state and the page looks blank or broken.

```bash
node scripts/filmstrip.mjs /events events 12    # scroll-stepped frames
node scripts/shot.mjs / hero.png                # one settled frame
```

Both wait for the loader to clear rather than guessing a delay. `filmstrip.mjs`
also fails on console errors.

## Not built

Deliberately absent, and not to be added speculatively: seasons, a projects
showcase, partners or sponsors, host-an-event, signup, login, registration,
ticketing, payments, organizer or judge dashboards, a CMS, a backend, and
analytics.

## Layout

```
src/app/            routes; template.tsx runs the page-transition reveal
src/components/motion/   gsap.ts, MotionProvider, Transition*, Marquee, SplitLines
src/components/site/     Loader, Nav, Hero, TapeStack, Manifesto, EventRail, Timeline, Footer
src/components/canvas/   the events ring, its shader, and the non-WebGL fallback
src/components/poster/   generative posters (DOM and canvas twins)
src/lib/                 pure logic: rail metrics, marquee integration, ring angles
src/data/                the files you edit
scripts/                 filmstrip, shot, check-burst, check-links, gen-logo
```

Pure motion maths lives in `src/lib` and is unit-tested, so when something
looks wrong you can tell whether the arithmetic or the wiring is at fault.

## The logo

`src/components/site/Logo.tsx` is **generated** from `public/brand/logo.svg` by
`node scripts/gen-logo.mjs`. Do not hand-edit it. If the source SVG changes,
re-run the generator; it asserts that it found all twelve letter paths.

The ids ending `-arrow` are the letters that *carry* the arrow flourishes — the
C of "Code" and the C, R and S of "Coders". They are full letterforms, not
decoration, and must always end up filled.

The wordmark's pink gradient is built for a violet ground and is effectively
invisible on cream, so pass `tone="ink"` wherever it sits on paper.
