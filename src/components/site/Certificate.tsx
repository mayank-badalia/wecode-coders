import type { Certificate as CertificateRecord } from "@/lib/certificates";

/*
  The certificate itself, rendered as the page rather than pictured on it.

  This is the same design as src/certificates/<event>.html, which the PDF is
  printed from — not a screenshot of it. That means the verify page cannot
  drift out of date with the artwork, and there are no megabytes of generated
  images in the repo.

  Everything is sized in `em` off a single root that scales with the container,
  so one component serves a 1440px desktop and a 360px phone at identical
  proportions. The A4 landscape ratio is pinned by aspect-ratio, so it is
  always the shape of the thing that comes out of the printer.
*/
export function Certificate({
  cert,
  eventTitle,
  eventDates,
  verifyUrl,
  qr,
}: {
  cert: CertificateRecord;
  eventTitle: string;
  eventDates: string;
  verifyUrl: string;
  qr: string;
}) {
  const ROLE_COPY: Record<string, string> = {
    participant: "a participant",
    finalist: "a finalist",
    winner: "a winner",
  };

  return (
    <div className="cert-stage">
      <article className="cert" aria-label={`Certificate ${cert.id} for ${cert.name}`}>
        <div className="cert-frame" aria-hidden="true" />
        <div className="cert-inner">
          <header className="cert-head">
            <div className="cert-wordmark">
              WE<span>CODE</span>
              <br />
              CODERS
            </div>
            <div className="cert-mono cert-event">
              {eventTitle}
              <br />
              {eventDates}
            </div>
          </header>

          <div className="cert-body">
            <p className="cert-mono cert-awarded">This certifies that</p>
            {/*
              Long names are the failure mode: "Chinta Durga Siva Manikanta
              Reddy" is a real holder. The size steps down by name length
              rather than being set small enough for the worst case, which
              would leave every ordinary name looking timid.
            */}
            <h1 className="cert-name" data-length={cert.name.length > 26 ? "long" : "normal"}>
              {cert.name}
            </h1>
            <p className="cert-citation">
              took part in <strong>{eventTitle}</strong>, a national online hackathon run by We
              Code Coders, and is recognised as <strong>{ROLE_COPY[cert.role] ?? cert.role}</strong>.
            </p>
          </div>

          <footer className="cert-foot">
            <dl className="cert-meta">
              <div>
                <dt className="cert-mono">Issued</dt>
                <dd>{cert.issuedAt}</dd>
              </div>
              <div>
                <dt className="cert-mono">Certificate ID</dt>
                <dd className="cert-id">{cert.id}</dd>
              </div>
            </dl>
            <div className="cert-verify">
              <div>
                <p className="cert-mono cert-verify-label">Verify at</p>
                <p className="cert-mono cert-verify-url">{verifyUrl}</p>
              </div>
              {/* Decorative here: the reader is already on the page it points to. */}
              <img className="cert-qr" src={qr} alt="" />
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
}
