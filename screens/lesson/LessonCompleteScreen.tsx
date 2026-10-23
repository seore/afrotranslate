import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { getCourse } from '../../content';
import { useHabit } from '../../context/HabitContext';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import { usePhraseAudio } from '../../hooks/usePhraseAudio';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import { allLessons, findLesson } from '../../lib/course';
import { canStartLesson } from '../../lib/entitlements';
import { REVIEW_LESSON_ID } from '../../lib/review';
import type { RootStackParamList } from '../../navigation/types';
import { canPromptAgain, isReviewMoment, requestReviewPrompt } from '../../services/reviewPrompt';
import { colors } from '../../theme/colors';
import { track } from '../../services/analytics';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonComplete'>;

export default function LessonCompleteScreen({ navigation, route }: Props) {
  const { lessonId, accuracy, xp, goalJustMet, streak, firstCourseLessonJustDone } = route.params;
  const { profile } = useLearnerProfile();
  const { habit, update } = useHabit();
  const { isPremium } = usePremiumStatus();
  const language = profile.language ?? 'yo';
  const course = getCourse(language);
  const isReview = lessonId === REVIEW_LESSON_ID;
  const found = course && !isReview ? findLesson(course, lessonId) : null;
  const audio = usePhraseAudio(language);

  // Rating prompt only after a win, never on launch (see services/reviewPrompt.ts).
  useEffect(() => {
    if (!isReviewMoment({ firstCourseLessonJustDone, streak: goalJustMet ? streak : 0 })) return;
    if (!canPromptAgain(habit.lastReviewPromptAt)) return;
    const timer = setTimeout(async () => {
      if (await requestReviewPrompt()) {
        update({ lastReviewPromptAt: new Date().toISOString() });
        track('review_prompt_shown', { trigger: firstCourseLessonJustDone ? 'first_lesson' : 'streak_3' });
      }
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!course) return null;

  const lessons = allLessons(course);
  const nextIndex = lessons.findIndex((l) => l.id === lessonId) + 1;
  const nextLesson = found ? lessons[nextIndex] : undefined;
  const nextNeedsPremium = Boolean(nextLesson) && !canStartLesson(nextIndex, isPremium);
  const percent = Math.round(accuracy * 100);
  const headline = isReview
    ? 'Review complete'
    : percent === 100
      ? 'Perfect!'
      : percent >= 70
        ? 'Well done!'
        : 'Lesson complete';

  return (
    <Screen
      footer={
        <>
          {nextLesson ? (
            nextNeedsPremium ? (
              <Button
                label="Unlock the next lesson"
                icon="diamond"
                onPress={() => navigation.replace('Paywall', { source: 'locked_lesson' })}
              />
            ) : (
              <Button label="Next lesson" onPress={() => navigation.replace('Lesson', { lessonId: nextLesson.id })} />
            )
          ) : null}
          <Button
            label={isReview ? 'Done' : 'Back to lessons'}
            variant={nextLesson ? 'text' : 'primary'}
            onPress={() => navigation.goBack()}
          />
        </>
      }
    >
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Ionicons name={isReview ? 'refresh' : 'trophy'} size={40} color={colors.onAccent} />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {headline}
        </Text>
        {found ? <Text style={styles.subtitle}>{found.lesson.title}</Text> : null}
        <View style={styles.stats}>
          <View style={styles.stat} accessible accessibilityLabel={`${xp} XP earned`}>
            <Text style={styles.statValue}>+{xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.stat} accessible accessibilityLabel={`${percent} percent correct first time`}>
            <Text style={styles.statValue}>{percent}%</Text>
            <Text style={styles.statLabel}>FIRST TIME</Text>
          </View>
        </View>
        {goalJustMet ? (
          <Text style={styles.streak} accessibilityLiveRegion="polite">
            Daily goal reached · 🔥 {streak}-day streak
          </Text>
        ) : null}
      </View>

      {found ? (
        <>
          <Text style={styles.sectionLabel}>PHRASES YOU LEARNED</Text>
          {found.lesson.newItemIds.map((id) => {
            const phrase = course.lexicon[id];
            return (
              <TouchableOpacity
                key={id}
                style={styles.row}
                onPress={() => audio.play(phrase)}
                accessibilityRole="button"
                accessibilityLabel={`${phrase.english}. Play`}
                activeOpacity={0.8}
              >
                <Ionicons name="volume-medium" size={20} color={colors.accent} />
                <View style={styles.rowText}>
                  <Text style={styles.phrase} accessibilityLanguage={language}>
                    {phrase.text}
                  </Text>
                  <Text style={styles.english}>{phrase.english}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 28,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  stat: {
    minWidth: 110,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  },
  streak: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: 18,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  rowText: {
    flex: 1,
  },
  phrase: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.text,
  },
  english: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
