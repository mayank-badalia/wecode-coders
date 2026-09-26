import type { Metadata } from "next";
import { Arrow } from "@/components/site/Arrow";
import { BurstBreak } from "@/components/site/BurstBreak";
import { HiringMotion } from "@/components/site/HiringMotion";
import { getSite } from "@/lib/events";
import { applicationsOpen, getProgramme, getRoles } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Hiring — We Code Coders",
  description:
    "Open roles across India: hackathon organisers, creators and designers, campus and city leads. A performance-based community programme — no fixed salary, and everything it awards is earned.",
};

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "clamp(0.72rem, 0.95vw, 0.78rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--color-ink-60)",
};

const SHELL: React.CSSProperties = {
  maxWidth: "min(1680px, 92vw)",
  margin: "0 auto",
  padding: "0 clamp(1.25rem, 2vw, 2rem)",
};

/** Section heading in the house style: [ 02 ] // What this is. */
function SectionLabel({ code, children }: { code: string; children: React.ReactNode }) {
  return (
    <p
      style={{
        ...mono,
        margin: "0 0 1.6rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid var(--color-ink)",
      }}
    >
      [ {code} ] // {children}
    </p>
  );
}

/**
 * A titled list inside a role.
 *
 * Every block on this page is one of these, so the numbering, the rule above
 * each item and the measure are set once. `tone` exists because a role's own
 * responsibilities read at full contrast while what the community provides in
 * return is supporting detail.
 */
