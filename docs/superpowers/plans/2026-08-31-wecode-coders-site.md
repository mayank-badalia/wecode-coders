# We Code Coders Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public, heavily-animated community website for We Code Coders — Home, Events (WebGL), Event Detail, About — that is editorial/maximalist at a structurally enforced 70/30 ratio and contains no broken links or fabricated real-world claims.

**Architecture:** Next 16 App Router with a single global motion layer. Exactly one Lenis instance driven from the GSAP ticker; exactly one GSAP plugin-registration module; all event reads through one seam so a backend can land later without touching components. Visual work is verified by scroll-stepped Playwright filmstrips, pure motion math is unit-tested with Vitest.

**Tech Stack:** Next 16.3.3, React 19.2.8, TypeScript strict, Tailwind 4.3.3, GSAP 3.15.0, @gsap/react 2.1.2, Lenis 1.3.26, three 0.185.1, @react-three/fiber 9.7.0, @react-three/drei 10.7.8, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-31-wecode-coders-site-design.md`

## Global Constraints

Every task's requirements implicitly include this section. Values copied verbatim from the spec.

- **Colour tokens:** `--paper #F4F1EA`, `--paper-2 #EAE5DA`, `--ink #131C33`, `--ink-60 rgba(19,28,51,0.6)`, `--terracotta #D2543F`, `--violet #4B3BF0`, `--pink #F5C9D0`, `--lime #C9F73D`.
- **Burst rule:** `--violet`, `--pink`, `--lime` may appear ONLY in: Loader, TapeStack, transition panel, event card at `d < 0.1` and card hover, `/events` page, the single `/about` interruption block, Footer, and generative posters. Enforced by `scripts/check-burst.mjs`.
- **One Lenis, one RAF.** Only `MotionProvider` constructs Lenis or registers a RAF. Everything else uses `useLenis()`.
- **One gsap import path.** Every file imports from `@/components/motion/gsap`, never from `"gsap"`. Enforced by ESLint `no-restricted-imports`.
- **One data seam.** No component imports `src/data/*`. Reads go through `src/lib/events.ts`.
- **Scoped triggers.** Every ScrollTrigger/timeline/Observer is created inside `useGSAP({ scope })`. Never in a bare `useEffect`.
- **Reduced motion:** honoured everywhere. Every animation's end state IS the element's default state — content must be fully legible with JS disabled.
- **No fabricated reality:** no real named person, partner organisation, or past outcome in any generated content. `src/data/events.ts` and `src/data/site.ts` each open with `// PLACEHOLDER — replace with real content`.
- **No dead links.** Any link whose destination does not exist is omitted, not stubbed. Enforced by `scripts/check-links.mjs`.
- **Not built:** seasons, projects, partners, host-an-event, signup, login, registration, payments, dashboards, CMS, backend, analytics.
- **Verification ban:** a Playwright `fullPage: true` screenshot never fires ScrollTrigger and renders every scroll reveal blank. It is not valid evidence that this site works. Use `scripts/filmstrip.mjs`.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/app/layout.tsx` | Fonts, providers, grain, grid, nav, footer |
| `src/app/template.tsx` | Per-navigation enter half of the page transition |
| `src/app/page.tsx` | Home — composes Hero, TapeStack, Manifesto, EventRail, Timeline |
| `src/app/events/page.tsx` | WebGL ring + DOM info panel + hidden crawler list |
| `src/app/events/[slug]/page.tsx` | Event detail, statically generated per slug |
| `src/app/about/page.tsx` | Long-form editorial + one burst interruption |
| `src/components/motion/gsap.ts` | THE plugin registration point; exports gsap + plugins + custom eases |
| `src/components/motion/MotionProvider.tsx` | THE Lenis instance + THE raf + reduced-motion context |
| `src/components/motion/TransitionProvider.tsx` | Transition state machine + overlay panel |
| `src/components/motion/TransitionLink.tsx` | `onNavigate` interceptor, Flip handoff |
| `src/components/motion/SplitLines.tsx` | SplitText wrapper: waits for fonts, re-splits on resize |
| `src/components/motion/useReveal.ts` | Standard masked line/word reveal hook |
| `src/components/motion/Marquee.tsx` | Velocity-reactive infinite marquee |
| `src/components/motion/Counter.tsx` | Count-up on enter |
| `src/lib/rail.ts` | PURE: card metrics as a function of distance from centre |
| `src/lib/marquee.ts` | PURE: marquee position/velocity integration |
| `src/lib/seededRandom.ts` | PURE: deterministic PRNG + helpers for posters |
| `src/lib/format.ts` | PURE: date/time formatting for events |
| `src/lib/events.ts` | The read seam over `src/data/events.ts` |
| `src/data/events.ts` | Placeholder event records — the file the user edits |
| `src/data/site.ts` | Placeholder community facts, socials, stats |
| `src/components/poster/Poster.tsx` | Generative poster, deterministic from `posterSeed` |
| `src/components/site/*` | Logo, Arrow, Grain, Grid, Nav, NavOverlay, Loader, Hero, TapeStack, Manifesto, EventRail, Timeline, Footer |
| `src/components/canvas/*` | Scene, EventRing, EventPlane, shaders, RingFallback |
| `scripts/filmstrip.mjs` | Scroll-stepped Playwright capture — the ONLY valid visual check |
| `scripts/check-burst.mjs` | 70/30 enforcement |
| `scripts/check-links.mjs` | Dead internal link crawl |

---

# Checkpoint 1 — Foundation

### Task 1: Scaffold and tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/styles/globals.css`, `README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: a running dev server at `localhost:3000`; `npm test` runs Vitest; `@/*` resolves to `src/*`.

- [ ] **Step 1: Scaffold Next**

```bash
cd ~/Developer/wecode-coders
npx --yes create-next-app@16.3.3 . \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --turbopack --no-install --yes
```

If the directory-not-empty prompt appears, keep the existing `docs/`, `public/brand/logo.svg`, `.gitignore`, and `.git`.

- [ ] **Step 2: Install pinned dependencies**

```bash
npm install next@16.3.3 react@19.2.8 react-dom@19.2.8 \
  gsap@3.15.0 @gsap/react@2.1.2 lenis@1.3.26 \
  three@0.185.1 @react-three/fiber@9.7.0 @react-three/drei@10.7.8
npm install -D typescript@^5 tailwindcss@4.3.3 vitest@latest \
  @vitejs/plugin-react@latest jsdom@latest @playwright/test@latest \
  @types/three@latest
npx playwright install chromium
```

- [ ] **Step 3: Turn on TypeScript strict mode**

In `tsconfig.json` set `"strict": true`, `"noUncheckedIndexedAccess": true`, and confirm `"paths": { "@/*": ["./src/*"] }`.

- [ ] **Step 4: Ban direct gsap imports via ESLint**

Add to `eslint.config.mjs` rules:

```js
'no-restricted-imports': ['error', {
  paths: [{
    name: 'gsap',
    message: 'Import gsap from "@/components/motion/gsap" — that module is the single registration point.',
  }],
  patterns: [{
    group: ['gsap/*'],
    message: 'Import GSAP plugins from "@/components/motion/gsap".',
  }, {
    group: ['@/data/*'],
    message: 'Read data through "@/lib/events" — components never import src/data directly.',
  }],
}],
```

Exempt the registration module itself by adding a second config object with `files: ['src/components/motion/gsap.ts']` and `rules: { 'no-restricted-imports': 'off' }`, and likewise exempt `src/lib/events.ts` for the `@/data/*` pattern.

- [ ] **Step 5: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', include: ['src/**/*.test.ts', 'src/**/*.test.tsx'] },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 6: Verify the toolchain**

```bash
npm run dev   # visit localhost:3000, expect the default page
npm run build # expect a clean production build
npm test      # expect "No test files found" — not an error
npx tsc --noEmit
npx eslint .
```

All five must succeed before continuing.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next 16 + GSAP + Lenis + R3F toolchain"
```

---

### Task 2: Design tokens, fonts, and burst enforcement

**Files:**
- Modify: `src/styles/globals.css`, `src/app/layout.tsx`
- Create: `src/lib/fonts.ts`, `scripts/check-burst.mjs`, `src/app/specimen/page.tsx`

**Interfaces:**
- Consumes: Task 1's scaffold.
- Produces: CSS vars `--paper --paper-2 --ink --ink-60 --terracotta`, burst vars `--violet --pink --lime` defined ONLY under `.burst`; font CSS vars `--font-fraunces --font-archivo --font-mono`; `npm run check:burst`.

- [ ] **Step 1: Define the fonts with their variable axes**

Create `src/lib/fonts.ts`:

```ts
import { Fraunces, Archivo, JetBrains_Mono } from 'next/font/google';

export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK', 'opsz'],
});

export const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
  axes: ['wdth'],
});

export const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});
```

Apply all three `.variable` classes to `<html>` in `src/app/layout.tsx`.

- [ ] **Step 2: Write the token layer**

In `src/styles/globals.css`, after `@import "tailwindcss";`:

```css
@theme {
  --color-paper: #F4F1EA;
  --color-paper-2: #EAE5DA;
  --color-ink: #131C33;
  --color-ink-60: rgba(19, 28, 51, 0.6);
  --color-terracotta: #D2543F;

  --font-display: var(--font-archivo), 'Arial Narrow', sans-serif;
  --font-editorial: var(--font-fraunces), Georgia, serif;
  --font-mono: var(--font-mono), ui-monospace, monospace;
}

/* Burst palette is scoped. Outside a .burst ancestor these are undefined,
   so misuse fails visibly in review. See spec section 4.1. */
.burst {
  --violet: #4B3BF0;
  --pink: #F5C9D0;
  --lime: #C9F73D;
}

