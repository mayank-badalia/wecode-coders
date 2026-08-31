/*
  The editorial grid.

  Faintly visible at rest so the layout reads as built on a grid rather than
  floating. Sections raise --grid-opacity briefly as they enter, which makes
  the structure assert itself and then recede.
*/
export function Grid() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        opacity: "var(--grid-opacity, 0.15)",
        transition: "opacity 400ms ease",
      }}
    >
      <div
        style={{
          height: "100%",
          margin: "0 auto",
          maxWidth: "min(1680px, 92vw)",
          backgroundImage:
            "repeating-linear-gradient(to right, var(--color-paper-2) 0 1px, transparent 1px calc(100% / 12))",
          backgroundSize: "100% 100%",
        }}
      />
    </div>
  );
}
