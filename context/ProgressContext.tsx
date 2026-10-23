// ================================================================
// ProgressContext.tsx - Lesson completion, learned phrases and their
// spaced-repetition cards, on device. Scheduling rules: lib/srs.ts.
// ================================================================

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { dateKey } from '../lib/dates';
import { addCards, gradeCard, type SrsCards } from '../lib/srs';

export interface LessonRecord {
  firstCompletedAt: string;
  lastCompletedAt: string;
  bestAccuracy: number;
  timesCompleted: number;
}

export interface Progress {
  lessons: Record<string, LessonRecord>;
  /** Lexicon ids the learner has been taught, in the order first learned. */
  learnedItemIds: string[];
  cards: SrsCards;
  /** Finished review sessions; the first is free (lib/entitlements.ts). */
  reviewSessionsCompleted: number;
}

interface ProgressValue {
  progress: Progress;
  loaded: boolean;
  isLessonComplete: (lessonId: string) => boolean;
  recordLessonComplete: (lessonId: string, accuracy: number, itemIds: string[]) => Promise<void>;
  recordReview: (results: { itemId: string; correct: boolean }[]) => Promise<void>;
}

const STORAGE_KEY = 'griot.progress.v1';
const EMPTY: Progress = { lessons: {}, learnedItemIds: [], cards: {}, reviewSessionsCompleted: 0 };

const ProgressContext = createContext<ProgressValue | null>(null);

export function useProgress(): ProgressValue {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside ProgressProvider');
  return value;
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  // Latest value for writes, so quick successive saves never use stale state.
  const progressRef = useRef<Progress>(EMPTY);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed: Progress = { ...EMPTY, ...JSON.parse(stored) };
        // Phrases learned before review cards existed (Phase 2) get cards now.
        parsed.cards = addCards(parsed.cards, parsed.learnedItemIds, dateKey(new Date()));
        progressRef.current = parsed;
        setProgress(parsed);
      })
      .catch((error) => console.error('Load progress error:', error))
      .finally(() => setLoaded(true));
  }, []);

  const save = useCallback(async (next: Progress) => {
    progressRef.current = next;
    setProgress(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Save progress error:', error);
    }
  }, []);

  const recordLessonComplete = useCallback(
    async (lessonId: string, accuracy: number, itemIds: string[]) => {
      const prev = progressRef.current;
      const now = new Date();
      const iso = now.toISOString();
      const existing = prev.lessons[lessonId];
      const learned = new Set(prev.learnedItemIds);

      await save({
        ...prev,
        lessons: {
          ...prev.lessons,
          [lessonId]: {
            firstCompletedAt: existing?.firstCompletedAt ?? iso,
            lastCompletedAt: iso,
            bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, accuracy),
            timesCompleted: (existing?.timesCompleted ?? 0) + 1,
          },
        },
        learnedItemIds: [...prev.learnedItemIds, ...itemIds.filter((id) => !learned.has(id))],
        cards: addCards(prev.cards, itemIds, dateKey(now)),
      });
    },
    [save],
  );

  const recordReview = useCallback(
    async (results: { itemId: string; correct: boolean }[]) => {
      const prev = progressRef.current;
      const today = dateKey(new Date());
      const cards = { ...prev.cards };
      for (const { itemId, correct } of results) {
        if (cards[itemId]) cards[itemId] = gradeCard(cards[itemId], correct, today);
      }
      await save({ ...prev, cards, reviewSessionsCompleted: prev.reviewSessionsCompleted + 1 });
    },
    [save],
  );

  const isLessonComplete = useCallback((lessonId: string) => lessonId in progress.lessons, [progress]);

  const value = useMemo(
    () => ({ progress, loaded, isLessonComplete, recordLessonComplete, recordReview }),
    [progress, loaded, isLessonComplete, recordLessonComplete, recordReview],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
