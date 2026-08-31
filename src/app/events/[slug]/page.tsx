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
                {event.stats.map((st) => (
                  <div key={st.label}>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "clamp(2rem, 5vw, 3.4rem)",
                        lineHeight: 1,
                      }}
                    >
                      {st.value}
                    </p>
                    <p style={{ ...monoLabel, margin: "0.5em 0 0" }}>{st.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* The brief: the single most important thing on the page. */}
        <section
          data-nav-theme="dark"
          style={{
            background: "var(--color-ink)",
            color: "var(--color-paper)",
            padding: "clamp(3.5rem, 10vh, 7rem) clamp(1.25rem, 4vw, 3rem)",
          }}
        >
          <div style={{ maxWidth: "min(1680px, 92vw)", margin: "0 auto" }}>
            <p style={{ ...monoLabel, margin: 0, color: "var(--color-paper)", opacity: 0.6 }}>
              [ Brief ] // What you are being asked to do
            </p>
            <p
              data-reveal
              style={{
                margin: "0.6em 0 0",
                fontFamily: "var(--font-editorial)",
                fontSize: "clamp(1.7rem, 4.2vw, 3.6rem)",
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                maxWidth: "22ch",
              }}
            >
              {event.brief}
            </p>

            <div
              className="detail-brief-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "clamp(1.5rem, 4vw, 3rem)",
                marginTop: "clamp(2.5rem, 7vh, 4rem)",
                paddingTop: "1.4rem",
                borderTop: "1px solid rgba(243,239,229,0.25)",
              }}
            >
              <div data-reveal>
                <p style={{ ...monoLabel, margin: 0, color: "var(--color-paper)", opacity: 0.6 }}>
                  What you leave with
                </p>
                <ul style={{ margin: "0.8em 0 0", paddingLeft: "1.1em", lineHeight: 1.6 }}>
                  {event.deliverables.map((d) => (
                    <li key={d} style={{ marginBottom: "0.4em" }}>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div data-reveal>
                <p style={{ ...monoLabel, margin: 0, color: "var(--color-paper)", opacity: 0.6 }}>
                  Team size
                </p>
                <p style={{ margin: "0.8em 0 0", lineHeight: 1.6 }}>{event.teamSize}</p>
              </div>
              <div data-reveal>
                <p style={{ ...monoLabel, margin: 0, color: "var(--color-paper)", opacity: 0.6 }}>
                  Who can come
                </p>
                <p style={{ margin: "0.8em 0 0", lineHeight: 1.6 }}>{event.eligibility}</p>
              </div>
            </div>
          </div>
        </section>

        <div
          style={{
            maxWidth: "min(1680px, 92vw)",
            margin: "0 auto",
            padding: "clamp(3.5rem, 10vh, 7rem) clamp(1.25rem, 2vw, 2rem) 0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "clamp(2.5rem, 6vw, 5rem)",
            alignItems: "start",
          }}
        >
          {event.schedule && event.schedule.length > 0 && (
            <section>
              <p style={{ ...monoLabel, margin: "0 0 1.4rem" }}>[ Schedule ] // How the day runs</p>
              <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {event.schedule.map((row) => (
                  <li
                    key={row.when + row.what}
                    data-reveal
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 0.6fr) minmax(0, 1.4fr)",
                      gap: "1rem",
                      padding: "0.9em 0",
                      borderBottom: "1px solid var(--color-paper-2)",
                    }}
                  >
                    <span style={monoLabel}>{row.when}</span>
                    <span style={{ lineHeight: 1.55 }}>{row.what}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div>
            {event.judging && event.judging.length > 0 && (
              <section style={{ marginBottom: "clamp(2.5rem, 6vh, 4rem)" }}>
                <p style={{ ...monoLabel, margin: "0 0 1.4rem" }}>[ Judging ]</p>
                {event.judging.map((j) => (
                  <div key={j.name} data-reveal style={{ marginBottom: "1.2em" }}>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-editorial)",
                        fontSize: "clamp(1.2rem, 2vw, 1.7rem)",
                        color: "var(--color-signal)",
                      }}
                    >
                      {j.name}
                    </p>
                    <p style={{ margin: "0.3em 0 0", lineHeight: 1.6, maxWidth: "52ch" }}>{j.detail}</p>
                  </div>
                ))}
              </section>
            )}

            {event.rewards && event.rewards.length > 0 && (
              <section>
                <p style={{ ...monoLabel, margin: "0 0 1.4rem" }}>[ What you get ]</p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {event.rewards.map((r) => (
                    <li
                      key={r}
                      data-reveal
                      style={{
                        display: "flex",
                        gap: "0.7em",
                        alignItems: "baseline",
                        padding: "0.6em 0",
                        lineHeight: 1.55,
                      }}
                    >
                      <Arrow style={{ width: 13, height: 13, color: "var(--color-signal)", flexShrink: 0 }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {event.faq && event.faq.length > 0 && (
          <section
            style={{
              maxWidth: "min(1680px, 92vw)",
              margin: "0 auto",
              padding: "clamp(3.5rem, 10vh, 6rem) clamp(1.25rem, 2vw, 2rem) 0",
            }}
          >
            <p style={{ ...monoLabel, margin: "0 0 1.4rem" }}>[ Questions ]</p>
            {event.faq.map((row) => (
              <div
                key={row.q}
                data-reveal
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "clamp(1rem, 3vw, 2.5rem)",
                  padding: "1.3em 0",
                  borderTop: "1px solid var(--color-paper-2)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-editorial)",
                    fontSize: "clamp(1.15rem, 1.9vw, 1.6rem)",
                    lineHeight: 1.2,
                  }}
                >
                  {row.q}
                </p>
                <p style={{ margin: 0, lineHeight: 1.6, color: "var(--color-ink-60)" }}>{row.a}</p>
              </div>
            ))}
          </section>
        )}

        {/*
          No registration in this version. Rendered only when there is a real
          social account to point at, because a link to nowhere is a dead link.
        */}
        {site.socials.length > 0 && site.socials[0] && (
          <p
            style={{
              maxWidth: "min(1680px, 92vw)",
              margin: "0 auto",
              padding: "clamp(2.5rem, 6vh, 4rem) clamp(1.25rem, 2vw, 2rem) 0",
            }}
          >
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
