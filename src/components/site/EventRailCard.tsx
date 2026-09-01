"use client";

import { forwardRef, useRef } from "react";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { groundFor } from "@/components/poster/layouts";
import { Poster } from "@/components/poster/Poster";
import { formatEventDate } from "@/lib/format";
import type { Event } from "@/lib/types";
import { Arrow } from "./Arrow";

/*
  One rail card.

  Everything that varies with scroll position is written directly to the DOM
  by EventRail via gsap.set, not held in React state — this runs on every
  scroll frame for every card, and re-rendering React that often would be
  visibly slow.
*/
export const EventRailCard = forwardRef<HTMLDivElement, { event: Event; index: number; total: number }>(
  function EventRailCard({ event, index, total }, ref) {
    const card = useRef<HTMLDivElement>(null);
    const ground = groundFor(event);

    const fromRect = () => {
      const el = card.current;
      if (!el) return undefined;
      const r = el.getBoundingClientRect();
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    };

    return (
      <div
        ref={(node) => {
          card.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className="rail-card"
        data-slug={event.slug}
        data-cursor="Open"
        data-cursor-active="false"
        data-cursor-color={ground.bg}
        data-cursor-ink={ground.fg}
        style={{
          position: "relative",
          flexShrink: 0,
          overflow: "hidden",
          borderRadius: 18,
          background: "var(--color-ink)",
          // Each card carries its own accent so hover states, the cursor
          // bubble and the wash all match the poster in front of the visitor
          // rather than sharing one flat colour.
          ["--card-accent" as string]: ground.bg,
          ["--card-ink" as string]: ground.fg,
        }}
      >
        <div className="rail-poster" style={{ position: "absolute", inset: 0 }}>
          <Poster
            event={event}
            className="rail-poster-inner"
            priority={index < 2}
            showTitle={false}
            fill
          />
        </div>

        {/* Violet wash, faded in only as the card approaches full bleed. */}
        <div
          className="rail-wash"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            background:
              "linear-gradient(to top, color-mix(in srgb, #142139 90%, transparent) 0%, color-mix(in srgb, #142139 34%, transparent) 58%, transparent 100%)",
          }}
        />

        {/* Accent flood, revealed on hover and withdrawn on leave. */}
        <div
          className="rail-flood"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--card-accent)",
            opacity: 0,
            mixBlendMode: "multiply",
            transform: "scaleY(0)",
            transformOrigin: "bottom center",
          }}
        />

        {/*
          Absolutely positioned on purpose. As a normal-flow child it
          contributed its min-content height to the card, which silently
          overrode the height GSAP sets each frame — cards ended up as tall as
          their text no matter how far from centre they were.
        */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "clamp(1.1rem, 2.4vw, 2.4rem)",
            paddingBottom: "clamp(2.5rem, 7vh, 4.5rem)",
            color: "var(--color-paper)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(0.58rem, 0.8vw, 0.72rem)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} —{" "}
            {event.kicker}
          </p>

          <h3
            style={{
              margin: "0.4em 0 0",
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 3.4vw, 3.4rem)",
              fontWeight: 700,
              lineHeight: 0.95,
              textTransform: "uppercase",
            }}
          >
            {event.title}
          </h3>

          <p
            style={{
              margin: "0.6em 0 0",
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(0.6rem, 0.85vw, 0.74rem)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.75,
            }}
          >
            {formatEventDate(event.startsAt, event.endsAt)} — {event.venue.place}
          </p>

          {/* Revealed only once the card is nearly full-bleed and readable. */}
          <div
            className="rail-detail"
            style={{ opacity: 0, marginTop: "1.4em", maxWidth: "52ch" }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-editorial)",
                fontSize: "clamp(1rem, 1.5vw, 1.35rem)",
                lineHeight: 1.35,
              }}
            >
              {event.summary}
            </p>

            <span
              className="rail-cta"
              style={{
                marginTop: "1.2em",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6em",
                color: "var(--color-paper)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                borderBottom: "1px solid currentColor",
                paddingBottom: "0.3em",
              }}
            >
              View event
              <Arrow style={{ width: 15, height: 15 }} />
            </span>
          </div>
        </div>

        {/*
          The whole card is the link, not a small label inside it.

          Only the label was clickable before, so clicking the card — the
          obvious thing to do — did nothing at all. The panel still grows from
          the card's exact live rect, so opening an event stays continuous
          with the card it came from.
        */}
        <TransitionLink
          href={`/events/${event.slug}`}
          label={event.title}
          getFromRect={fromRect}
          className="rail-link"
          aria-label={`View ${event.title}`}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            display: "block",
            textIndent: "-9999px",
            overflow: "hidden",
          }}
        >
          {event.title}
        </TransitionLink>
      </div>
    );
  },
);