html { background: var(--color-paper); color: var(--color-ink); }
body { margin: 0; -webkit-font-smoothing: antialiased; }
```

- [ ] **Step 3: Build a specimen page to prove the axes animate**

Create `src/app/specimen/page.tsx` rendering: Fraunces italic at `WONK 0` and `WONK 1` side by side; Fraunces at `SOFT 0` and `SOFT 100`; Archivo at `wdth 62`, `wdth 100`, `wdth 125`, each labelled. Use inline `style={{ fontVariationSettings: "'WONK' 1" }}`.

- [ ] **Step 4: Verify the axes actually respond**

```bash
npm run dev
```

Open `localhost:3000/specimen`. Each pair MUST look visibly different. If `wdth` does not change Archivo's width, the axis is not being served — fix `axes` in `fonts.ts` before continuing, because the hero and posters depend on width morphing.

Delete `src/app/specimen/page.tsx` once confirmed — it must not ship (it would be an orphan route).

- [ ] **Step 5: Write the burst enforcement script**

Create `scripts/check-burst.mjs`:

```js
#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'src';
const TOKENS = /--violet|--pink|--lime|#4B3BF0|#F5C9D0|#C9F73D/i;
const ALLOWED = [
  'src/components/site/Loader',
  'src/components/site/TapeStack',
  'src/components/site/Footer',
  'src/components/site/EventRail',
  'src/components/site/NavOverlay',
  'src/components/site/BurstBreak',
  'src/components/site/Timeline',
  'src/components/motion/Transition',
  'src/components/canvas/',
  'src/components/poster/',
  'src/app/about/',
  'src/app/events/',
  'src/styles/globals.css',
];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const violations = walk(ROOT)
  .filter((p) => /\.(tsx?|css)$/.test(p))
  .filter((p) => !ALLOWED.some((a) => relative('.', p).startsWith(a)))
  .filter((p) => TOKENS.test(readFileSync(p, 'utf8')));

if (violations.length) {
  console.error('Burst colours used outside an allowed zone (spec 4.1):');
  for (const v of violations) console.error('  ' + v);
  process.exit(1);
}
console.log('check-burst: ok');
```

Add script `"check:burst": "node scripts/check-burst.mjs"`.

- [ ] **Step 6: Verify the check catches a violation**

Temporarily add `color: var(--violet)` to `src/app/page.tsx`, run `npm run check:burst`, expect exit code 1 naming that file. Remove the line, re-run, expect `check-burst: ok`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: design tokens, variable fonts, burst-zone enforcement"
```

---

### Task 3: The single GSAP registration point

**Files:**
- Create: `src/components/motion/gsap.ts`, `src/components/motion/gsap.test.ts`

**Interfaces:**
- Produces: named exports `gsap, ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, Flip, Observer, InertiaPlugin, CustomEase, ScrambleTextPlugin`; custom eases registered as `"wcc"` and `"wccOut"`; `gsap.defaults({ ease: 'wccOut', duration: 0.8 })`.

- [ ] **Step 1: Write the failing test**

Create `src/components/motion/gsap.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { gsap, ScrollTrigger, SplitText, Flip, DrawSVGPlugin } from './gsap';

describe('gsap registration point', () => {
  it('exports gsap', () => expect(typeof gsap.timeline).toBe('function'));

  it('registers every plugin the design depends on', () => {
    for (const p of [ScrollTrigger, SplitText, Flip, DrawSVGPlugin]) {
      expect(p).toBeDefined();
    }
  });

  it('registers the project custom eases', () => {
    expect(gsap.parseEase('wcc')).toBeTypeOf('function');
    expect(gsap.parseEase('wccOut')).toBeTypeOf('function');
  });
});
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run src/components/motion/gsap.test.ts
```

Expected: FAIL — cannot resolve `./gsap`.

- [ ] **Step 3: Write the module**

Create `src/components/motion/gsap.ts`:

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

// Registered once, at module scope. Importing gsap anywhere else in the app
// is an ESLint error — see eslint.config.mjs. Plugins registered twice are
// harmless; plugins never registered fail only in production builds.
gsap.registerPlugin(
  ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin,
  Flip, Observer, InertiaPlugin, CustomEase, ScrambleTextPlugin,
);

CustomEase.create('wcc', '0.76, 0, 0.24, 1');
CustomEase.create('wccOut', '0.16, 1, 0.3, 1');

gsap.defaults({ ease: 'wccOut', duration: 0.8 });

export {
  gsap, ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin,
  Flip, Observer, InertiaPlugin, CustomEase, ScrambleTextPlugin,
};
```

- [ ] **Step 4: Run the test again**

```bash
npx vitest run src/components/motion/gsap.test.ts
```

Expected: 3 passing.

- [ ] **Step 5: Verify the ESLint ban works**

Add `import { gsap } from 'gsap';` to `src/app/page.tsx`, run `npx eslint src/app/page.tsx`, expect the restricted-import error. Remove it.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: single GSAP registration point with project eases"
```

---

### Task 4: MotionProvider — one Lenis, one RAF

**Files:**
- Create: `src/components/motion/MotionProvider.tsx`, `src/components/motion/useReducedMotion.ts`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `@/components/motion/gsap`.
- Produces: `<MotionProvider>` wrapping the app; `useReducedMotion(): boolean` from React context; re-exports `useLenis` from `lenis/react` so no component imports Lenis directly.

- [ ] **Step 1: Write the provider**

Create `src/components/motion/MotionProvider.tsx`:

```tsx
'use client';

import { ReactLenis, useLenis, type LenisRef } from 'lenis/react';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from './gsap';

const ReducedMotionContext = createContext(false);
export const useReducedMotion = () => useContext(ReducedMotionContext);
export { useLenis };

export function MotionProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (reduced) return;

    // THE raf. Lenis runs with autoRaf:false and is driven from the GSAP
    // ticker so scroll and animation share one clock. A second RAF anywhere
    // in this app causes scroll drift that is very hard to trace later.
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const lenis = lenisRef.current?.lenis;
    lenis?.on('scroll', ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(update);
      lenis?.off('scroll', ScrollTrigger.update);
    };
  }, [reduced]);

  return (
    <ReducedMotionContext.Provider value={reduced}>
      {reduced ? null : (
        <ReactLenis root options={{ autoRaf: false, lerp: 0.1, wheelMultiplier: 1 }} ref={lenisRef} />
      )}
      {children}
    </ReducedMotionContext.Provider>
  );
}
```

- [ ] **Step 2: Mount it in the root layout**

Wrap `{children}` in `src/app/layout.tsx` with `<MotionProvider>`.

- [ ] **Step 3: Verify exactly one RAF exists**

Create a temporary page with 300vh of content. Run `npm run dev`, open DevTools console and run:

```js
let n = 0; const orig = window.requestAnimationFrame;
window.requestAnimationFrame = (cb) => { n++; return orig(cb); };
setTimeout(() => console.log('rAF callers per second:', n), 1000);
```

Expected: a single steady loop (~60/s from one source), not two interleaved loops. Scrolling must feel smoothed, not native.

- [ ] **Step 4: Verify reduced motion disables Lenis**

In DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce", reload. Scrolling must be native/instant and no `ReactLenis` element should be in the DOM.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: MotionProvider owns the only Lenis instance and raf"
```

---

### Task 5: Content model, pure helpers, and the data seam

**Files:**
- Create: `src/lib/types.ts`, `src/lib/seededRandom.ts`, `src/lib/seededRandom.test.ts`, `src/lib/format.ts`, `src/lib/format.test.ts`, `src/lib/events.ts`, `src/lib/events.test.ts`, `src/data/events.ts`, `src/data/site.ts`

**Interfaces:**
- Produces:
  - `type Event` exactly as in spec §5; `type SiteData`.
  - `createRng(seed: number): () => number`, `pick<T>(rng, arr): T`, `range(rng, min, max): number`.
  - `formatEventDate(startsAt: string, endsAt: string): string`, `formatEventTime(iso: string): string`, `eventDurationHours(a: string, b: string): number`.
  - `getAllEvents(): Event[]`, `getEventBySlug(slug: string): Event | undefined`, `getUpcomingEvents(): Event[]`, `getPastEvents(): Event[]`, `getAdjacentEvent(slug: string): Event | undefined`.

- [ ] **Step 1: Write the failing tests for the PRNG**

Create `src/lib/seededRandom.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createRng, pick, range } from './seededRandom';

