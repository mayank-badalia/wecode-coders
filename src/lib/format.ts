/*
  Fixed to en-GB and UTC so the server and the client format identically.
  Using the visitor's locale here would produce a hydration mismatch on every
  date on the site. The one place local time is genuinely wanted — the footer
  clock — is client-only and formats explicitly in the community's timezone.
*/
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
  const a = new Date(startsAt);
  const b = new Date(endsAt);

  if (a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10)) {
    return DAY.format(a);
  }

  const sameYear = a.getUTCFullYear() === b.getUTCFullYear();
  return `${sameYear ? DAY_NO_YEAR.format(a) : DAY.format(a)} — ${DAY.format(b)}`;
}

export function formatEventTime(iso: string): string {
  return TIME.format(new Date(iso));
}

export function eventDurationHours(startsAt: string, endsAt: string): number {
  return Math.round(
    (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 3_600_000,
  );
}
