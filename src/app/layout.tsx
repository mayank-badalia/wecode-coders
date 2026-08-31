import type { Metadata } from "next";
import { Footer } from "@/components/site/Footer";
import { Loader, LOADER_PREPAINT_SCRIPT } from "@/components/site/Loader";
import { Grain } from "@/components/site/Grain";
import { Grid } from "@/components/site/Grid";
import { Nav } from "@/components/site/Nav";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { archivo, fraunces, jetbrainsMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "We Code Coders",
  description: "A community of builders. Build in public. Leave with proof.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${archivo.variable} ${jetbrainsMono.variable}`}
      /*
        The loader's pre-paint script stamps data-wcc-seen on this element
        before React hydrates, so the server's markup and the client's differ
        by that one attribute. It is intentional and one level deep, which is
        exactly the case this flag is for.
      */
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOADER_PREPAINT_SCRIPT }} />
      </head>
      <body>
        <MotionProvider>
          <Loader />
          <Grain />
          <Grid />
          <Nav />
          {children}
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
