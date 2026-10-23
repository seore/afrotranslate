import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PremiumProvider } from './PremiumContext';
import { HabitProvider } from './context/HabitContext';
import { LearnerProfileProvider } from './context/LearnerProfileContext';
import { ProgressProvider } from './context/ProgressContext';
import RootNavigator from './navigation/RootNavigator';
import { track } from './services/analytics';
import { colors } from './theme/colors';

const navigationTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.background, primary: colors.accent },
};

export default function App() {
  // Retention (D1/D7/D30) is measured from app_open.
  useEffect(() => {
    track('app_open');
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') track('app_open');
    });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <PremiumProvider>
        <LearnerProfileProvider>
          <ProgressProvider>
            <HabitProvider>
              <NavigationContainer theme={navigationTheme}>
                <RootNavigator />
              </NavigationContainer>
            </HabitProvider>
          </ProgressProvider>
        </LearnerProfileProvider>
      </PremiumProvider>
    </SafeAreaProvider>
  );
}
