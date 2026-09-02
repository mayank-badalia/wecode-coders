import type { CSSProperties } from "react";

/**
 * A padlock, used wherever an event is held back before announcement.
 *
 * Deliberately the only mark a locked event carries: no title, no date, no
 * format, nothing that hints at what is behind it.
 */
export function LockGlyph({
  className,
  style,
  strokeWidth = 1.5,
}: {
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      style={{ width: "clamp(1.4rem, 9cqw, 2.4rem)", height: "auto", ...style }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4.5" y="10.5" width="15" height="10" rx="1.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <path d="M12 14.5v2.5" />
    </svg>
  );
}
