// Calendar-day helpers in the learner's local time zone. Habit data is
// keyed by 'YYYY-MM-DD' so a "day" is the day the learner sees.

export type DateKey = string;

export function dateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parse(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: DateKey, days: number): DateKey {
  const date = parse(key);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

/** Whole calendar days from `a` to `b` (positive when b is later). DST-safe. */
export function daysBetween(a: DateKey, b: DateKey): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}
