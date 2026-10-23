// ================================================================
// services/analytics.ts - Anonymous product analytics via PostHog (EU).
// Set up to collect as little as possible, to match the privacy label
// "Usage Data > Product Interaction, not linked to you, not tracking":
// - a random per-install ID; users are never identified, no ad ID
// - no GeoIP lookup (also turn on "Discard client IP data" in PostHog)
// - no autocapture, session replay, surveys or feature flags
// - only the events and properties allowed in lib/analytics.ts
// - learners can switch it off in Settings
// Without POSTHOG_API_KEY (e.g. development) events are only logged.
// ================================================================

import { useEffect, useState } from 'react';
import { POSTHOG_API_KEY } from '@env';
import PostHog from 'posthog-react-native';

import { sanitizeProperties, type AnalyticsEvent } from '../lib/analytics';

const HOST = 'https://eu.i.posthog.com';

let client: PostHog | null = null;
if (POSTHOG_API_KEY) {
  try {
    client = new PostHog(POSTHOG_API_KEY, {
      host: HOST,
      disableGeoip: true,
      personProfiles: 'never',
      preloadFeatureFlags: false,
      disableRemoteConfig: true,
      disableSurveys: true,
      // Only our own events: retention comes from app_open, not built-ins.
      captureAppLifecycleEvents: false,
      enableSessionReplay: false,
      errorTracking: { autocapture: false },
    });
  } catch (error) {
    console.error('Analytics init error:', error);
  }
}

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
  const clean = sanitizeProperties(event, properties);
  if (__DEV__) console.log('[analytics]', event, clean);
  try {
    client?.capture(event, clean);
  } catch (error) {
    console.error('Analytics capture error:', error);
  }
}

const listeners = new Set<(enabled: boolean) => void>();

export function isAnalyticsEnabled(): boolean {
  return client ? !client.optedOut : false;
}

export async function setAnalyticsEnabled(enabled: boolean): Promise<void> {
  if (!client) return;
  if (enabled) await client.optIn();
  else await client.optOut();
  listeners.forEach((listener) => listener(enabled));
}

/** For the Settings switch. `available` is false when analytics isn't configured. */
export function useAnalyticsConsent() {
  const [enabled, setEnabled] = useState(isAnalyticsEnabled());
  useEffect(() => {
    listeners.add(setEnabled);
    return () => {
      listeners.delete(setEnabled);
    };
  }, []);
  return { available: client !== null, enabled, setEnabled: setAnalyticsEnabled };
}
