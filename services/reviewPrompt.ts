// Ask for an App Store rating only right after a win: the first course
// lesson completed, or a 3-day streak. Never on launch, and at most once
// every 120 days (Apple also caps the prompt at 3 times a year).

import * as StoreReview from 'expo-store-review';

export const REVIEW_STREAK_DAYS = 3;
const MIN_DAYS_BETWEEN_PROMPTS = 120;

export function isReviewMoment(opts: { firstCourseLessonJustDone: boolean; streak: number }): boolean {
  return opts.firstCourseLessonJustDone || opts.streak === REVIEW_STREAK_DAYS;
}

export function canPromptAgain(lastPromptAt: string | null, now = new Date()): boolean {
  if (!lastPromptAt) return true;
  const days = (now.getTime() - new Date(lastPromptAt).getTime()) / 86_400_000;
  return days >= MIN_DAYS_BETWEEN_PROMPTS;
}

/** Returns true if the system prompt was requested. */
export async function requestReviewPrompt(): Promise<boolean> {
  try {
    if (!(await StoreReview.isAvailableAsync())) return false;
    await StoreReview.requestReview();
    return true;
  } catch (error) {
    console.error('Review prompt error:', error);
    return false;
  }
}
