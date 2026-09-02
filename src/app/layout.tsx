import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Loader, LOADER_PREPAINT_SCRIPT } from "@/components/site/Loader";
import { Cursor } from "@/components/motion/Cursor";
import { Grain } from "@/components/site/Grain";
import { Grid } from "@/components/site/Grid";
import { Nav } from "@/components/site/Nav";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { getSite } from "@/lib/events";
import { TransitionProvider } from "@/components/motion/TransitionProvider";
import { instrumentSerif, plexCondensed, plexMono, plexSans } from "@/lib/fonts";
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
      className={`${instrumentSerif.variable} ${plexSans.variable} ${plexCondensed.variable} ${plexMono.variable}`}
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
          <TransitionProvider>
            <Loader />
            <Grain />
            <Cursor />
            <Grid />
            <Nav />
            {children}
            <SiteFooter site={getSite()} />
          </TransitionProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
