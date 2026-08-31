import type { Metadata } from "next";
import { Grain } from "@/components/site/Grain";
import { Grid } from "@/components/site/Grid";
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
    >
      <body>
        <MotionProvider>
          <Grain />
          <Grid />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
