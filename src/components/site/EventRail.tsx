"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { railMetrics } from "@/lib/rail";
import type { PublicEvent } from "@/lib/types";
import { Arrow } from "./Arrow";
import { EventRailCard } from "./EventRailCard";

export function EventRail({ events }: { events: PublicEvent[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const section = root.current;
      const trackEl = track.current;
      if (!section || !trackEl) return;

      const counter = section.querySelector<HTMLElement>(".rail-counter");
      const progressBar = section.querySelector<HTMLElement>(".rail-progress");

      /*
        Applies the metrics for every card.

        All reads happen before all writes, bar one noted below. Interleaving
        getBoundingClientRect with style writes forces a synchronous layout per
        card, which on a seven-card rail is seven forced reflows every scroll
        frame.
      */
      const applyMetrics = () => {
        const cards = gsap.utils.toArray<HTMLElement>(".rail-card", section);
        if (cards.length === 0) return;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const centre = vw / 2;

        const measured = cards.map((card) => {
          const r = card.getBoundingClientRect();
          return { card, left: r.left, dx: r.left + r.width / 2 - centre };
        });

        const metrics = measured.map(({ dx }) => railMetrics(dx, { width: vw, height: vh }));

        let nearest = 0;
        let nearestDist = Infinity;
        measured.forEach(({ dx }, i) => {
          if (Math.abs(dx) < nearestDist) {
            nearestDist = Math.abs(dx);
            nearest = i;
          }
        });

        measured.forEach(({ card, left }, i) => {
          const m = metrics[i];
          if (!m) return;

          gsap.set(card, {
            width: m.width,
            height: m.height,
            borderRadius: m.radius,
          });

          const poster = card.querySelector<HTMLElement>(".rail-poster");
          // A resting card should still read as colour, just quieter than the
          // one at centre; the metrics floor of 0.35 greyed them to mud.
          if (poster)
            gsap.set(poster, { filter: `saturate(${0.6 + m.saturation * 0.4})` });

          const wash = card.querySelector<HTMLElement>(".rail-wash");
          // Just enough to carry the title at rest, deepening only as the card
          // approaches full bleed and has real body copy to support. A heavy
          // constant wash turns the lime and pink posters to mud.
          if (wash) gsap.set(wash, { opacity: 0.3 + m.wash * 0.45 });

          const detail = card.querySelector<HTMLElement>(".rail-detail");
          if (detail) gsap.set(detail, { opacity: m.detail });

          /*
            Keep the full-bleed card's copy inside the viewport, not merely
            inside the card.

            A card wide enough to fill the screen sits with its left edge past
            the viewport's, because it keeps growing after the track has
            stopped translating. Its copy then renders off the left of the
            screen and the visitor reads the tail of a sentence.

            This is the one read that cannot be batched: the overhang depends
            on the width written a line above and on the track offset the
            scrub writes in this same frame, so an edge measured earlier is
            wrong by however far the rail moved. It is confined to the card at
            the centre, and only once the stale edge says it has crossed the
            viewport — one forced layout per frame at the end of the pin
            rather than one per card throughout. A card leaving to the left
            overhangs too, but its copy is meant to slide out of frame with
            it, so it is left alone.
          */
          const copy = card.querySelector<HTMLElement>(".rail-copy");
          if (copy) {
            // `left`, not padding: the box is positioned by left/right, and
            // padding is set with the shorthand this would clobber.
            const overhang =
              i === nearest && left < 0
                ? Math.max(0, -card.getBoundingClientRect().left)
                : 0;
            gsap.set(copy, { left: overhang });
          }

          const link = card.querySelector<HTMLElement>(".rail-link");
          // An unreadable card must not be clickable, and the cursor bubble
          // must not offer to open it either.
          if (link) link.style.pointerEvents = m.interactive ? "auto" : "none";
          card.setAttribute("data-cursor-active", m.interactive ? "true" : "false");

          // A full-bleed card is a dark ground, so the nav must read light
          // over it. The nav hit-tests for this attribute every frame.
          card.classList.toggle("burst", m.interactive);
          if (m.interactive) card.setAttribute("data-nav-theme", "dark");
          else card.removeAttribute("data-nav-theme");
        });

        if (counter) {
          counter.textContent = `${String(nearest + 1).padStart(2, "0")} / ${String(
            cards.length,
          ).padStart(2, "0")}`;
        }

        // The chrome sits over the cards, so it has to invert when a card
        // goes full-bleed and becomes its background.
        const overCard = measured.some(
          ({ dx }) => railMetrics(dx, { width: vw, height: vh }).interactive,
        );
        section.style.setProperty(
          "--rail-chrome",
          overCard ? "rgba(244,241,234,0.85)" : "rgba(19,28,51,0.6)",
        );
      };

      const mm = gsap.matchMedia();

      // ---- Desktop: pinned horizontal rail --------------------------------
      mm.add("(min-width: 901px) and (pointer: fine)", () => {
        if (reduced) {
          applyMetrics();
          return;
        }

        const distance = () => trackEl.scrollWidth - window.innerWidth;

        const tween = gsap.to(trackEl, {
          x: () => -distance(),
          ease: "none",
          /*
            On the tween, not the trigger. `scrub` keeps easing the track for
            about half a second after the trigger's progress has stopped
            changing, so metrics driven off the trigger are computed against
            an x the scrub is still about to move, and the last card settles
            with its copy offset by however far that tail carried it. A tween
            onUpdate runs after each tick has written x, and it keeps running
            through the tail.
          */
          onUpdate: applyMetrics,
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (progressBar) gsap.set(progressBar, { scaleX: self.progress });
            },
            onRefresh: applyMetrics,
          },
        });

        applyMetrics();

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });

      // ---- Touch / narrow: vertical stack, identical metrics --------------
      mm.add("(max-width: 900px), (pointer: coarse)", () => {
        // No pin and no horizontal translation. Distance from the viewport
        // centre is measured on Y instead of X and fed through the same
        // function, so the growth behaviour is identical — only the axis
        // changes. A pinned horizontal rail on touch is reliably bad.
        const applyVertical = () => {
          const cards = gsap.utils.toArray<HTMLElement>(".rail-card", section);
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const centre = vh / 2;

          const measured = cards.map((card) => {
            const r = card.getBoundingClientRect();
            return { card, dy: r.top + r.height / 2 - centre };
          });

          /*
            Constant card geometry, unlike the horizontal rail.

            Sizing each card from its distance to the centre is what makes the
            desktop rail work, but on a stack it fed back on itself: changing
            card heights changed the section's height, which moved the very
            ScrollTrigger range being used to measure them. Past the stale
            range the updates simply stopped, leaving cards frozen at whatever
            size they last had — one full-bleed card followed by a column of
            173px strips.

            A stack of equal cards is also the better phone design. Distance
            still drives the wash and the nav theme, which cost nothing to
            recompute and change no layout.
          */
          const cardW = Math.min(vw - 32, 560);
          const cardH = Math.min(vh * 0.8, cardW * 1.6);

          measured.forEach(({ card, dy }) => {
            // Scale the vertical offset into the same domain the function
            // expects, so the thresholds mean the same thing on both axes.
            const m = railMetrics((dy / vh) * vw, { width: vw, height: vh });
            gsap.set(card, { width: cardW, height: cardH, borderRadius: 18 });
            /*
              Always shown here. On the desktop rail the summary fades in as a
              card reaches the centre, but the copy block is anchored to the
              card's bottom edge, so hiding it does not reclaim the space — it
              leaves a hole under the title. Touch has no hover to reward
              either, so every card in the stack simply reads in full.
            */
            const detail = card.querySelector<HTMLElement>(".rail-detail");
            if (detail) gsap.set(detail, { opacity: 1 });
            const wash = card.querySelector<HTMLElement>(".rail-wash");
            if (wash) gsap.set(wash, { opacity: 0.3 + m.wash * 0.45 });
            const link = card.querySelector<HTMLElement>(".rail-link");
            if (link) link.style.pointerEvents = "auto";
            card.setAttribute("data-cursor-active", "true");

            card.classList.toggle("burst", m.interactive);
            if (m.interactive) card.setAttribute("data-nav-theme", "dark");
            else card.removeAttribute("data-nav-theme");
          });
        };

        const st = ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          onUpdate: applyVertical,
          onRefresh: applyVertical,
        });

        applyVertical();
        return () => st.kill();
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section
      ref={root}
      className="rail-section"
      style={{ position: "relative", zIndex: 2 }}
    >
      <div
        className="rail-chrome-top"
        style={{
          zIndex: 4,
          pointerEvents: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "1rem",
          padding: "calc(clamp(1rem, 2.2vw, 1.8rem) + 3.2rem) clamp(1.25rem, 4vw, 3rem) 1rem",
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.72rem, 1vw, 0.78rem)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--rail-chrome, rgba(19,28,51,0.6))",
          transition: "color 300ms ease",
        }}
      >
        <span>[ 02 ] // What we run</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.7em" }}>
          <span className="rail-counter">01 / {String(events.length).padStart(2, "0")}</span>
          <Arrow style={{ width: 15, height: 15 }} />
        </span>
      </div>

      <div
        className="rail-viewport"
        style={{ display: "flex", alignItems: "center" }}
      >
        <div
          ref={track}
          className="rail-track"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(1rem, 2.5vw, 2.5rem)",
            willChange: "transform",
          }}
        >
          {events.map((event, i) => (
            <EventRailCard
              key={event.slug}
              event={event}
              index={i}
              total={events.length}
            />
          ))}
        </div>
      </div>

      <div
        className="rail-progress-bar"
        style={{
          position: "absolute",
          left: "clamp(1.25rem, 4vw, 3rem)",
          right: "clamp(1.25rem, 4vw, 3rem)",
          bottom: "clamp(1.5rem, 4vh, 2.5rem)",
          zIndex: 4,
          pointerEvents: "none",
          height: 1,
          background: "color-mix(in srgb, var(--rail-chrome, #131C33) 30%, transparent)",
        }}
      >
        <div
          className="rail-progress"
          style={{
            height: "100%",
            background: "var(--color-signal)",
            transformOrigin: "left center",
            transform: "scaleX(0)",
          }}
        />
      </div>
    </section>
  );
}
