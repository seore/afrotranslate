// ================================================================
// ProgressContext.tsx - Lesson completion and learned phrases, on device.
// Same AsyncStorage approach as LearnerProfileContext. Phase 3 builds
// streaks, XP and the review queue on top of `learnedItemIds`.
// ================================================================

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

interface ProgressValue {
  progress: Progress;
  loaded: boolean;
  isLessonComplete: (lessonId: string) => boolean;
  recordLessonComplete: (lessonId: string, accuracy: number, itemIds: string[]) => Promise<void>;
}

const STORAGE_KEY = 'griot.progress.v1';
const EMPTY: Progress = { lessons: {}, learnedItemIds: [] };

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
        progressRef.current = { ...EMPTY, ...JSON.parse(stored) };
        setProgress(progressRef.current);
      })
      .catch((error) => console.error('Load progress error:', error))
      .finally(() => setLoaded(true));
  }, []);

  const recordLessonComplete = useCallback(async (lessonId: string, accuracy: number, itemIds: string[]) => {
    const prev = progressRef.current;
    const now = new Date().toISOString();
    const existing = prev.lessons[lessonId];
    const learned = new Set(prev.learnedItemIds);

    const next: Progress = {
      lessons: {
        ...prev.lessons,
        [lessonId]: {
          firstCompletedAt: existing?.firstCompletedAt ?? now,
          lastCompletedAt: now,
          bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, accuracy),
          timesCompleted: (existing?.timesCompleted ?? 0) + 1,
        },
      },
      learnedItemIds: [...prev.learnedItemIds, ...itemIds.filter((id) => !learned.has(id))],
    };

    progressRef.current = next;
    setProgress(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Save progress error:', error);
    }
  }, []);

  const isLessonComplete = useCallback((lessonId: string) => lessonId in progress.lessons, [progress]);

  const value = useMemo(
    () => ({ progress, loaded, isLessonComplete, recordLessonComplete }),
    [progress, loaded, isLessonComplete, recordLessonComplete],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
