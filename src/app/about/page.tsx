import type { Metadata } from "next";
import { AboutMotion } from "@/components/site/AboutMotion";
import { BurstBreak } from "@/components/site/BurstBreak";
import { Poster } from "@/components/poster/Poster";
import { getAllEvents, getSite } from "@/lib/events";

export const metadata: Metadata = {
  title: "About — We Code Coders",
  description:
    "A community of builders in Pune. No application, no screening, no prizes — just rooms where people build things in public.",
};

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "clamp(0.65rem, 0.95vw, 0.78rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--color-ink-60)",
};

/*
  Community timeline. Written as intentions and plans rather than as verified
  achievements — every fact on this site is placeholder until replaced, and
  claiming outcomes we cannot evidence would be the wrong kind of copy.
*/
const STORY = [
  {
    when: "Early 2026",
    what: "A message in a group chat asking whether anyone wanted to sit in a room and build.",
  },
  {
    when: "February 2026",
    what: "Nineteen people, one broken projector, and a rule about showing unfinished work.",
  },
  {
    when: "Through 2026",
    what: "Build nights, a workshop series, and a demo day where everything had to actually run.",
  },
  {
    when: "Next",
    what: "More formats, more first-timers, and the same refusal to make any of it exclusive.",
  },
];

export default function AboutPage() {
  const site = getSite();
  const events = getAllEvents();

  return (
    <AboutMotion>
      <main style={{ position: "relative", zIndex: 2 }}>
        <header
          style={{
            maxWidth: "min(1680px, 92vw)",
            margin: "0 auto",
            padding: "clamp(8rem, 20vh, 13rem) clamp(1.25rem, 2vw, 2rem) clamp(3rem, 8vh, 5rem)",
          }}
        >
          <p style={{ ...mono, margin: 0 }}>[ About ] // {site.name}</p>
          <h1
            className="about-title"
            style={{
              margin: "0.3em 0 0",
              fontFamily: "var(--font-editorial)",
              fontSize: "clamp(2.8rem, 9vw, 8rem)",
              fontWeight: 900,
              lineHeight: 0.94,
              letterSpacing: "-0.025em",
              maxWidth: "15ch",
            }}
          >
            A room where people{" "}
            <span
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--color-terracotta)",
                // The italic's exit stroke overruns its advance width.
                marginRight: "0.12em",
              }}
            >
              build
            </span>{" "}
            things.
          </h1>
        </header>

        <section
          style={{
            maxWidth: "min(1680px, 92vw)",
            margin: "0 auto",
            padding: "0 clamp(1.25rem, 2vw, 2rem)",
            display: "grid",
            gridTemplateColumns: "minmax(0, 7fr) minmax(0, 4fr)",
            gap: "clamp(2rem, 6vw, 6rem)",
            alignItems: "start",
          }}
          className="about-grid"
        >
          <div className="about-body">
            {site.manifesto.map((para, i) => (
              <p
                key={i}
                data-reveal
                className={i === 0 ? "about-lead" : undefined}
                style={{
                  margin: "0 0 1.2em",
                  fontFamily: "var(--font-editorial)",
                  fontSize: "clamp(1.1rem, 1.6vw, 1.5rem)",
                  lineHeight: 1.58,
                  maxWidth: "66ch",
                }}
              >
                {para}
              </p>
            ))}

            <p
              data-reveal
              style={{
                margin: "0 0 1.2em",
                fontFamily: "var(--font-editorial)",
                fontSize: "clamp(1.1rem, 1.6vw, 1.5rem)",
                lineHeight: 1.58,
                maxWidth: "66ch",
              }}
            >
              There is no application form and no screening call. There is a date, a
              room, and whatever you are working on. The only thing we ask is that you
              are willing to show it before it is finished, because a room full of
              polished work goes quiet and a room full of broken work does not.
            </p>
          </div>

          <aside style={{ ...mono, lineHeight: 1.7 }}>
            <p data-reveal style={{ margin: "0 0 1.6em" }}>
              Based in {site.city}, {site.country}. Everything happens in person unless
              it genuinely cannot.
            </p>
            <p data-reveal style={{ margin: 0 }}>
              Founded {site.foundedYear}. Run by the people who turn up.
            </p>
          </aside>
        </section>

        <BurstBreak line={site.tagline} />

        {/* Story */}
        <section
          style={{
            maxWidth: "min(1680px, 92vw)",
            margin: "0 auto",
            padding: "0 clamp(1.25rem, 2vw, 2rem)",
          }}
        >
          <p style={{ ...mono, margin: "0 0 2rem", paddingBottom: "1rem", borderBottom: "1px solid var(--color-paper-2)" }}>
            [ 01 ] // How it went
          </p>

          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {STORY.map((row) => (
              <li
                key={row.when}
                data-reveal
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 3fr)",
                  gap: "clamp(1rem, 4vw, 3rem)",
                  padding: "1.6em 0",
                  borderBottom: "1px solid var(--color-paper-2)",
                }}
              >
                <span style={mono}>{row.when}</span>
                <span
                  style={{
                    fontFamily: "var(--font-editorial)",
                    fontSize: "clamp(1.05rem, 1.5vw, 1.35rem)",
                    lineHeight: 1.5,
                  }}
                >
                  {row.what}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/*
          Posters rather than photographs: there are no real photographs of this
          community to show, and stock imagery of strangers would misrepresent
          it. These are the same generated posters used everywhere else.
        */}
        <section
          style={{
            maxWidth: "min(1680px, 92vw)",
            margin: "0 auto",
            padding: "clamp(4rem, 12vh, 8rem) clamp(1.25rem, 2vw, 2rem) clamp(5rem, 14vh, 9rem)",
          }}
        >
          <p style={{ ...mono, margin: "0 0 2rem" }}>[ 02 ] // What it looks like</p>
          <div
            className="about-tiles"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "clamp(0.75rem, 1.6vw, 1.5rem)",
            }}
          >
            {events.map((e) => (
              <div key={e.slug} className="about-tile" style={{ containerType: "inline-size" }}>
                <Poster event={e} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </AboutMotion>
  );
}
