"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/components/motion/gsap";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { getAllEvents } from "@/lib/events";
import { railMetrics } from "@/lib/rail";
import { Arrow } from "./Arrow";
import { EventRailCard } from "./EventRailCard";

export function EventRail() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const events = getAllEvents();

  useGSAP(
    () => {
      const section = root.current;
      const trackEl = track.current;
      if (!section || !trackEl) return;

      const counter = section.querySelector<HTMLElement>(".rail-counter");
      const progressBar = section.querySelector<HTMLElement>(".rail-progress");

      /*
        Applies the metrics for every card.

        All reads happen before all writes. Interleaving getBoundingClientRect
        with style writes forces a synchronous layout per card, which on a
        seven-card rail is seven forced reflows every scroll frame.
      */
      const applyMetrics = () => {
        const cards = gsap.utils.toArray<HTMLElement>(".rail-card", section);
        if (cards.length === 0) return;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const centre = vw / 2;

        const measured = cards.map((card) => {
          const r = card.getBoundingClientRect();
          return { card, dx: r.left + r.width / 2 - centre };
        });

        let nearest = 0;
        let nearestDist = Infinity;

        measured.forEach(({ card, dx }, i) => {
          const m = railMetrics(dx, { width: vw, height: vh });

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

          const link = card.querySelector<HTMLElement>(".rail-link");
          // An unreadable card must not be clickable.
          if (link) link.style.pointerEvents = m.interactive ? "auto" : "none";

          // A full-bleed card is a dark ground, so the nav must read light
          // over it. The nav hit-tests for this attribute every frame.
          card.classList.toggle("burst", m.interactive);
          if (m.interactive) card.setAttribute("data-nav-theme", "dark");
          else card.removeAttribute("data-nav-theme");

          if (Math.abs(dx) < nearestDist) {
            nearestDist = Math.abs(dx);
            nearest = i;
          }
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
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              applyMetrics();
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

          measured.forEach(({ card, dy }) => {
            // Scale the vertical offset into the same domain the function
            // expects, so the thresholds mean the same thing on both axes.
            const m = railMetrics((dy / vh) * vw, { width: vw, height: vh });
            gsap.set(card, {
              width: Math.min(m.width, vw - 32),
              height: m.height,
              borderRadius: m.radius,
            });
            const detail = card.querySelector<HTMLElement>(".rail-detail");
            if (detail) gsap.set(detail, { opacity: m.detail });
            const wash = card.querySelector<HTMLElement>(".rail-wash");
            if (wash) gsap.set(wash, { opacity: 0.3 + m.wash * 0.45 });
            const link = card.querySelector<HTMLElement>(".rail-link");
            if (link) link.style.pointerEvents = "auto";

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
      style={{
        position: "relative",
        zIndex: 2,
        // Exactly one screen tall, so a card scaled to 100vh x 100vw genuinely
        // fills the viewport. The chrome is overlaid rather than stacked,
        // because stacking it made the section taller than the screen and
        // pushed the bottom of a full-bleed card out of view.
        height: "100svh",
        overflow: "hidden",
      }}
    >
      <div
        className="rail-chrome-top"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 4,
          pointerEvents: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "1rem",
          padding: "calc(clamp(1rem, 2.2vw, 1.8rem) + 3.2rem) clamp(1.25rem, 4vw, 3rem) 1rem",
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.65rem, 1vw, 0.78rem)",
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
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
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
            background: "var(--color-terracotta)",
            transformOrigin: "left center",
            transform: "scaleX(0)",
          }}
        />
      </div>
    </section>
  );
}
