import { programme, roles } from "@/data/roles";
import type { Programme, Role } from "./types";

/*
  The seam over recruitment content.

  Not server-only, unlike "@/lib/events" — there is nothing withheld here. A
  locked event has to be redacted before it reaches the browser; an open role
  is published copy, and the whole point of the page is that everybody can
  read every condition on it.

  It is still a seam rather than a direct import, for the same reason as the
  others: no component reads src/data, so when this content moves behind a CMS
  only the bodies below change.
*/

/** Open roles, in the order they are billed on the page. */
export function getRoles(): Role[] {
  return roles;
}

/** The terms that apply to every role. */
export function getProgramme(): Programme {
  return programme;
}

/**
 * Whether applications are actually open.
 *
 * Exists so the page never has to decide this twice. Without a form URL there
 * is no button — the page says applications open soon instead of linking
 * nowhere, which is the honest state and not a placeholder to be papered over.
 */
export function applicationsOpen(): boolean {
  return Boolean(programme.application.href);
}
