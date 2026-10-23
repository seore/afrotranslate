import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';

interface ScreenProps {
  children: React.ReactNode;
  /** Pinned below the scrolling content, e.g. the main button. */
  footer?: React.ReactNode;
}

// Dark gradient background used across the app, with safe areas and
// scrolling so content fits small screens and large text sizes.
export function Screen({ children, footer }: ScreenProps) {
  return (
    <LinearGradient colors={colors.gradient} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },
});
