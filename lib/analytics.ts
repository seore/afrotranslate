// ================================================================
// lib/analytics.ts - The analytics event list and what each may carry.
// Privacy rule: events hold only fixed identifiers (lesson ids, plan
// names, reasons), numbers and booleans - never anything a person typed
// or said. Anything else is dropped before it can leave the device.
// Matches the privacy label "Usage Data > Product Interaction, not
// linked to you, not used for tracking".
// ================================================================

export const EVENT_PROPERTIES = {
  app_open: [],
  onboarding_complete: ['reason', 'level', 'language', 'path'],
  lesson_start: ['lesson_id', 'kind'],
  lesson_complete: ['lesson_id', 'kind', 'accuracy', 'xp', 'duration_s'],
  streak_day: ['streak'],
  paywall_view: ['source'],
  trial_start: ['plan', 'source'],
  purchase: ['plan', 'source'],
  review_prompt_shown: ['trigger'],
} as const;

export type AnalyticsEvent = keyof typeof EVENT_PROPERTIES;
export type PropertyValue = string | number | boolean;

/** Identifier-like strings only: no spaces, so sentences can't get through. */
const SAFE_STRING = /^[A-Za-z0-9_$.-]{1,40}$/;

export function sanitizeProperties(
  event: AnalyticsEvent,
  properties: Record<string, unknown> = {},
): Record<string, PropertyValue> {
  const allowed: readonly string[] = EVENT_PROPERTIES[event];
  const clean: Record<string, PropertyValue> = {};
  for (const key of allowed) {
    const value = properties[key];
    if (typeof value === 'boolean') clean[key] = value;
    else if (typeof value === 'number' && Number.isFinite(value)) clean[key] = Math.round(value * 100) / 100;
    else if (typeof value === 'string' && SAFE_STRING.test(value)) clean[key] = value;
  }
  return clean;
}
