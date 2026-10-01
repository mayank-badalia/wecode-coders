import type { Metadata } from "next";
import { Arrow } from "@/components/site/Arrow";
import { HiringMotion } from "@/components/site/HiringMotion";
import { getSite } from "@/lib/events";
import { applicationsOpen, getProgramme, getRoles } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Hiring — We Code Coders",
  /*
    Unlisted while recruitment is closed.

    Nothing on the site links here any more, and this keeps it out of search
    results too — the page stays reachable for anyone holding the URL, which
    is the point, but it is not something a visitor can stumble into.
  */
  robots: { index: false, follow: false },
  description:
    "Open roles across India: hackathon organisers, creators and designers, campus and city leads. Clear your milestone and you are paid ₹10,000 a month.",
};

/*
  The hiring page.

  Built around the one question an applicant actually arrives with — what do I
  get, and when — so the pay is the first thing under the headline and the
  first thing in every role. The first version buried it: the page opened on a
  block of programme terms, and each role listed its pay sixth out of nine
  bullets.

  Everything is sized from the scale below rather than from a clamp() written
  wherever it was needed. Nine slightly different body sizes is most of what
  made the page read as unorganised, and a named scale is harder to drift.
*/

const TYPE = {
  /** Section labels and metadata. */
  mono: {
    fontFamily: "var(--font-mono)",
    fontSize: "clamp(0.72rem, 0.9vw, 0.78rem)",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  } as React.CSSProperties,
  /*
    Running text. Bigger and looser than the first draft, which set body copy
    at 0.92rem over a 52ch measure and was genuinely hard work to read.
  */
  body: {
    fontSize: "clamp(1rem, 1.05vw, 1.08rem)",
    lineHeight: 1.65,
  } as React.CSSProperties,
  /** The lead paragraph of a section. */
  lead: {
    fontFamily: "var(--font-editorial)",
    fontSize: "clamp(1.1rem, 1.5vw, 1.35rem)",
    lineHeight: 1.55,
  } as React.CSSProperties,
} as const;

const SHELL: React.CSSProperties = {
  // Narrower than the 1680px the rest of the site uses. This page is read
  // rather than browsed, and a 1600px line of body copy is unreadable.
  maxWidth: "min(1280px, 92vw)",
  margin: "0 auto",
  padding: "0 clamp(1.25rem, 2vw, 2rem)",
};

/** One value for the gap between major sections, so the rhythm is even. */
const SECTION_GAP = "clamp(4rem, 11vh, 7rem)";

/** The two-column split used by every row on the page: label left, body right. */
const SPLIT = "minmax(0, 0.85fr) minmax(0, 1.15fr)";

function SectionHead({ code, title, intro }: { code: string; title: string; intro?: string }) {
  return (
    <header style={{ marginBottom: "clamp(2rem, 5vh, 3rem)" }}>
      <p
        style={{
          ...TYPE.mono,
          margin: 0,
          color: "var(--color-ink-40)",
          paddingBottom: "0.9rem",
          borderBottom: "1px solid var(--color-ink-40)",
        }}
      >
        [ {code} ] // {title}
      </p>
      {intro && <p style={{ ...TYPE.lead, margin: "1.4rem 0 0", maxWidth: "46ch" }}>{intro}</p>}
    </header>
  );
}

/**
 * A labelled list inside a role.
 *
 * One column at a readable measure, rather than the two ragged columns the
 * first version used. Those halved the page's height and doubled the work of
 * reading it: the eye had to hunt for the top of the second column after
 * every list, and each row stood as tall as the tallest cell in it.
 */
