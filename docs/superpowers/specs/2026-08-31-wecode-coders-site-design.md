# We Code Coders — Public Website Design

**Date:** 2026-08-31
**Status:** Approved
**Scope:** Public marketing/community site — Home, Events, Event Detail, About.

---

## 1. Purpose

A public website for the We Code Coders community. Its single job is to make the
community feel alive and worth joining, and to show what events exist. It is a
showpiece: heavily animated, deliberately art-directed, built to be looked at.

Two aesthetic targets, held in a fixed ratio:

- **70% editorial** — print-derived layout. Asymmetric grids, hairline rules,
  generous whitespace, real typographic hierarchy, marginalia, drop-caps.
- **30% maximalism** — saturated full-bleed colour, overlapping tape marquees,
  oversized outlined type, WebGL, halftone, motion that interrupts.

The ratio is enforced structurally, not by taste (see §4.1).

## 2. Non-goals

Explicitly **not** built in this version. Do not add them speculatively:

- Seasons (there is no "Season 1" — events are a flat list)
- Projects showcase
- Partners / sponsors
- Host-an-event / event submission
- Signup, login, authentication, accounts
- Registration, ticketing, payments
- Organizer or judge dashboards
- A CMS or backend of any kind

Event content is static TypeScript. A future version may add a backend behind
the read seam defined in §6.3; nothing in this version may assume one.

## 3. Stack

Pinned at the versions verified on 2026-08-31:

| Package | Version | Role |
|---|---|---|
| next | 16.3.3 | App Router, RSC, routing, image optimisation |
| react / react-dom | 19.2.8 | React 19.2 |
| typescript | ^5 | Strict mode on |
| tailwindcss | 4.3.3 | CSS-first config via `@theme` |
| gsap | 3.15.0 | All animation |
| @gsap/react | latest | `useGSAP` hook |
| lenis | 1.3.26 | Smooth scroll |
| three | 0.185.1 | WebGL |
| @react-three/fiber | 9.7.0 | React renderer for three |
| @react-three/drei | 10.7.8 | R3F helpers |

**Verified fact:** GSAP 3.15's public npm package ships every formerly-paid
plugin — `SplitText`, `DrawSVGPlugin`, `MorphSVGPlugin`, `Flip`, `Observer`,
`CustomEase`, `ScrollTrigger`. No Club membership, no private registry, no
auth token in `.npmrc`. The design depends on SplitText, DrawSVG and Flip.

Deployment target: Vercel.

## 4. Design system

### 4.1 Colour and the 70/30 rule

```
--paper       #F4F1EA   cream ground
--paper-2     #EAE5DA   rules, grid lines, insets
--ink         #131C33   primary type
--ink-60      rgba(19,28,51,0.6)   secondary type
--terracotta  #D2543F   editorial accent

--violet      #4B3BF0   burst ground
--pink        #F5C9D0   burst type (matches logo gradient)
--lime        #C9F73D   burst accent
```

`--violet`, `--pink` and `--lime` may appear **only inside burst zones**. The
complete list of burst zones, and there are no others:

1. Loader
2. Tape marquee stack
3. Page-transition panel
4. Event card at >=90% expansion, and event card hover states
5. The nav overlay menu, and the nav bar itself while it is over a burst section
6. The `/events` WebGL page
7. The single full-bleed interruption block on `/about`
8. Footer

Everything else on every page is paper / ink / terracotta only. This is the
70/30 split made mechanical.

**Enforcement:** `scripts/check-burst.mjs` greps the component tree for burst
token usage and fails if it appears outside the allowed files
(`components/site/{Loader,TapeStack,Footer,Nav,NavOverlay,BurstBreak,Timeline,EventRail}`,
`components/motion/Transition*`, `components/canvas/**`, `components/poster/**`,
`app/about/**`, `app/events/**`). Wired into CI and the pre-deploy check.

### 4.2 Typography

Three families, all free, all loaded via `next/font/google` with `display:
swap` and preloaded subsets.

| Family | Axes used | Role |
|---|---|---|
| **Fraunces** | `opsz 9–144`, `wght 100–900`, `SOFT 0–100`, `WONK 0–1` | Editorial voice: hero, pull-quotes, body headings, event titles on detail pages |
| **Archivo** | `wdth 62–125`, `wght 100–900` | Display: outlined headlines, full-bleed poster type, transition lines, nav overlay, logo echo |
| **JetBrains Mono** | `wght 100–800` | Labels, metadata, counters, tape bar content, spec tables |

