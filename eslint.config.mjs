import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Two of the four hard motion rules, enforced by the linter rather than
      // by memory. See docs/superpowers/specs — sections 6.2 and 6.3.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "gsap",
              message:
                'Import gsap from "@/components/motion/gsap" — that module is the single registration point.',
            },
          ],
          patterns: [
            {
              group: ["gsap/*"],
              message: 'Import GSAP plugins from "@/components/motion/gsap".',
            },
            {
              group: ["@/data/*", "**/data/events", "**/data/site"],
              message:
                'Read data through "@/lib/events" — components never import src/data directly.',
            },
          ],
        },
      ],
    },
  },
  {
    /*
      WebGL scene code drives external GPU resources — shader uniforms, camera
      transforms, geometry — by mutating them every frame. That is the only way
      three.js works, and those objects are not React state: nothing renders
      from them. react-hooks/immutability cannot tell the difference, so it is
      switched off for the canvas layer only. Everything outside this folder
      still has it on.
    */
    files: ["src/components/canvas/**"],
    rules: { "react-hooks/immutability": "off" },
  },
  {
    // The registration point itself must import gsap directly.
    files: ["src/components/motion/gsap.ts"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    /*
      The seams themselves must import the data modules directly. Certificates
      are their own seam: records live in src/data/certificates and everything
      else reads them through "@/lib/certificates".
    */
    files: ["src/lib/events.ts", "src/lib/certificates.ts"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    /*
      Tests may read the raw data. The locked-event test exists precisely to
      compare both sides of the seam — it has to know what a locked event
      actually says in order to prove none of it is published.
    */
    files: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    rules: { "no-restricted-imports": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".filmstrips/**"]),
]);

export default eslintConfig;
