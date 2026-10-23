// Learn tab home. Phase 1 shows the first lesson; the full unit and
// lesson path arrive with the lesson engine in Phase 2.

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
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

export default function LearnHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useLearnerProfile();
  const language = profile.language ?? 'yo';
  const languageName = LEARNABLE_LANGUAGES.find((l) => l.code === language)?.native ?? '';
  const lesson = getFirstLesson(language);
  const reason = REASONS.find((r) => r.id === profile.reason);
  const done = Boolean(profile.firstLessonCompletedAt);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.logo} accessibilityRole="header">
          GRIOT
        </Text>
        <Text style={styles.subtitle}>LEARN {languageName.toUpperCase()}</Text>
        {reason ? (
          <Text style={styles.goal}>
            {reason.emoji} {reason.title}
          </Text>
        ) : null}
      </View>

      {lesson ? (
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.cardLabel}>FIRST LESSON</Text>
            {done ? <Ionicons name="checkmark-circle" size={22} color={colors.success} /> : null}
          </View>
          <Text style={styles.cardTitle}>{lesson.title}</Text>
          <Text style={styles.cardBody}>
            {lesson.phrases.length} phrases · about 2 minutes
          </Text>
          <View style={styles.cardAction}>
            <Button
              label={done ? 'Practise again' : 'Start'}
              variant={done ? 'secondary' : 'primary'}
              icon="play"
              onPress={() => navigation.navigate('FirstLesson', { mode: 'practice' })}
            />
          </View>
        </View>
      ) : null}

      <View style={[styles.card, styles.upcoming]}>
        <Text style={styles.cardLabel}>UNIT 1</Text>
        <Text style={styles.cardTitle}>Family phrases</Text>
        <Text style={styles.cardBody}>
          Greetings for every time of day, respect forms and family words. Coming in the next update.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 28,
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 2,
  },
  goal: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  upcoming: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    opacity: 0.7,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.accent,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 6,
  },
  cardAction: {
    marginTop: 18,
  },
});
