import type { EventSection } from "@/lib/types";

/*
  The long-form blocks on an event detail page — tracks, topic areas,
  submission checklists, rules.

  Two shapes cover every one of them, so this renders two and no more. A
  `columns` block is a small set of named things a reader compares before
  picking one; a `list` block is a set of requirements a reader works through.
  Anything that wants a third shape probably wants its own section instead.

  Reveal markers sit on the block and on its cards, never on every line. The
  page's reveal runs one staggered chain over all [data-reveal] elements at
  once, so tagging seventeen rules individually would push the tail of that
  chain past the point where a reader has already scrolled to it.
*/

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "clamp(0.72rem, 0.85vw, 0.72rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--color-ink-60)",
};

function Intro({ text }: { text: string }) {
  return (
    <p
      style={{
        margin: "0 0 clamp(1.8rem, 4vh, 2.6rem)",
        maxWidth: "62ch",
        fontFamily: "var(--font-editorial)",
        fontSize: "clamp(1rem, 1.3vw, 1.2rem)",
        lineHeight: 1.6,
        color: "var(--color-ink-60)",
      }}
    >
      {text}
    </p>
  );
}

function Columns({ section }: { section: Extract<EventSection, { kind: "columns" }> }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
        gap: "clamp(2rem, 4vw, 3.5rem)",
      }}
    >
      {section.items.map((item) => (
        <div key={item.code} data-reveal>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(2.4rem, 4vw, 3.2rem)",
              lineHeight: 1,
              color: "var(--color-signal)",
            }}
          >
            {item.code}
          </p>
          {/*
            The dates this item covers, above its name.

            "Round 2 — The build" with no dates on it is the question every
            reader asks next, and the schedule further down the page answers
            it too late. Mono and bold so it reads as a fact rather than as
            part of the prose.
          */}
          {item.meta && (
            <p
              style={{
                margin: "0.5em 0 0",
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(0.78rem, 1vw, 0.88rem)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-signal)",
              }}
            >
              {item.meta}
            </p>
          )}
          <h3
            style={{
              margin: item.meta ? "0.25em 0 0" : "0.35em 0 0",
              fontFamily: "var(--font-editorial)",
              fontSize: "clamp(1.25rem, 2vw, 1.7rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            {item.name}
          </h3>
          {item.blurb && (
            <p
              style={{
                margin: "0.7em 0 0",
                lineHeight: 1.6,
                maxWidth: "44ch",
                color: "var(--color-ink-60)",
              }}
            >
              {item.blurb}
            </p>
          )}
          <ul
            style={{
              listStyle: "none",
              margin: "1.2em 0 0",
              padding: 0,
              borderTop: "1px solid var(--color-paper-2)",
            }}
          >
            {item.points.map((p) => (
              <li
                key={p}
                style={{
                  padding: "0.55em 0",
                  borderBottom: "1px solid var(--color-paper-2)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(0.72rem, 0.95vw, 0.8rem)",
                  lineHeight: 1.5,
                }}
              >
                {p}
              </li>
            ))}
          </ul>
          {item.note && (
            <p
              style={{
                margin: "1.1em 0 0",
                paddingLeft: "0.9em",
                borderLeft: "3px solid var(--color-signal)",
                maxWidth: "44ch",
                lineHeight: 1.6,
                fontSize: "clamp(0.82rem, 1vw, 0.92rem)",
                color: "var(--color-ink)",
              }}
            >
              {item.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function List({ section }: { section: Extract<EventSection, { kind: "list" }> }) {
  const Tag = section.numbered ? "ol" : "ul";
  return (
    <Tag
      data-reveal
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
        columnGap: "clamp(2rem, 5vw, 4rem)",
      }}
    >
      {section.items.map((item, i) => (
        <li
          key={item}
          style={{
            display: "grid",
            gridTemplateColumns: "2.6em minmax(0, 1fr)",
            gap: "0.4em",
            alignItems: "baseline",
            padding: "0.7em 0",
            borderBottom: "1px solid var(--color-paper-2)",
            lineHeight: 1.55,
          }}
        >
          <span style={{ ...mono, color: "var(--color-signal)" }} aria-hidden="true">
            {section.numbered ? String(i + 1).padStart(2, "0") : "—"}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </Tag>
  );
}

export function EventSections({ sections }: { sections: EventSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <section
          key={section.label}
          style={{
            maxWidth: "min(1680px, 92vw)",
            margin: "0 auto",
            padding: "clamp(3.5rem, 10vh, 6rem) clamp(1.25rem, 2vw, 2rem) 0",
          }}
        >
          <p data-reveal style={{ ...mono, margin: "0 0 1.4rem" }}>
            [ {section.label} ]
          </p>
          {section.intro && <Intro text={section.intro} />}
          {section.kind === "columns" ? (
            <Columns section={section} />
          ) : (
            <List section={section} />
          )}
        </section>
      ))}
    </>
  );
}
