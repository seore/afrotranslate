// ================================================================
// lib/streak.ts - Daily goal, XP and streak rules (pure functions).
// A day counts toward the streak when the daily goal is met. Missed
// days are covered by streak freezes when available: one is earned for
// every 7-day streak, holding at most MAX_FREEZES.
// ================================================================

import { addDays, daysBetween, type DateKey } from './dates.ts';

export const MAX_FREEZES = 2;
export const FREEZE_EVERY_DAYS = 7;
export const DEFAULT_GOAL_MINUTES = 5;
export const GOAL_OPTIONS_MINUTES = [3, 5, 10, 15];

export const XP = {
  lesson: 10,
  perfectBonus: 5,
  starter: 10,
  reviewPerItem: 2,
};

/** Cap per session so leaving a lesson open doesn't inflate practice time. */
export const MAX_SESSION_SECONDS = 15 * 60;

export interface DayLog {
  seconds: number;
  xp: number;
}

export interface StreakState {
  current: number;
  longest: number;
  /** Last day the goal was met, or that a freeze covered. */
  lastGoalDate: DateKey | null;
  freezes: number;
  /** Days kept alive by a freeze, for the calendar/history. */
  frozenDates: DateKey[];
}

export const EMPTY_STREAK: StreakState = {
  current: 0,
  longest: 0,
  lastGoalDate: null,
  freezes: 0,
  frozenDates: [],
};

/**
 * Bring the streak up to date for `today`: spend freezes on missed days
 * if there are enough, otherwise the streak resets. Today itself is
 * never "missed" - there's still time to practise.
 */
export function reconcileStreak(streak: StreakState, today: DateKey): StreakState {
  if (!streak.lastGoalDate || streak.current === 0) return streak;
  const missed = daysBetween(streak.lastGoalDate, today) - 1;
  if (missed <= 0) return streak;

  if (missed <= streak.freezes) {
    const frozen = Array.from({ length: missed }, (_, i) => addDays(streak.lastGoalDate as DateKey, i + 1));
    return {
      ...streak,
      freezes: streak.freezes - missed,
      frozenDates: [...streak.frozenDates, ...frozen],
      lastGoalDate: addDays(today, -1),
    };
  }
  return { ...streak, current: 0 };
}

/** Call when today's goal is first met. Safe to call more than once a day. */
export function meetGoal(streak: StreakState, today: DateKey): StreakState {
  const s = reconcileStreak(streak, today);
  if (s.lastGoalDate === today) return s;

  const continues = s.current > 0 && s.lastGoalDate !== null && daysBetween(s.lastGoalDate, today) === 1;
  const current = continues ? s.current + 1 : 1;
  const earnsFreeze = current % FREEZE_EVERY_DAYS === 0 && s.freezes < MAX_FREEZES;

  return {
    ...s,
    current,
    longest: Math.max(s.longest, current),
    lastGoalDate: today,
    freezes: s.freezes + (earnsFreeze ? 1 : 0),
  };
}

export function lessonXp(accuracy: number): number {
  return XP.lesson + (accuracy >= 1 ? XP.perfectBonus : 0);
}

export function goalMet(day: DayLog | undefined, goalMinutes: number): boolean {
  return (day?.seconds ?? 0) >= goalMinutes * 60;
}
