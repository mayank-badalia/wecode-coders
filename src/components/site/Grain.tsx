/*
  Paper grain.

  Rendered once and left alone: animated grain looks marginally better and
  costs a full-viewport repaint every frame, which is a measurable battery and
  GPU drain for an effect nobody consciously notices.
*/
const GRAIN = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">
     <filter id="n">
       <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
       <feColorMatrix type="saturate" values="0"/>
     </filter>
     <rect width="220" height="220" filter="url(#n)"/>
   </svg>`,
)}`;

export function Grain() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        pointerEvents: "none",
        opacity: 0.04,
        mixBlendMode: "multiply",
        backgroundImage: `url("${GRAIN}")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}
