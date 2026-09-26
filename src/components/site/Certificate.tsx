import type { Certificate as CertificateRecord } from "@/lib/certificates";

/*
  The certificate itself, rendered as markup rather than pictured.

  This component is the single source of the design: the PDF is printed from
  /verify/<id>/print, which renders this same component. There is no second
  copy of the artwork to drift out of step, and no generated images in the repo.

  Everything is sized in `em` off one root that scales with the container, so
  the same component serves a 1440px desktop, a 360px phone and an A4 page at
  identical proportions.
*/

const ROLE_COPY: Record<string, string> = {
  participant: "a participant",
  finalist: "a finalist",
  winner: "a winner",
};

export function Certificate({
  cert,
  verifyUrl,
  qr,
}: {
  cert: CertificateRecord;
  verifyUrl: string;
  qr: string;
}) {
  const title = cert.award?.title ?? "";
  const duration = cert.award?.duration;

  /*
    Print-sized logo copies, not the full-resolution marks used on the event
    page. Each certificate embeds both, and at the size they render here the
    originals added ~170KB per PDF for detail no one can see — 14MB across a
    batch of 55.
  */
  return (
    <div className="cert-stage">
      <article className="cert" aria-label={`Certificate ${cert.id} for ${cert.name}`}>
        <div className="cert-frame" aria-hidden="true" />
        <div className="cert-inner">
          <header className="cert-head">
            <p className="cert-mono cert-kind">Certificate of Participation</p>
            {cert.award?.context && <p className="cert-mono cert-context">{cert.award.context}</p>}
          </header>

          <div className="cert-body">
            <p className="cert-mono cert-awarded">This certifies that</p>
            {/*
              Long names are the failure mode: "Chinta Durga Siva Manikanta
              Reddy" is a real holder. A step down by length beats setting
              every name small enough for the worst one.
            */}
            <h1 className="cert-name" data-length={cert.name.length > 26 ? "long" : "normal"}>
              {cert.name}
            </h1>
            <p className="cert-citation">
              took part in <strong>{title}</strong>
              {duration ? <>, a {duration} challenge</> : null}
              {cert.teamName ? (
                <>
                  , with team <strong>{cert.teamName}</strong>
                </>
              ) : null}
              , and is recognised as <strong>{ROLE_COPY[cert.role] ?? cert.role}</strong>.
            </p>
          </div>

          {/*
            Credits before the administrative strip: who ran it and who backed
            it is part of what the certificate asserts, so it sits with the
            citation rather than in the small print.
          */}
          <div className="cert-credits">
            <div className="cert-credit">
              <p className="cert-mono cert-credit-role">Organised by</p>
              <img className="cert-logo cert-logo--wcc" src="/sponsors/we-code-coders-print.png" alt="We Code Coders" />
            </div>
            <div className="cert-credit">
              <p className="cert-mono cert-credit-role">Title Sponsor</p>
              <img className="cert-logo cert-logo--inkloom" src="/sponsors/inkloom-print.png" alt="Inkloom" />
            </div>
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
              {/* Decorative on the page: the reader is already where it points. */}
              <img className="cert-qr" src={qr} alt="" />
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
}
