"use client";

import { Canvas } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { useTransition } from "@/components/motion/TransitionProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/components/motion/gsap";
import { useLenis, useReducedMotion } from "@/components/motion/MotionProvider";
import { Arrow } from "@/components/site/Arrow";
import { formatEventDate } from "@/lib/format";
import type { Event } from "@/lib/types";
import { CAMERA_Z, EventRing } from "./EventRing";
import { RingFallback } from "./RingFallback";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "clamp(0.62rem, 0.9vw, 0.76rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

/**
 * Decides whether this device should run the WebGL ring at all.
 *
 * Three ways to fail: the visitor asked for reduced motion, the device is a
 * small touch screen, or a short frame-time sample shows it cannot hold a
 * usable rate. Any of them mounts the CSS fallback instead.
 */
function useCanRunWebGL(reduced: boolean) {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    /*
      WebGL runs unless there is a real reason it cannot.

      There used to be a startup frame-rate probe here that demanded 50fps over
      a 500ms sample. It sampled during page entry — while the loader, Lenis
      and the route transition were all still running — so on a retina display
      it routinely measured below the threshold and silently dropped the whole
      ring to the CSS fallback. Headless browsers always hit 60fps, so it
      looked fine in automation and was broken on real machines.

      The remaining checks are the ones that are actually knowable up front:
      the visitor asked for less motion, the device is a small touch screen, or
      the browser cannot give us a context at all. Frame rate is handled by
      degrading resolution while running, not by refusing to start.
    */
    const decide = () => {
      if (reduced) return setOk(false);

      if (window.matchMedia("(max-width: 900px) and (pointer: coarse)").matches) {
        return setOk(false);
      }

      const probe = document.createElement("canvas");
      const gl =
        probe.getContext("webgl2") ??
        probe.getContext("webgl") ??
        probe.getContext("experimental-webgl");

      if (!gl) return setOk(false);
      (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();

      setOk(true);
    };

    /*
      Deferred by a timeout, not by requestAnimationFrame.

      rAF does not fire in a background tab, so opening the page in a tab that
      was not focused left the decision permanently pending and rendered
      neither the canvas nor the fallback — a blank page whose cause was
      invisible in any foreground test. A timeout still defers the state
      update out of the effect body, which is all that was needed.
    */
    const id = window.setTimeout(decide, 0);
    return () => window.clearTimeout(id);
  }, [reduced]);

  return ok;
}

