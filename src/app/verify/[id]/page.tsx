import type { Metadata } from "next";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { Arrow } from "@/components/site/Arrow";
import { findCertificate } from "@/lib/certificates";
import { getEventBySlug } from "@/lib/events";

type Params = { params: Promise<{ id: string }> };

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "clamp(0.72rem, 0.85vw, 0.74rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const cert = findCertificate(id);
  return {
    title: cert ? `Certificate ${cert.id} — We Code Coders` : "Verify a certificate — We Code Coders",
    description: cert
      ? `Issued to ${cert.name}.`
      : "Check whether a We Code Coders certificate is genuine.",
    // A verification result is a lookup, not a page anyone should find in
    // search. Indexing them would also publish the holders' names.
    robots: { index: false, follow: false },
  };
}

const ROLE_COPY: Record<string, string> = {
  participant: "Participant",
  finalist: "Finalist",
  winner: "Winner",
};

export default async function VerifyPage({ params }: Params) {
  const { id } = await params;
  const cert = findCertificate(id);

  const event = cert ? getEventBySlug(cert.event) : null;
  const eventTitle = event && !event.locked ? event.title : cert?.event;

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
      }}
    >
      <div style={{ width: "min(46rem, 100%)" }}>
        {cert ? (
          <>
            <p style={{ ...mono, margin: 0, color: "var(--color-signal)" }}>[ Verified ]</p>
            <h1
              className="detail-title"
              style={{
                margin: "0.4em 0 0",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem, 7vw, 5rem)",
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
              }}
            >
              {cert.name}
            </h1>
            <p
              style={{
                margin: "1.2em 0 0",
                maxWidth: "52ch",
                fontFamily: "var(--font-editorial)",
                fontSize: "clamp(1.05rem, 1.5vw, 1.3rem)",
                lineHeight: 1.55,
                opacity: 0.85,
              }}
            >
              This certificate was issued by We Code Coders and is genuine.
            </p>

            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                gap: "clamp(1.2rem, 3vw, 2rem)",
                margin: "clamp(2.4rem, 6vh, 3.5rem) 0 0",
                paddingTop: "clamp(1.4rem, 3vh, 2rem)",
                borderTop: "1px solid rgba(243,239,229,0.22)",
              }}
            >
              {[
                ["Event", eventTitle ?? "—"],
                ["Awarded as", ROLE_COPY[cert.role] ?? cert.role],
                ...(cert.teamName ? [["Team", cert.teamName]] : []),
                ["Issued", cert.issuedAt],
                ["Certificate ID", cert.id],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt style={{ ...mono, margin: 0, opacity: 0.6 }}>{label}</dt>
                  <dd
                    style={{
                      margin: "0.5em 0 0",
                      fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
                      lineHeight: 1.35,
                    }}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <>
            <p style={{ ...mono, margin: 0, opacity: 0.6 }}>[ Not found ]</p>
            <h1
              style={{
                margin: "0.4em 0 0",
                fontFamily: "var(--font-editorial)",
                fontSize: "clamp(2rem, 6vw, 3.6rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
              }}
            >
              No certificate with that ID.
            </h1>
            <p
              style={{
                margin: "1.2em 0 0",
                maxWidth: "52ch",
                fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
                lineHeight: 1.6,
                opacity: 0.75,
              }}
            >
              Check the ID printed on the certificate — it looks like{" "}
              <span style={{ fontFamily: "var(--font-mono)" }}>L30-7QK4M2</span>. Nothing we
              have issued is missing from this record, so an ID that does not resolve here was
              not issued by us.
            </p>
          </>
        )}

        <p style={{ marginTop: "clamp(2.4rem, 6vh, 3.5rem)" }}>
          <TransitionLink
            href="/events"
            label="Events"
            className="back-link"
            style={{
              ...mono,
              color: "var(--color-paper)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6em",
              borderBottom: "1px solid currentColor",
              paddingBottom: "0.3em",
            }}
          >
            We Code Coders events
            <Arrow style={{ width: 15, height: 15 }} />
          </TransitionLink>
        </p>
      </div>
    </main>
  );
}