**Axis animation is a first-class part of the design**, not decoration:

- Hero `LEAVE WITH PROOF.` animates Archivo `wdth` 75 → 110 across its scroll range.
- Fraunces `WONK` animates 0 → 1 on hover for italic emphasis words, physically
  warping the letterforms.
- Fraunces `SOFT` rises on the manifesto pull-quote as it enters, softening terminals.
- Section headings animate `wght` on scroll velocity.

Axis animation is driven by GSAP tweening CSS custom properties which
`font-variation-settings` consumes, so the live values stay inspectable in
DevTools.

Scale: fluid, `clamp()` driven, defined once in `@theme`. Editorial body copy
sits at a 65–72 character measure; display type is allowed to break the grid.

### 4.3 Texture

- **Paper grain** — an SVG `feTurbulence` filter rendered once to a fixed,
  `pointer-events: none`, full-viewport overlay at 4% opacity, `mix-blend-mode:
  multiply`. Static, not animated (animated grain is a known battery/GPU sink).
- **Halftone** — a repeating radial-gradient dot pattern applied to violet
  blocks, scaled by element size.
- **Editorial grid** — a 12-column hairline overlay in `--paper-2`, normally at
  ~15% opacity, flaring to 45% for ~400ms during section transitions and while
  the nav overlay is open.
- **Arrow motif** — the flourish inside the logo's C, R and S is extracted into
  a standalone `<Arrow />` SVG component and reused as: link markers, list
  bullets, the scroll cue, timeline node caps, and the "next event" indicator.
  This is the visual thread tying the brand to the layout.

## 5. Content model

`src/data/events.ts` is the one file a non-developer edits. Everything else
reads through the seam in §6.3.

```ts
export type Event = {
  slug: string;              // url segment, stable
  title: string;
  kicker: string;            // short mono label, e.g. "HACKATHON — 36 HOURS"
  format: 'hackathon' | 'workshop' | 'build-night' | 'demo-day' | 'meetup';
  status: 'upcoming' | 'past';
  startsAt: string;          // ISO 8601 with offset
  endsAt: string;            // ISO 8601 with offset
  venue: { name: string; city: string; country: string };
  summary: string;           // 1–2 sentences, used on cards and the ring panel
  description: string[];     // paragraphs, event detail page
  forWho: string;            // "who this is for" line
  tags: string[];
  stats?: { label: string; value: string }[];
  posterSeed: number;        // drives the generative poster, see §8
  posterImage?: string;      // OPTIONAL override — real poster path when supplied
  links?: { label: string; href: string }[];
};
```

`src/data/site.ts` holds community facts: name, tagline, location, founded
year, socials, and the aggregate stats shown in the tape bars and manifesto.

**All event and community content in this version is generated by the
implementer as realistic placeholder.** Every generated record carries a
`// PLACEHOLDER — replace with real content` marker at the top of the file, and
the README states it plainly. Nothing generated may claim a real named person,
a real partner organisation, or a real past outcome.

## 6. Architecture

### 6.1 Tree

```
src/
  app/
    layout.tsx                root: fonts, providers, grain, grid, nav, footer
    template.tsx              per-navigation enter reveal
    page.tsx                  home
    events/page.tsx           WebGL ring
    events/[slug]/page.tsx    event detail
    about/page.tsx
    not-found.tsx
    opengraph-image.tsx       + per-event OG images
  components/
    motion/
      gsap.ts                 THE plugin registration point
      MotionProvider.tsx      THE Lenis instance + THE raf
      TransitionProvider.tsx  transition state + overlay
      TransitionLink.tsx      onNavigate interceptor
      useReveal.ts            standard masked-line/word reveal
      SplitLines.tsx          SplitText wrapper, re-splits on resize + font load
      Marquee.tsx             velocity-reactive infinite marquee
      Magnetic.tsx            pointer-attraction wrapper
      Counter.tsx             count-up on enter
    canvas/
      Scene.tsx               persistent R3F canvas
      EventRing.tsx           cylinder of planes, scroll/drag/snap
      EventPlane.tsx          single curved plane
      shaders/ring.vert|frag
      RingFallback.tsx        CSS-3D coverflow for low-power
    site/
      Loader.tsx  Nav.tsx  NavOverlay.tsx  Footer.tsx
      TapeStack.tsx  Hero.tsx  Manifesto.tsx  EventRail.tsx  Timeline.tsx
      Arrow.tsx  Grain.tsx  Grid.tsx
    poster/
      Poster.tsx              generative poster
  data/     events.ts  site.ts
  lib/      events.ts  format.ts  seededRandom.ts
  styles/   globals.css
scripts/
  filmstrip.mjs               scroll-stepped screenshot capture
  check-burst.mjs             70/30 enforcement
  check-links.mjs             dead internal link crawl
```

