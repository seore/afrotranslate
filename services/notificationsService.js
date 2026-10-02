// Local (device-only) daily streak reminder. No push server/backend - this
// just schedules an on-device notification at a fixed time, which is enough
// for "remind me if I haven't practiced today."

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ENABLED_KEY = 'griot_notifications_enabled';
const REMINDER_ID = 'griot-daily-streak-reminder';
const REMINDER_HOUR = 19;
const REMINDER_MINUTE = 0;

export const REMINDER_TIME_LABEL = '7:00 PM';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function isReminderEnabled() {
  const stored = await AsyncStorage.getItem(ENABLED_KEY);
  return stored === 'true';
}

/**
 * Requests notification permission and schedules the daily reminder if
 * granted. Returns `{ granted: false }` without scheduling anything if the
 * learner declines the permission prompt.
 */
export async function enableDailyReminder() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    return { granted: false };
  }

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: "Don't lose your streak!",
      body: 'Take a few minutes for Yorùbá today.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: REMINDER_HOUR,
      minute: REMINDER_MINUTE,
    },
  });

  await AsyncStorage.setItem(ENABLED_KEY, 'true');
  return { granted: true };
}

export async function disableDailyReminder() {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  await AsyncStorage.setItem(ENABLED_KEY, 'false');
}
