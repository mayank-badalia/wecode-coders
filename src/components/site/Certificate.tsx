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

/*
  The heading is the role, not a constant.

  "Certificate of Participation" printed above a winner's name undersells the
  thing the holder is going to show someone, and three identical headings make
  the role line the only difference between the three documents.
*/
const ROLE_TITLE: Record<string, string> = {
  participant: "Certificate of Participation",
  finalist: "Certificate of Merit",
  winner: "Certificate of Achievement",
};

/*
  Long names are the failure mode: "Chinta Durga Siva Manikanta Reddy" is a
  real holder, and "Pagidikalva Obula Jaswanth" already wraps to two lines at
  the top size. Stepping down by length beats setting every name small enough
  for the worst one, and the third step exists because two was not enough —
  the longest names in the Launchpad data overran the frame.
*/
function nameStep(name: string): string {
  if (name.length > 34) return "xlong";
  if (name.length > 24) return "long";
  return "normal";
}

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
  const kind = cert.award?.kind ?? "challenge";

  return (
    <div className="cert-stage">
      <article className="cert" aria-label={`Certificate ${cert.id} for ${cert.name}`}>
        <div className="cert-frame" aria-hidden="true" />
        <div className="cert-inner">
          {/*
            Credits sit at the top, as a letterhead.

            They used to run as a band between the citation and the footer,
            which is what pushed the administrative strip past the frame on
            longer names — two logos at 2.8em plus their labels is most of a
            line of body copy, and it was competing for the space the name
            needed. Up here they cost a fixed, small amount of height and read
            the way a letterhead does: who issued this, before what it says.

            Print-sized logo copies, not the full-resolution marks used on the
            event page. Each certificate embeds both, and at the size they
            render here the originals added ~170KB per PDF for detail no one
            can see — 14MB across a batch of 55.
          */}
          <div className="cert-credits">
            <div className="cert-credit">
              <p className="cert-mono cert-credit-role">Organised by</p>
              <img
                className="cert-logo cert-logo--wcc"
                src="/sponsors/we-code-coders-print.png"
                alt="We Code Coders"
              />
            </div>
            <div className="cert-credit cert-credit--end">
              <p className="cert-mono cert-credit-role">Title Sponsor</p>
              <img
                className="cert-logo cert-logo--inkloom"
                src="/sponsors/inkloom-print.png"
                alt="Inkloom"
              />
            </div>
          </div>

          <header className="cert-head">
            <p className="cert-mono cert-kind">{ROLE_TITLE[cert.role] ?? ROLE_TITLE.participant}</p>
            {cert.award?.context && <p className="cert-mono cert-context">{cert.award.context}</p>}
          </header>

          <div className="cert-body">
            <p className="cert-mono cert-awarded">This certifies that</p>
            <h1 className="cert-name" data-length={nameStep(cert.name)}>
              {cert.name}
            </h1>
            <p className="cert-citation">
              took part in <strong>{title}</strong>
              {duration ? (
                <>
                  , a {duration} {kind}
                </>
              ) : null}
              {cert.teamName ? (
                <>
                  , with team <strong>{cert.teamName}</strong>
                </>
              ) : null}
              , and is recognised as <strong>{ROLE_COPY[cert.role] ?? cert.role}</strong>.
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
              <div className="cert-verify-text">
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