describe('createRng', () => {
  it('is deterministic for a given seed', () => {
    const a = createRng(42), b = createRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('differs across seeds', () => {
    expect(createRng(1)()).not.toBe(createRng(2)());
  });

  it('stays within [0, 1)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 500; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('pick and range', () => {
  it('pick returns a member of the array', () => {
    const rng = createRng(3);
    expect(['a', 'b', 'c']).toContain(pick(rng, ['a', 'b', 'c']));
  });

  it('range stays within bounds', () => {
    const rng = createRng(9);
    for (let i = 0; i < 200; i++) {
      const v = range(rng, 10, 20);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThan(20);
    }
  });
});
```

- [ ] **Step 2: Run and watch it fail**

```bash
npx vitest run src/lib/seededRandom.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the PRNG**

Create `src/lib/seededRandom.ts`:

```ts
/**
 * Mulberry32. Deterministic across server and client, which is why posters
 * generated from a seed do not cause hydration mismatches.
 */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: () => number, arr: readonly T[]): T {
  if (arr.length === 0) throw new Error('pick: empty array');
  return arr[Math.floor(rng() * arr.length)]!;
}

export function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}
```

- [ ] **Step 4: Run — expect 5 passing**

```bash
npx vitest run src/lib/seededRandom.test.ts
```

- [ ] **Step 5: Write the failing tests for date formatting**

Create `src/lib/format.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { eventDurationHours, formatEventDate } from './format';

describe('formatEventDate', () => {
  it('collapses a same-day event to one date', () => {
    const s = formatEventDate('2026-09-12T10:00:00+05:30', '2026-09-12T18:00:00+05:30');
    expect(s).toMatch(/12/);
    expect(s).not.toMatch(/—|–/);
  });

  it('renders a multi-day event as a range', () => {
    const s = formatEventDate('2026-09-12T10:00:00+05:30', '2026-09-13T18:00:00+05:30');
    expect(s).toMatch(/12/);
    expect(s).toMatch(/13/);
  });
});

describe('eventDurationHours', () => {
  it('computes whole hours', () => {
    expect(eventDurationHours('2026-09-12T10:00:00Z', '2026-09-13T22:00:00Z')).toBe(36);
  });
});
```

- [ ] **Step 6: Run — expect FAIL, then implement**

Create `src/lib/format.ts`:

```ts
const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const DAY_NO_YEAR = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

export function formatEventDate(startsAt: string, endsAt: string): string {
  const a = new Date(startsAt), b = new Date(endsAt);
  const sameDay = a.toDateString() === b.toDateString();
  if (sameDay) return DAY.format(a);
  const sameYear = a.getFullYear() === b.getFullYear();
  return `${sameYear ? DAY_NO_YEAR.format(a) : DAY.format(a)} — ${DAY.format(b)}`;
}

export function formatEventTime(iso: string): string {
  return TIME.format(new Date(iso));
}

export function eventDurationHours(startsAt: string, endsAt: string): number {
  return Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 3_600_000);
}
```

Re-run: expect 3 passing.

- [ ] **Step 7: Define the types**

Create `src/lib/types.ts` with the `Event` type copied verbatim from spec §5, plus:

```ts
export type SiteData = {
  name: string;
  tagline: string;
  foundedYear: number;
  city: string;
  country: string;
  timezone: string;              // IANA, e.g. 'Asia/Kolkata' — used by the footer clock
  manifesto: string[];
  stats: { label: string; value: string }[];
  socials: { label: string; href: string }[];
};
```

- [ ] **Step 8: Write the placeholder content**

Create `src/data/events.ts`. It MUST begin with:

```ts
// PLACEHOLDER — replace with real content.
// Every record below is invented for layout purposes. No real person,
// partner organisation, or past outcome is named. Edit freely; the shape
// is enforced by the Event type and read through src/lib/events.ts.
```

Write **seven** events — a mix of `format` values and at least two `status: 'past'` — with distinct `posterSeed` integers. Titles should be short enough to set large (2–4 words). Descriptions: 2–3 real paragraphs each, written as the community would write them, but claiming nothing verifiable.

Create `src/data/site.ts` with the same PLACEHOLDER banner, `timezone: 'Asia/Kolkata'`, a 3-line manifesto, three stats, and socials. **Only include a social link if it is a real reachable URL** — otherwise use an empty array; the footer omits what is absent (Global Constraints: no dead links).

- [ ] **Step 9: Write the seam test, then the seam**

Create `src/lib/events.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getAdjacentEvent, getAllEvents, getEventBySlug, getPastEvents, getUpcomingEvents } from './events';

describe('events seam', () => {
  it('returns every event', () => expect(getAllEvents().length).toBeGreaterThanOrEqual(5));

  it('has unique slugs', () => {
    const slugs = getAllEvents().map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has unique poster seeds so posters differ', () => {
    const seeds = getAllEvents().map((e) => e.posterSeed);
    expect(new Set(seeds).size).toBe(seeds.length);
  });

  it('finds an event by slug and misses cleanly', () => {
    const first = getAllEvents()[0]!;
    expect(getEventBySlug(first.slug)?.slug).toBe(first.slug);
    expect(getEventBySlug('nope')).toBeUndefined();
  });

  it('partitions upcoming and past exhaustively', () => {
    expect(getUpcomingEvents().length + getPastEvents().length).toBe(getAllEvents().length);
  });

  it('wraps around for the adjacent event', () => {
    const all = getAllEvents();
    expect(getAdjacentEvent(all[all.length - 1]!.slug)?.slug).toBe(all[0]!.slug);
  });

  it('every event carries the fields the detail page renders', () => {
    for (const e of getAllEvents()) {
      expect(e.title).toBeTruthy();
      expect(e.summary).toBeTruthy();
      expect(e.description.length).toBeGreaterThan(0);
      expect(new Date(e.startsAt).toString()).not.toBe('Invalid Date');
      expect(new Date(e.endsAt).getTime()).toBeGreaterThanOrEqual(new Date(e.startsAt).getTime());
    }
  });
});
```

Then create `src/lib/events.ts`:

```ts
import { events } from '@/data/events';
import type { Event } from './types';

// The single seam over event data. A future backend replaces the bodies of
// these functions and returns Promises; call sites are already typed to cope.
export function getAllEvents(): Event[] {
  return [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function getEventBySlug(slug: string): Event | undefined {
  return getAllEvents().find((e) => e.slug === slug);
}

export function getUpcomingEvents(): Event[] {
  return getAllEvents().filter((e) => e.status === 'upcoming');
}

export function getPastEvents(): Event[] {
  return getAllEvents().filter((e) => e.status === 'past');
}

export function getAdjacentEvent(slug: string): Event | undefined {
  const all = getAllEvents();
  const i = all.findIndex((e) => e.slug === slug);
  return i === -1 ? undefined : all[(i + 1) % all.length];
}
```

- [ ] **Step 10: Run the full suite**

```bash
npm test
```

Expected: all tests pass. If "unique poster seeds" fails, fix the data — identical seeds would render identical posters.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: event content model, pure helpers, and the data read seam"
```

---

### Task 6: Brand primitives — Logo, Arrow, Grain, Grid

**Files:**
- Create: `scripts/gen-logo.mjs`, `src/components/site/Logo.tsx`, `src/components/site/Arrow.tsx`, `src/components/site/Grain.tsx`, `src/components/site/Grid.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces:
  - `<Logo className? title? />` — inline SVG, every letter path carrying `id` and `data-letter` exactly as in `public/brand/logo.svg`, plus `className="logo-letter"`. Groups `#we-code` and `#coders` preserved. Accepts a `gradientId` prop so two Logos on one page do not collide on `<defs>` ids.
  - `<Arrow className? direction? />` — the flourish extracted from the logo's C/R/S, `aria-hidden`.
  - `<Grain />` — fixed full-viewport turbulence overlay, `pointer-events:none`.
  - `<Grid />` — 12-column hairline overlay; opacity driven by CSS var `--grid-opacity` (default `0.15`).

- [ ] **Step 1: Generate the Logo component from the source SVG**

Hand-transcribing 20KB of path data is how typos ship. Create `scripts/gen-logo.mjs`:

```js
#!/usr/bin/env node
// Regenerates src/components/site/Logo.tsx from public/brand/logo.svg.
// Run after any change to the source logo. The logo is used as supplied —
// only animated, never redrawn (spec section 13).
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync('public/brand/logo.svg', 'utf8');
const paths = [...svg.matchAll(/<path\b([^>]*)\/>/g)].map(([, attrs]) => {
  const get = (n) => (attrs.match(new RegExp(`${n}="([^"]*)"`)) || [])[1];
  return { id: get('id'), letter: get('data-letter'), d: get('d') };
});
if (paths.length !== 12) throw new Error(`expected 12 letter paths, found ${paths.length}`);

const groupOf = (id) => (id.startsWith('top-') ? 'we-code' : 'coders');
const render = (g) => paths.filter((p) => groupOf(p.id) === g).map((p) =>
  `      <path id={\`\${idPrefix}-${p.id}\`} className="logo-letter" data-letter="${p.letter}"\n` +
  `        fill={\`url(#\${idPrefix}-gradient)\`} fillRule="evenodd" clipRule="evenodd"\n` +
  `        d="${p.d}" />`).join('\n');

writeFileSync('src/components/site/Logo.tsx', `// GENERATED by scripts/gen-logo.mjs — do not edit by hand.
type LogoProps = { className?: string; idPrefix?: string; title?: string };

export function Logo({ className, idPrefix = 'logo', title = 'We Code Coders' }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 1328 884" role="img" aria-label={title}>
      <defs>
        <linearGradient id={\`\${idPrefix}-gradient\`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD0DC" />
          <stop offset="0.52" stopColor="#F9C1D0" />
          <stop offset="1" stopColor="#F2B1C4" />
        </linearGradient>
      </defs>
      <g id={\`\${idPrefix}-we-code\`}>
${render('we-code')}
      </g>
      <g id={\`\${idPrefix}-coders\`}>
${render('coders')}
      </g>
    </svg>
  );
}
`);
console.log(`gen-logo: wrote 12 letter paths`);
```

Run it:

```bash
node scripts/gen-logo.mjs
npx tsc --noEmit
```

Expected: `gen-logo: wrote 12 letter paths`, clean typecheck. If the path count assertion throws, the source SVG changed shape — fix the regex rather than lowering the assertion.

- [ ] **Step 2: Verify the logo renders identically to the source**

Add `<Logo className="w-[600px]" />` to `src/app/page.tsx` temporarily, run `npm run dev`, and compare against `public/brand/logo.svg` opened directly in a browser tab. They must be visually identical. Remove the temporary usage.

- [ ] **Step 3: Extract the Arrow motif**

Create `src/components/site/Arrow.tsx` — a small standalone SVG tracing the same arrowhead-and-tail form as the flourishes inside the logo's C, R and S, on a `0 0 24 24` viewBox, `stroke="currentColor"`, `fill="none"`, `strokeWidth={1.5}`, `aria-hidden="true"`, with a `direction` prop of `'right' | 'down' | 'up-right'` applying a rotation. This is the motif reused for link markers, list bullets, the scroll cue, and timeline node caps.

- [ ] **Step 4: Build Grain and Grid**

`src/components/site/Grain.tsx` — a `fixed inset-0 z-[60] pointer-events-none` div at `opacity: 0.04`, `mixBlendMode: 'multiply'`, whose background is an inline data-URI SVG using `<feTurbulence baseFrequency="0.8" numOctaves="3" />`. Rendered once, static: animated grain is a known battery and GPU sink.

`src/components/site/Grid.tsx` — a `fixed inset-0 z-[1] pointer-events-none` 12-column `repeating-linear-gradient` of 1px `--color-paper-2` lines, inside the same max-width container the page content uses, at `opacity: var(--grid-opacity, 0.15)`.

- [ ] **Step 5: Mount Grain and Grid in the root layout**

Add both inside `<body>`, before `{children}`.

- [ ] **Step 6: Verify**

```bash
npm run dev && npm run check:burst && npx tsc --noEmit
```

Grain must be visible as a faint tooth over the cream, not as visible noise. Grid must be barely perceptible at rest.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: brand primitives — generated Logo, Arrow motif, grain, editorial grid"
```

---

### Task 7: Generative posters

**Files:**
- Create: `src/components/poster/Poster.tsx`, `src/components/poster/layouts.ts`, `src/components/poster/Poster.test.tsx`

**Interfaces:**
- Consumes: `createRng, pick, range` from `@/lib/seededRandom`; `Event` from `@/lib/types`; `formatEventDate` from `@/lib/format`.
- Produces: `<Poster event={event} className? priority? />`. Renders `event.posterImage` via `next/image` when present, otherwise a generated composition. Always fills its container and preserves a 3:4 aspect ratio.

- [ ] **Step 1: Write the failing test**

