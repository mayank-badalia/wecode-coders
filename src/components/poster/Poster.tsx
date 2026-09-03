import Image from "next/image";
import { Fragment } from "react";
import { Arrow } from "@/components/site/Arrow";
import { formatEventDate } from "@/lib/format";
import { createRng, pick, range } from "@/lib/seededRandom";
import type { PublicEvent } from "@/lib/types";
import { LockGlyph } from "@/components/site/LockGlyph";
import {
  GRAIN_URL,
  GROUNDS,
  TITLE_ALIGNMENTS,
  TITLE_TREATMENTS,
  groundFor,
  tint,
} from "./layouts";

type PosterProps = {
  event: PublicEvent;
  className?: string;
  priority?: boolean;
  /**
   * Set false where the surrounding surface already sets the title — the
   * event rail, for instance, where showing both reads as a duplication
   * rather than a composition.
   */
  showTitle?: boolean;
  /**
   * Cover the container instead of holding a 3:4 ratio. The event rail sizes
   * its cards from scroll position, so their aspect changes continuously and
   * a fixed ratio leaves a band of bare card showing.
   */
  fill?: boolean;
  /**
   * How a real poster image sits in its frame. Only meaningful alongside
   * `fill`, and only for events with a `posterImage` — a generated poster
   * composes to whatever box it is given.
   *
   * `cover` is right wherever the poster is furniture in a larger layout: a
   * rail card, an about tile. `contain` is right where the artwork is the
   * subject and cropping it would cut into someone's design.
   */
  fit?: "cover" | "contain";
  /**
   * CSS object-position for a real poster image. Cropping a tall poster into
   * a wide card from the centre lands on an arbitrary middle slice; anchoring
   * to the top keeps the masthead and title, which is the part that says
   * which poster it is.
   */
  position?: string;
};