### 6.2 Motion contract — four hard rules

These exist because each has previously broken a build of this kind.

1. **One Lenis, one RAF.** Only `MotionProvider` constructs a Lenis instance
   and only it registers a `requestAnimationFrame` loop. It runs Lenis with
   `autoRaf: false` and drives it from `gsap.ticker`, per the Lenis docs:
   ```
   lenis.on('scroll', ScrollTrigger.update)
   gsap.ticker.add((t) => lenis.raf(t * 1000))
   gsap.ticker.lagSmoothing(0)
   ```
   Every other component consumes `useLenis()`. A second RAF anywhere causes
   scroll drift that is very hard to diagnose later.
2. **One gsap import path.** Every file imports from `components/motion/gsap.ts`,
   never from `"gsap"`. That module registers plugins exactly once, guards
   registration against SSR, and re-exports. Direct imports produce
   "plugin not registered" failures that only appear in production builds.
3. **One data seam.** No component imports `src/data/*`. Reads go through
   `src/lib/events.ts`. This is the single place a future backend lands.
4. **Scoped, cleaned-up triggers.** Every ScrollTrigger, timeline and Observer
   is created inside `useGSAP({ scope })`. Nothing is created in a bare
   `useEffect`. Route changes must not leak triggers — a leaked pinned trigger
   corrupts scroll position on the next page.

### 6.3 Data seam

`src/lib/events.ts` exports `getAllEvents()`, `getEventBySlug(slug)`,
`getUpcomingEvents()`, `getPastEvents()`. All synchronous today; all typed to
be trivially made `async` later without touching call sites.

### 6.4 Reduced motion

A single `gsap.matchMedia()` context in `MotionProvider` reads
`(prefers-reduced-motion: reduce)`. When set:

- Lenis is not instantiated; native scroll is used.
- The loader is skipped entirely.
- Scroll-scrubbed timelines become instant state changes at their trigger point.
- Marquees stop.
- Page transitions become a 150ms cross-fade.
- The WebGL ring stops auto-rotating and responds to discrete input only.

Content is never gated behind motion. Every reveal's end state is the default
state; animation only delays arrival.

## 7. Page specifications

### 7.1 Loader

Runs on first paint of the first page of a session only, tracked in
`sessionStorage`. Total ~2.6s. Violet ground.

The logo SVG has 12 addressable letter paths (`#top-w`, `#top-e`, `#top-c-arrow`,
`#top-o`, `#top-d`, `#top-e-2`, `#bottom-c-arrow`, `#bottom-o`, `#bottom-d`,
`#bottom-e`, `#bottom-r-arrow`, `#bottom-s-arrow`) in two groups (`#we-code`,
`#coders`), filled from `#logo-gradient`.

Sequence:

1. **Draw (0.9s)** — each letter's outline is stroked in pink via
   `DrawSVGPlugin` from `0%` to `100%`, staggered from the centre of the
   wordmark outward (`stagger: { from: 'center', amount: 0.5 }`), fill
   transparent.
2. **Flood (0.5s)** — the gradient fill floods each letter bottom-to-top through
   a per-letter `clipPath` rect, on a shuffled stagger so letters fill out of
   order.
3. **Fire (0.35s)** — the three arrow paths (C, R, S) draw last with a slight
   scale overshoot, `back.out(2)`.
4. Concurrent: a mono counter 00→100 bottom-left; `WECODECODERS` scrambling in
   mono behind the mark at low opacity via `ScrambleTextPlugin`.
5. **Exit (0.7s)** — the violet field is split into 6 vertical columns that
   translate to `-100%` on a stagger of 0.06s, `expo.inOut`. The hero underneath
   is already 300ms into its own entrance when the first column clears.

If fonts or the SVG have not loaded by 4s, the loader exits regardless. It must
never be able to trap a visitor.

### 7.2 Home

**Hero.** Reproduces the approved reference composition:

```
Build              Fraunces italic ~300, --terracotta
    in public.     Fraunces ~900, --ink, indented right
LEAVE WITH PROOF.  Archivo wdth~110 wght 900, outlined (transparent fill,
                   1.5px --ink stroke), full measure
```

