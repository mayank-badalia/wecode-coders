import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { Arrow } from "@/components/site/Arrow";
import { isCertificateId } from "@/lib/certificates";

export const metadata: Metadata = {
  title: "Verify a certificate — We Code Coders",
  description: "Check whether a We Code Coders certificate is genuine.",
};

type Props = { searchParams: Promise<{ id?: string }> };

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "clamp(0.72rem, 0.85vw, 0.74rem)",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

/*
  The lookup form is a plain GET to this same page — no client JavaScript, no
  state. A valid id redirects to /verify/<id>, which is the shareable address
  printed on the certificate and encoded in its QR code. An invalid one falls
  through to the same form with a note, rather than pretending to search.
*/
export default async function VerifyIndex({ searchParams }: Props) {
  const { id } = await searchParams;
  const typed = id?.trim() ?? "";

  if (typed && isCertificateId(typed)) {
    redirect(`/verify/${encodeURIComponent(typed.toUpperCase())}`);
  }

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
      <div style={{ width: "min(40rem, 100%)" }}>
        <p style={{ ...mono, margin: 0, color: "var(--color-signal)" }}>[ Verify ]</p>
        <h1
          style={{
            margin: "0.4em 0 0",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.2rem, 7vw, 4.5rem)",
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
          }}
        >
          Check a certificate
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
          Every certificate we issue carries an ID. Enter it here to see who it was issued to
          and for which event.
        </p>

        <form
          method="get"
          action="/verify"
          className="verify-form"
          style={{ marginTop: "clamp(2rem, 5vh, 3rem)" }}
        >
          <label htmlFor="id" style={{ ...mono, display: "block", opacity: 0.6 }}>
            Certificate ID
          </label>
          <div className="verify-row">
            <input
              id="id"
              name="id"
              required
              autoComplete="off"
              spellCheck={false}
              placeholder="L30-7QK4M2"
              defaultValue={typed}
              className="verify-input"
            />
            <button type="submit" className="verify-submit">
              Check
              <Arrow direction="up-right" style={{ width: 14, height: 14 }} />
            </button>
          </div>
          {typed && !isCertificateId(typed) && (
            <p style={{ margin: "0.9rem 0 0", color: "var(--color-signal)", fontSize: "0.95rem" }}>
              That is not the shape of one of our IDs. They look like L30-7QK4M2.
            </p>
          )}
        </form>

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
