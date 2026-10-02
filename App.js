import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts, Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';

import { PremiumProvider } from './PremiumContext';
import { ProgressProvider } from './ProgressContext';
import { SRSProvider } from './SRSContext';
import CoursePathScreen from './CoursePathScreen';
import { COLORS } from './theme';

// Root entrypoint: renders the Yoruba learning path.
//
// The original translator UI (language picker, live machine translation via
// Google Translate, the OFFLINE_PACKS phrase dictionary, and conversation
// mode) has been retired now that the course path is the app's primary
// experience — it's recoverable from git history if any of it is needed
// again. PremiumContext is back in the provider tree (re-wired around
// lessons/streak freezes instead of translations); ProgressContext reads its
// isPremium flag, so PremiumProvider has to wrap it.
export default function AppWrapper() {
  const [fontsLoaded] = useFonts({ Fraunces_600SemiBold, Fraunces_700Bold });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <PremiumProvider>
      <ProgressProvider>
        <SRSProvider>
          <CoursePathScreen />
        </SRSProvider>
      </ProgressProvider>
    </PremiumProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
});
