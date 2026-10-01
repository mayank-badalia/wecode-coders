"use client";

import { Canvas } from "@react-three/fiber";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { useTransition } from "@/components/motion/TransitionProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/components/motion/gsap";
import { setCursorTarget } from "@/components/motion/Cursor";
import { useLenis, useReducedMotion } from "@/components/motion/MotionProvider";
import { Arrow } from "@/components/site/Arrow";
import { formatEventDate } from "@/lib/format";
import type { PublicEvent } from "@/lib/types";
import { groundFor } from "@/components/poster/layouts";
import { cameraZFor, EventRing } from "./EventRing";
import { RingFallback } from "./RingFallback";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "clamp(0.72rem, 0.9vw, 0.76rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

/**
 * Decides whether this device should run the WebGL ring at all.
 *
 * Two ways to fail: the visitor asked for reduced motion, or the browser
 * cannot give us a context at all. Either mounts the CSS fallback instead.
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
      the visitor asked for less motion, or the browser cannot give us a
      context at all. Frame rate is handled by degrading resolution while
      running, not by refusing to start.

      Small touch screens used to be excluded outright, which meant a phone
      got the CSS coverflow — a flat row of cards with none of the ring's
      curve, and none of the camera travel that takes the visitor inside it.
      The two looked like different websites. They now run the same scene, at
      a lower pixel ratio and with smaller textures; see the Canvas below and
      the CAP in posterCanvas.

      A device that reports 2GB or less is still sent to the fallback. That is
      a real constraint rather than a guess about touch: nine textures and a
      WebGL context on 2GB is how you get a tab killed mid-scroll.
    */
    const decide = () => {
      if (reduced) return setOk(false);

      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      if (typeof memory === "number" && memory <= 2) return setOk(false);

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

export function EventsExperience({ events }: { events: PublicEvent[] }) {
  const router = useRouter();
  const { playExit, isBusy } = useTransition();
  const [focused, setFocused] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  const reduced = useReducedMotion();
  const webgl = useCanRunWebGL(reduced);
  /*
    Touch, decided once on the client.

    Read in an effect rather than during render: matchMedia does not exist on
    the server, and branching on it while rendering would make the first
    client paint disagree with the markup that came down the wire.
  */
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    webglRef.current = webgl;
  }, [webgl]);

  /*
    The cursor bubble belongs to a poster, not to the page.

    The whole stage used to carry data-cursor, so the bubble sat on screen
    permanently in one flat colour no matter what was under the pointer. It is
    now driven straight from the ring's raycast, and takes that event's own
    ground colour.

    Driven from the raycast callback rather than from an effect on `hovered`.
    Going through React state put a full render and a passive effect between
    the frame that detected the poster and the frame that moved the bubble —
    which is why it lagged, and why it sometimes never arrived at all when two
    hover changes landed inside one render pass and the intermediate value was
    dropped. The bubble is not React state; it is a GSAP tween on a fixed
    element, so it is told directly. `hovered` is still tracked, because the
    stage's CSS cursor reads it, but nothing time-critical waits on it now.
  */
  const handleHoverChange = useCallback(
    (index: number | null) => {
      setHovered(index);

      const target = index === null ? null : events[index];
      if (!target) {
        setCursorTarget(null);
        return;
      }
      /*
        The bubble takes the poster's own ground, and a contrasting ring keeps
        it readable on top of it.

        Inverting it instead collapsed the whole set to two colours — every
        ground's foreground is either paper or ink — so the bubble stopped
        changing between events, which was the point of colouring it at all.
      */
      const ground = groundFor(target);
      setCursorTarget({
        label: target.locked ? "Locked" : "Open",
        color: ground.bg,
        ink: ground.fg,
        ring: ground.fg,
      });
    },
    [events],
  );

  // Leaving the route, the window, or the tab must all release the bubble.
  useEffect(() => {
    const release = () => {
      input.current.pointerOver = false;
    };
    window.addEventListener("blur", release);
    document.addEventListener("pointerleave", release);
    return () => {
      window.removeEventListener("blur", release);
      document.removeEventListener("pointerleave", release);
      setCursorTarget(null);
    };
  }, []);
  const stage = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const input = useRef({ drag: 0, scroll: 0, nudge: 0, dragging: false, pointerOver: false });
  const lastPointerX = useRef(0);
  const lastPointerY = useRef(0);
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

  /*
    Travel accumulated toward the next event, for the non-WebGL path.

    The fallback has no ring to spin, so it steps whole events. Accumulating
    across input events and subtracting a threshold at a time is what makes a
    long swipe move several events and a short one move exactly one — the drag
    handler used to test each pointermove's own delta, so a fast swipe with
    30px deltas stepped on every frame and a slow one never stepped at all.
  */
  const fallbackTravel = useRef(0);
  const advanceFallback = useCallback(
    (delta: number, threshold: number) => {
      fallbackTravel.current += delta;
      while (Math.abs(fallbackTravel.current) >= threshold) {
        const dir = fallbackTravel.current > 0 ? 1 : -1;
        step(dir);
        fallbackTravel.current -= dir * threshold;
      }
    },
    [step],
  );

  useEffect(() => {
    lenis?.stop();

    const { body, documentElement: html } = document;
    const prev = { bodyOverflow: body.style.overflow, htmlOverflow: html.style.overflow };
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Without a ring to spin, the fallback steps a whole event once enough
      // wheel travel has accumulated.
      if (webglRef.current === false) {
        advanceFallback(e.deltaY, 240);
        return;
      }

      // Scrolling down carries the posters to the right, scrolling up to the
      // left — the direction the content travels, not the direction the
      // wheel turns.
      input.current.scroll -= e.deltaY * 0.0042;
    };

    let lastTouchY = 0;
    let lastTouchX = 0;
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0]?.clientY ?? 0;
      lastTouchX = e.touches[0]?.clientX ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0;
      const x = e.touches[0]?.clientX ?? 0;
      // Positive means the finger moved up, or left.
      const dy = lastTouchY - y;
      const dx = lastTouchX - x;
      lastTouchY = y;
      lastTouchX = x;

      /*
        The fallback needs its own branch here, exactly as the wheel does.

        Without it this wrote to input.current.scroll, which only the WebGL
        ring ever reads — and the ring is deliberately off on a small touch
        screen. So every phone on the site had a poster carousel that did
        nothing at all when you dragged a finger down it.

        Either axis moves it: the layout is a coverflow, and swiping sideways
        across it is the obvious gesture even though the page scrolls down.
      */
      if (webglRef.current === false) {
        /*
          Only when no pointer drag is running. A touch fires pointerdown, so
          the pointer handler is normally the one stepping the fallback — both
          acting on the same gesture stepped it twice per swipe.
        */
        if (!input.current.dragging) {
          advanceFallback(Math.abs(dx) > Math.abs(dy) ? dx : dy, 80);
        }
        return;
      }

      /*
        A touch drags the ring further than a wheel tick does.

        A thumb swipe is a couple of hundred pixels at most, where a trackpad
        will happily emit thousands — at the wheel's rate the ring barely
        moved and the whole thing felt stuck.
      */
      input.current.scroll -= dy * 0.016;
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
  }, [lenis, advanceFallback]);


  // Pointer drag, used by both the WebGL ring and the fallback.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;

    const enter = () => {
      input.current.pointerOver = true;
    };
    const leave = () => {
      input.current.pointerOver = false;
    };

    const down = (e: PointerEvent) => {
      input.current.dragging = true;
      lastPointerX.current = e.clientX;
      lastPointerY.current = e.clientY;
      pointerStart.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      /*
        Presence is re-asserted by movement, not only by pointerenter.

        Relying on enter and leave alone meant a single missed or stray leave
        killed hover until the pointer physically exited the stage and came
        back — the bubble simply stopped appearing. Any movement over the
        stage proves the pointer is here.
      */
      input.current.pointerOver = true;

      if (!input.current.dragging) return;
      const dx = e.clientX - lastPointerX.current;
      const dy = e.clientY - lastPointerY.current;
      lastPointerX.current = e.clientX;
      lastPointerY.current = e.clientY;

      /*
        Both axes turn the ring on a touch screen.

        A finger on a phone swipes up and down — that is what "scroll" means
        there — and a vertical swipe has almost no horizontal delta. The ring
        only ever read this handler's horizontal component, so a vertical
        swipe moved it by nothing at all.

        The touchmove handler further up does write vertical travel, but into
        `scroll`, and the ring ignores `scroll` for as long as a drag is in
        progress. A touch fires pointerdown, so a drag is always in progress:
        every vertical swipe on the site was being written to a field nothing
        was reading. Feeding it through `drag` puts it on the path that is
        actually live, and leaves the scroll write as the fallback for when
        the browser cancels the pointer mid-gesture.
      */
      input.current.drag += dx * 0.005 + (coarse ? dy * 0.008 : 0);
      /*
        Dragging right, or swiping down, carries the posters forward — so both
        are negated before the accumulator. Whichever axis the finger is
        actually travelling on wins, the same rule the ring uses.
      */
      if (!webgl) {
        const vertical = coarse && Math.abs(dy) > Math.abs(dx);
        advanceFallback(vertical ? -dy : -dx, 60);
      }
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
      // A locked event still opens — to its locked page, which says only that.
      const label = target.locked ? "Locked" : target.title;
      void playExit(label).then(() => router.push(`/events/${target.slug}`));
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [webgl, coarse, advanceFallback, events, router, playExit, isBusy]);

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

      style={{
        position: "relative",
        height: "100svh",
        background: "var(--color-ink)",
        color: "var(--color-paper)",
        overflow: "hidden",
        /*
          The stage owns every touch gesture.

          "pan-y" told the browser that vertical drags were its to handle. The
          page does not scroll here — the body is fixed and a scroll is a
          rotation — so there was nothing for it to pan, but it still claimed
          the gesture and fired pointercancel partway through, dropping the
          drag it had already started.
        */
        touchAction: "none",
        cursor: hovered === null ? "grab" : "pointer",
      }}
    >
      {/*
        The Canvas is wrapped rather than classed directly.

        React Three Fiber writes `position: relative; width: 100%; height:
        100%` inline on its own wrapper, and an inline style beats every rule
        in the stylesheet — so `.ring-canvas { position: absolute; inset: 0 }`
        had never applied to it, and neither had the mobile rule that shrinks
        it to the top of the screen. On desktop that went unnoticed because
        filling the stage is what it should do anyway; on a phone the ring
        covered the whole viewport and ran underneath the copy. The CSS
        fallback looked correct throughout precisely because it is our own div
        with no inline style to lose to.

        Our div owns the box; R3F's fills it.
      */}
      {webgl === true && (
        <div className="ring-canvas">
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
          frameloop="always"
          camera={{ position: [0, 0.15, cameraZFor(events.length)], fov: 46 }}
          // Capped at 1.5 rather than 2: a retina panel at full DPR is four
          // times the pixels for no visible gain at this scale, and that
          // headroom is what keeps the ring smooth on ordinary laptops.
          /*
            Capped lower on a phone. A 1.5x ratio on a 3x panel is four times
            the fragments for detail nobody can resolve at arm's length, and
            it is the first thing to give on a mid-range Android.
          */
          dpr={coarse ? [1, 1.25] : [1, 1.5]}
          /*
            No multisampling on a phone. MSAA is the single most expensive
            thing in this scene on a mobile GPU, and at 1.25x on a 3x panel
            the edges it smooths are already sub-pixel.
          */
          gl={{ antialias: !coarse, powerPreference: "high-performance" }}
          style={{ width: "100%", height: "100%" }}
        >
          <EventRing
            events={events}
            focused={focused}
            onFocusChange={setFocused}
            onHoverChange={handleHoverChange}
            consumeInput={consumeInput}
          />
        </Canvas>
        </div>
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
          className="ring-panel"
          style={{
            position: "absolute",
            zIndex: 6,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "clamp(1.5rem, 4vw, 3rem)",
            pointerEvents: "none",
          }}
        >
          {event.locked ? (
            <>
              <div style={{ overflow: "hidden" }}>
                <p className="panel-line" style={{ ...mono, margin: 0, opacity: 0.6 }}>
                  {String(focused + 1).padStart(2, "0")} /{" "}
                  {String(events.length).padStart(2, "0")} — Locked
                </p>
              </div>
              <div style={{ overflow: "hidden" }}>
                <h2
                  className="panel-line"
                  style={{
                    margin: "0.3em 0 0",
                    fontFamily: "var(--font-editorial)",
                    fontSize: "clamp(1.6rem, 3.4vw, 3rem)",
                    lineHeight: 1.02,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Not announced yet.
                </h2>
              </div>
              <div style={{ overflow: "hidden" }}>
                <p
                  className="panel-line"
                  style={{
                    margin: "0.9em 0 0",
                    fontFamily: "var(--font-body)",
                    fontSize: "clamp(0.9rem, 1.2vw, 1.05rem)",
                    lineHeight: 1.5,
                    opacity: 0.7,
                  }}
                >
                  Registration opens when this one is announced.
                </p>
              </div>
            </>
          ) : (
            <>
          <div style={{ overflow: "hidden" }}>
            <p className="panel-line" style={{ ...mono, margin: 0, opacity: 0.8 }}>
              {String(focused + 1).padStart(2, "0")} /{" "}
              {String(events.length).padStart(2, "0")} — {event.kicker}
              {event.status === "past" && " — FINISHED"}
            </p>
          </div>

          <div style={{ overflow: "hidden" }}>
            <h2
              className="panel-line"
              style={{
                margin: "0.2em 0 0",
                fontFamily: "var(--font-display)",
                /*
                  Stepped down for a title with a long unbreakable word.

                  "TECHCIRCUIT" and "FUTURESTACK" are eleven characters with
                  nowhere to wrap, so at full size they overran the column and
                  the break-word below split them mid-word — "TECHCIRCUI" over
                  "T". A multi-word title of the same length is fine, because
                  it wraps at its spaces, so the test is the longest word
                  rather than the length of the whole title.

                  Set inline because the size beside it is: a clamp() in a
                  style attribute beats any rule that tries to override it,
                  and a half-inline, half-stylesheet pair of sizes is exactly
                  how this build has lost the argument before.
                */
                fontSize:
                  Math.max(...event.title.split(/\s+/).map((w) => w.length)) > 9
                    ? "clamp(1.35rem, 2.7vw, 2.4rem)"
                    : "clamp(1.7rem, 3.6vw, 3.2rem)",
                fontWeight: 700,
                lineHeight: 0.96,
                textTransform: "uppercase",
                // Last resort, for a title longer than the step-down handles:
                // wrap inside the panel rather than run out across whichever
                // poster is behind it.
                overflowWrap: "break-word",
              }}
            >
              {event.title}
            </h2>
          </div>

          <div style={{ overflow: "hidden" }}>
            <p className="panel-line" style={{ ...mono, margin: "0.6em 0 0", opacity: 0.75 }}>
              {formatEventDate(event.startsAt, event.endsAt)}
              {event.venue.place ? ` — ${event.venue.place}` : ""}
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
            </>
          )}
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
        Drag or scroll{" "}
        <Arrow style={{ width: 14, height: 14, display: "inline-block", verticalAlign: "middle" }} />
      </div>
    </div>
  );
}