function RoleList({
  label,
  intro,
  items,
  muted = false,
}: {
  label: string;
  intro?: string;
  items: string[];
  muted?: boolean;
}) {
  return (
    <section style={{ marginTop: "clamp(2rem, 4vh, 2.8rem)" }}>
      <h4 style={{ ...TYPE.mono, margin: 0, color: "var(--color-signal)" }}>{label}</h4>
      {intro && (
        <p
          style={{
            ...TYPE.body,
            margin: "0.9rem 0 0",
            maxWidth: "62ch",
            color: "var(--color-ink-60)",
          }}
        >
          {intro}
        </p>
      )}
      <ul style={{ listStyle: "none", margin: "1.1rem 0 0", padding: 0 }}>
        {items.map((item) => (
          <li
            key={item}
            data-reveal
            style={{
              ...TYPE.body,
              display: "flex",
              gap: "1em",
              alignItems: "baseline",
              maxWidth: "64ch",
              padding: "0.6em 0",
              borderTop: "1px solid var(--color-paper-2)",
              color: muted ? "var(--color-ink-60)" : undefined,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                flexShrink: 0,
                width: "0.4em",
                height: "0.4em",
                borderRadius: "50%",
                background: "var(--color-ink-40)",
              }}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * What a role returns, at the top of the role rather than inside a bullet
 * list. It is the thing people scroll for, and a page that makes them hunt
 * for it is answering a question nobody asked.
 *
 * The label follows the kind. Creators are not paid, and heading their block
 * "What you are paid" would be the one lie that matters on this page.
 */
function RewardBlock({
  kind,
  headline,
  detail,
}: {
  kind: "pay" | "recognition";
  headline: string;
  detail: string;
}) {
  return (
    <div
      data-reveal
      style={{
        marginTop: "clamp(1.8rem, 4vh, 2.4rem)",
        background: "var(--color-ink)",
        color: "var(--color-paper)",
        padding: "clamp(1.4rem, 3vw, 2rem) clamp(1.4rem, 3vw, 2.2rem)",
      }}
    >
      <p style={{ ...TYPE.mono, margin: 0, opacity: 0.6 }}>
        {kind === "pay" ? "What you are paid" : "What you get for it"}
      </p>
      <p
        style={{
          margin: "0.5rem 0 0",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          textTransform: "uppercase",
          fontSize: "clamp(1.45rem, 2.9vw, 2.3rem)",
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
        }}
      >
        {headline}
      </p>
      <p style={{ ...TYPE.body, margin: "1rem 0 0", maxWidth: "58ch", opacity: 0.85 }}>
        {detail}
      </p>
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
            padding: "clamp(8rem, 20vh, 13rem) clamp(1.25rem, 2vw, 2rem) 0",
          }}
        >
          <p style={{ ...TYPE.mono, margin: 0, color: "var(--color-ink-40)" }}>
            [ Hiring ] // {site.name}
          </p>
          <h1
            style={{
              margin: "0.3em 0 0",
              fontFamily: "var(--font-editorial)",
              fontSize: "clamp(2.8rem, 8.5vw, 7rem)",
              fontWeight: 900,
              lineHeight: 0.95,
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
          <p style={{ ...TYPE.lead, margin: "1.6rem 0 0", maxWidth: "52ch" }}>
            {programme.premise}
          </p>
        </header>

        {/*
          The pay, directly under the headline.

          This slot used to hold a block of programme terms, which is the
          wrong thing to lead with: it answered a question nobody had reached
          yet, and read as a list of reasons not to apply.
        */}
        <section style={{ ...SHELL, marginTop: "clamp(2.5rem, 6vh, 4rem)" }}>
          <div
            data-reveal
            className="hiring-grid"
            style={{
              background: "var(--color-signal)",
              color: "var(--color-paper)",
              padding: "clamp(2rem, 5vw, 3.2rem)",
              display: "grid",
              ["--cols" as string]: "minmax(0, 1fr) minmax(0, 1.1fr)",
              gap: "clamp(1.5rem, 4vw, 3.5rem)",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ ...TYPE.mono, margin: 0, opacity: 0.75 }}>What you are paid</p>
              <p
                style={{
                  margin: "0.4rem 0 0",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "clamp(2.3rem, 6vw, 4.2rem)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.02em",
                }}
              >
                {programme.pay.headline}
              </p>
              <p style={{ ...TYPE.lead, margin: "0.5rem 0 0", fontStyle: "italic", opacity: 0.9 }}>
                {programme.pay.gate}
              </p>
            </div>
            <p style={{ ...TYPE.body, margin: 0, maxWidth: "52ch" }}>
              {programme.pay.detail}
            </p>
          </div>
        </section>

        {/* Roles */}
        <section style={{ ...SHELL, marginTop: SECTION_GAP }}>
          <SectionHead
            code="01"
            title="Open roles"
            intro="Three ways in. Pick the one that matches what you already do, not the one that sounds most senior."
          />

          {roles.map((role, i) => (
            <article
              key={role.anchor}
              id={role.anchor}
              style={{
                paddingTop: i === 0 ? 0 : "clamp(3rem, 8vh, 5rem)",
                paddingBottom: "clamp(3rem, 8vh, 5rem)",
                borderBottom: i === roles.length - 1 ? "none" : "1px solid var(--color-ink-40)",
              }}
            >
              <div
                className="hiring-grid"
                style={{
                  display: "grid",
                  ["--cols" as string]: SPLIT,
                  gap: "clamp(1.5rem, 4vw, 3.5rem)",
                  alignItems: "start",
                }}
              >
                <div>
                  <p style={{ ...TYPE.mono, margin: 0, color: "var(--color-ink-40)" }}>
                    {role.code}
                  </p>
                  <h3
                    style={{
                      margin: "0.3rem 0 0",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      fontSize: "clamp(1.7rem, 3.2vw, 2.6rem)",
                      lineHeight: 1.02,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {role.title}
                  </h3>
                  <p
                    style={{
                      ...TYPE.mono,
                      margin: "0.9rem 0 0",
                      color: "var(--color-signal)",
                    }}
                  >
                    {role.kicker}
                  </p>
                  {/* Scarcity, stated plainly rather than implied. */}
                  <p
                    style={{
                      ...TYPE.mono,
                      margin: "0.8rem 0 0",
                      display: "inline-block",
                      padding: "0.5em 0.9em",
                      border: "1px solid var(--color-ink-40)",
                      borderRadius: 999,
                      color: "var(--color-ink-60)",
                    }}
                  >
                    Only {role.openings} open
                  </p>
                </div>
                <p style={{ ...TYPE.body, margin: 0, maxWidth: "62ch" }}>{role.summary}</p>
              </div>

              <RewardBlock
                kind={role.reward.kind}
                headline={role.reward.headline}
                detail={role.reward.detail}
              />

              <RoleList label="What you do" items={role.responsibilities} />
              {role.milestones && <RoleList label="How it is measured" items={role.milestones} />}
              {role.support && (
                <RoleList
                  label="What we provide"
                  intro={role.support.intro}
                  items={role.support.items}
                  muted
                />
              )}
              <RoleList label="What else you get" items={role.benefits} />
              {role.skills && <RoleList label="Helpful to have" items={role.skills} muted />}
            </article>
          ))}
        </section>

        {/* Selection */}
        <section style={{ ...SHELL, marginTop: SECTION_GAP }}>
          <SectionHead code="02" title="How selection works" />
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {programme.rounds.map((r) => (
              <li
                key={r.round}
                data-reveal
                className="hiring-grid"
                style={{
                  display: "grid",
                  ["--cols" as string]: SPLIT,
                  gap: "clamp(1.2rem, 4vw, 3.5rem)",
                  padding: "clamp(1.8rem, 4vh, 2.6rem) 0",
                  borderTop: "1px solid var(--color-paper-2)",
                }}
              >
                <div>
                  <p style={{ ...TYPE.mono, margin: 0, color: "var(--color-signal)" }}>
                    Round {r.round}
                  </p>
                  <h3
                    style={{
                      margin: "0.35rem 0 0",
                      fontFamily: "var(--font-editorial)",
                      fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)",
                      lineHeight: 1.15,
                      fontWeight: 500,
                    }}
                  >
                    {r.title}
                  </h3>
                </div>
                <div>
                  <p style={{ ...TYPE.body, margin: 0, maxWidth: "60ch" }}>{r.detail}</p>
                  {r.items && (
                    <ul style={{ listStyle: "none", margin: "1.3rem 0 0", padding: 0 }}>
                      {r.items.map((item) => (
                        <li
                          key={item}
                          style={{
                            ...TYPE.body,
                            fontSize: "0.95rem",
                            padding: "0.5em 0",
                            borderTop: "1px solid var(--color-paper-2)",
                            color: "var(--color-ink-60)",
                            maxWidth: "58ch",
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

            {/*
              What happens after the interview, as the closing step of the
              same list — to an applicant it is the next thing that happens,
              not a separate topic.
            */}
            <li
              data-reveal
              className="hiring-grid"
              style={{
                display: "grid",
                ["--cols" as string]: SPLIT,
                gap: "clamp(1.2rem, 4vw, 3.5rem)",
                padding: "clamp(1.8rem, 4vh, 2.6rem) 0 0",
                borderTop: "2px solid var(--color-signal)",
              }}
            >
              <div>
                <p style={{ ...TYPE.mono, margin: 0, color: "var(--color-signal)" }}>Then</p>
                <h3
                  style={{
                    margin: "0.35rem 0 0",
                    fontFamily: "var(--font-editorial)",
                    fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)",
                    lineHeight: 1.15,
                    fontWeight: 500,
                  }}
                >
                  {programme.onboarding.title}
                </h3>
              </div>
              <p style={{ ...TYPE.body, margin: 0, maxWidth: "60ch" }}>
                {programme.onboarding.detail}
              </p>
            </li>
          </ol>
        </section>

        {/* Conditions */}
        <section style={{ ...SHELL, marginTop: SECTION_GAP }}>
          <SectionHead code="03" title="Conditions" />
          <ol
            className="hiring-conditions"
            style={{ listStyle: "none", margin: 0, padding: 0, gap: "0 clamp(2rem, 5vw, 4rem)" }}
          >
            {programme.conditions.map((c, i) => (
              <li
                key={c}
                data-reveal
                style={{
                  ...TYPE.body,
                  display: "flex",
                  gap: "1.1em",
                  alignItems: "baseline",
                  borderTop: "1px solid var(--color-paper-2)",
                  padding: "0.8em 0",
                  maxWidth: "56ch",
                  color: "var(--color-ink-60)",
                }}
              >
                <span style={{ ...TYPE.mono, color: "var(--color-ink-40)", flexShrink: 0 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* What it asks of you — last, as the closing practical detail. */}
        <section style={{ ...SHELL, marginTop: SECTION_GAP }}>
          <SectionHead
            code="04"
            title="What it asks of you"
            intro="Before you apply, the practical shape of it."
          />
          <dl
            style={{
              margin: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
              gap: "clamp(1.6rem, 3.5vw, 2.6rem)",
            }}
          >
            {programme.commitment.map((c) => (
              <div
                key={c.label}
                data-reveal
                style={{ borderTop: "1px solid var(--color-ink-40)", paddingTop: "1rem" }}
              >
                <dt
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-editorial)",
                    fontSize: "clamp(1.3rem, 2vw, 1.7rem)",
                    color: "var(--color-signal)",
                  }}
                >
                  {c.label}
                </dt>
                <dd style={{ ...TYPE.body, margin: "0.7rem 0 0", color: "var(--color-ink-60)" }}>
                  {c.detail}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/*
          Without a form URL this renders the headline and the note and no
          button — the same posture /events/[slug] takes before registration
          exists. A button that went nowhere would be a dead link.
        */}
        <section
          data-nav-theme="dark"
          style={{
            marginTop: SECTION_GAP,
            background: "var(--color-ink)",
            color: "var(--color-paper)",
            padding: "clamp(3.5rem, 9vh, 5.5rem) clamp(1.25rem, 4vw, 3rem)",
          }}
        >
          <div style={{ maxWidth: "min(1280px, 92vw)", margin: "0 auto" }}>
            <p style={{ ...TYPE.mono, margin: 0, opacity: 0.6 }}>[ Apply ]</p>
            <p
              style={{
                margin: "0.5rem 0 0",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                textTransform: "uppercase",
                fontSize: "clamp(2rem, 6vw, 4.4rem)",
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
              }}
            >
              {open
                ? (programme.application.label ?? "Apply now")
                : (programme.application.label ?? "Applications open soon")}
            </p>
            <p style={{ ...TYPE.body, margin: "1.2rem 0 0", maxWidth: "52ch", opacity: 0.8 }}>
              {programme.application.note}
            </p>
            {programme.application.href && (
              <p style={{ margin: "2rem 0 0" }}>
                <a
                  href={programme.application.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="detail-cta"
                  style={{
                    ...TYPE.mono,
                    color: "var(--color-ink)",
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
