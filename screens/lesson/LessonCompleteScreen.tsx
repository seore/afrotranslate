import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { getCourse } from '../../content';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import { usePhraseAudio } from '../../hooks/usePhraseAudio';
import { allLessons, findLesson } from '../../lib/course';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonComplete'>;

export default function LessonCompleteScreen({ navigation, route }: Props) {
  const { profile } = useLearnerProfile();
  const language = profile.language ?? 'yo';
  const course = getCourse(language);
  const found = course ? findLesson(course, route.params.lessonId) : null;
  const audio = usePhraseAudio(language);
  if (!course || !found) return null;

  const lessons = allLessons(course);
  const nextLesson = lessons[lessons.findIndex((l) => l.id === found.lesson.id) + 1];
  const percent = Math.round(route.params.accuracy * 100);
  const headline = percent === 100 ? 'Perfect!' : percent >= 70 ? 'Well done!' : 'Lesson complete';

  return (
    <Screen
      footer={
        <>
          {nextLesson ? (
            <Button
              label="Next lesson"
              onPress={() => navigation.replace('Lesson', { lessonId: nextLesson.id })}
            />
          ) : null}
          <Button
            label="Back to lessons"
            variant={nextLesson ? 'text' : 'primary'}
            onPress={() => navigation.goBack()}
          />
        </>
      }
    >
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Ionicons name="trophy" size={40} color={colors.onAccent} />
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {headline}
        </Text>
        <Text style={styles.subtitle}>{found.lesson.title}</Text>
        <Text style={styles.score} accessibilityLabel={`${percent} percent correct first time`}>
          {percent}% correct first time
        </Text>
      </View>

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
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  score: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 16,
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
