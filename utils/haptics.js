// Thin wrapper around React Native's core Vibration API - the old translator
// screen had its own inline hapticFeedback() but it never made it into the
// new learning screens. Named patterns instead of raw durations so call
// sites read as intent ("success", "error") rather than magic numbers.

import { Platform, Vibration } from 'react-native';

const PATTERNS = {
  light: Platform.OS === 'ios' ? 10 : 20,
  success: Platform.OS === 'ios' ? 15 : 40,
  error: Platform.OS === 'ios' ? [0, 20, 40, 20] : [0, 60, 40, 60],
};

export const haptics = {
  light: () => Vibration.vibrate(PATTERNS.light),
  success: () => Vibration.vibrate(PATTERNS.success),
  error: () => Vibration.vibrate(PATTERNS.error),
};
