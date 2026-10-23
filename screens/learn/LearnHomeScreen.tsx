// Learn tab home: the starter lesson, then each unit's lessons in order.
// A lesson unlocks when the one before it is complete.

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HabitBar } from '../../components/habit/HabitBar';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { getCourse, getFirstLesson } from '../../content';
import { LEARNABLE_LANGUAGES } from '../../content/languages';
import { REASONS } from '../../content/reasons';
import type { Lesson } from '../../content/types';
import { useHabit } from '../../context/HabitContext';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import { useProgress } from '../../context/ProgressContext';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { allLessons } from '../../lib/course';
import { canStartLesson } from '../../lib/entitlements';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

// premium: needs Premium (lib/entitlements.ts); locked: finish the previous lesson first.
type LessonStatus = 'done' | 'next' | 'locked' | 'premium';

export default function LearnHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useLearnerProfile();
  const { isLessonComplete } = useProgress();
  const { habit, update } = useHabit();
  const { isPremium } = usePremiumStatus();
  const language = profile.language ?? 'yo';
  const languageName = LEARNABLE_LANGUAGES.find((l) => l.code === language)?.native ?? '';
  const starter = getFirstLesson(language);
  const course = getCourse(language);
  const reason = REASONS.find((r) => r.id === profile.reason);
  const starterDone = Boolean(profile.firstLessonCompletedAt);
  const showReminderPrompt = starterDone && !habit.reminder.enabled && !habit.reminderPromptDismissed;

  const ordered = course ? allLessons(course) : [];
  const nextId = ordered.find((l) => !isLessonComplete(l.id))?.id;
  const statusOf = (lesson: Lesson): LessonStatus =>
    !canStartLesson(ordered.indexOf(lesson), isPremium)
      ? 'premium'
      : isLessonComplete(lesson.id)
        ? 'done'
        : lesson.id === nextId
          ? 'next'
          : 'locked';
  const openPaywall = () => navigation.navigate('Paywall', { source: 'locked_lesson' });

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

      <HabitBar onPressSettings={() => navigation.navigate('HabitSettings')} />

      {showReminderPrompt ? (
        <View style={styles.reminder}>
          <Text style={styles.reminderTitle}>🔔 Set a daily reminder</Text>
          <Text style={styles.reminderBody}>A nudge at a time that suits you makes the habit stick.</Text>
          <View style={styles.reminderActions}>
            <View style={styles.flex}>
              <Button label="Choose a time" onPress={() => navigation.navigate('HabitSettings')} />
            </View>
            <Button label="Not now" variant="text" onPress={() => update({ reminderPromptDismissed: true })} />
          </View>
        </View>
      ) : null}

      {starter ? (
        <TouchableOpacity
          style={styles.starter}
          onPress={() => navigation.navigate('FirstLesson', { mode: 'practice' })}
          accessibilityRole="button"
          accessibilityLabel={`Starter lesson: ${starter.title}. ${starterDone ? 'Completed. Practise again' : 'Start'}`}
          activeOpacity={0.8}
        >
          <Ionicons
            name={starterDone ? 'checkmark-circle' : 'play-circle'}
            size={26}
            color={starterDone ? colors.success : colors.accent}
          />
          <View style={styles.flex}>
            <Text style={styles.starterLabel}>STARTER</Text>
            <Text style={styles.starterTitle}>{starter.title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}

      {course?.units.map((unit, unitIndex) => (
        <View key={unit.id} style={styles.unit}>
          <Text style={styles.unitLabel}>UNIT {unitIndex + 1}</Text>
          <Text style={styles.unitTitle} accessibilityRole="header">
            {unit.title}
          </Text>
          <Text style={styles.unitBody}>{unit.description}</Text>

          {unit.lessons.map((lesson, lessonIndex) => {
            const status = statusOf(lesson);
            const open =
              status === 'premium' ? openPaywall : () => navigation.navigate('Lesson', { lessonId: lesson.id });
            const isNextPremium = status === 'premium' && lesson.id === nextId;
            return (
              <View key={lesson.id} style={[styles.lesson, (status === 'next' || isNextPremium) && styles.lessonNext]}>
                <TouchableOpacity
                  style={styles.lessonRow}
                  onPress={open}
                  disabled={status === 'locked'}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Lesson ${lessonIndex + 1}: ${lesson.title}. ${
                    status === 'done'
                      ? 'Completed'
                      : status === 'locked'
                        ? 'Locked'
                        : status === 'premium'
                          ? 'Premium. Opens upgrade options'
                          : 'Up next'
                  }`}
                  accessibilityState={{ disabled: status === 'locked' }}
                >
                  <View style={[styles.lessonIcon, status === 'done' && styles.iconDone]}>
                    <Ionicons
                      name={
                        status === 'done'
                          ? 'checkmark'
                          : status === 'locked'
                            ? 'lock-closed'
                            : status === 'premium'
                              ? 'diamond'
                              : 'play'
                      }
                      size={18}
                      color={status === 'locked' ? colors.textMuted : status === 'done' ? colors.onAccent : colors.accent}
                    />
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.lessonTitle, status === 'locked' && styles.muted]}>{lesson.title}</Text>
                    {status === 'premium' ? <Text style={styles.premiumTag}>PREMIUM</Text> : null}
                    <Text style={styles.lessonBody}>{lesson.description}</Text>
                  </View>
                </TouchableOpacity>
                {status === 'next' ? (
                  <View style={styles.lessonAction}>
                    <Button label="Start lesson" icon="play" onPress={open} />
                  </View>
                ) : null}
                {isNextPremium ? (
                  <View style={styles.lessonAction}>
                    <Button label="Unlock with Premium" icon="diamond" onPress={openPaywall} />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ))}

      {!isPremium ? (
        <TouchableOpacity
          style={styles.upgrade}
          onPress={() => navigation.navigate('Paywall', { source: 'learn_upgrade' })}
          accessibilityRole="button"
          accessibilityLabel="GRIOT Premium. See plans"
          activeOpacity={0.8}
        >
          <Ionicons name="diamond" size={22} color={colors.accent} />
          <View style={styles.flex}>
            <Text style={styles.starterTitle}>GRIOT Premium</Text>
            <Text style={styles.lessonBody}>Every lesson, daily review and the full translator.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  reminder: {
    backgroundColor: colors.accentSoft,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: 16,
    marginBottom: 20,
  },
  reminderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  reminderBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: 4,
  },
  reminderActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  starter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 24,
  },
  starterLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
  },
  starterTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  unit: {
    marginBottom: 24,
  },
  unitLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.accent,
  },
  unitTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },
  unitBody: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  lesson: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 16,
    marginBottom: 10,
  },
  lessonNext: {
    borderColor: colors.accent,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  lessonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDone: {
    backgroundColor: colors.success,
  },
  lessonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  muted: {
    color: colors.textMuted,
  },
  lessonBody: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  premiumTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.accent,
    marginTop: 4,
  },
  upgrade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.accentSoft,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: 16,
    marginBottom: 8,
  },
  lessonAction: {
    marginTop: 14,
  },
});
