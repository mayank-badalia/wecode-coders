import type { Certificate as CertificateRecord } from "@/lib/certificates";

/*
  The certificate itself, rendered as markup rather than pictured.

  This component is the single source of the design: the PDF is printed from
  /verify/<id>/print, which renders this same component. There is no second
  copy of the artwork to drift out of step, and no generated images in the repo.

  Everything is sized in `em` off one root that scales with the container, so
  the same component serves a 1440px desktop, a 360px phone and an A4 page at
  identical proportions.

  The layout is centred and symmetrical because that is what the document is
  imitating, and because a certificate is read in one glance from across a
  desk rather than scanned left to right. Two things carry that glance: who it
  belongs to, and what they did. Everything else is set quiet around them.
*/

const ROLE_COPY: Record<string, string> = {
  participant: "a participant",
  finalist: "a finalist",
  winner: "a winner",
};

const TEAM_ROLE_COPY: Record<string, string> = {
  leader: "team leader",
  member: "a team member",
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
  real holder. Stepping down by length beats setting every name small enough
  for the worst one.
*/
function nameStep(name: string): string {
  /*
    Thresholds are low because character count is only a proxy for width:
    "Tanvi Pavan Bhageshwar" is 22 characters and still wrapped to two lines
    at the top size, which pushed the citation onto the footer rule. 20 was
    not low enough either: "Shubham Kumar Sharma" is exactly 20 and wrapped.
    Every threshold here was set by measuring all issued certificates for a
    citation that collides with the footer rule, not by eye.
  */
  if (name.length > 30) return "xlong";
  if (name.length > 18) return "long";
  return "normal";
}

/*
  "30 September 2026" — written out, in the timezone the event ran in.

  A certificate is a document somebody keeps, so 2026-09-30 is the wrong
  register for the line a reader actually reads, and parsing it as UTC would
  print the day before for an evening event in India.
*/
function heldOnLabel(iso: string): string {
  return new Date(`${iso}T12:00:00+05:30`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
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
  const award = cert.award;
  const heldOn = award?.heldOn ? heldOnLabel(award.heldOn) : null;

  return (
    <div className="cert-stage">
      <article className="cert" aria-label={`Certificate ${cert.id} for ${cert.name}`}>
        <div className="cert-frame" aria-hidden="true" />
        <div className="cert-inner">
          {/*
            Credits as a letterhead. They used to run as a band between the
            citation and the footer, where two logos plus their labels
            competed with the name for the only flexible space on the sheet —
            on a two-line name the footer lost and printed outside the frame.

            Print-sized logo copies, not the full-resolution marks used on the
            event page: at this size the originals added ~170KB per PDF for
            detail no one can see.
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

          <div className="cert-body">
            <p className="cert-mono cert-kind">{ROLE_TITLE[cert.role] ?? ROLE_TITLE.participant}</p>
            <span className="cert-ornament" aria-hidden="true" />

            <p className="cert-mono cert-awarded">This is to certify that</p>
            <h1 className="cert-name" data-length={nameStep(cert.name)}>
              {cert.name}
            </h1>
            <p className="cert-lead">took part in</p>

            {/*
              The competition, set as the second focal point. It is the thing
              a reader is looking for after the name — and the thing that was
              hardest to find in the previous layout, where it sat mid-sentence
              in grey body copy.
            */}
            <p className="cert-event">{award?.title ?? cert.event}</p>
            {(award?.context || award?.detail) && (
              <p className="cert-mono cert-event-sub">
                {[award?.context, award?.detail].filter(Boolean).join("  ·  ")}
              </p>
            )}

            {/*
              The closing line carries whatever is true of this record. Team
              used to split the lead — "took part, with team X, in" — which
              put a subordinate clause between the reader and the thing they
              were looking for.
            */}
            <p className="cert-citation">
              {cert.teamName ? (
                <>
                  with team <strong>{cert.teamName}</strong>
                  {cert.teamRole ? (
                    <> as <strong>{TEAM_ROLE_COPY[cert.teamRole]}</strong></>
                  ) : null}
                  ,{" "}
                </>
              ) : null}
              {heldOn ? <>held on {heldOn}, </> : null}
              and is recognised as <strong>{ROLE_COPY[cert.role] ?? cert.role}</strong>.
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