/*
  A generative poster, composed from the event's own data.

  Real hackathon posters found online are other people's copyrighted work, so
  each event gets a poster built from its record instead. Everything that
  varies is drawn from createRng(event.posterSeed) — never Math.random — so
  the server and client renders are byte-identical and there is no hydration
  mismatch and no layout shift.

  Setting `posterImage` on an event overrides all of this with a real image.
*/
export function Poster({
  event,
  className,
  priority = false,
  showTitle = true,
  fill = false,
  fit = "cover",
  position = "center",
}: PosterProps) {
  const frame = fill
    ? ({ position: "absolute", inset: 0 } as const)
    : ({ position: "relative", aspectRatio: "3 / 4" } as const);

  /*
    A locked event has nothing to compose from — no title, no date, no seed.
    It gets a sealed placeholder instead, and deliberately not a generated
    poster, so its very look does not hint at the format or the mood of it.
  */
  if (event.locked) {
    const ground = groundFor(event);
    return (
      <div
        className={`burst ${className ?? ""}`}
        style={{
          ...frame,
          overflow: "hidden",
          backgroundColor: ground.bg,
          color: ground.fg,
          display: "grid",
          placeItems: "center",
          border: `1px solid ${tint(ground.fg, 0.35)}`,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.18,
            backgroundImage: `repeating-linear-gradient(135deg, transparent 0 10px, ${tint(
              ground.fg,
              0.5,
            )} 10px 11px)`,
          }}
        />
        <div style={{ position: "relative", textAlign: "center", padding: "12%" }}>
          <LockGlyph />
          <p
            style={{
              margin: "0.9em 0 0",
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(0.72rem, 2.8cqw, 0.85rem)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Locked
          </p>
        </div>
      </div>
    );
  }
  if (event.posterImage) {
    return (
      <div
        className={`burst ${className ?? ""}`}
        style={{ ...frame, overflow: "hidden" }}
      >
        <Image
          src={event.posterImage}
          alt={`Poster for ${event.title}`}
          fill
          priority={priority}
          style={{ objectFit: fit, objectPosition: position }}
          sizes="(max-width: 900px) 90vw, 46vw"
        />
      </div>
    );
  }

  const rng = createRng(event.posterSeed);
  const ground = pick(rng, GROUNDS);
  const treatment = pick(rng, TITLE_TREATMENTS);
  const alignment = pick(rng, TITLE_ALIGNMENTS);

  const halftoneSize = Math.round(range(rng, 8, 18));
  const titleWeight = Math.round(range(rng, 800, 900));
  // IBM Plex Sans Condensed ships static weights and no width axis, so the
  // seeded variation moves to weight and treatment rather than wdth.

  const words = event.title.toUpperCase().split(" ");
  const longestWord = Math.max(...words.map((w) => w.length));

  // A long word set wide will always run into the margin. Condensing it is
  // what a typesetter would do, so the width axis is capped by word length
  // rather than left purely to the seed.
  // And the size is bounded by how many glyphs have to fit across the measure.
  const titleCqw = Math.min(9.5, 74 / longestWord);

  // Keep the arrow wholly inside the frame — a clipped flourish reads as a
  // rendering fault rather than a compositional choice.
  const arrowTop = Math.round(range(rng, 22, 52));
  const arrowLeft = Math.round(range(rng, 48, 64));
  const arrowScale = range(rng, 1.4, 2.6).toFixed(2);
  const arrowRotate = Math.round(range(rng, -20, 20));

  const ruleCount = Math.round(range(rng, 3, 5));
  const rules = Array.from({ length: ruleCount }, () => Math.round(range(rng, 12, 88)));

  const justify =
    alignment === "top" ? "flex-start" : alignment === "bottom" ? "flex-end" : "center";

  return (
    <div
      className={`burst ${className ?? ""}`}
      style={{
        ...frame,
        overflow: "hidden",
        backgroundColor: ground.bg,
        color: ground.fg,
        display: "flex",
        flexDirection: "column",
        justifyContent: justify,
        padding: "7% 6% 6%",
        isolation: "isolate",
      }}
    >
      {/* halftone */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.25,
          backgroundImage: `radial-gradient(circle, ${ground.accent} 1px, transparent 1px)`,
          backgroundSize: `${halftoneSize}px ${halftoneSize}px`,
        }}
      />

      {/* hairline grid fragment */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        {rules.map((left, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${left}%`,
              width: 1,
              background: ground.accent,
              opacity: 0.5,
            }}
          />
        ))}
      </div>

      {/* the arrow motif, placed by seed */}
      <Arrow
        direction="down-right"
        strokeWidth={1.2}
        style={{
          position: "absolute",
          top: `${arrowTop}%`,
          left: `${arrowLeft}%`,
          width: `${Number(arrowScale) * 12}%`,
          height: "auto",
          color: ground.accent,
          opacity: 0.9,
          transform: `rotate(${arrowRotate}deg)`,
        }}
      />

      {/* title */}
      {showTitle ? (
      <h3
        style={{
          position: "relative",
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: `clamp(1.4rem, ${titleCqw}cqw, 3.8rem)`,
          lineHeight: 0.86,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          fontWeight: titleWeight >= 850 ? 700 : 600,
        }}
      >
        {words.map((word, i) => {
          const outlined =
            treatment === "outline" || (treatment === "mixed" && i > 0);
          return (
            // The space between words is a real text node so screen readers
            // and copy-paste get "COLD START", not "COLDSTART". Block-level
            // spans collapse it visually, so the stacked layout is unaffected.
            <Fragment key={`${word}-${i}`}>
              {i > 0 ? " " : null}
            <span
              style={{
                display: "block",
                ...(outlined
                  ? {
                      color: "transparent",
                      WebkitTextStroke: `1.2px ${ground.fg}`,
                    }
                  : { color: ground.fg }),
              }}
            >
              {word}
            </span>
            </Fragment>
          );
        })}
      </h3>
      ) : null}

      {/* metadata */}
      {showTitle ? (
      <div
        style={{
          position: "relative",
          marginTop: "auto",
          paddingTop: "1.4em",
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(0.72rem, 2.8cqw, 0.82rem)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: ground.fg,
          opacity: 0.85,
          display: "flex",
          flexDirection: "column",
          gap: "0.35em",
        }}
      >
        <span>{formatEventDate(event.startsAt, event.endsAt)}</span>
        <span>{event.format.replace("-", " ")}</span>
      </div>
      ) : null}

      {/* grain */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          mixBlendMode: "overlay",
          backgroundImage: `url("${GRAIN_URL}")`,
        }}
      />
    </div>
  );
}
