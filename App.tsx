import React from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PremiumProvider } from './PremiumContext';
import { LearnerProfileProvider } from './context/LearnerProfileContext';
import { ProgressProvider } from './context/ProgressContext';
import RootNavigator from './navigation/RootNavigator';
import { colors } from './theme/colors';

const navigationTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.background, primary: colors.accent },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PremiumProvider>
        <LearnerProfileProvider>
          <ProgressProvider>
            <NavigationContainer theme={navigationTheme}>
              <RootNavigator />
            </NavigationContainer>
          </ProgressProvider>
        </LearnerProfileProvider>
      </PremiumProvider>
    </SafeAreaProvider>
  );
}
