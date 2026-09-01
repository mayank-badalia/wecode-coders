"use client";

import { useEffect, useState } from "react";

/**
 * The clock the schedule is published in, ticking.
 *
 * Renders nothing on the server: the server's clock and the visitor's differ,
 * so rendering a time during SSR guarantees a hydration mismatch. The first
 * value is written after mount instead.
 */
export function LocalClock({ timezone, label }: { timezone: string; label: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timezone,
    });

    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timezone]);

  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      Schedules in {label} — {time ?? "--:--:--"}
    </span>
  );
}
