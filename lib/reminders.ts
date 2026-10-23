// Plans the next week of reminder notifications. One-off notifications
// per day (rather than a repeating one) let us skip days the goal is
// already met and vary the wording. Re-planned on every app open.

export const REMINDER_DAYS_AHEAD = 7;

export interface PlannedReminder {
  date: Date;
  title: string;
  body: string;
}

export function planReminders(opts: {
  now: Date;
  hour: number;
  minute: number;
  goalMetToday: boolean;
  /** Reason-specific lines; `{language}` is replaced with the language name. */
  lines: string[];
  languageName: string;
}): PlannedReminder[] {
  const { now, hour, minute, goalMetToday, lines, languageName } = opts;
  const plan: PlannedReminder[] = [];
  if (!lines.length) return plan;

  for (let offset = 0; offset < REMINDER_DAYS_AHEAD; offset++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, minute);
    if (offset === 0 && (goalMetToday || date <= now)) continue;
    const line = lines[date.getDate() % lines.length];
    plan.push({
      date,
      title: `Time for ${languageName}`,
      body: line.replaceAll('{language}', languageName),
    });
  }
  return plan;
}