Motion: SplitText line masks, staggered up, `expo.out`, 0.09s apart. `Build`
settles its `WONK` axis 1 → 0 over 0.6s. The outlined line's stroke is revealed
left-to-right via an animated `clip-path` inset (it is live text, not a path, so
DrawSVG does not apply). Behind, an oversized low-opacity logo mark parallaxes
at 0.15 scroll ratio. Mono kicker top-left. Arrow scroll cue, bobbing on a 2s
yoyo.

**Tape stack.** Five overlapping marquees at `-3deg, 2deg, -1.5deg, 4deg,
-2deg`, vertically overlapping by ~25% of their height, sitting over the
hero/manifesto boundary so they read as tape sealing the page.

| # | Ground | Type | Content |
|---|---|---|---|
| 1 | violet | pink | event formats, bullet-separated |
| 2 | paper | ink | founded year — city — "open to all — no gatekeeping" |
| 3 | lime | ink | aggregate stats from `site.ts` |
| 4 | ink | pink | repeating logo mark + arrow |
| 5 | pink | violet | `BUILD IN PUBLIC / LEAVE WITH PROOF` |

Each has its own base speed and direction. Lenis scroll velocity is added to
the instantaneous speed, so fast scrolling whips them and reversing scroll
direction reverses them, with the added velocity damped back to base over
~0.6s. Hovering a bar pauses it and raises its `z-index` above the stack.

Implementation: a single `Marquee` component using a duplicated track and a
`gsap.set(x, ...)` on the ticker with modulo wrapping. Not a CSS keyframe
animation — CSS cannot take a velocity input.

**Manifesto.** Peak editorial, no burst colour. Asymmetric two-column grid with
hairline rules. A large Fraunces pull-quote revealed per-word through masks.
Mono marginalia in the outer column fading in at staggered scroll offsets, like
footnotes. Three count-up tallies. The `SOFT` axis of the pull-quote rises as
it enters.

**Event rail — pinned horizontal scroll.** The centrepiece.

- Pins for `events.length * 100vh` of scroll distance, `scrub: 1`.
- An inner track translates on X from `0` to `-(trackWidth - viewportWidth)`.
- Each card's presentation is a **continuous function of its distance from the
  viewport centre**, not a discrete state. Let `d` = normalised distance from
  centre, clamped 0–1. Then:
  - size interpolates from a resting `46vw x 62vh` at `d = 1` to a full
    `100vw x 100vh` at `d = 0`
  - `borderRadius` goes 18px → 0
  - the card's poster desaturates as `d` rises
  - a violet wash and the detail block fade in over `d < 0.1`
- Consequence: the centred card genuinely fills the screen and shrinks back as
  you continue scrolling. It is not click-gated.
- A card is interactive (`<TransitionLink>` to `/events/[slug]`) only while
  `d < 0.1`, so you cannot click a card you cannot read.
- Clicking captures the card's live rect with **GSAP Flip** and hands it to the
  transition panel, which grows from exactly that rect — the navigation is
  physically continuous from the card.
- Chrome: mono `03 / 07` counter, hairline progress rule, arrow hint.
- **Touch / `max-width: 900px`:** `matchMedia` swaps the pin for a vertical
  stack that applies the identical distance-from-centre function on Y. No
  horizontal pin on touch devices — pinned horizontal scroll on touch is
  reliably bad.

**Timeline.** A vertical SVG spine drawn by `DrawSVGPlugin` tied to scroll
progress, its stroke colour tweening `--ink → --terracotta → --violet` down
its length. Five nodes:

```
01 SHOW UP            02 FIND YOUR PEOPLE    03 BUILD SOMETHING REAL
04 SHIP IT PUBLICLY   05 LEAVE WITH PROOF
```

Left rail is "where you are" — small mono, `--ink-60`. Right is "where you're
going" — large Fraunces, `--terracotta`. Each node pops with the arrow motif at
the moment the drawn line reaches it (a `ScrollTrigger` per node, not a single
timeline, so nodes fire on real geometry). The section ends flush against the
violet footer, the spine running into it.

**Footer.** Violet burst zone. Working links only — Events, About, and the real
socials from `site.ts`. Any link whose destination does not exist is omitted
rather than stubbed; this site ships no dead links. Local time in the community
city ticking in mono, updated on a 1s interval (cleared on unmount). At the
bottom, the full logo SVG draws itself in pink on a `ScrollTrigger` as it
enters, arrows last.

### 7.3 Nav

