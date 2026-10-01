/*
  Event dates and times are formatted in the offset the event itself states,
  not in UTC and not in the visitor's locale.

  Not UTC, because an event starting at 09:00 in India starts at 09:00 for the
  people attending it — rendering 03:30 is simply wrong. Not the visitor's
  locale, because the server and the client would then disagree and every date
  on the site would be a hydration mismatch.

  The offset is read from the ISO string, so each event carries its own.
*/

const OFFSET = /(?:Z|([+-])(\d{2}):?(\d{2}))$/;

/** Minutes east of UTC, from an ISO 8601 string. Defaults to 0 for Z. */
function offsetMinutes(iso: string): number {
  const m = OFFSET.exec(iso.trim());
  if (!m || !m[1]) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3]));
}

/**
 * The instant shifted so that reading it in UTC yields the event's local
 * wall-clock time. Intl only reliably accepts named zones, and an event
 * record carries an offset rather than a zone name.
 */
function asLocalWallClock(iso: string): Date {
  return new Date(new Date(iso).getTime() + offsetMinutes(iso) * 60_000);
}

const DAY = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DAY_NO_YEAR = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

export function formatEventDate(startsAt: string, endsAt: string): string {
  const a = asLocalWallClock(startsAt);
  const b = asLocalWallClock(endsAt);

  if (a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10)) {
    return DAY.format(a);
  }

  const sameYear = a.getUTCFullYear() === b.getUTCFullYear();
  return `${sameYear ? DAY_NO_YEAR.format(a) : DAY.format(a)} — ${DAY.format(b)}`;
}

export function formatEventTime(iso: string): string {
  return TIME.format(asLocalWallClock(iso));
}

/** Real elapsed hours, which is offset-independent. */
export function eventDurationHours(startsAt: string, endsAt: string): number {
  return Math.round(
    (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 3_600_000,
  );
}

/**
 * How long an event runs, in the unit a reader would use for it.
 *
 * Hours stop being useful somewhere past a couple of days: a twelve-day
 * hackathon printed "Runs for 288 hours", which is accurate and tells nobody
 * anything.
 *
 * Days are counted inclusively, which is the part worth knowing. These events
 * are published as "twelve calendar days", running from a start date D to
 * D + 11 — eleven days of elapsed time across twelve dates. Dividing the
 * elapsed hours by 24 gives eleven and contradicts every other place the
 * event is described, so the first day is counted too.
 */
export function formatEventDuration(startsAt: string, endsAt: string): string {
  const hours = eventDurationHours(startsAt, endsAt);
  if (hours < 48) return `${hours} hours`;

  const days = Math.floor(hours / 24) + 1;
  return `${days} ${days === 1 ? "day" : "days"}`;
}