Create `src/components/poster/Poster.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Poster } from './Poster';
import { getAllEvents } from '@/lib/events';

const events = getAllEvents();

describe('Poster', () => {
  it('renders the event title as real text', () => {
    const e = events[0]!;
    const { container } = render(<Poster event={e} />);
    expect(container.textContent).toContain(e.title);
  });

  it('is deterministic — the same event renders identically twice', () => {
    const e = events[0]!;
    const a = render(<Poster event={e} />).container.innerHTML;
    const b = render(<Poster event={e} />).container.innerHTML;
    expect(a).toBe(b);
  });

  it('differs between events with different seeds', () => {
    const a = render(<Poster event={events[0]!} />).container.innerHTML;
    const b = render(<Poster event={events[1]!} />).container.innerHTML;
    expect(a).not.toBe(b);
  });

  it('prefers a supplied poster image over the generated one', () => {
    const e = { ...events[0]!, posterImage: '/brand/logo.svg' };
    const { container } = render(<Poster event={e} />);
    expect(container.querySelector('img')).not.toBeNull();
  });
});
```

Install the testing library: `npm i -D @testing-library/react @testing-library/dom`.

- [ ] **Step 2: Run and watch it fail**

```bash
npx vitest run src/components/poster/Poster.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Define the layout table**

Create `src/components/poster/layouts.ts`:

```ts
export const GROUNDS = [
  { bg: '#4B3BF0', fg: '#F5C9D0', accent: '#C9F73D' }, // violet
  { bg: '#F5C9D0', fg: '#4B3BF0', accent: '#131C33' }, // pink
  { bg: '#C9F73D', fg: '#131C33', accent: '#4B3BF0' }, // lime
  { bg: '#131C33', fg: '#F5C9D0', accent: '#C9F73D' }, // ink
] as const;

export const TITLE_TREATMENTS = ['solid', 'outline', 'mixed'] as const;
export const TITLE_ALIGNMENTS = ['top', 'centre', 'bottom'] as const;

export type Ground = (typeof GROUNDS)[number];
export type TitleTreatment = (typeof TITLE_TREATMENTS)[number];
```

- [ ] **Step 4: Implement the Poster**

Create `src/components/poster/Poster.tsx`. It is a server-safe component with no hooks and no `Math.random` — every varying value comes from `createRng(event.posterSeed)`, which is why the determinism test passes and why there is no hydration mismatch.

Composition, in order:
1. Ground `div`, `aspect-[3/4]`, `overflow-hidden`, `relative`, colours from `pick(rng, GROUNDS)`, `className="burst"` so the burst tokens resolve.
2. Halftone layer — `radial-gradient(circle, <accent> 1px, transparent 1px)` at a seeded `backgroundSize` between 8px and 18px, `opacity: 0.25`.
3. A hairline grid fragment — 3 to 5 seeded 1px rules at seeded offsets in the accent colour at low opacity.
4. Title — `event.title` in Archivo via `font-display`, `fontVariationSettings` with a seeded `wdth` between 62 and 118 and `wght` 800–900, `text-transform: uppercase`, line-broken per word so long titles stack. Treatment from `pick(rng, TITLE_TREATMENTS)`: `outline` uses `color: transparent` with `-webkit-text-stroke: 1.5px <fg>`; `mixed` outlines all words but the first.
5. `<Arrow />` positioned at a seeded `top`/`left` percentage, seeded scale 1.5–4, seeded rotation −25°..25°, in the accent colour at `opacity: 0.9`.
6. Mono metadata block pinned to the bottom: `formatEventDate(...)`, `event.venue.city`, `event.format.toUpperCase()`.
7. Grain — the same turbulence data-URI as `<Grain />`, at `opacity: 0.06`, `mixBlendMode: 'overlay'`.

When `event.posterImage` is set, render only `next/image` with `fill` and `object-cover` and skip layers 2–7 entirely.

- [ ] **Step 5: Run the tests**

```bash
npx vitest run src/components/poster/Poster.test.tsx
```

Expected: 4 passing. If "differs between events" fails, the seed is not reaching enough decisions — vary ground, treatment, alignment, arrow placement and halftone size, not just one of them.

- [ ] **Step 6: Eyeball all seven posters at once**

Temporarily render every event's poster in a grid on `src/app/page.tsx`, run `npm run dev`, and confirm: all seven look clearly distinct, every title is legible against its ground, and no title overflows its frame. Adjust the seeded ranges — not the data — until true. Remove the temporary grid.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: deterministic generative posters with real-image override"
```

---

### Task 8: Nav and overlay menu

**Files:**
- Create: `src/components/site/Nav.tsx`, `src/components/site/NavOverlay.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `Logo`, `Arrow`, `useLenis`, `useReducedMotion`, `gsap`/`useGSAP`.
- Produces: `<Nav />` fixed at `z-50`, `mix-blend-mode: difference`. Links are plain `next/link` for now; Task 16 swaps them for `TransitionLink`.

- [ ] **Step 1: Build the nav bar**

Fixed, full width, `mix-blend-difference` so it inverts against any ground. Left: `<Logo />` at ~120px wide linking to `/`. Right: `EVENTS` and `ABOUT`, each prefixed with a mono index (`01`, `02`), then a menu button.

Link hover is a two-layer roll: the label is duplicated inside an `overflow-hidden` span; on hover the ink copy translates to `-100%` and the terracotta copy comes from `100%` to `0`, both over 0.4s `wccOut`, staggered by 0.02s per character using SplitText chars.

- [ ] **Step 2: Add the scroll morph**

Past 60vh the two-line lockup collapses to a single arrow glyph. Implement inside `useGSAP({ scope })` with a `ScrollTrigger` at `start: '60vh top'` running a timeline that fades and scales the wordmark out while `MorphSVGPlugin` morphs a source path into the Arrow's path. Reverses on scroll back up.

If the morph reads as mush at small size, fall back to a cross-fade between `<Logo />` and `<Arrow />` — legibility wins over technique.

- [ ] **Step 3: Build the overlay**

`src/components/site/NavOverlay.tsx`, `className="burst"`, violet ground, wiping in from the right via `clip-path: inset(0 0 0 100%)` → `inset(0)` over 0.6s `wcc`. Links (`EVENTS`, `ABOUT`) in Archivo at `clamp(3rem, 12vw, 9rem)`, pink, staggering up through line masks at 0.06s.

Hovering a link lerps that section's poster thumbnail toward the cursor: track pointer position in a ref, and in a `gsap.ticker` callback registered inside `useGSAP` move the thumbnail with `x += (target - x) * 0.12`. Do not add a new `requestAnimationFrame` — use the GSAP ticker, which is already the app's single clock.

- [ ] **Step 4: Make the overlay accessible**

- `role="dialog"`, `aria-modal="true"`, labelled by a visually hidden heading.
- Focus moves to the first link on open and returns to the menu button on close.
- Focus is trapped: `Tab` from the last focusable wraps to the first.
- `Escape` closes.
- `lenis.stop()` on open, `lenis.start()` on close, via `useLenis()`.
- When `useReducedMotion()` is true, the overlay appears and disappears with a 150ms opacity change and no wipe.

- [ ] **Step 5: Verify by hand**

```bash
npm run dev
```

Check every one of: nav inverts over both cream and any dark block; both link hovers roll correctly; the logo morphs past 60vh and reverses; overlay opens/closes; `Escape` closes it; `Tab` cannot escape it; background does not scroll while open; focus returns to the button.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: blend-mode nav with scroll morph and accessible overlay menu"
```

---

### Task 9: Footer and root layout wiring

**Files:**
- Create: `src/components/site/Footer.tsx`, `src/components/site/LocalClock.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `Logo`, `Arrow`, site data via a new `getSite()` export added to `src/lib/events.ts`.
- Produces: `<Footer />`; `getSite(): SiteData`.

- [ ] **Step 1: Extend the seam with site data**

Add to `src/lib/events.ts`:

```ts
import { site } from '@/data/site';
import type { SiteData } from './types';

export function getSite(): SiteData {
  return site;
}
```

- [ ] **Step 2: Build the clock**

`src/components/site/LocalClock.tsx` — a client component showing the current time in `site.timezone` via `Intl.DateTimeFormat` with `timeZone`, updating on a 1s `setInterval` that is cleared on unmount.

It must render `null` on the server and mount its first value in `useEffect`, otherwise server and client render different times and hydration fails.

- [ ] **Step 3: Build the footer**

`className="burst"`, violet ground, pink type.

- Large Archivo `BUILD IN PUBLIC.`
- A link column built from `getSite().socials` — **rendered only if the array is non-empty**, and each entry rendered only if it has an `href`. Plus internal links to `/events` and `/about`, which are the only two internal destinations that exist.
- `<LocalClock />` with the city label in mono.
- At the very bottom, `<Logo idPrefix="footer" />` at large scale, drawing itself in on a `ScrollTrigger` with `start: 'top 85%'`: `DrawSVGPlugin` strokes each `.logo-letter` 0% → 100% staggered `from: 'center'`, then fills flood in, then the three arrow paths fire last with `back.out(2)`.
- No signup, no newsletter, no host-an-event — those are non-goals.

- [ ] **Step 4: Wire the layout**

`src/app/layout.tsx` final shape: `<html>` with the three font variables → `<body>` → `<MotionProvider>` → `<Grain />`, `<Grid />`, `<Nav />`, `{children}`, `<Footer />`.

Add root `metadata` with title, description, `metadataBase`, and OpenGraph fields drawn from `getSite()`.

- [ ] **Step 5: Verify the footer logo animation with a filmstrip**

Write `scripts/filmstrip.mjs` now, because from here on it is the only valid way to check scroll work:

```js
#!/usr/bin/env node
// Usage: node scripts/filmstrip.mjs /events events-ring [steps]
// Scrolls the route in steps, waiting a frame at each, and writes PNGs to
// .filmstrips/<name>/NN.png. A Playwright fullPage screenshot never fires
// ScrollTrigger and renders every reveal blank — never judge this site by one.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [route = '/', name = 'shot', steps = '12'] = process.argv.slice(2);
const n = Number(steps);
const dir = `.filmstrips/${name}`;
mkdirSync(dir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3200); // let the loader finish

const height = await page.evaluate(() => document.body.scrollHeight);
for (let i = 0; i < n; i++) {
  const y = ((height - 900) * i) / (n - 1);
  await page.evaluate((to) => window.scrollTo({ top: to, behavior: 'instant' }), y);
  await page.waitForTimeout(700); // let Lenis settle and triggers fire
  await page.screenshot({ path: `${dir}/${String(i).padStart(2, '0')}.png` });
}
await browser.close();
console.log(`filmstrip: ${n} frames in ${dir}`);
```

Add `.filmstrips/` to `.gitignore`. Then:

```bash
npm run dev &
node scripts/filmstrip.mjs / home 12
```

Open the last two frames and confirm the footer logo is drawn, not blank and not already-complete-on-arrival.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: violet footer with drawing logo, local clock, and filmstrip harness"
```

