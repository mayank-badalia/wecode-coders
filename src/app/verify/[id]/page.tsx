import type { Metadata } from "next";
import QRCode from "qrcode";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { Arrow } from "@/components/site/Arrow";
import { Certificate } from "@/components/site/Certificate";
import { certificatesWithin, findCertificate } from "@/lib/certificates";

type Params = { params: Promise<{ id: string }> };

const SITE = "https://wecodecoders.in";

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
    title: cert
      ? `Certificate ${cert.id} — We Code Coders`
      : "Verify a certificate — We Code Coders",
    description: cert ? `Issued to ${cert.name}.` : "Check whether a certificate is genuine.",
    // A lookup result is not something search should hold — indexing it would
    // publish the holders' names alongside their ids.
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

  // When an id does not resolve, it is usually two ids joined by a mail client
  // rather than a forgery. Offer what is actually in there.
  const embedded = cert ? [] : certificatesWithin(id);

  const verifyUrl = cert ? `${SITE}/verify/${cert.id}` : "";
  const qr = cert
    ? await QRCode.toDataURL(verifyUrl, {
        margin: 0,
        width: 400,
        color: { dark: "#142139ff", light: "#00000000" },
      })
    : "";

  return (
    <main
      data-nav-theme="dark"
      style={{
        position: "relative",
        zIndex: 2,
        minHeight: "100svh",
        background: "var(--color-ink)",
        color: "var(--color-paper)",
        padding: "clamp(6rem, 16vh, 9rem) clamp(1.25rem, 5vw, 3rem) clamp(4rem, 10vh, 6rem)",
      }}
    >
      <div style={{ width: "min(62rem, 100%)", margin: "0 auto" }}>
        {cert ? (
          <>
            <p style={{ ...mono, margin: 0, color: "var(--color-signal)" }}>[ Verified ]</p>
            <p
              style={{
                margin: "0.7em 0 0",
                maxWidth: "52ch",
                fontFamily: "var(--font-editorial)",
                fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                lineHeight: 1.45,
              }}
            >
              This certificate was issued by We Code Coders to{" "}
              <strong style={{ fontWeight: 600 }}>{cert.name}</strong>, and is genuine.
            </p>

            <div style={{ margin: "clamp(2rem, 5vh, 3rem) 0 0" }}>
              <Certificate
                cert={cert}
                verifyUrl={verifyUrl.replace(/^https?:\/\//, "")}
                qr={qr}
              />
            </div>

            {/*
              Certificates are delivered as this link rather than as an
              attachment, so this page has to be where the holder gets their
              copy. A plain anchor, not a transition link: the print route
              deliberately sits outside the site chrome.
            */}
            <p style={{ margin: "clamp(1.2rem, 3vh, 1.8rem) 0 0" }}>
              <a
                href={`/verify/${cert.id}/print`}
                className="verify-download"
                style={mono}
              >
                Download your certificate
                <Arrow style={{ width: 15, height: 15 }} />
              </a>
            </p>

            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
                gap: "clamp(1.2rem, 3vw, 2rem)",
                margin: "clamp(2rem, 5vh, 3rem) 0 0",
                paddingTop: "clamp(1.4rem, 3vh, 2rem)",
                borderTop: "1px solid rgba(243,239,229,0.22)",
              }}
            >
              {[
                ["Issued to", cert.name],
                ["Awarded for", cert.award?.title ?? cert.event],
                ...(cert.award?.context ? [["Part of", cert.award.context]] : []),
                ...(cert.award?.duration
                  ? [["Format", `${cert.award.duration} ${cert.award.kind ?? "challenge"}`]]
                  : []),
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
                      fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)",
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

            {embedded.length > 0 ? (
              <>
                <p
                  style={{
                    margin: "1.2em 0 0",
                    maxWidth: "54ch",
                    fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
                    lineHeight: 1.6,
                    opacity: 0.8,
                  }}
                >
                  That link has {embedded.length === 1 ? "an ID" : "two IDs"} run together — it
                  usually happens when a mail app joins a link to the line beneath it. Here
                  {embedded.length === 1 ? " is the one" : " are the ones"} it contains:
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: "1.4rem 0 0" }}>
                  {embedded.map((c) => (
                    <li key={c.id} style={{ marginTop: "0.8rem" }}>
                      <a
                        href={`/verify/${c.id}`}
                        style={{
                          ...mono,
                          color: "var(--color-paper)",
                          borderBottom: "1px solid var(--color-signal)",
                          paddingBottom: "0.25em",
                          textDecoration: "none",
                        }}
                      >
                        {c.id} — {c.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p
                style={{
                  margin: "1.2em 0 0",
                  maxWidth: "54ch",
                  fontSize: "clamp(0.95rem, 1.2vw, 1.1rem)",
                  lineHeight: 1.6,
                  opacity: 0.75,
                }}
              >
                Check the ID printed on the certificate — it looks like{" "}
                <span style={{ fontFamily: "var(--font-mono)" }}>L30-7QK4M2</span>. Nothing we
                have issued is missing from this record, so an ID that does not resolve here
                was not issued by us.
              </p>
            )}
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
