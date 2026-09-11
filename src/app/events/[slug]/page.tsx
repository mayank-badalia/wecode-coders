import type { Metadata } from "next";
import Image from "next/image";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { notFound } from "next/navigation";
import { Poster } from "@/components/poster/Poster";
import { Arrow } from "@/components/site/Arrow";
import { LockGlyph } from "@/components/site/LockGlyph";
import { EventDetailMotion } from "@/components/site/EventDetailMotion";
import { EventSections } from "@/components/site/EventSections";
import { getAdjacentEvent, getAllEvents, getEventBySlug, getSite } from "@/lib/events";
import { eventDurationHours, formatEventDate, formatEventTime } from "@/lib/format";
import { webpSize } from "@/lib/imageSize";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllEvents().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};

  // A locked event must not leak through metadata either — that is the one
  // place a title would otherwise reach search results and link previews.
  if (event.locked) {
    return {
      title: "Locked event — We Code Coders",
      description: "This event has not been announced yet.",
      robots: { index: false, follow: false },
    };
  }

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
  fontSize: "clamp(0.72rem, 0.85vw, 0.72rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--color-ink-60)",
};

export default async function EventPage({ params }: Params) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  /*
    Locked events get a page that says only that they are locked. Everything
    else about them is absent from this component's data, not merely unrendered.
  */
  if (event.locked) {
    return (
      <main
        data-nav-theme="dark"
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100svh",
          display: "grid",
          placeItems: "center",
          background: "var(--color-ink)",
          color: "var(--color-paper)",
          padding: "clamp(6rem, 16vh, 10rem) clamp(1.25rem, 5vw, 3rem)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "44ch" }}>
          <LockGlyph style={{ width: "clamp(2.2rem, 6vw, 3.4rem)", margin: "0 auto" }} />
          <p style={{ ...monoLabel, margin: "1.6rem 0 0", color: "var(--color-paper)", opacity: 0.55 }}>
            Locked
          </p>
          <h1
            style={{
              margin: "0.4em 0 0",
              fontFamily: "var(--font-editorial)",
              fontSize: "clamp(2rem, 6vw, 4rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
            }}
          >
            Not announced yet.
          </h1>
          <p
            style={{
              margin: "1.2em 0 0",
              fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
              lineHeight: 1.6,
              opacity: 0.75,
            }}
          >
            Registration opens when this one is announced. Nothing about it is
            published until then — not the brief, not the date, not the format.
          </p>
          <p style={{ marginTop: "2.2rem" }}>
            <TransitionLink
              href="/events"
              label="Events"
              className="back-link"
              style={{
                ...monoLabel,
                color: "var(--color-paper)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6em",
                borderBottom: "1px solid currentColor",
                paddingBottom: "0.3em",
              }}
            >
              Back to events
              <Arrow style={{ width: 15, height: 15 }} />
            </TransitionLink>
          </p>
        </div>
      </main>
    );
  }

  // Only ever points at something announced; a "next event" that is locked
  // would be a link to a wall.
  const next = getAdjacentEvent(slug);
  const nextAnnounced = next && !next.locked ? next : undefined;
  const site = getSite();
  const hours = eventDurationHours(event.startsAt, event.endsAt);

  // Read from the file, not declared beside it — see src/lib/imageSize.ts.
  // Drives --poster-ratio so the stacked hero's box is the picture exactly.
  const posterSize = event.posterImage ? webpSize(event.posterImage) : null;

  // The title sponsor is billed on its own line, above and larger than the
  // rest, so it is split off here rather than special-cased by index in JSX.
  const [titleSponsor, ...otherSponsors] = event.sponsors ?? [];

  const spec: { label: string; value: string }[] = [
    { label: "Date", value: formatEventDate(event.startsAt, event.endsAt) },
    { label: "Starts", value: event.startTimeNote ?? formatEventTime(event.startsAt) },
    // A duration measured from a start time that has not been announced is
    // fiction, so it is dropped alongside the time it is derived from.
    ...(event.startTimeNote ? [] : [{ label: "Runs for", value: `${hours} hours` }]),
    { label: "Joining", value: event.venue.name },
    { label: "Kind", value: event.format.replace("-", " ") },
    { label: "Who it is for", value: event.forWho },
  ];

  return (
    <EventDetailMotion>
      <article style={{ position: "relative", zIndex: 2 }}>
        {/*
          Two headers, because there are two kinds of poster.

          A generated poster composes to whatever box it is handed, so it can
          run full bleed with the title laid over it. A real poster is someone's
          finished artwork at a fixed portrait ratio: cropping it to a landscape
          band cuts the design in half, and setting our own title over it
          duplicates the one already printed on it. That one gets shown whole,
          against the ink ground, with the copy beside it.
        */}
        {event.posterImage ? (
          <header
            data-nav-theme="dark"
            style={{
              background: "var(--color-ink)",
              color: "var(--color-paper)",
              padding:
                "clamp(7rem, 16vh, 10rem) clamp(1.25rem, 4vw, 3rem) clamp(3rem, 8vh, 5rem)",
            }}
          >
            <div
              className="detail-hero"
              style={{
                maxWidth: "min(1680px, 92vw)",
                margin: "0 auto",
                display: "grid",
                ["--cols" as string]: "minmax(0, 5fr) minmax(0, 6fr)",
                gap: "clamp(2.5rem, 6vw, 5rem)",
                alignItems: "center",
              }}
            >
              {/*
                The poster leads, and comes first in the DOM so it takes the
                left column without a reordering rule that a reader dragging
                a keyboard through the page would feel as a jump.

                On a phone the grid collapses to one column and that order
                would push the title and the register button below a
                full-height poster, so the copy is pulled back above it there
                — see .detail-hero-copy in globals.css.
              */}
              {/*
                Sized in globals.css, not here. The box has to change shape on
                one column — height-driven beside the copy, width-driven under
                it — and an inline height would win against that media query.
              */}
              <div
                className="detail-hero-poster"
                style={
                  posterSize
                    ? {
                        ["--poster-ratio" as string]: `${posterSize.width} / ${posterSize.height}`,
                      }
                    : undefined
                }
              >
                <Poster event={event} showTitle={false} fill fit="contain" priority />
              </div>

              <div className="detail-hero-copy">
                <p style={{ ...monoLabel, color: "rgba(244,241,234,0.8)", margin: 0 }}>
                  {event.kicker}
                </p>
                <h1
                  className="detail-title"
                  style={{
                    margin: "0.3em 0 0",
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2.4rem, 6.5vw, 6rem)",
                    fontWeight: 700,
                    lineHeight: 0.92,
                    letterSpacing: "-0.02em",
                    textTransform: "uppercase",
                  }}
                >
                  {event.title}
                </h1>
                <p
                  className="detail-hero-summary"
                  style={{
                    fontFamily: "var(--font-editorial)",
                    fontSize: "clamp(1.05rem, 1.5vw, 1.4rem)",
                    lineHeight: 1.55,
                    opacity: 0.82,
                  }}
                >
                  {event.summary}
                </p>

                {/*
                  Register, at the top of the page.

                  The red band at the foot is the full call to action, but it
                  sits behind the entire brief — tracks, submission list,
                  rules, judging — and someone who arrives already intending to
                  sign up should not have to read to the end to find the link.

                  Rendered only when there is a real URL, so it can never
                  appear as a button that goes nowhere.
                */}
                {event.registration?.href && (
                  <p style={{ margin: "1.6em 0 0" }}>
                    <a
                      href={event.registration.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="detail-cta detail-cta--signal"
                    >
                      {event.registration.label ?? "Register now"}
                      <Arrow direction="up-right" style={{ width: 15, height: 15 }} />
                    </a>
                  </p>
                )}
              </div>
            </div>
          </header>
        ) : (
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
        )}

        <div
          style={{
            maxWidth: "min(1680px, 92vw)",
            margin: "0 auto",
            padding: "clamp(3rem, 10vh, 7rem) clamp(1.25rem, 2vw, 2rem)",
            display: "grid",
            ["--cols" as string]: "minmax(0, 4fr) minmax(0, 7fr)",
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
                    fontSize: "clamp(0.72rem, 0.95vw, 0.8rem)",
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
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "baseline",
                        gap: "0.6em",
                        fontFamily: "var(--font-editorial)",
                        fontSize: "clamp(1.2rem, 2vw, 1.7rem)",
                        color: "var(--color-signal)",
                      }}
                    >
                      {j.name}
                      {j.weight && <span style={monoLabel}>{j.weight}</span>}
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

        {event.sections && event.sections.length > 0 && (
          <EventSections sections={event.sections} />
        )}

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
          Partners.

          Set as names, not as a logo wall. Supplied marks arrive at different
          weights, trims and colour treatments, and a row of them fights the
          typography holding up every other section here — a sponsor rendered
          badly is served worse than a sponsor set properly.
        */}
        {event.sponsors && event.sponsors.length > 0 && (
          <section
            style={{
              maxWidth: "min(1680px, 92vw)",
              margin: "0 auto",
              padding: "clamp(3.5rem, 10vh, 6rem) clamp(1.25rem, 2vw, 2rem) 0",
            }}
          >
            <p style={{ ...monoLabel, margin: "0 0 1.4rem" }}>[ Partners ]</p>

            {titleSponsor && (
              <div
                data-reveal
                style={{
                  borderTop: "1px solid var(--color-paper-2)",
                  paddingTop: "clamp(1.4rem, 3.5vh, 2.1rem)",
                }}
              >
                <p style={{ ...monoLabel, margin: 0, color: "var(--color-signal)" }}>
                  {titleSponsor.role}
                </p>
                {titleSponsor.logo ? (
                  <div className="sponsor-logo sponsor-logo--title">
                    <Image
                      src={titleSponsor.logo}
                      alt={titleSponsor.name}
                      fill
                      sizes="(max-width: 900px) 70vw, 340px"
                      style={{ objectFit: "contain", objectPosition: "left center" }}
                    />
                  </div>
                ) : (
                  /* As written — see the partner fallback below. */
                  <p
                    style={{
                      margin: "0.2em 0 0",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "clamp(2.2rem, 6.5vw, 4.5rem)",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {titleSponsor.name}
                  </p>
                )}
              </div>
            )}

            {otherSponsors.length > 0 && (
              <div className="sponsor-grid" data-reveal>
                {otherSponsors.map((s) => (
                  <div
                    key={s.name}
                    style={{ borderTop: "1px solid var(--color-paper-2)", paddingTop: "1.1rem" }}
                  >
                    <p style={{ ...monoLabel, margin: 0 }}>{s.role}</p>
                    {s.logo ? (
                      <div className="sponsor-logo">
                        <Image
                          src={s.logo}
                          alt={s.name}
                          fill
                          sizes="(max-width: 900px) 50vw, 180px"
                          style={{ objectFit: "contain", objectPosition: "left center" }}
                        />
                      </div>
                    ) : (
                      /*
                        Set as written, not upper-cased. A partner with no logo
                        file falls back to their name in type, and forcing case
                        on it misspells brands that are deliberately lower-case
                        — n8n became "N8N" here.
                      */
                      <p
                        style={{
                          margin: "0.35em 0 0",
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: "clamp(1.3rem, 2.2vw, 1.8rem)",
                          lineHeight: 1.05,
                        }}
                      >
                        {s.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/*
          Registration.

          `href` absent is the honest pre-launch state: the page says the form
          is not open rather than rendering a button that goes nowhere, which
          is both a dead link and a worse lie than saying nothing.
        */}
        {event.registration && (
          <section
            data-nav-theme="dark"
            style={{
              marginTop: "clamp(3.5rem, 10vh, 6rem)",
              background: "var(--color-signal)",
              color: "var(--color-paper)",
              padding: "clamp(3rem, 8vh, 5rem) clamp(1.25rem, 4vw, 3rem)",
            }}
          >
            <div style={{ maxWidth: "min(1680px, 92vw)", margin: "0 auto" }}>
              <p style={{ ...monoLabel, margin: 0, color: "var(--color-paper)", opacity: 0.75 }}>
                [ Register ]
              </p>
              <p
                data-reveal
                style={{
                  margin: "0.5em 0 0",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "clamp(2rem, 6.5vw, 5rem)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.02em",
                }}
              >
                {event.registration.href
                  ? (event.registration.label ?? "Register now")
                  : "Registration opens soon"}
              </p>
              {event.registration.note && (
                <p
                  style={{
                    margin: "1em 0 0",
                    maxWidth: "52ch",
                    fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
                    lineHeight: 1.6,
                    opacity: 0.85,
                  }}
                >
                  {event.registration.note}
                </p>
              )}
              {event.registration.href && (
                <p style={{ margin: "1.8rem 0 0" }}>
                  <a
                    href={event.registration.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="detail-cta"
                    style={{
                      ...monoLabel,
                      color: "var(--color-signal)",
                      background: "var(--color-paper)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.7em",
                      padding: "1em 1.6em",
                      borderRadius: 999,
                      textDecoration: "none",
                    }}
                  >
                    {event.registration.label ?? "Register now"}
                    <Arrow direction="up-right" style={{ width: 15, height: 15 }} />
                  </a>
                </p>
              )}
            </div>
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
              className="detail-cta"
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

        {nextAnnounced && (
          <nav
            aria-label="Next event"
            style={{
              maxWidth: "min(1680px, 92vw)",
              margin: "0 auto",
              padding: "0 clamp(1.25rem, 2vw, 2rem) clamp(4rem, 12vh, 8rem)",
            }}
          >
            <TransitionLink
              href={`/events/${nextAnnounced.slug}`}
              label={nextAnnounced.title}
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
                {nextAnnounced.title}
                <Arrow style={{ width: "0.5em", height: "0.5em" }} />
              </span>
            </TransitionLink>
          </nav>
        )}
      </article>
    </EventDetailMotion>
  );
}