export function EventsExperience({ events }: { events: Event[] }) {
  const router = useRouter();
  const { playExit, isBusy } = useTransition();
  const [focused, setFocused] = useState(0);
  const [inside, setInside] = useState(0);
  const [active, setActive] = useState(true);

  // A hidden tab should not be rendering a 3D scene.
  useEffect(() => {
    const onVisibility = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  const reduced = useReducedMotion();
  const webgl = useCanRunWebGL(reduced);
  useEffect(() => {
    webglRef.current = webgl;
  }, [webgl]);
  const stage = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const input = useRef({ drag: 0, scroll: 0, nudge: 0, dragging: false });
  const lastPointerX = useRef(0);
  const pointerStart = useRef({ x: 0, y: 0 });
  const lenis = useLenis();
  // Read inside the listeners, which are bound once.
  const webglRef = useRef<boolean | null>(null);
  // Mirrors `focused` for the pointer handlers, which are bound once and must
  // not be torn down and rebound on every rotation of the ring.
  const focusedRef = useRef(0);
  useEffect(() => {
    focusedRef.current = focused;
  }, [focused]);

  // Hands the ring everything accumulated since its last frame, and clears it.
  const consumeInput = useCallback(() => {
    const snapshot = { ...input.current };
    input.current.drag = 0;
    input.current.scroll = 0;
    input.current.nudge = 0;
    return snapshot;
  }, []);

  /*
    The page does not scroll on this route: every scroll is a rotation.

    Previously the document was taller than the viewport, so scrolling carried
    the visitor past the ring to the footer while also spinning it — which is
    why it felt stuck rather than driven. Lenis is stopped, the body is fixed
    at its current offset, and wheel and touch events are consumed here.
  */
  const step = useCallback(
    (dir: number) => {
      // In WebGL mode the ring owns the focused index, so a key press has to
      // move the ring; setting state alone would be overwritten on the next
      // frame. The fallback has no ring, so it uses the state directly.
      input.current.nudge += dir;
      setFocused((f) => (f + dir + events.length) % events.length);
    },
    [events.length],
  );

  useEffect(() => {
    lenis?.stop();

    const { body, documentElement: html } = document;
    const prev = { bodyOverflow: body.style.overflow, htmlOverflow: html.style.overflow };
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);

    let fallbackAccum = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Without a ring to spin, the fallback steps a whole event once enough
      // wheel travel has accumulated.
      if (webglRef.current === false) {
        fallbackAccum += e.deltaY;
        if (Math.abs(fallbackAccum) > 240) {
          step(fallbackAccum > 0 ? 1 : -1);
          fallbackAccum = 0;
        }
        return;
      }

      // Scrolling down carries the posters to the right, scrolling up to the
      // left — the direction the content travels, not the direction the
      // wheel turns.
      input.current.scroll -= e.deltaY * 0.0042;
    };

    let lastTouchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0;
      input.current.scroll -= (lastTouchY - y) * 0.009;
      lastTouchY = y;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      body.style.overflow = prev.bodyOverflow;
      html.style.overflow = prev.htmlOverflow;
      lenis?.start();
    };
  }, [lenis, step]);


  // Pointer drag, used by both the WebGL ring and the fallback.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;

    const down = (e: PointerEvent) => {
      input.current.dragging = true;
      lastPointerX.current = e.clientX;
      pointerStart.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!input.current.dragging) return;
      const dx = e.clientX - lastPointerX.current;
      lastPointerX.current = e.clientX;
      input.current.drag += dx * 0.005;
      if (!webgl && Math.abs(dx) > 24) step(dx > 0 ? -1 : 1);
    };
    const up = (e: PointerEvent) => {
      input.current.dragging = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);

      /*
        A press that did not travel is a click on the focused poster.

        This is handled here rather than with a mesh click handler because the
        stage captures the pointer in order to drag, so React Three Fiber never
        receives a clean click of its own. Doing it at this level also means
        the CSS fallback behaves identically without a second code path.
      */
      const travelled = Math.hypot(
        e.clientX - pointerStart.current.x,
        e.clientY - pointerStart.current.y,
      );
      if (travelled > 6) return;
      if ((e.target as HTMLElement | null)?.closest("a")) return;

      const target = events[focusedRef.current];
      if (!target || isBusy()) return;
      void playExit(target.title).then(() => router.push(`/events/${target.slug}`));
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [webgl, step, events, router, playExit, isBusy]);

  // Keyboard: arrow keys rotate the ring, so it is operable without a pointer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") step(1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") step(-1);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  // Panel copy swaps through a mask on each snap.
  useGSAP(
    () => {
      if (reduced) return;
      const lines = gsap.utils.toArray<HTMLElement>(".panel-line", panel.current);
      if (lines.length === 0) return;
      gsap.fromTo(
        lines,
        { yPercent: 110, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: "wccOut" },
      );
    },
    { dependencies: [focused, reduced], scope: panel },
  );

  const event = events[focused];

  return (
    <div
      ref={stage}
      className="burst"
      data-nav-theme="dark"
      data-cursor="Drag"
      style={{
        position: "relative",
        height: "100svh",
        background: "var(--color-ink)",
        color: "var(--color-paper)",
        overflow: "hidden",
        touchAction: "pan-y",
        cursor: "grab",
      }}
    >
      {webgl === true && (
        <Canvas
          /*
            A continuous loop, not "demand".

            On demand, every input has to explicitly wake the renderer, and a
            single wheel tick accumulated into the input buffer without ever
            producing a frame — the ring sat frozen while the page insisted it
            had received the scroll. The ring is the whole page here, there is
            nothing else competing for frames, and continuous motion is the
            point. The loop is paused when the tab is hidden.
          */
          frameloop={active ? "always" : "never"}
          camera={{ position: [0, 0.15, CAMERA_Z], fov: 46 }}
          // Capped at 1.5 rather than 2: a retina panel at full DPR is four
          // times the pixels for no visible gain at this scale, and that
          // headroom is what keeps the ring smooth on ordinary laptops.
          dpr={[1, 1.5]}
          gl={{ antialias: true }}
          style={{ position: "absolute", inset: 0 }}
        >
          <EventRing
            events={events}
            focused={focused}
            onFocusChange={setFocused}
            onInsideChange={setInside}
            consumeInput={consumeInput}
          />
        </Canvas>
      )}

      {webgl === false && <RingFallback events={events} focused={focused} />}

      {/*
        The focused event's copy is DOM, not canvas text. That keeps it
        selectable, translatable, present in the accessibility tree and
        visible to crawlers — none of which canvas glyphs would be.
      */}
      {event && (
        <div
          ref={panel}
          aria-live="polite"
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            top: 0,
            zIndex: 6,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "min(42ch, 40vw)",
            padding: "clamp(1.5rem, 4vw, 3rem)",
            pointerEvents: "none",
            // A scrim from the left, so the copy reads over whichever poster
            // happens to be rotating behind it. Without it the title was
            // clipped mid-word by the neighbouring plane.
            background:
              "linear-gradient(90deg, var(--color-ink) 0%, color-mix(in srgb, var(--color-ink) 82%, transparent) 55%, transparent 100%)",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <p className="panel-line" style={{ ...mono, margin: 0, opacity: 0.8 }}>
              {String(focused + 1).padStart(2, "0")} /{" "}
              {String(events.length).padStart(2, "0")} — {event.kicker}
            </p>
          </div>

          <div style={{ overflow: "hidden" }}>
            <h2
              className="panel-line"
              style={{
                margin: "0.2em 0 0",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.7rem, 3.6vw, 3.2rem)",
                fontWeight: 700,
                lineHeight: 0.96,
                textTransform: "uppercase",
                // Long titles wrap inside the panel instead of running out
                // across whichever poster is behind it.
                overflowWrap: "break-word",
              }}
            >
              {event.title}
            </h2>
          </div>

          <div style={{ overflow: "hidden" }}>
            <p className="panel-line" style={{ ...mono, margin: "0.6em 0 0", opacity: 0.75 }}>
              {formatEventDate(event.startsAt, event.endsAt)} — {event.venue.place}
            </p>
          </div>

          <div style={{ overflow: "hidden" }}>
            <p
              className="panel-line"
              style={{
                margin: "1em 0 0",
                fontFamily: "var(--font-editorial)",
                fontSize: "clamp(1rem, 1.4vw, 1.25rem)",
                lineHeight: 1.45,
                opacity: 0.92,
              }}
            >
              {event.summary}
            </p>
          </div>

          {/*
            A real link, not just a clickable mesh. Clicking the poster works,
            but a canvas click target is invisible to keyboards and screen
            readers, so the same destination is offered as an anchor.
          */}
          <div style={{ overflow: "hidden", marginTop: "1.2em" }}>
            <TransitionLink
              href={`/events/${event.slug}`}
              label={event.title}
              className="panel-line"
              style={{
                ...mono,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6em",
                color: "var(--color-paper)",
                textDecoration: "none",
                borderBottom: "1px solid currentColor",
                paddingBottom: "0.3em",
                pointerEvents: "auto",
              }}
            >
              View event
              <Arrow style={{ width: 15, height: 15 }} />
            </TransitionLink>
          </div>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 5,
          padding: "calc(clamp(1rem, 2.2vw, 1.8rem) + 3.4rem) clamp(1.25rem, 4vw, 3rem) 0",
          ...mono,
          opacity: 0.7,
          pointerEvents: "none",
        }}
      >
        {inside > 0.65 ? "You are inside the ring" : "Drag or scroll"}{" "}
        <Arrow style={{ width: 14, height: 14, display: "inline-block", verticalAlign: "middle" }} />
      </div>
    </div>
  );
}
