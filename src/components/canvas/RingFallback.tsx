"use client";

import { Poster } from "@/components/poster/Poster";
import type { Event } from "@/lib/types";

/*
  Non-WebGL path: a CSS-3D coverflow with the same interaction contract as the
  ring — the focused index is driven by the same controller, so scroll, drag,
  snap and click behave identically. The page must be completely usable with
  no WebGL at all.
*/
export function RingFallback({
  events,
  focused,
}: {
  events: Event[];
  focused: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        perspective: "1400px",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", transformStyle: "preserve-3d", width: 0, height: 0 }}>
        {events.map((event, i) => {
          let offset = i - focused;
          const half = events.length / 2;
          if (offset > half) offset -= events.length;
          if (offset < -half) offset += events.length;

          const abs = Math.abs(offset);
          return (
            <div
              key={event.slug}
              style={{
                position: "absolute",
                width: "min(38vw, 300px)",
                aspectRatio: "3 / 4",
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translateX(${offset * 62}%) translateZ(${-abs * 180}px) rotateY(${offset * -22}deg)`,
                filter: `saturate(${Math.max(0.25, 1 - abs * 0.35)})`,
                opacity: abs > 2.6 ? 0 : 1,
                transition: "transform 500ms cubic-bezier(0.16,1,0.3,1), opacity 400ms, filter 400ms",
                zIndex: 100 - Math.round(abs * 10),
                pointerEvents: "none",
              }}
            >
              <Poster event={event} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
