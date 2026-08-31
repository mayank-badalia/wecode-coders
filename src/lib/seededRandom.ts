/**
 * Mulberry32 — a small, fast, well-distributed PRNG.
 *
 * Determinism is the whole point: generative posters are rendered on the
 * server and again on the client, so every varying value must come from a
 * seed rather than Math.random(). Otherwise the two renders disagree and
 * React reports a hydration mismatch.
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
  if (arr.length === 0) throw new Error("pick: cannot pick from an empty array");
  return arr[Math.floor(rng() * arr.length)]!;
}

export function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}