Fixed, `mix-blend-mode: difference` so it inverts against any ground beneath.

- Left: logo mark that **morphs on scroll** — the two-line lockup collapses to a
  single arrow glyph past 60vh, via `MorphSVGPlugin`.
- Right: `EVENTS` / `ABOUT`, each with a mono index (`01`, `02`) and a
  two-layer roll-up hover (ink line rolls out upward, terracotta rolls in from
  below), plus a menu button.
- Overlay menu: violet panel wipes in from the right, huge Archivo links stagger
  in; hovering a link pulls that section's poster thumbnail toward the cursor
  with damped lerp. Focus is trapped while open; `Esc` closes; Lenis is stopped
  while open and started on close.

### 7.4 Page transition

Implemented as a `TransitionProvider` + `TransitionLink`, not the View
Transitions API — the choreography (five independently-masked repeated lines) is
beyond what CSS-only view transitions express cleanly, and GSAP gives
deterministic control and a seekable timeline for testing.

Exit, on `TransitionLink` click:

1. `onNavigate` fires, `e.preventDefault()`.
2. Lenis is stopped.
3. The violet panel animates `clip-path: inset(100% 0 0 0)` → `inset(0 0 0 0)`
   over 0.65s on a `CustomEase`. When arriving from an event card, the panel
   instead starts at the card's Flip-captured rect and grows to full-bleed.
4. The destination page's name repeats on **five lines** in Archivo Black, pink,
   each line masked and staggering up from below at 0.05s intervals — the
   approved galekto-style composition.
5. `router.push(href)`.

Enter, in `app/template.tsx` (which remounts per navigation):

6. The five lines stagger out upward.
7. The panel animates `clip-path: inset(0)` → `inset(0 0 100% 0)`, clipping away
   to the top.
8. The new page's own entrance timeline is already running underneath.
9. Lenis is started and `ScrollTrigger.refresh()` is called once, after the
   panel has cleared.

Browser back/forward do not fire `onNavigate`. A `popstate` listener plays the
enter half only, so navigation history still feels intentional rather than
snapping.

### 7.5 Events page — WebGL

A persistent R3F `<Canvas>` mounted in the route, `frameloop="demand"` when
idle and `"always"` while the ring has velocity.

- Event posters are rendered to textures on planes arranged around a **vertical
  cylinder**, each plane facing inward toward the camera at the axis.
- **Rotation input:** scroll (via `useLenis`) and pointer drag both drive the
  same angular velocity. Release applies inertia with exponential damping.
- **Snap:** once `|velocity| < threshold`, a GSAP tween eases rotation to the
  nearest slot angle with `expo.out`. Any new input kills the tween.
- **Shader** (`ring.vert` / `ring.frag`): a barrel curve on the vertex stage and
  an RGB channel offset on the fragment stage, both scaled by rotation velocity
  so the ring smears while spinning and resolves when it settles. Plus static
  grain, a violet→pink fresnel rim on the focused plane, and desaturation
  ramping with angular distance from focus.
- **Info panel is DOM, not canvas.** The focused event's title, date, venue,
  tags and summary render as real HTML in an editorial side panel, swapping on
  masked lines at each snap. This keeps the text selectable, translatable, in
  the accessibility tree and visible to crawlers — canvas text would be none of
  those.
- **Focus click:** the focused plane flies toward the camera and scales to fill
  the viewport while the others scatter outward and fade; the DOM panel expands
  to a full editorial layout; then the transition panel takes over and routes to
  `/events/[slug]`.
- **Fallback:** on `(prefers-reduced-motion: reduce)`, on coarse pointers below
  900px, or when a startup probe finds the device cannot hold 50fps, mount
  `RingFallback` — a CSS-3D coverflow with the same input contract (scroll/drag,
  snap, focus, click-through) and the same DOM panel. The page must be fully
  usable with no WebGL at all.
- Behind everything, the route is still statically rendered with a real list of
  `<TransitionLink>`s for crawlers and no-JS visitors, visually hidden but
  present in the DOM.

### 7.6 Event detail

Editorial-first with burst accents.

- Full-bleed poster header parallaxing at 0.2 ratio under the title in Archivo
  condensed, with the mono kicker above it.
- A mono spec table: date, time, duration, venue, format, who it's for.
- Fraunces body copy at a proper measure, with a drop-cap on the first
  paragraph.
- A stats strip when `stats` is present.
- "Next event" link at the foot using the same Flip transition.
- **No signup CTA.** A single "notify me when the next one drops" that links to
  the community's social accounts from `site.ts`.
