@AGENTS.md

# We Code Coders — project rules

Read `README.md` first. The parts that matter most:

- **All content in `src/data/` is placeholder.** Do not present it as real, and
  do not invent named people, partner organisations, or verified outcomes when
  asked to make the site more convincing. Improve the writing instead.
- **Four enforced rules:** one Lenis and one rAF (only `MotionProvider`); one
  GSAP import path (`@/components/motion/gsap`); one data seam
  (`@/lib/events`); every trigger inside `useGSAP({ scope })`. The first three
  are enforced by ESLint.
- **The 70/30 palette rule** is enforced by `scripts/check-burst.mjs`. Violet,
  pink and lime belong only to the burst zones listed in the README.
- **Never judge animation from a full-page screenshot** — it does not fire
  ScrollTrigger and shows every reveal blank. Use `scripts/filmstrip.mjs`.
- **No dead links.** `scripts/check-links.mjs` fails on stubs and 404s. Fix by
  removing the link, not by adding a page.
- Do not add anything from the "Not built" list in the README without being
  asked.

Design spec: `docs/superpowers/specs/2026-08-31-wecode-coders-site-design.md`
Implementation plan: `docs/superpowers/plans/2026-08-31-wecode-coders-site.md`
