import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { getFirstLesson } from '../../content';
import { LEARNABLE_LANGUAGES } from '../../content/languages';
import { REASONS } from '../../content/reasons';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

// Shown once after the first lesson, then the paywall. Finishing onboarding
// swaps the root navigator over to the tabs (see navigation/RootNavigator.tsx).
export default function FirstWinScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile, updateProfile } = useLearnerProfile();
  const { isPremium } = usePremiumStatus();

  // Premium is offered right after the first win; closing it finishes onboarding.
  const next = () =>
    isPremium
      ? updateProfile({ onboardingCompletedAt: new Date().toISOString() })
      : navigation.navigate('Paywall', { source: 'first_win' });
  const language = profile.language ?? 'yo';
  const lesson = getFirstLesson(language);
  const languageName = LEARNABLE_LANGUAGES.find((l) => l.code === language)?.native ?? '';
  const nudge = REASONS.find((r) => r.id === profile.reason)?.firstWinNudge;

  return (
    <Screen
      footer={<Button label="Continue" onPress={next} />}
    >
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Ionicons name="checkmark" size={44} color={colors.onAccent} />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          You just spoke {languageName}!
        </Text>
        <Text style={styles.body}>Three real phrases, in about two minutes.</Text>
      </View>

      {lesson?.phrases.map((phrase) => (
        <View key={phrase.id} style={styles.row}>
          <Ionicons name="checkmark-circle" size={22} color={colors.success} />
          <Text style={styles.phrase} accessibilityLanguage={language}>
            {phrase.text}
          </Text>
          <Text style={styles.english}>{phrase.english}</Text>
        </View>
      ))}

      {nudge ? <Text style={styles.nudge}>{nudge}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  phrase: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.text,
  },
  english: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  nudge: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.accent,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
});