---

# Checkpoint 2 — The opening

### Task 10: Loader

**Files:**
- Create: `src/components/site/Loader.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `Logo`, `gsap`, `DrawSVGPlugin`, `ScrambleTextPlugin`, `useReducedMotion`.
- Produces: `<Loader />` mounted first inside `<body>` at `z-[100]`. Dispatches `window` event `wcc:loader-done` when its exit begins, which `Hero` listens for.

- [ ] **Step 1: Gate it to once per session**

Read `sessionStorage.getItem('wcc:seen')` in a `useState` initialiser guarded for SSR. If set, or if `useReducedMotion()` is true, render nothing and dispatch `wcc:loader-done` immediately in an effect. Otherwise set the key and play.

- [ ] **Step 2: Build the four-phase timeline**

Inside `useGSAP({ scope })`, violet ground (`className="burst"`), `<Logo />` centred at ~60vw:

```
Phase 1 DRAW  (0.9s)  DrawSVG each .logo-letter 0% -> 100%,
                      stroke pink, fill transparent,
                      stagger { from: 'center', amount: 0.5 }
Phase 2 FLOOD (0.5s)  per-letter clip-path inset(100% 0 0 0) -> inset(0),
                      fill restored to the gradient, shuffled stagger
Phase 3 FIRE  (0.35s) the three arrow paths (#logo-top-c-arrow,
                      #logo-bottom-r-arrow, #logo-bottom-s-arrow)
                      draw + scale overshoot, back.out(2)
Phase 4 EXIT  (0.7s)  six full-height columns translateY -100%,
                      stagger 0.06, expo.inOut
```

Concurrent from t=0: a mono counter bottom-left tweening an object `{ v: 0 }` to `100` and writing `String(Math.round(v)).padStart(2,'0')`; behind the mark, `WECODECODERS` at low opacity scrambling in via `ScrambleTextPlugin`.

Fire `wcc:loader-done` at the *start* of Phase 4, so the hero is already 300ms into its entrance when the first column clears.

- [ ] **Step 3: Add the escape hatch**

A `setTimeout` at 4000ms that force-completes the timeline and dispatches the event regardless of font or SVG load state. The loader must never be able to trap a visitor. Clear the timeout on normal completion and on unmount.

- [ ] **Step 4: Verify**

Hard-reload with an empty session and watch: letters draw before they fill; the arrows fire last; the columns clear upward; total elapsed under 3s. Then reload again — the loader must NOT reappear in the same session. Then emulate reduced motion — it must not appear at all, and the page must still be usable.

Throttle to Slow 3G and confirm the 4s hatch fires and the site becomes usable.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: logo-construction loader with session gate and load escape hatch"
```

---

### Task 11: Hero

**Files:**
- Create: `src/components/site/Hero.tsx`, `src/components/motion/SplitLines.tsx`, `src/components/motion/useReveal.ts`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces:
  - `<SplitLines as? className? children />` — splits into masked lines after `document.fonts.ready`, re-splits on resize (debounced 200ms), reverts on unmount. Exposes the line elements through a callback prop `onSplit(lines: HTMLElement[])`.
  - `useReveal(scope, opts?)` — the standard masked reveal: `y: '110%'` → `0`, `stagger: 0.09`, `ease: 'wccOut'`, triggered at `top 80%`.

- [ ] **Step 1: Build SplitLines correctly**

The three failure modes it exists to prevent:
1. Splitting before webfonts load measures the fallback font and produces wrong line breaks — so `await document.fonts.ready` first.
2. Not re-splitting on resize leaves lines broken for the old width — so re-split on a debounced `resize`.
3. Not reverting on unmount leaves orphaned DOM — so call `split.revert()` in cleanup.

Wrap each line in an `overflow-hidden` parent (`SplitText`'s `mask: 'lines'` option) so the reveal is a true mask, not a fade.

- [ ] **Step 2: Compose the hero**

```
Build              font-editorial, italic, wght 300, --terracotta
    in public.     font-editorial, wght 900, --ink, indented ~18%
LEAVE WITH PROOF.  font-display, wdth 110, wght 900,
                   color: transparent, -webkit-text-stroke: 1.5px --ink
```

Sizes fluid via `clamp()`; the outlined line spans the full measure. Mono kicker top-left reading name, city and country from `getSite()`. `<Arrow direction="down" />` scroll cue at the bottom, bobbing on a 2s yoyo `sine.inOut`.

Behind everything, `<Logo idPrefix="hero" />` at ~140vw, `opacity: 0.05`, parallaxing at a 0.15 scroll ratio via a `scrub: true` ScrollTrigger.

- [ ] **Step 3: Animate it**

Start the timeline on `wcc:loader-done` (listen in `useGSAP`; if the event already fired before mount, a module-scope boolean records it so the hero never waits forever).

- Lines reveal through masks, staggered 0.09s, `expo.out`.
- `Build` tweens `--wonk` from `1` to `0` over 0.6s; the element's `font-variation-settings` reads `'WONK' var(--wonk)`.
- The outlined line reveals left-to-right via `clip-path: inset(0 100% 0 0)` → `inset(0)` over 1.1s. **It is live text, not an SVG path — DrawSVG does not apply here.**
- Across the hero's scroll range, a separate `scrub` trigger tweens the outlined line's `--wdth` from 75 to 110.

- [ ] **Step 4: Verify**

```bash
node scripts/filmstrip.mjs / hero 6
```

Frame 0 must show the composition matching the reference: terracotta italic `Build`, ink `in public.` indented, outlined `LEAVE WITH PROOF.` beneath. Then in the browser confirm the width axis visibly widens as you scroll, and that with JS disabled all three lines are still fully legible.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: editorial hero with font-axis animation and font-safe line splitting"
```

---

### Task 12: Velocity-reactive marquee and the tape stack

**Files:**
- Create: `src/lib/marquee.ts`, `src/lib/marquee.test.ts`, `src/components/motion/Marquee.tsx`, `src/components/site/TapeStack.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces:
  - `advanceMarquee(state, dt, scrollVelocity, opts): MarqueeState` — PURE. `state = { x: number; boost: number }`, `opts = { baseSpeed: number; direction: 1 | -1; trackWidth: number; damping: number }`.
  - `<Marquee speed direction className children />`.
  - `<TapeStack />` — five overlapping bars.

- [ ] **Step 1: Write the failing test for the motion maths**

Create `src/lib/marquee.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { advanceMarquee } from './marquee';

const opts = { baseSpeed: 100, direction: 1 as const, trackWidth: 500, damping: 0.6 };

describe('advanceMarquee', () => {
  it('moves at base speed with no scrolling', () => {
    const s = advanceMarquee({ x: 0, boost: 0 }, 1, 0, opts);
    expect(s.x).toBeCloseTo(-100, 5);
  });

  it('wraps within the track width so it never runs off', () => {
    const s = advanceMarquee({ x: -480, boost: 0 }, 1, 0, opts);
    expect(s.x).toBeGreaterThan(-500);
    expect(s.x).toBeLessThanOrEqual(0);
  });

  it('scroll velocity adds to speed', () => {
    const slow = advanceMarquee({ x: 0, boost: 0 }, 0.1, 0, opts).x;
    const fast = advanceMarquee({ x: 0, boost: 0 }, 0.1, 2000, opts).x;
    expect(Math.abs(fast)).toBeGreaterThan(Math.abs(slow));
  });

  it('boost decays back toward base when scrolling stops', () => {
    const spun = advanceMarquee({ x: 0, boost: 900 }, 0.1, 0, opts);
    expect(Math.abs(spun.boost)).toBeLessThan(900);
    let s = { x: 0, boost: 900 };
    for (let i = 0; i < 200; i++) s = advanceMarquee(s, 0.05, 0, opts);
    expect(Math.abs(s.boost)).toBeLessThan(1);
  });

  it('reverses direction when scroll velocity is strongly negative', () => {
    const s = advanceMarquee({ x: 0, boost: 0 }, 0.1, -5000, opts);
    expect(s.x).toBeGreaterThan(0);
  });

  it('is frame-rate independent', () => {
    let a = { x: 0, boost: 0 };
    for (let i = 0; i < 60; i++) a = advanceMarquee(a, 1 / 60, 0, opts);
    const b = advanceMarquee({ x: 0, boost: 0 }, 1, 0, opts);
    expect(a.x).toBeCloseTo(b.x, 1);
  });
});
```

- [ ] **Step 2: Run and watch it fail**

```bash
npx vitest run src/lib/marquee.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the maths**

Create `src/lib/marquee.ts`:

```ts
export type MarqueeState = { x: number; boost: number };
export type MarqueeOpts = {
  baseSpeed: number;      // px/sec at rest
  direction: 1 | -1;
  trackWidth: number;     // width of ONE copy of the track
  damping: number;        // seconds for boost to decay ~63%
};

/**
 * Integrates one frame. Pure and frame-rate independent: the decay uses
 * exp(-dt/damping) rather than a per-frame multiplier, so a 30fps device
 * and a 120fps device travel the same distance in the same wall time.
 */
export function advanceMarquee(
  state: MarqueeState,
  dt: number,
  scrollVelocity: number,
  opts: MarqueeOpts,
): MarqueeState {
  const boost = state.boost + (scrollVelocity - state.boost) * (1 - Math.exp(-dt / opts.damping));
  const speed = opts.baseSpeed * opts.direction + boost;
  let x = state.x - speed * dt;

  // Wrap into (-trackWidth, 0] so the duplicated track always covers the view.
  if (opts.trackWidth > 0) {
    x = ((x % opts.trackWidth) + opts.trackWidth) % opts.trackWidth - opts.trackWidth;
    if (x <= -opts.trackWidth) x += opts.trackWidth;
  }
  return { x, boost };
}
```

- [ ] **Step 4: Run — expect 6 passing**

```bash
npx vitest run src/lib/marquee.test.ts
```

If "reverses direction" fails, the boost is not permitted to exceed and invert `baseSpeed` — do not clamp it to positive values.

- [ ] **Step 5: Build the Marquee component**

Renders `children` twice inside a flex row (so the wrap is seamless), measures one copy's width with a `ResizeObserver`, and on each `gsap.ticker` tick calls `advanceMarquee` and applies `gsap.set(track, { x })`.

Scroll velocity comes from `useLenis((lenis) => lenis.velocity)` stored in a ref. Do **not** register a `requestAnimationFrame` — use the GSAP ticker, the app's single clock.

Hover sets a ref that zeroes `baseSpeed` and raises `z-index`. Under `useReducedMotion()` the component renders the static track with no ticker registration at all.

- [ ] **Step 6: Compose the stack**

`src/components/site/TapeStack.tsx`, `className="burst"`, five bars overlapping vertically by ~25% of their height, at rotations `-3, 2, -1.5, 4, -2` degrees, in a container with `overflow-x: clip` so the rotations never create a horizontal scrollbar.

| # | Ground | Type | Base speed | Dir | Content |
|---|---|---|---|---|---|
| 1 | violet | pink | 70 | 1 | event formats, bullet-separated |
| 2 | paper | ink | 45 | -1 | `EST. {foundedYear}` — city — `OPEN TO ALL — NO GATEKEEPING` |
| 3 | lime | ink | 95 | 1 | the three stats from `getSite()` |
| 4 | ink | pink | 60 | -1 | repeating `<Logo />` mark + `<Arrow />` |
| 5 | pink | violet | 80 | 1 | `BUILD IN PUBLIC / LEAVE WITH PROOF` |

Position the stack over the hero/manifesto boundary so it reads as tape sealing the page.

- [ ] **Step 7: Verify**

```bash
npx vitest run && node scripts/filmstrip.mjs / tape 10
```

In the browser: scroll hard downward and confirm the bars whip; scroll hard upward and confirm they reverse; stop and confirm they ease back to base over roughly half a second; hover one and confirm it pauses and lifts. Confirm no horizontal scrollbar appears at any width from 320px to 2560px.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: velocity-reactive marquee maths and the five-bar tape stack"
```

---

# Checkpoint 3 — The body of the home page

### Task 13: Manifesto and the Counter primitive

**Files:**
- Create: `src/components/motion/Counter.tsx`, `src/components/site/Manifesto.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `<Counter to={number} suffix? duration? />`; `<Manifesto />`.

- [ ] **Step 1: Build the Counter**

Renders `to` as static text on the server (so the number is present with JS off and for crawlers), then on mount sets the display to `0` and, on a `ScrollTrigger` at `top 85%`, tweens a proxy object up to `to` with `ease: 'wccOut'`, writing `Math.round` into the node. Under `useReducedMotion()` it skips the tween entirely and leaves the final value. `once: true`.

Wrap in `<span aria-label={String(to)}>` so screen readers hear the target, not the flicker.

- [ ] **Step 2: Compose the manifesto**

**This section is peak editorial — it must contain no burst colour at all.** `check:burst` enforces that; do not add `.burst` here.

Layout: an asymmetric two-column grid (roughly 7fr / 4fr) with 1px `--color-paper-2` rules between blocks. Left column holds a large Fraunces pull-quote from `getSite().manifesto`. Right column holds mono marginalia — short notes set small in `--color-ink-60`, deliberately not vertically aligned with the left column's baseline grid, the way print footnotes are not.

Beneath, a row of three `<Counter />` tallies from `getSite().stats`.

- [ ] **Step 3: Animate it**

- The pull-quote reveals **per word** through masks (`SplitText` with `type: 'words,lines'`, `mask: 'lines'`), stagger 0.03s.
- Its `--soft` custom property tweens 0 → 60 across the reveal, so `font-variation-settings: 'SOFT' var(--soft)` softens the terminals as it arrives.
- Each marginalia note gets its **own** `ScrollTrigger` at a slightly different `start` (`top 90%`, `top 84%`, `top 78%`…) so they arrive out of step rather than as a block.
- Section entry raises `--grid-opacity` to `0.45` for 400ms, then back to `0.15`.

- [ ] **Step 4: Verify**

```bash
npm run check:burst && node scripts/filmstrip.mjs / manifesto 10
```

`check:burst` must pass — if it flags `Manifesto.tsx`, remove the burst colour rather than adding the file to the allow-list. In the filmstrip, the counters must be mid-count in one frame and settled in a later one; if they are settled in every frame the trigger is firing too early.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: editorial manifesto with per-word reveal and count-up tallies"
```

---

### Task 14: Event rail — pinned horizontal scroll

**Files:**
- Create: `src/lib/rail.ts`, `src/lib/rail.test.ts`, `src/components/site/EventRail.tsx`, `src/components/site/EventRailCard.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces:
  - `railMetrics(dx: number, viewport: { width: number; height: number }): RailMetrics` — PURE.
  - `<EventRail />`.

- [ ] **Step 1: Write the failing test for the metrics**

Create `src/lib/rail.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { railMetrics } from './rail';

const vp = { width: 1440, height: 900 };
const FALLOFF = vp.width * 0.6;

describe('railMetrics', () => {
  it('fills the viewport at dead centre', () => {
    const m = railMetrics(0, vp);
    expect(m.width).toBeCloseTo(1440, 0);
    expect(m.height).toBeCloseTo(900, 0);
    expect(m.radius).toBeCloseTo(0, 5);
    expect(m.interactive).toBe(true);
  });

  it('rests small at the falloff edge', () => {
    const m = railMetrics(FALLOFF, vp);
    expect(m.width).toBeCloseTo(vp.width * 0.46, 0);
    expect(m.height).toBeCloseTo(vp.height * 0.62, 0);
    expect(m.interactive).toBe(false);
    expect(m.wash).toBe(0);
  });

  it('is symmetric about the centre', () => {
    expect(railMetrics(300, vp)).toEqual(railMetrics(-300, vp));
  });

  it('shrinks monotonically as the card leaves the centre', () => {
    let prev = Infinity;
    for (let dx = 0; dx <= FALLOFF; dx += 60) {
      const w = railMetrics(dx, vp).width;
      expect(w).toBeLessThanOrEqual(prev + 0.001);
      prev = w;
    }
  });

  it('clamps beyond the falloff instead of inverting', () => {
    expect(railMetrics(FALLOFF * 4, vp)).toEqual(railMetrics(FALLOFF, vp));
  });

  it('only becomes interactive once it is nearly full-bleed', () => {
    expect(railMetrics(0, vp).interactive).toBe(true);
    expect(railMetrics(FALLOFF * 0.5, vp).interactive).toBe(false);
  });

  it('fades the wash and detail in together over the last tenth', () => {
    const m = railMetrics(0, vp);
    expect(m.wash).toBeCloseTo(1, 5);
    expect(m.detail).toBeCloseTo(1, 5);
  });
});
```

- [ ] **Step 2: Run and watch it fail**

```bash
npx vitest run src/lib/rail.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the metrics**

Create `src/lib/rail.ts`:

```ts
export type RailMetrics = {
  progress: number;    // 0 at the falloff edge, 1 at dead centre
  width: number;
  height: number;
  radius: number;
  saturation: number;
  wash: number;        // violet wash opacity
  detail: number;      // detail block opacity
  interactive: boolean;
};

const RESTING_W = 0.46;   // of viewport width
const RESTING_H = 0.62;   // of viewport height
const FALLOFF = 0.6;      // of viewport width
const INTERACTIVE_AT = 0.9;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Card presentation as a continuous function of distance from the viewport
 * centre. The centred card genuinely fills the screen and shrinks back as
 * scrolling continues — growth is not click-gated (spec section 7.2).
 *
 * @param dx    card centre minus viewport centre, in px (sign ignored)
 * @param viewport current viewport size in px
 */
export function railMetrics(dx: number, viewport: { width: number; height: number }): RailMetrics {
  const d = clamp01(Math.abs(dx) / (viewport.width * FALLOFF));
  const t = 1 - d;
  const progress = t * t * (3 - 2 * t); // smoothstep

  const tail = clamp01((progress - INTERACTIVE_AT) / (1 - INTERACTIVE_AT));

  return {
    progress,
    width: lerp(viewport.width * RESTING_W, viewport.width, progress),
    height: lerp(viewport.height * RESTING_H, viewport.height, progress),
    radius: lerp(18, 0, progress),
    saturation: lerp(0.35, 1, progress),
    wash: tail,
    detail: tail,
    interactive: progress >= INTERACTIVE_AT,
  };
}
```

- [ ] **Step 4: Run — expect 7 passing**

```bash
npx vitest run src/lib/rail.test.ts
```

- [ ] **Step 5: Build the desktop rail**

`src/components/site/EventRail.tsx`, inside `useGSAP({ scope })` and wrapped in `gsap.matchMedia()` for `'(min-width: 901px) and (pointer: fine)'`:

- A pinned section of height `(events.length) * 100vh`, `scrub: 1`.
- An inner track laid out as a flex row translating from `x: 0` to `x: -(trackWidth - window.innerWidth)`.
- On every ScrollTrigger `onUpdate`, for each card: read its centre via `getBoundingClientRect()`, call `railMetrics`, and apply with `gsap.set` — `width`, `height`, `borderRadius`, `filter: saturate()`, and the wash/detail opacities.

  Batch all reads before all writes to avoid layout thrashing: loop once collecting rects, then loop again applying.
- Chrome: a mono `03 / 07` counter bound to the nearest card index, a 1px progress rule scaling from 0 to 1, and an `<Arrow direction="right" />` hint.
- Each card renders `<Poster event={e} />`, the title in Archivo condensed, and a mono date/place line. The detail block — summary plus `VIEW EVENT` and an arrow — is the part that fades in with `metrics.detail`.
- The card is wrapped in a link to `/events/${e.slug}` whose `pointerEvents` is `metrics.interactive ? 'auto' : 'none'`, so an unreadable card cannot be clicked.
- Add `.burst` to the card element **only** while `metrics.interactive` is true, so the violet wash's tokens resolve exactly where the spec allows.

- [ ] **Step 6: Build the touch fallback**

In the same `matchMedia`, under `'(max-width: 900px), (pointer: coarse)'`: no pin, no horizontal track. Render a vertical stack of the same cards, computing `dx` from the **vertical** distance to the viewport centre and passing it through the identical `railMetrics`. Behaviour and thresholds stay the same; only the axis changes.

- [ ] **Step 7: Verify**

```bash
npx vitest run && node scripts/filmstrip.mjs / rail 16
```

The filmstrip must show at least one frame with a card genuinely filling the whole viewport, and adjacent frames with it partly grown — proving the growth is continuous rather than binary. Then by hand:

- Scroll to a centred card and confirm `VIEW EVENT` is clickable; scroll slightly away and confirm it is not.
- Resize the window mid-pin and confirm the layout recovers (matchMedia tears down and rebuilds).
- Load at 375px wide and confirm the vertical variant runs and **no horizontal scrolling is possible**.
- Navigate away and back and confirm scroll position is not corrupted — a leaked pin is the usual cause.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: pinned horizontal event rail with continuous centre-driven scaling"
```

---

### Task 15: Timeline

**Files:**
- Create: `src/components/site/Timeline.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build the spine**

An inline SVG running the full height of the section with a single `<path>` — a gentle vertical S-curve, not a straight line. Stroke width 2, `fill: none`.

`DrawSVGPlugin` animates `drawSVG: '0%'` → `'100%'` on a `ScrollTrigger` with `scrub: 1` spanning the section. A second scrubbed tween moves the stroke colour `--color-ink` → `--color-terracotta` → `#4B3BF0` down its length via a `<linearGradient>` whose stops are animated (a plain `stroke` tween cannot express a gradient along the path).

Because the gradient uses violet, `Timeline.tsx` needs the violet hex — add it as a **gradient stop inside the SVG only** and add `src/components/site/Timeline` to the `check:burst` allow-list, with a comment in the script recording why.

- [ ] **Step 2: Build the five nodes**

```
01 SHOW UP           02 FIND YOUR PEOPLE      03 BUILD SOMETHING REAL
04 SHIP IT PUBLICLY  05 LEAVE WITH PROOF
```

Alternating left/right of the spine. Left rail — "where you are" — small mono in `--color-ink-60`. Right — "where you're going" — large Fraunces in `--color-terracotta`.

Each node gets its **own** `ScrollTrigger` positioned on its real geometry (`trigger: nodeEl, start: 'top 70%'`), not offsets within one shared timeline, so nodes fire exactly when the drawn line reaches them at any viewport height. On fire: the node's `<Arrow />` cap scales in with `back.out(2)` and its text reveals through a mask.

- [ ] **Step 3: Land it on the footer**

The section ends flush against the violet footer with no gap, the spine running into it. Verify at 1440×900 and at 1280×2000 that there is no seam.

- [ ] **Step 4: Verify**

```bash
node scripts/filmstrip.mjs / timeline 14
```

Consecutive frames must show the spine progressively longer. If it is fully drawn in the first frame the scrub is misconfigured; if it never completes, the trigger `end` is beyond the section.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: scroll-drawn timeline spine with per-node geometry triggers"
```

---

# Checkpoint 4 — Transitions and About

### Task 16: The page transition system

**Files:**
- Create: `src/components/motion/TransitionProvider.tsx`, `src/components/motion/TransitionLink.tsx`, `src/app/template.tsx`
- Modify: `src/app/layout.tsx`, `src/components/site/Nav.tsx`, `src/components/site/Footer.tsx`, `src/components/site/EventRail.tsx`

**Interfaces:**
- Produces:
  - `<TransitionProvider>` — renders the overlay panel and exposes `useTransition(): { playExit(href, label, fromRect?): Promise<void>; playEnter(): void }`.
  - `<TransitionLink href label fromRect? >` — a `next/link` wrapper.
  - `app/template.tsx` — runs `playEnter()` on every navigation.

- [ ] **Step 1: Build the overlay**

A `fixed inset-0 z-[90]` element with `className="burst"`, violet ground, `pointer-events: none` when idle. Inside it, **five** stacked lines of the destination label in Archivo Black, pink, each inside its own `overflow-hidden` mask. Sized so the five lines fill the viewport height, matching the approved reference.

- [ ] **Step 2: Implement the exit**

```
1. Lenis stop.
2. Panel clip-path inset(100% 0 0 0) -> inset(0 0 0 0), 0.65s, ease 'wcc'.
   When fromRect is supplied, the panel instead starts at that exact rect
   (set via gsap.set with top/left/width/height) and grows to full-bleed.
3. The five label lines stagger up from y:110% to y:0, 0.05s apart,
   starting 0.25s into the panel move.
4. Resolve the promise.
```

`TransitionLink` uses `onNavigate={(e) => { e.preventDefault(); playExit(...).then(() => router.push(href)); }}`. `useRouter` comes from `next/navigation`.

- [ ] **Step 3: Implement the enter**

`src/app/template.tsx` is a client component that remounts on every navigation. On mount it calls `playEnter()`:

```
1. The five lines stagger out upward.
2. Panel clip-path inset(0) -> inset(0 0 100% 0), clipping away to the top.
3. Lenis start; then ScrollTrigger.refresh() exactly once, after the panel
   has fully cleared. Refreshing while the panel is mid-move measures the
   wrong layout and corrupts every pinned trigger on the incoming page.
```

- [ ] **Step 4: Handle back and forward**

Browser back/forward do not fire `onNavigate`. Add a `popstate` listener in `TransitionProvider` that plays the **enter half only**, so history navigation still resolves rather than snapping.

- [ ] **Step 5: Wire the Flip handoff from the event rail**

In `EventRail`, when a card is clicked, capture the card's rect with `Flip.getState(cardEl)` / `cardEl.getBoundingClientRect()` and pass it as `fromRect`. The panel then grows from exactly where the card was, so the navigation is physically continuous.

- [ ] **Step 6: Swap every internal link**

Replace `next/link` with `TransitionLink` in `Nav`, `NavOverlay`, `Footer`, `EventRail`, and anywhere else internal. Each needs a `label` — `EVENTS`, `ABOUT`, the event title, `HOME`.

- [ ] **Step 7: Add the reduced-motion path**

Under `useReducedMotion()`, both halves collapse to a 150ms opacity cross-fade with no line choreography.

- [ ] **Step 8: Verify**

By hand, and carefully — this is the most breakable system in the build:

- Home → Events → About → Home. Every transition shows the five repeated lines.
- Clicking a centred rail card grows the panel **from the card**, not from the bottom.
- Browser back and forward both animate and land correctly.
- After every transition, scroll behaviour on the new page is correct and the rail's pin still works — a missing or mistimed `ScrollTrigger.refresh()` shows up here.
- Double-click a link rapidly: it must not queue two transitions or strand the overlay. Guard with an `isTransitioning` ref.
- Reduced motion gives the cross-fade.

Then:

```bash
node scripts/filmstrip.mjs /about about 6
npx tsc --noEmit && npx eslint . && npm run check:burst
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: GSAP page-transition system with repeated-line panel and Flip handoff"
```

---

### Task 17: About page

**Files:**
- Create: `src/app/about/page.tsx`, `src/components/site/BurstBreak.tsx`

- [ ] **Step 1: Build the editorial body**

Long-form, drawn from `getSite().manifesto` plus prose written for this page. A drop-cap on the first paragraph (`::first-letter` at ~5.5 lines, Fraunces, `--color-terracotta`, `float: left`). Marginalia in an outer column at staggered scroll offsets, matching the manifesto's treatment.

Include a short community timeline (founding, first event, where it is going) as a simple editorial list — **stated as intentions and plans, never as verified achievements**, since all of it is placeholder.

- [ ] **Step 2: Build the photo grid**

A grid of tiles that scatter slightly on hover: on pointer move within the grid, each tile translates by a damped amount proportional to its distance from the pointer, applied through the GSAP ticker with a lerp — no new RAF.

Use the generative `<Poster />` output as the tile content, since there are no real photographs to show and placeholder stock imagery would misrepresent the community.

- [ ] **Step 3: Build the single burst interruption**

`src/components/site/BurstBreak.tsx` — one full-bleed violet section, `className="burst"`, carrying a manifesto line in giant outlined Archivo with two `<Marquee />` tape bars crossing it at opposing angles. Exactly one of these on the page: it is the only place `/about` is allowed burst colour.

- [ ] **Step 4: Add metadata**

Export `metadata` with a title and description for `/about`.

- [ ] **Step 5: Verify**

```bash
npm run check:burst && node scripts/filmstrip.mjs /about about 12
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: about page with drop-cap editorial body and one burst interruption"
```

---

# Checkpoint 5 — Events

### Task 18: Event detail pages

**Files:**
- Create: `src/app/events/[slug]/page.tsx`, `src/app/events/[slug]/opengraph-image.tsx`, `src/app/not-found.tsx`

**Interfaces:**
- Consumes: `getAllEvents`, `getEventBySlug`, `getAdjacentEvent`, `formatEventDate`, `formatEventTime`, `eventDurationHours`, `<Poster />`.

- [ ] **Step 1: Generate the routes statically**

```tsx
export async function generateStaticParams() {
  return getAllEvents().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};
  return {
    title: `${event.title} — We Code Coders`,
    description: event.summary,
    openGraph: { title: event.title, description: event.summary },
  };
}
```

In the page, `notFound()` when the slug misses. Note `params` is a Promise in Next 16 — it must be awaited.

- [ ] **Step 2: Build the layout**

- Full-bleed `<Poster />` header parallaxing at a 0.2 ratio on a `scrub` trigger, with the mono `kicker` above and the title in Archivo condensed over it.
- A mono spec table: date (`formatEventDate`), time (`formatEventTime`), duration (`eventDurationHours`), venue name and city, format, and `forWho`.
- `description` paragraphs in Fraunces at a 65–72ch measure, drop-cap on the first.
- A stats strip, rendered only when `event.stats` is present.
- Tags as mono chips.
- `event.links`, rendered only when present and non-empty.
- A "next event" `TransitionLink` from `getAdjacentEvent`.
- **No signup CTA.** A single "notify me when the next one drops" that links to the first entry of `getSite().socials` — and which is **omitted entirely if socials is empty**, because a link to nowhere is a broken link.

- [ ] **Step 3: Add the OG image**

`opengraph-image.tsx` using `ImageResponse` at 1200×630, rendering the event title and date over the poster's ground colour. Keep it to system-safe styling — `ImageResponse` supports only a subset of CSS and no external fonts unless they are fetched and passed explicitly.

- [ ] **Step 4: Build not-found**

`src/app/not-found.tsx` in the site's voice, with a `TransitionLink` back to `/` and to `/events`. It must not be blank or default.

- [ ] **Step 5: Verify**

```bash
npm run build
```

The build output must list all seven `/events/<slug>` routes as statically generated. Then visit each, plus a deliberately wrong slug to confirm the 404.

```bash
node scripts/filmstrip.mjs /events/<first-slug> detail 8
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: statically generated event detail pages with OG images"
```

---

### Task 19: Events page — WebGL ring

**Files:**
- Create: `src/app/events/page.tsx`, `src/components/canvas/Scene.tsx`, `src/components/canvas/EventRing.tsx`, `src/components/canvas/EventPlane.tsx`, `src/components/canvas/shaders/ring.vert`, `src/components/canvas/shaders/ring.frag`, `src/components/canvas/RingFallback.tsx`, `src/components/canvas/useRingRotation.ts`, `src/lib/ring.ts`, `src/lib/ring.test.ts`

**Interfaces:**
- Produces:
  - `slotAngle(index, count): number`, `nearestSlot(rotation, count): number`, `angularDistance(a, b): number` — PURE, in `src/lib/ring.ts`.
  - `<Scene events />`, `<RingFallback events />`.

- [ ] **Step 1: Write the failing test for the ring maths**

Create `src/lib/ring.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { angularDistance, nearestSlot, slotAngle } from './ring';

const TAU = Math.PI * 2;

describe('ring maths', () => {
  it('spaces slots evenly around the circle', () => {
    expect(slotAngle(0, 8)).toBeCloseTo(0, 6);
    expect(slotAngle(2, 8)).toBeCloseTo(TAU / 4, 6);
  });

  it('finds the nearest slot', () => {
    expect(nearestSlot(0.01, 8)).toBe(0);
    expect(nearestSlot(TAU / 8 + 0.01, 8)).toBe(1);
  });

  it('wraps when finding the nearest slot', () => {
    expect(nearestSlot(TAU - 0.01, 8)).toBe(0);
    expect(nearestSlot(TAU * 3 + 0.01, 8)).toBe(0);
  });

  it('measures the short way round', () => {
    expect(angularDistance(0.1, TAU - 0.1)).toBeCloseTo(0.2, 6);
    expect(angularDistance(0, Math.PI)).toBeCloseTo(Math.PI, 6);
  });

  it('never returns a distance greater than half a turn', () => {
    for (let i = 0; i < 100; i++) {
      const a = Math.random() * TAU * 4, b = Math.random() * TAU * 4;
      expect(angularDistance(a, b)).toBeLessThanOrEqual(Math.PI + 1e-9);
    }
  });
});
```

- [ ] **Step 2: Run — expect FAIL — then implement**

Create `src/lib/ring.ts`:

```ts
const TAU = Math.PI * 2;

export function slotAngle(index: number, count: number): number {
  return (index / count) * TAU;
}

export function nearestSlot(rotation: number, count: number): number {
  const step = TAU / count;
  const wrapped = ((rotation % TAU) + TAU) % TAU;
  return Math.round(wrapped / step) % count;
}

/** Shortest angular distance between two angles, always in [0, PI]. */
export function angularDistance(a: number, b: number): number {
  const d = ((((a - b) % TAU) + TAU + Math.PI) % TAU) - Math.PI;
  return Math.abs(d);
}
```

Re-run: expect 5 passing.

- [ ] **Step 3: Build the shader**

`ring.vert` — barrel-curve the plane on its local X by displacing Z with `position.x * position.x * uCurve`, and pass `vUv`.

`ring.frag` — sample the poster texture three times with a UV offset scaled by `uVelocity` for the RGB split, mix toward greyscale by `uDistance` (angular distance from focus), add a violet→pink fresnel rim scaled by `uFocus`, and add static grain from a hash of `vUv`:

```glsl
uniform sampler2D uTex;
uniform float uVelocity;   // rad/sec, drives the smear
uniform float uDistance;   // 0 at focus, 1 far away
uniform float uFocus;      // 1 for the focused plane
varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  float amt = clamp(uVelocity * 0.02, 0.0, 0.05);
  float r = texture2D(uTex, vUv + vec2(amt, 0.0)).r;
  float g = texture2D(uTex, vUv).g;
  float b = texture2D(uTex, vUv - vec2(amt, 0.0)).b;
  vec3 col = vec3(r, g, b);

  float grey = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(grey), clamp(uDistance, 0.0, 1.0) * 0.85);

  float edge = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 3.0);
  vec3 rim = mix(vec3(0.294, 0.231, 0.941), vec3(0.961, 0.788, 0.816), vUv.y);
  col += rim * edge * uFocus * 0.35;

  col += (hash(vUv * 900.0) - 0.5) * 0.05;
  gl_FragColor = vec4(col, 1.0);
}
```

- [ ] **Step 4: Build the ring**

Planes at `slotAngle(i, n)` around a vertical cylinder of radius ~4 units, each rotated to face the axis. Camera at the centre looking outward, or just outside looking in — pick whichever reads better and note the choice in a comment.

Poster textures: render each `<Poster />` to a texture. The simplest reliable route is drei's `<RenderTexture>` wrapping the poster as HTML is **not** available — instead render the poster to an offscreen canvas via a small `posterToCanvas(event)` helper that draws the same composition with the Canvas 2D API, or pre-render posters to static images at build time. Choose the offscreen-canvas route and keep `layouts.ts` as the shared source of truth for colours so the DOM poster and the texture agree.

Rotation state lives in `useRingRotation.ts`:
- Scroll via `useLenis` and pointer drag both add to angular velocity.
- Release applies exponential damping.
- When `|velocity| < 0.05`, a GSAP tween eases rotation to `slotAngle(nearestSlot(...))` with `expo.out`. Any new input kills that tween.
- `frameloop="demand"`: call `invalidate()` while velocity is non-zero, and stop once settled.

- [ ] **Step 5: Build the DOM info panel**

**Not canvas text.** A real HTML side panel showing the focused event's title, `formatEventDate`, venue, tags and summary, plus a `TransitionLink`. On each snap the lines swap out and in through masks.

This keeps event text selectable, translatable, in the accessibility tree and visible to crawlers.

- [ ] **Step 6: Build the fallback and the crawler list**

`RingFallback.tsx` — a CSS-3D coverflow with the same contract: scroll/drag rotate, snap on rest, focus, click through. Same DOM panel.

Mount the fallback when any of: `useReducedMotion()`, `(max-width: 900px)` with `(pointer: coarse)`, or a startup probe that samples frame times for ~500ms and finds the device cannot hold 50fps.

Independently of both, the page always renders a visually-hidden `<ul>` of `<TransitionLink>`s — one per event — so the route works with no JS and no WebGL at all. Keyboard users tab through these; arrow keys rotate the ring.

- [ ] **Step 7: Verify**

```bash
npx vitest run && npm run build
node scripts/filmstrip.mjs /events events 10
```

Then by hand: drag and confirm inertia; stop and confirm it snaps to a slot; confirm the panel text changes on each snap; confirm the RGB smear appears while spinning and resolves at rest; click the focused plane and confirm it fills the viewport and routes through.

Disable JavaScript entirely and confirm `/events` still lists every event as working links. Emulate reduced motion and confirm the fallback mounts.

Check the browser console for `WebGLRenderer: Context Lost` and for any leaked contexts after navigating away and back five times — R3F should dispose on unmount.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: WebGL event ring with DOM info panel, snap, and non-WebGL fallbacks"
```

