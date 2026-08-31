import type { CSSProperties } from "react";

type ArrowProps = {
  className?: string;
  style?: CSSProperties;
  /** Rotation applied to the base right-pointing form. */
  direction?: "right" | "down" | "left" | "up" | "up-right" | "down-right";
  strokeWidth?: number;
};

const ROTATION: Record<NonNullable<ArrowProps["direction"]>, number> = {
  right: 0,
  "down-right": 45,
  down: 90,
  left: 180,
  up: 270,
  "up-right": -45,
};

/**
 * The arrow flourish lifted out of the logo's C, R and S.
 *
 * This is the thread tying the wordmark to the rest of the layout — reused as
 * link markers, list bullets, the scroll cue, timeline node caps and the
 * "next event" indicator. Always decorative; meaning is carried by adjacent text.
 */
export function Arrow({
  className,
  style,
  direction = "right",
  strokeWidth = 1.5,
}: ArrowProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ ...style, transform: `rotate(${ROTATION[direction]}deg)` }}
    >
      {/* A tail that curves the way the logo's flourishes curve, not a straight shaft. */}
      <path d="M2 15.5C6.5 15.5 12 13.5 20.5 8" />
      <path d="M14.5 8.5 20.8 7.8 20.2 14" />
    </svg>
  );
}
