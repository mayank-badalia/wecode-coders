import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Observer } from "gsap/Observer";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/*
  The single GSAP registration point.

  Importing "gsap" or "gsap/*" anywhere else in this app is an ESLint error
  (see eslint.config.mjs). Registering a plugin twice is harmless; failing to
  register one is not — it works in dev and breaks only in the production
  build, once tree-shaking drops the unreferenced plugin.

  As of GSAP 3.15 every plugin below ships in the public npm package. No Club
  membership, no private registry, no token in .npmrc.
*/
gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
  DrawSVGPlugin,
  MorphSVGPlugin,
  Flip,
  Observer,
  InertiaPlugin,
  CustomEase,
  ScrambleTextPlugin,
);

// The project's two eases. `wcc` is the symmetrical one used for panels and
// wipes; `wccOut` is the decelerating one used for nearly every reveal.
CustomEase.create("wcc", "0.76, 0, 0.24, 1");
CustomEase.create("wccOut", "0.16, 1, 0.3, 1");

gsap.defaults({ ease: "wccOut", duration: 0.8 });

export {
  CustomEase,
  DrawSVGPlugin,
  Flip,
  gsap,
  InertiaPlugin,
  MorphSVGPlugin,
  Observer,
  ScrambleTextPlugin,
  ScrollTrigger,
  SplitText,
};
