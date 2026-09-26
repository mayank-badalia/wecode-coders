import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Certificate } from "@/components/site/Certificate";
import { findCertificate } from "@/lib/certificates";

type Params = { params: Promise<{ id: string }> };

const SITE = "https://wecodecoders.in";

export const metadata: Metadata = {
  title: "Certificate",
  robots: { index: false, follow: false },
};

/*
  The print surface.

  scripts/render-certificates.mjs loads this route and prints it to PDF, which
  is why the design lives in one component rather than being duplicated in a
  standalone HTML file: the PDF and the verify page cannot disagree, because
  they are the same markup.

  Nothing else is on the page — no nav, no background, no motion — so the
  sheet that comes out is the certificate and only the certificate.
*/
export default async function PrintPage({ params }: Params) {
  const { id } = await params;
  const cert = findCertificate(id);
  if (!cert) notFound();

  const verifyUrl = `${SITE}/verify/${cert.id}`;
  const qr = await QRCode.toDataURL(verifyUrl, {
    margin: 0,
    width: 400,
    color: { dark: "#142139ff", light: "#00000000" },
  });

  return (
    <div className="cert-print">
      <Certificate cert={cert} verifyUrl={verifyUrl.replace(/^https?:\/\//, "")} qr={qr} />
    </div>
  );
}