---

# Checkpoint 6 — Launch readiness

### Task 20: Link integrity, accessibility, performance, deploy

**Files:**
- Create: `scripts/check-links.mjs`, `README.md`
- Modify: `package.json`

- [ ] **Step 1: Write the dead-link crawler**

Create `scripts/check-links.mjs` — start at `/`, collect every `href` starting with `/`, request each against the running dev server, and fail on any non-200. Also fail on any `href="#"` or empty `href`, which are stub links by another name.

```bash
npm run dev &
node scripts/check-links.mjs
```

Expected: every internal link resolves. **Fix by deleting the link, not by creating a stub page** — the requirement is no unnecessary pages and no broken links.

- [ ] **Step 2: Add the composite check script**

```json
"scripts": {
  "check": "tsc --noEmit && eslint . && vitest run && node scripts/check-burst.mjs"
}
```

Run `npm run check`. All four must pass.

- [ ] **Step 3: Accessibility pass**

Walk every route with the keyboard only: nav, overlay, rail cards, ring, footer. Confirm visible focus rings everywhere (do not remove outlines without replacing them), that the overlay traps and restores focus, and that tab order is sane.

Run axe DevTools on `/`, `/events`, `/events/<slug>`, `/about` and fix every violation. Verify contrast on pink-on-violet is used at display sizes only and never for body copy.

