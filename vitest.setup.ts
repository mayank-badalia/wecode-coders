/*
  jsdom ships no matchMedia, but ScrollTrigger.register() calls it during
  plugin registration, and gsap.matchMedia() is central to how this project
  handles responsive and reduced-motion behaviour. Without this polyfill any
  test that imports the motion layer fails at import time.

  Defaults to "does not match" so tests see the desktop, full-motion path
  unless they override it.
*/
import { vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// jsdom has no layout engine, so ResizeObserver is absent too. Several motion
// components observe their own size.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
