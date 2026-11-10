// Leave Request helpers (design Part A §9, rule 8). The Days number is
// always computed from the two dates — the app never stores or accepts it.

const DAY_MS = 86_400_000;

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
