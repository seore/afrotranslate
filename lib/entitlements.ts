// ================================================================
// lib/entitlements.ts - What's free and what needs Premium, in one place.
// Free: the starter lesson, the first FREE_COURSE_LESSONS course lessons,
// FREE_REVIEW_SESSIONS review session(s), proverbs, names and the
// translator's existing free tier. Premium (RevenueCat "premium"
// entitlement): everything else. Translator limits live in PremiumContext.
// ================================================================

export const FREE_COURSE_LESSONS = 2;
export const FREE_REVIEW_SESSIONS = 1;

/** `lessonIndex` is the lesson's position across the whole course, from 0. */
export function canStartLesson(lessonIndex: number, isPremium: boolean): boolean {
  return isPremium || lessonIndex < FREE_COURSE_LESSONS;
}

export function canStartReview(reviewSessionsCompleted: number, isPremium: boolean): boolean {
  return isPremium || reviewSessionsCompleted < FREE_REVIEW_SESSIONS;
}

export type PaywallSource = 'first_win' | 'locked_lesson' | 'review' | 'learn_upgrade' | 'translator';