Confirm with JS disabled that all four routes render legible content.

- [ ] **Step 4: Performance pass**

Lighthouse on each route. Targets: LCP < 2.5s, CLS < 0.05.

- If CLS is high, the font swap is shifting layout — add `adjustFontFallback` / `size-adjust` fallbacks.
- If LCP is high on `/`, the loader is blocking paint — it must overlay content, not gate rendering.
- Confirm the R3F canvas idles at `frameloop="demand"` by watching the Performance panel show no work when the ring is at rest.

- [ ] **Step 5: Write the README**

Cover: what the site is; how to run it; **that every event and community fact in `src/data/` is placeholder and must be replaced before launch**; how to add an event; how to supply a real poster via `posterImage`; the four hard motion rules from Global Constraints; and that `scripts/filmstrip.mjs` — not full-page screenshots — is how animation is verified.

- [ ] **Step 6: Final full verification**

```bash
npm run check
npm run build
npm run start &
node scripts/check-links.mjs
node scripts/filmstrip.mjs / home 16
node scripts/filmstrip.mjs /events events 10
node scripts/filmstrip.mjs /about about 10
```

Review every filmstrip frame. Anything blank is a trigger that did not fire.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: link integrity, accessibility, performance pass, and README"
```

- [ ] **Step 8: Deploy**

Deployment sends this site to the public internet. **Confirm with the user before running it** — and confirm they accept that `src/data/` still holds placeholder content, or replace it first.

```bash
npx vercel --prod
```

---

## Notes for the executor

- The riskiest tasks are 14 (rail), 16 (transitions) and 19 (WebGL). Each has pure, unit-tested maths extracted deliberately so that when the visual layer misbehaves you can tell whether the arithmetic or the wiring is wrong.
- If a filmstrip frame is blank, suspect in this order: the trigger never fired, `ScrollTrigger.refresh()` was not called after a transition, or a previous route leaked a pin.
- Content is placeholder throughout. If asked to make the site "more convincing", do not invent named people, partner organisations or verified outcomes — improve the writing instead.
