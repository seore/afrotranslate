// Keeps scheduled reminders in step with the learner: re-plans the next
// week on launch, on returning to the app, when today's goal is met and
// when settings change. Reminders on days already practised are skipped.

import { useEffect } from 'react';
import { AppState } from 'react-native';

import { LEARNABLE_LANGUAGES } from '../content/languages';
import { REASONS } from '../content/reasons';
import { useHabit } from '../context/HabitContext';
import { useLearnerProfile } from '../context/LearnerProfileContext';
import { dateKey } from '../lib/dates';
import { planReminders } from '../lib/reminders';
import { goalMet } from '../lib/streak';
import { hasReminderPermission, scheduleReminders } from '../services/reminderService';

const FALLBACK_LINES = ['A few minutes of {language} keeps your streak going.'];

export function useReminderSync() {
  const { habit, loaded } = useHabit();
  const { profile } = useLearnerProfile();
  const { enabled, hour, minute } = habit.reminder;
  const metToday = goalMet(habit.days[dateKey(new Date())], habit.goalMinutes);

  useEffect(() => {
    if (!loaded) return;

    const sync = async () => {
      try {
        if (!enabled || !(await hasReminderPermission())) {
          await scheduleReminders([]);
          return;
        }
        const language = profile.language ?? 'yo';
        const plan = planReminders({
          now: new Date(),
          hour,
          minute,
          goalMetToday: goalMet(habit.days[dateKey(new Date())], habit.goalMinutes),
          lines: REASONS.find((r) => r.id === profile.reason)?.reminderLines ?? FALLBACK_LINES,
          languageName: LEARNABLE_LANGUAGES.find((l) => l.code === language)?.native ?? '',
        });
        await scheduleReminders(plan);
      } catch (error) {
        console.error('Reminder sync error:', error);
      }
    };

    sync();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, enabled, hour, minute, metToday, profile.reason, profile.language]);
}