- `generateStaticParams` over all slugs; per-event `generateMetadata` and a
  dynamic `opengraph-image` rendering the generative poster.

### 7.7 About

Peak editorial. Long-form with a drop-cap, marginalia in the outer column, a
community timeline, and a photo grid whose tiles scatter slightly on hover
(damped, pointer-relative). Interrupted exactly once, mid-page, by a full-bleed
violet burst carrying the manifesto in giant outlined Archivo with two tape
bars crossing it at opposing angles.

## 8. Generative posters

Real hackathon posters found online are third-party copyrighted work and are
not used. Each event's poster is composed at runtime from its own data.

`Poster.tsx` takes an `Event` and renders deterministically from
`posterSeed` via a seeded PRNG in `lib/seededRandom.ts` — the same event always
produces the same poster, across server and client, so there is no hydration
mismatch and no layout shift.

Composition, chosen by seed from a small set of editorial layouts:

- Ground: violet, pink, lime, or ink; type in a contrasting brand colour.
- The event title set in Archivo at an extreme width axis, breaking across
  lines, sometimes outlined and sometimes solid.
- Mono metadata block: date, city, format.
- The arrow motif at a seeded position, scale and rotation.
- A halftone field, a hairline grid fragment, and grain.

`posterImage` on an `Event`, when present, overrides the generative poster
entirely. Supplying real posters later is a one-field-per-event change with no
code modification.

## 9. Responsive and performance

- Breakpoints: 480 / 900 / 1280 / 1680. All motion decisions go through
  `gsap.matchMedia()` so they tear down correctly on resize.
- Horizontal pinning, WebGL ring, and magnetic pointer effects are desktop-only;
  each has a defined touch equivalent, specified above.
- Budgets: LCP < 2.5s and CLS < 0.05 on a mid-range laptop over a throttled
  Fast 3G profile; the ring holds 60fps on desktop and 30fps minimum on the
  fallback path.
- Fonts: `next/font/google`, self-hosted output, preloaded, `display: swap`,
  with `size-adjust` fallbacks so the swap does not shift layout. SplitText
  splits only after `document.fonts.ready` and re-splits on resize.
- Images: `next/image` throughout. Generative posters are SVG/CSS, so they cost
  nothing to download.
- The R3F canvas is `frameloop="demand"` at rest.

## 10. Accessibility

- Every animation's end state is the element's default state. Content is legible
  with JavaScript disabled.
- `prefers-reduced-motion` is honoured throughout, per §6.4.
- The events ring has a visually-hidden but real list of links; keyboard users
  can tab through events and arrow-key the ring.
- Nav overlay traps focus, closes on `Esc`, and restores focus to the trigger.
- Contrast: all type/ground pairs meet WCAG AA. Pink on violet is verified at
  large sizes only, and is never used for body copy.
- Decorative SVG is `aria-hidden`; the logo carries its existing `<title>`.

## 11. Verification

- **Filmstrips, not full-page screenshots.** `scripts/filmstrip.mjs <route>
  <name>` drives Playwright, scrolls the page in steps, waits a frame at each,
  and captures. A Playwright `fullPage: true` screenshot never fires
  ScrollTrigger and renders every scroll reveal blank — it is not a valid check
  and must not be used to judge this site.
- Deterministic timeline checks: expose named timelines on `window` in dev and
  seek them via `tl.progress(x)` in tests rather than sleeping.
- `scripts/check-burst.mjs` enforces §4.1.
- `scripts/check-links.mjs` crawls every internal link before launch and fails
  on any dead destination — the stated requirement that this site ships no
  broken links.
- Lighthouse pass on each route before deploy.

## 12. Build order

Six reviewable checkpoints:

1. Scaffold, design tokens, fonts, `gsap.ts`, `MotionProvider`, grain/grid, nav
   and footer shells, data seam with generated content.
2. Loader, hero, tape stack.
3. Manifesto, event rail (pinned horizontal), timeline.
4. Transition system, about page.
5. Events WebGL ring, fallback, event detail pages.
6. Generative posters, mobile paths, reduced motion, accessibility, perf,
   deploy.

## 13. Assumptions

- All event and community content is implementer-generated placeholder, clearly
  marked, for the user to replace. No real person, partner or outcome is named.
- The logo SVG is used as supplied; only animated, never redrawn.
- Analytics, cookie consent and a privacy policy are out of scope for this
  version and must be added before any real launch that collects data — this
  version collects none.
