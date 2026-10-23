// ================================================================
// LearnerProfileContext.tsx - Onboarding answers, stored on device.
// Same AsyncStorage approach as PremiumContext.js; no backend.
// ================================================================

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LanguageCode } from '../content/types';

export type LearningReason = 'family' | 'visiting' | 'teaching_kids' | 'culture';
export type StartingLevel = 'none' | 'understand_some' | 'speak_little';

export interface LearnerProfile {
  reason?: LearningReason;
  level?: StartingLevel;
  language?: LanguageCode;
  firstLessonCompletedAt?: string;
  onboardingCompletedAt?: string;
}

interface LearnerProfileValue {
  profile: LearnerProfile;
  loaded: boolean;
  updateProfile: (changes: Partial<LearnerProfile>) => Promise<void>;
}

const STORAGE_KEY = 'griot.learnerProfile.v1';

const LearnerProfileContext = createContext<LearnerProfileValue | null>(null);

export function useLearnerProfile(): LearnerProfileValue {
  const value = useContext(LearnerProfileContext);
  if (!value) throw new Error('useLearnerProfile must be used inside LearnerProfileProvider');
  return value;
}

export function LearnerProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<LearnerProfile>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        profileRef.current = JSON.parse(stored);
        setProfile(profileRef.current);
      })
      .catch((error) => console.error('Load learner profile error:', error))
      .finally(() => setLoaded(true));
  }, []);

  // Ref holds the latest profile so back-to-back updates never save stale data.
  const profileRef = useRef<LearnerProfile>({});

  const updateProfile = useCallback(async (changes: Partial<LearnerProfile>) => {
    const next = { ...profileRef.current, ...changes };
    profileRef.current = next;
    setProfile(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Save learner profile error:', error);
    }
  }, []);

  const value = useMemo(() => ({ profile, loaded, updateProfile }), [profile, loaded, updateProfile]);

  return <LearnerProfileContext.Provider value={value}>{children}</LearnerProfileContext.Provider>;
}