function RoleList({
  label,
  intro,
  items,
  tone = "ink",
}: {
  label: string;
  intro?: string;
  items: string[];
  tone?: "ink" | "muted";
}) {
  return (
    <div style={{ marginTop: "clamp(1.8rem, 4vh, 2.6rem)" }}>
      <p style={{ ...mono, margin: 0, color: "var(--color-signal)" }}>{label}</p>
      {intro && (
        <p
          style={{
            margin: "0.8em 0 0",
            maxWidth: "58ch",
            fontSize: "clamp(0.92rem, 1.05vw, 1rem)",
            lineHeight: 1.6,
            color: "var(--color-ink-60)",
          }}
        >
          {intro}
        </p>
      )}
      <ul className="hiring-list" style={{ listStyle: "none", margin: "1.1rem 0 0", padding: 0 }}>
        {items.map((item) => (
          <li
            key={item}
            data-reveal
            style={{
              borderTop: "1px solid var(--color-paper-2)",
              padding: "0.85em 0",
              maxWidth: "52ch",
              fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)",
              lineHeight: 1.55,
              color: tone === "muted" ? "var(--color-ink-60)" : undefined,
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HiringPage() {
  const site = getSite();
  const roles = getRoles();
  const programme = getProgramme();
  const open = applicationsOpen();

  return (
    <HiringMotion>
      <main style={{ position: "relative", zIndex: 2 }}>
        <header
          style={{
            ...SHELL,
            padding: "clamp(8rem, 20vh, 13rem) clamp(1.25rem, 2vw, 2rem) clamp(2.5rem, 7vh, 4rem)",
          }}
        >
          <p style={{ ...mono, margin: 0 }}>[ Hiring ] // {site.name}</p>
          <h1
            style={{
              margin: "0.3em 0 0",
              fontFamily: "var(--font-editorial)",
              fontSize: "clamp(2.8rem, 9vw, 8rem)",
              fontWeight: 900,
              lineHeight: 0.94,
              letterSpacing: "-0.025em",
            }}
          >
            Run the{" "}
            <span
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                color: "var(--color-signal)",
                // The italic's exit stroke overruns its advance width.
                marginRight: "0.12em",
              }}
            >
              next
            </span>{" "}
            one.
          </h1>
          <p
            style={{
              margin: "1.4em 0 0",
              maxWidth: "58ch",
              fontFamily: "var(--font-editorial)",
              fontSize: "clamp(1.1rem, 1.7vw, 1.5rem)",
              lineHeight: 1.55,
            }}
          >
            {programme.premise}
          </p>
        </header>

        {/*
          The pay position, before any list of benefits.

          A reader deciding whether to spend ten hours a week on this needs the
          terms first, not after three screens of what they could earn. It is
          set in signal red and full size for that reason — this is not fine
          print and the page does not treat it as any.
        */}
        <section style={{ ...SHELL, marginTop: "clamp(1rem, 3vh, 2rem)" }}>
          <div
            style={{
              borderTop: "2px solid var(--color-signal)",
              paddingTop: "clamp(1.2rem, 3vh, 1.8rem)",
              display: "grid",
              ["--cols" as string]: "minmax(0, 1fr) minmax(0, 2fr)",
              gap: "clamp(1rem, 4vw, 3rem)",
            }}
            className="hiring-grid"
          >
            <p style={{ ...mono, margin: 0, color: "var(--color-signal)" }}>
              Read this first
            </p>
            <p
              style={{
                margin: 0,
                maxWidth: "62ch",
                fontSize: "clamp(1rem, 1.25vw, 1.15rem)",
                lineHeight: 1.6,
              }}
            >
              {programme.compensation}
            </p>
          </div>
        </section>

        {/* What it asks of you */}
        <section style={{ ...SHELL, marginTop: "clamp(3.5rem, 10vh, 6rem)" }}>
          <SectionLabel code="01">What it asks of you</SectionLabel>
          <dl
            style={{
              margin: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
              gap: "clamp(1.4rem, 3vw, 2.4rem)",
            }}
          >
            {programme.commitment.map((c) => (
              <div key={c.label} data-reveal style={{ borderTop: "1px solid var(--color-ink-40)", paddingTop: "0.9rem" }}>
                <dt
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-editorial)",
                    fontSize: "clamp(1.3rem, 2.2vw, 1.9rem)",
                    color: "var(--color-signal)",
                  }}
                >
                  {c.label}
                </dt>
                <dd
                  style={{
                    margin: "0.5em 0 0",
                    fontSize: "clamp(0.92rem, 1.05vw, 1rem)",
                    lineHeight: 1.6,
                    color: "var(--color-ink-60)",
                  }}
                >
                  {c.detail}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* The roles */}
        <section style={{ ...SHELL, marginTop: "clamp(3.5rem, 10vh, 6rem)" }}>
          <SectionLabel code="02">Open roles</SectionLabel>
          {roles.map((role) => (
            <article
              key={role.anchor}
              id={role.anchor}
              className="hiring-role"
              style={{
                paddingTop: "clamp(2rem, 6vh, 3.5rem)",
                paddingBottom: "clamp(2.5rem, 7vh, 4rem)",
                borderBottom: "1px solid var(--color-paper-2)",
              }}
            >
              <div
                className="hiring-grid"
                style={{
                  display: "grid",
                  ["--cols" as string]: "minmax(0, 1fr) minmax(0, 2fr)",
                  gap: "clamp(1rem, 4vw, 3rem)",
                  alignItems: "start",
                }}
              >
                <div>
                  <p style={{ ...mono, margin: 0, color: "var(--color-ink-40)" }}>{role.code}</p>
                  <h2
                    style={{
                      margin: "0.25em 0 0",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      fontSize: "clamp(1.6rem, 3.4vw, 2.8rem)",
                      lineHeight: 1.02,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {role.title}
                  </h2>
                  <p style={{ ...mono, margin: "0.9em 0 0" }}>{role.kicker}</p>
                </div>
                <p
                  style={{
                    margin: 0,
                    maxWidth: "58ch",
                    fontFamily: "var(--font-editorial)",
                    fontSize: "clamp(1.05rem, 1.5vw, 1.35rem)",
                    lineHeight: 1.55,
                  }}
                >
                  {role.summary}
                </p>
              </div>

              <RoleList label="What you do" items={role.responsibilities} />
              {role.milestones && <RoleList label="How it is measured" items={role.milestones} />}
              {role.support && (
                <RoleList
                  label="What we provide"
                  intro={role.support.intro}
                  items={role.support.items}
                  tone="muted"
                />
              )}
              <RoleList label="What you get" items={role.benefits} />
              {role.skills && <RoleList label="Helpful to have" items={role.skills} tone="muted" />}
            </article>
          ))}
        </section>

        <BurstBreak line={site.tagline} />

        {/* Selection */}
        <section style={SHELL}>
          <SectionLabel code="03">How selection works</SectionLabel>
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {programme.rounds.map((r) => (
              <li
                key={r.round}
                data-reveal
                className="hiring-grid"
                style={{
                  display: "grid",
                  ["--cols" as string]: "minmax(0, 1fr) minmax(0, 2fr)",
                  gap: "clamp(1rem, 4vw, 3rem)",
                  padding: "1.8em 0",
                  borderBottom: "1px solid var(--color-paper-2)",
                }}
              >
                <div>
                  <p style={{ ...mono, margin: 0, color: "var(--color-signal)" }}>Round {r.round}</p>
                  <p
                    style={{
                      margin: "0.35em 0 0",
                      fontFamily: "var(--font-editorial)",
                      fontSize: "clamp(1.3rem, 2.2vw, 1.9rem)",
                      lineHeight: 1.15,
                    }}
                  >
                    {r.title}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      maxWidth: "58ch",
                      fontSize: "clamp(0.95rem, 1.15vw, 1.08rem)",
                      lineHeight: 1.6,
                    }}
                  >
                    {r.detail}
                  </p>
                  {r.items && (
                    <ul
                      className="hiring-list"
                      style={{ listStyle: "none", margin: "1.2rem 0 0", padding: 0 }}
                    >
                      {r.items.map((item) => (
                        <li
                          key={item}
                          style={{
                            borderTop: "1px solid var(--color-paper-2)",
                            padding: "0.7em 0",
                            fontSize: "0.92rem",
                            lineHeight: 1.5,
                            color: "var(--color-ink-60)",
                          }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Conditions */}
        <section style={{ ...SHELL, marginTop: "clamp(3.5rem, 10vh, 6rem)" }}>
          <SectionLabel code="04">Conditions</SectionLabel>
          <ol className="hiring-conditions" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {programme.conditions.map((c, i) => (
              <li
                key={c}
                data-reveal
                style={{
                  display: "flex",
                  gap: "1.1em",
                  borderTop: "1px solid var(--color-paper-2)",
                  padding: "0.9em 0",
                  maxWidth: "52ch",
                }}
              >
                <span style={{ ...mono, color: "var(--color-ink-40)", flexShrink: 0 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: "clamp(0.92rem, 1.05vw, 1rem)", lineHeight: 1.55 }}>
                  {c}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/*
          The apply band.

          Without a form URL this renders the headline and the note and no
          button — the same posture /events/[slug] takes before registration
          exists. A button here that went nowhere would be a dead link and a
          worse lie than saying the form is not ready.
        */}
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
            <p style={{ ...mono, margin: 0, color: "var(--color-paper)", opacity: 0.75 }}>
              [ Apply ]
            </p>
            <p
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
              {open
                ? (programme.application.label ?? "Apply now")
                : (programme.application.label ?? "Applications open soon")}
            </p>
            <p
              style={{
                margin: "1em 0 0",
                maxWidth: "52ch",
                fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
                lineHeight: 1.6,
                opacity: 0.85,
              }}
            >
              {programme.application.note}
            </p>
            {programme.application.href && (
              <p style={{ margin: "1.8rem 0 0" }}>
                <a
                  href={programme.application.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="detail-cta"
                  style={{
                    ...mono,
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
                  {programme.application.label ?? "Apply now"}
                  <Arrow direction="up-right" style={{ width: 15, height: 15 }} />
                </a>
              </p>
            )}
          </div>
        </section>
      </main>
    </HiringMotion>
  );
}
