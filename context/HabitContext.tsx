// ================================================================
// HabitContext.tsx - Daily goal, practice time, XP, streak and reminder
// settings, stored on device. Rules live in lib/streak.ts.
// ================================================================

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { dateKey, type DateKey } from '../lib/dates';
import {
  DEFAULT_GOAL_MINUTES,
  EMPTY_STREAK,
  MAX_SESSION_SECONDS,
  goalMet,
  meetGoal,
  reconcileStreak,
  type DayLog,
  type StreakState,
} from '../lib/streak';

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface HabitState {
  goalMinutes: number;
  days: Record<DateKey, DayLog>;
  totalXp: number;
  streak: StreakState;
  reminder: ReminderSettings;
  reminderPromptDismissed: boolean;
  /** ISO time of the last App Store review prompt. */
  lastReviewPromptAt: string | null;
}

export interface SessionResult {
  goalJustMet: boolean;
  streak: StreakState;
}

interface HabitValue {
  habit: HabitState;
  loaded: boolean;
  today: DayLog;
  recordSession: (seconds: number, xp: number) => Promise<SessionResult>;
  update: (changes: Partial<HabitState>) => Promise<void>;
}

const STORAGE_KEY = 'griot.habit.v1';

const INITIAL: HabitState = {
  goalMinutes: DEFAULT_GOAL_MINUTES,
  days: {},
  totalXp: 0,
  streak: EMPTY_STREAK,
  reminder: { enabled: false, hour: 19, minute: 0 },
  reminderPromptDismissed: false,
  lastReviewPromptAt: null,
};

const HabitContext = createContext<HabitValue | null>(null);

export function useHabit(): HabitValue {
  const value = useContext(HabitContext);
  if (!value) throw new Error('useHabit must be used inside HabitProvider');
  return value;
}

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habit, setHabit] = useState<HabitState>(INITIAL);
  const [loaded, setLoaded] = useState(false);
  const habitRef = useRef<HabitState>(INITIAL);

  const save = useCallback(async (next: HabitState) => {
    habitRef.current = next;
    setHabit(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Save habit error:', error);
    }
  }, []);

  // Spend freezes / reset the streak for days missed since last time.
  const reconcile = useCallback(() => {
    const prev = habitRef.current;
    const streak = reconcileStreak(prev.streak, dateKey(new Date()));
    if (streak !== prev.streak) save({ ...prev, streak });
  }, [save]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        habitRef.current = { ...INITIAL, ...JSON.parse(stored) };
        setHabit(habitRef.current);
      })
      .catch((error) => console.error('Load habit error:', error))
      .finally(() => {
        setLoaded(true);
        reconcile();
      });

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') reconcile();
    });
    return () => sub.remove();
  }, [reconcile]);

  const recordSession = useCallback(
    async (seconds: number, xp: number): Promise<SessionResult> => {
      const prev = habitRef.current;
      const today = dateKey(new Date());
      const before = prev.days[today];
      const day: DayLog = {
        seconds: (before?.seconds ?? 0) + Math.min(Math.max(0, seconds), MAX_SESSION_SECONDS),
        xp: (before?.xp ?? 0) + xp,
      };
      const goalJustMet = !goalMet(before, prev.goalMinutes) && goalMet(day, prev.goalMinutes);
      const streak = goalJustMet ? meetGoal(prev.streak, today) : reconcileStreak(prev.streak, today);

      await save({ ...prev, days: { ...prev.days, [today]: day }, totalXp: prev.totalXp + xp, streak });
      return { goalJustMet, streak };
    },
    [save],
  );

  const update = useCallback(
    async (changes: Partial<HabitState>) => {
      const prev = habitRef.current;
      const next = { ...prev, ...changes };
      // A lower goal can be met by practice already done today.
      const today = dateKey(new Date());
      if (changes.goalMinutes && goalMet(next.days[today], next.goalMinutes)) {
        next.streak = meetGoal(next.streak, today);
      }
      await save(next);
    },
    [save],
  );

  const value = useMemo(
    () => ({
      habit,
      loaded,
      today: habit.days[dateKey(new Date())] ?? { seconds: 0, xp: 0 },
      recordSession,
      update,
    }),
    [habit, loaded, recordSession, update],
  );

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}
