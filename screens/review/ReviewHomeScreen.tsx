// Review tab: phrases due for spaced-repetition practice today.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { useProgress } from '../../context/ProgressContext';
import { dateKey } from '../../lib/dates';
import { REVIEW_LESSON_ID } from '../../lib/review';
import { dueItemIds, MAX_BOX } from '../../lib/srs';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

export default function ReviewHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { progress } = useProgress();
  const today = dateKey(new Date());
  const allDue = dueItemIds(progress.cards, today, Infinity).length;
  const cards = Object.values(progress.cards);
  const strong = cards.filter((c) => c.box >= MAX_BOX - 1).length;
  const learned = cards.length;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Review
        </Text>
        <Text style={styles.subtitle}>
          Short practice of phrases you’ve learned, timed so they stick.
        </Text>
      </View>

      <View style={styles.card}>
        <Ionicons
          name={allDue ? 'refresh-circle' : 'checkmark-done-circle'}
          size={56}
          color={allDue ? colors.accent : colors.success}
        />
        <Text style={styles.big} accessibilityLiveRegion="polite">
          {learned === 0 ? 'Nothing to review yet' : allDue ? `${allDue} to review` : 'All caught up'}
        </Text>
        <Text style={styles.body}>
          {learned === 0
            ? 'Finish a lesson and its phrases will appear here for review.'
            : allDue
              ? 'A quick session keeps these phrases fresh.'
              : 'Come back tomorrow for your next review.'}
        </Text>
        {allDue ? (
          <View style={styles.action}>
            <Button
              label="Start review"
              icon="play"
              onPress={() => navigation.navigate('Lesson', { lessonId: REVIEW_LESSON_ID })}
            />
          </View>
        ) : null}
      </View>

      {learned > 0 ? (
        <View style={styles.stats}>
          <View style={styles.stat} accessible accessibilityLabel={`${learned} phrases learned`}>
            <Text style={styles.statValue}>{learned}</Text>
            <Text style={styles.statLabel}>LEARNED</Text>
          </View>
          <View style={styles.stat} accessible accessibilityLabel={`${strong} phrases well remembered`}>
            <Text style={styles.statValue}>{strong}</Text>
            <Text style={styles.statLabel}>WELL REMEMBERED</Text>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  big: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 14,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.accent,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});
