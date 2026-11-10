// Leave Request helpers (design Part A §9–§11). The Days number is always
// computed from the two dates — the app never stores or accepts it. Server
// actions reuse the checks here so hiding a button is never the only guard.

const DAY_MS = 86_400_000;

import { prisma } from "./db";

// The three statuses a request can still be withdrawn from (rule 10).
export const OPEN_LEAVE_STATUSES = [
  "AWAITING_SUPERVISOR",
  "SIGNED",
  "AWAITING_HR",
] as const;

// Names for a set of user ids — the tables show names, not numbers.
export async function userNamesByIds(ids: number[]): Promise<Map<number, string>> {
  const unique = [...new Set(ids.filter((n) => Number.isInteger(n) && n > 0))];
  if (unique.length === 0) return new Map();
  const users = await prisma.user.findMany({
    where: { id: { in: unique } },
    select: { id: true, name: true },
  });
  return new Map(users.map((u) => [u.id, u.name]));
}

// Snap a stored date to its UTC midnight so counting depends only on the
// calendar date, not the time of day.
function toUtcMidnight(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

// Working days from start to end inclusive: Monday–Friday are counted,
// weekends are never consumed, public holidays are not skipped (rule 8).
// An inverted range (end before start) counts 0 — the submit checks refuse
// those anyway (rule 7), this just keeps the count safe.
export function workingDays(start: Date, end: Date): number {
  const first = toUtcMidnight(start);
  const last = toUtcMidnight(end);
  let count = 0;
  for (let t = first; t <= last; t += DAY_MS) {
    const day = new Date(t).getUTCDay(); // 0 = Sunday … 6 = Saturday
    if (day >= 1 && day <= 5) count += 1;
  }
  return count;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Parse a "YYYY-MM-DD" date from a form into a Date at midnight UTC, or null
// when it is missing, malformed or an impossible date (e.g. 2026-02-30).
export function parseDateOnly(value: unknown): Date | null {
  if (typeof value !== "string" || !DATE_RE.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  if (d.toISOString().slice(0, 10) !== value) return null;
  return d;
}
