import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
    No on-screen dev indicator.

    It only ever renders under `next dev` — it is not part of a production
    build and was never going to ship — but it sits in the bottom-left corner
    over the loader mark and the rail's call to action, which makes every
    screenshot of this site harder to judge than it needs to be.
  */
  devIndicators: false,
};

export default nextConfig;
