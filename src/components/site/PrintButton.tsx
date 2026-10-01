"use client";

/*
  The holder's own download.

  Certificates are delivered as a verify link rather than an attachment: the
  link is what proves the certificate is real, and a PDF forwarded without it
  proves nothing. So the page the link opens has to be the place the holder
  can save their copy from.

  This drives the browser's own print-to-PDF rather than serving a generated
  file, which means the sheet someone saves is rendered from the same markup
  the verify page shows them — there is no second artefact that could differ
  from what they just looked at.

  Hidden in print media, so it never appears on the saved sheet or in the
  batch PDFs scripts/render-certificates.mjs prints from this same route.
*/
export function PrintButton() {
  return (
    <button type="button" className="cert-print-action" onClick={() => window.print()}>
      Save as PDF
    </button>
  );
}
