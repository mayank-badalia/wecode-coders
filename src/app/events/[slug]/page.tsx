import type { Metadata } from "next";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { notFound } from "next/navigation";
import { Poster } from "@/components/poster/Poster";
import { Arrow } from "@/components/site/Arrow";
import { EventDetailMotion } from "@/components/site/EventDetailMotion";
import { getAdjacentEvent, getAllEvents, getEventBySlug, getSite } from "@/lib/events";
import { eventDurationHours, formatEventDate, formatEventTime } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllEvents().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};

  return {
    title: `${event.title} — We Code Coders`,
    description: event.summary,
    openGraph: {
      title: event.title,
      description: event.summary,
      type: "article",
    },
  };
}

const monoLabel: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "clamp(0.6rem, 0.85vw, 0.72rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--color-ink-60)",
};

export default async function EventPage({ params }: Params) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const next = getAdjacentEvent(slug);
  const site = getSite();
  const hours = eventDurationHours(event.startsAt, event.endsAt);

  const spec: { label: string; value: string }[] = [
    { label: "Date", value: formatEventDate(event.startsAt, event.endsAt) },
    { label: "Starts", value: formatEventTime(event.startsAt) },
    { label: "Runs for", value: hours >= 24 ? `${hours} hours` : `${hours} hours` },
    { label: "Venue", value: event.venue.name },
    { label: "City", value: `${event.venue.city}, ${event.venue.country}` },
    { label: "Format", value: event.format.replace("-", " ") },
    { label: "Who it is for", value: event.forWho },
  ];

  return (
    <EventDetailMotion>
      <article style={{ position: "relative", zIndex: 2 }}>
        {/* Header: full-bleed poster with the title over it. */}
        <header
          data-nav-theme="dark"
          style={{
            position: "relative",
            minHeight: "min(78svh, 720px)",
            display: "flex",
            alignItems: "flex-end",
            overflow: "hidden",
            padding: "clamp(6rem, 14vh, 9rem) clamp(1.25rem, 4vw, 3rem) clamp(2rem, 6vh, 4rem)",
          }}
        >
          <div className="detail-poster" style={{ position: "absolute", inset: "-10% 0 -10% 0" }}>
            <Poster event={event} showTitle={false} fill priority />
          </div>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(19,28,51,0.82) 0%, rgba(19,28,51,0.25) 60%, transparent 100%)",
            }}
          />

          <div style={{ position: "relative", color: "var(--color-paper)" }}>
            <p style={{ ...monoLabel, color: "rgba(244,241,234,0.8)", margin: 0 }}>
              {event.kicker}
            </p>
            <h1
              className="detail-title"
              style={{
                margin: "0.3em 0 0",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.6rem, 9vw, 8rem)",
                fontWeight: 700,
                lineHeight: 0.92,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                maxWidth: "14ch",
              }}
            >
              {event.title}
            </h1>
          </div>
        </header>

        <div
          style={{
            maxWidth: "min(1680px, 92vw)",
            margin: "0 auto",
            padding: "clamp(3rem, 10vh, 7rem) clamp(1.25rem, 2vw, 2rem)",
            display: "grid",
            gridTemplateColumns: "minmax(0, 4fr) minmax(0, 7fr)",
            gap: "clamp(2rem, 6vw, 6rem)",
            alignItems: "start",
          }}
          className="detail-grid"
        >
          {/* Spec table */}
          <dl style={{ margin: 0 }} data-reveal>
            {spec.map((row) => (
              <div
                key={row.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
                  gap: "1rem",
                  padding: "0.85em 0",
                  borderBottom: "1px solid var(--color-paper-2)",
                }}
              >
                <dt style={monoLabel}>{row.label}</dt>
                <dd
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(0.68rem, 0.95vw, 0.8rem)",
                    lineHeight: 1.5,
                  }}
                >
                  {row.value}
                </dd>
              </div>
            ))}

            {event.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.6rem" }}>
                {event.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      ...monoLabel,
                      color: "var(--color-ink)",
                      border: "1px solid var(--color-paper-2)",
                      borderRadius: 999,
                      padding: "0.45em 0.9em",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </dl>

          {/* Body */}
          <div>
            <div className="detail-body">
              {event.description.map((para, i) => (
                <p
                  key={i}
                  data-reveal
                  style={{
                    margin: i === 0 ? "0 0 1.1em" : "0 0 1.1em",
                    fontFamily: "var(--font-editorial)",
                    fontSize: "clamp(1.05rem, 1.45vw, 1.35rem)",
                    lineHeight: 1.62,
                    maxWidth: "68ch",
                  }}
                >
                  {para}
                </p>
              ))}
            </div>

            {event.stats && event.stats.length > 0 && (
              <div
                data-reveal
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "clamp(1.5rem, 5vw, 4rem)",
                  marginTop: "clamp(2rem, 6vh, 3.5rem)",
                  paddingTop: "1.4rem",
                  borderTop: "1px solid var(--color-paper-2)",
                }}
              >
                {event.stats.map((s) => (
                  <div key={s.label}>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(2rem, 5vw, 3.4rem)",
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </p>
                    <p style={{ ...monoLabel, margin: "0.5em 0 0" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {event.links && event.links.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "2rem 0 0" }}>
                {event.links.map((l) => (
                  <li key={l.href} style={{ marginBottom: "0.6em" }}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{ ...monoLabel, color: "var(--color-signal)" }}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {/*
              No signup, no registration — those are not built in this version.
              Only rendered at all when there is a real social account to point
              at, because a link to nowhere is a broken link.
            */}
            {site.socials.length > 0 && site.socials[0] && (
              <p data-reveal style={{ marginTop: "clamp(2rem, 6vh, 3.5rem)" }}>
                <a
                  href={site.socials[0].href}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{
                    ...monoLabel,
                    color: "var(--color-ink)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.6em",
                    borderBottom: "1px solid currentColor",
                    paddingBottom: "0.3em",
                  }}
                >
                  Notify me when the next one drops
                  <Arrow direction="up-right" style={{ width: 15, height: 15 }} />
                </a>
              </p>
            )}
          </div>
        </div>

        {next && (
          <nav
            aria-label="Next event"
            style={{
              maxWidth: "min(1680px, 92vw)",
              margin: "0 auto",
              padding: "0 clamp(1.25rem, 2vw, 2rem) clamp(4rem, 12vh, 8rem)",
            }}
          >
            <TransitionLink
              href={`/events/${next.slug}`}
              label={next.title}
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
                borderTop: "1px solid var(--color-paper-2)",
                paddingTop: "1.4rem",
              }}
            >
              <span style={monoLabel}>Next event</span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4em",
                  marginTop: "0.2em",
                  fontFamily: "var(--font-editorial)",
                  fontSize: "clamp(1.8rem, 5vw, 4rem)",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  color: "var(--color-signal)",
                }}
              >
                {next.title}
                <Arrow style={{ width: "0.5em", height: "0.5em" }} />
              </span>
            </TransitionLink>
          </nav>
        )}
      </article>
    </EventDetailMotion>
  );
}
