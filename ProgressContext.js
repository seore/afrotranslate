// ================================================================
// ProgressContext.js - Local learning progress (streak, XP, lesson completion)
// Modeled on PremiumContext.js's AsyncStorage day-check pattern.
// No backend/sync - everything here is device-local, per the MVP plan.
// ================================================================

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { usePremium } from './PremiumContext';

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

const STORAGE_KEYS = {
  streak: 'griot_progress_streak',
  longestStreak: 'griot_progress_longestStreak',
  lastActivityDate: 'griot_progress_lastActivityDate',
  xpTotal: 'griot_progress_xpTotal',
  xpToday: 'griot_progress_xpToday',
  xpDate: 'griot_progress_xpDate',
  dailyGoalXp: 'griot_progress_dailyGoalXp',
  completedLessons: 'griot_progress_completedLessons',
  streakFreezes: 'griot_progress_streakFreezes',
};

const DEFAULT_DAILY_GOAL_XP = 30;
const STARTING_STREAK_FREEZES = 1;
const MAX_FREE_STREAK_FREEZES = 2;
const FREEZE_EARNED_EVERY_N_DAY_STREAK = 7;

const dateOnly = (d) => {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const ProgressProvider = ({ children }) => {
  const { isPremium } = usePremium();

  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);
  const [xpToday, setXpToday] = useState(0);
  const [dailyGoalXp, setDailyGoalXp] = useState(DEFAULT_DAILY_GOAL_XP);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [streakFreezes, setStreakFreezes] = useState(STARTING_STREAK_FREEZES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  // Load everything from AsyncStorage, resetting the daily XP counter if it's a new day.
  const loadProgress = async () => {
    try {
      const [
        storedStreak,
        storedLongestStreak,
        storedXpTotal,
        storedXpToday,
        storedXpDate,
        storedDailyGoal,
        storedCompleted,
        storedFreezes,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.streak),
        AsyncStorage.getItem(STORAGE_KEYS.longestStreak),
        AsyncStorage.getItem(STORAGE_KEYS.xpTotal),
        AsyncStorage.getItem(STORAGE_KEYS.xpToday),
        AsyncStorage.getItem(STORAGE_KEYS.xpDate),
        AsyncStorage.getItem(STORAGE_KEYS.dailyGoalXp),
        AsyncStorage.getItem(STORAGE_KEYS.completedLessons),
        AsyncStorage.getItem(STORAGE_KEYS.streakFreezes),
      ]);

      const today = new Date().toDateString();

      setStreak(storedStreak ? parseInt(storedStreak, 10) : 0);
      setLongestStreak(storedLongestStreak ? parseInt(storedLongestStreak, 10) : 0);
      setXpTotal(storedXpTotal ? parseInt(storedXpTotal, 10) : 0);
      setDailyGoalXp(storedDailyGoal ? parseInt(storedDailyGoal, 10) : DEFAULT_DAILY_GOAL_XP);
      setCompletedLessonIds(storedCompleted ? JSON.parse(storedCompleted) : []);
      setStreakFreezes(storedFreezes !== null ? parseInt(storedFreezes, 10) : STARTING_STREAK_FREEZES);

      if (storedXpDate === today && storedXpToday) {
        setXpToday(parseInt(storedXpToday, 10));
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.xpDate, today);
        await AsyncStorage.setItem(STORAGE_KEYS.xpToday, '0');
        setXpToday(0);
      }
    } catch (error) {
      console.error('Load progress error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Bumps the streak at most once per calendar day.
  // - Same day as last activity: unchanged.
  // - Exactly one day since last activity: +1, normal continuation.
  // - A day (or more) was skipped: premium never breaks the streak; a free
  //   user spends a streak freeze if they have one; otherwise it resets to 1.
  // Also grants a free user a new freeze every FREEZE_EARNED_EVERY_N_DAY_STREAK
  // days of streak, capped at MAX_FREE_STREAK_FREEZES.
  const bumpStreakForToday = async () => {
    const today = new Date();
    const todayStr = today.toDateString();
    const lastActivityDate = await AsyncStorage.getItem(STORAGE_KEYS.lastActivityDate);

    if (lastActivityDate === todayStr) {
      return { streak, usedFreeze: false };
    }

    const daysSinceLastActivity = lastActivityDate
      ? Math.round((dateOnly(today) - dateOnly(lastActivityDate)) / 86400000)
      : null;

    let newStreak;
    let usedFreeze = false;
    let remainingFreezes = streakFreezes;

    if (daysSinceLastActivity === null) {
      newStreak = 1;
    } else if (daysSinceLastActivity === 1) {
      newStreak = streak + 1;
    } else if (isPremium) {
      newStreak = streak + 1;
    } else if (remainingFreezes > 0) {
      newStreak = streak + 1;
      usedFreeze = true;
      remainingFreezes -= 1;
    } else {
      newStreak = 1;
    }

    if (!isPremium && newStreak % FREEZE_EARNED_EVERY_N_DAY_STREAK === 0) {
      remainingFreezes = Math.min(remainingFreezes + 1, MAX_FREE_STREAK_FREEZES);
    }

    const newLongestStreak = Math.max(longestStreak, newStreak);

    await AsyncStorage.setItem(STORAGE_KEYS.streak, newStreak.toString());
    await AsyncStorage.setItem(STORAGE_KEYS.longestStreak, newLongestStreak.toString());
    await AsyncStorage.setItem(STORAGE_KEYS.lastActivityDate, todayStr);
    await AsyncStorage.setItem(STORAGE_KEYS.streakFreezes, remainingFreezes.toString());

    setStreak(newStreak);
    setLongestStreak(newLongestStreak);
    setStreakFreezes(remainingFreezes);
    return { streak: newStreak, usedFreeze };
  };

  const addXp = async (amount) => {
    if (!amount) return;

    const today = new Date().toDateString();
    const storedXpDate = await AsyncStorage.getItem(STORAGE_KEYS.xpDate);
    const newXpToday = storedXpDate === today ? xpToday + amount : amount;
    const newXpTotal = xpTotal + amount;

    await AsyncStorage.setItem(STORAGE_KEYS.xpDate, today);
    await AsyncStorage.setItem(STORAGE_KEYS.xpToday, newXpToday.toString());
    await AsyncStorage.setItem(STORAGE_KEYS.xpTotal, newXpTotal.toString());

    setXpToday(newXpToday);
    setXpTotal(newXpTotal);
  };

  const isLessonCompleted = (lessonId) => completedLessonIds.includes(lessonId);

  // Call once when a lesson's completion summary is reached: awards XP, bumps
  // the streak, and marks the lesson done (idempotent - repeating a lesson
  // still awards XP/streak credit but won't duplicate the completion record).
  // Returns whether a streak freeze was spent, so the summary screen can say so.
  const completeLesson = async (lessonId, xpEarned = 0) => {
    await addXp(xpEarned);
    const { usedFreeze } = await bumpStreakForToday();

    if (!completedLessonIds.includes(lessonId)) {
      const updated = [...completedLessonIds, lessonId];
      setCompletedLessonIds(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.completedLessons, JSON.stringify(updated));
    }

    return { usedFreeze };
  };

  const dailyGoalMet = xpToday >= dailyGoalXp;

  const setDailyGoal = async (xp) => {
    await AsyncStorage.setItem(STORAGE_KEYS.dailyGoalXp, xp.toString());
    setDailyGoalXp(xp);
  };

  // Wipes all local progress (streak, XP, completed lessons, freezes) back to
  // zero. Leaves the daily goal preference alone since that's a setting, not progress.
  const resetProgress = async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.streak,
      STORAGE_KEYS.longestStreak,
      STORAGE_KEYS.lastActivityDate,
      STORAGE_KEYS.xpTotal,
      STORAGE_KEYS.xpToday,
      STORAGE_KEYS.xpDate,
      STORAGE_KEYS.completedLessons,
      STORAGE_KEYS.streakFreezes,
    ]);
    setStreak(0);
    setLongestStreak(0);
    setXpTotal(0);
    setXpToday(0);
    setCompletedLessonIds([]);
    setStreakFreezes(STARTING_STREAK_FREEZES);
  };

  return (
    <ProgressContext.Provider
      value={{
        loading,
        streak,
        longestStreak,
        xpTotal,
        xpToday,
        dailyGoalXp,
        dailyGoalMet,
        completedLessonIds,
        isLessonCompleted,
        completeLesson,
        addXp,
        setDailyGoal,
        resetProgress,
        streakFreezes,
        hasUnlimitedFreezes: isPremium,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};
