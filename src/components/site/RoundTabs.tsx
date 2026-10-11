"use client";

import { useId, useRef, useState } from "react";
import type { EventSection } from "@/lib/types";

/*
  The three rounds, one at a time.

  Side by side they are three columns of dense checklist, and a reader scans
  past all three. Behind buttons, the page shows the round somebody is
  actually in — and the dates stay on the buttons, so the shape of the whole
  event is still readable without clicking anything.

  Takes its section as a prop from the server parent. It must never import
  "@/lib/events": that module is server-only and pulling it into a client
  component would bundle every locked record into the browser.
*/
type Columns = Extract<EventSection, { kind: "columns" }>;

export function RoundTabs({ section }: { section: Columns }) {
  const [open, setOpen] = useState(0);
  const base = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  /*
    Arrow keys move between tabs, which is what a tablist is expected to do —
    and without it the only way through is the mouse. Home/End jump to the
    ends; the focused tab is the open one, so moving focus changes the panel.
  */
  function onKeyDown(e: React.KeyboardEvent) {
    const last = section.items.length - 1;
    const to =
      e.key === "ArrowRight" ? (open === last ? 0 : open + 1)
      : e.key === "ArrowLeft" ? (open === 0 ? last : open - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (to === null) return;
    e.preventDefault();
    setOpen(to);
    tabs.current[to]?.focus();
  }

  const item = section.items[open]!;

  return (
    <div className="rounds">
      <div className="rounds-tablist" role="tablist" aria-label={section.label} onKeyDown={onKeyDown}>
        {section.items.map((it, i) => (
          <button
            key={it.code}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${i}`}
            aria-selected={i === open}
            aria-controls={`${base}-panel-${i}`}
            tabIndex={i === open ? 0 : -1}
            className="rounds-tab"
            data-open={i === open}
            onClick={() => setOpen(i)}
          >
            <span className="rounds-tab-code">{it.code}</span>
            <span className="rounds-tab-name">{it.name}</span>
            {it.meta && <span className="rounds-tab-meta">{it.meta}</span>}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${base}-panel-${open}`}
        aria-labelledby={`${base}-tab-${open}`}
        /*
          Keyed on the open round so React replaces the subtree rather than
          patching it. Without the key a long Round 1 list and a short Round 3
          one reuse the same <li> nodes and the switch reads as text mutating
          in place instead of a new panel.
        */
        key={item.code}
        className="rounds-panel"
      >
        <h3 className="rounds-panel-name">{item.name}</h3>
        {item.blurb && <p className="rounds-panel-blurb">{item.blurb}</p>}

        {/*
          What the round asks for and what it is marked on, side by side.
          Separately they were a checklist here and fifteen criteria in a
          column much further down the page, and nobody read the second one
          while looking at the first.
        */}
        <div className="rounds-split">
          <div>
            <p className="rounds-subhead">What you submit</p>
            <ul className="rounds-points">
              {item.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          {item.judging && item.judging.length > 0 && (
            <div>
              <p className="rounds-subhead">How this round is scored — out of 100</p>
              <ul className="rounds-criteria">
                {item.judging.map((j) => (
                  <li key={j.name}>
                    <p className="rounds-criterion">
                      <span>{j.name}</span>
                      {j.weight && <span className="rounds-weight">{j.weight}</span>}
                    </p>
                    <p className="rounds-criterion-detail">{j.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {item.note && <p className="rounds-note">{item.note}</p>}
      </div>
    </div>
  );
}
