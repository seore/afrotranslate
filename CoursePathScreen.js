import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { YORUBA_COURSE } from './content/yoruba';
import { useProgress } from './ProgressContext';
import { usePremium } from './PremiumContext';
import { useSRS } from './SRSContext';
import LessonPlayerScreen from './LessonPlayerScreen';
import LearnerSettingsScreen from './LearnerSettingsScreen';
import PremiumScreen from './PremiumScreen';
import ReviewSessionScreen from './ReviewSessionScreen';
import AnimatedNumber from './components/AnimatedNumber';
import AdireBackground from './components/AdireBackground';
import { haptics } from './utils/haptics';
import { COLORS, GRADIENT, FONTS } from './theme';

// Only the first unit is free; unlocking the rest requires premium.
const FREE_UNIT_COUNT = 1;

// A lesson is unlocked once the lesson immediately before it (in course order)
// is completed; the very first lesson is always unlocked.
function computeUnlockedLessonIds(course, completedLessonIds) {
  const unlocked = new Set();
  let prevDone = true;
  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      if (prevDone) unlocked.add(lesson.id);
      prevDone = completedLessonIds.includes(lesson.id);
    }
  }
  return unlocked;
}

export default function CoursePathScreen() {
  const { loading, streak, xpTotal, xpToday, dailyGoalXp, completedLessonIds, isLessonCompleted } = useProgress();
  const { isPremium } = usePremium();
  const { dueCount } = useSRS();
  const [activeLesson, setActiveLesson] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const unlockedLessonIds = useMemo(
    () => computeUnlockedLessonIds(YORUBA_COURSE, completedLessonIds),
    [completedLessonIds]
  );

  if (activeLesson) {
    return (
      <LessonPlayerScreen
        lesson={activeLesson}
        langCode={YORUBA_COURSE.langCode}
        onExit={() => setActiveLesson(null)}
        onComplete={() => setActiveLesson(null)}
      />
    );
  }

  if (showReview) {
    return <ReviewSessionScreen langCode={YORUBA_COURSE.langCode} onExit={() => setShowReview(false)} />;
  }

  if (showSettings) {
    return (
      <LearnerSettingsScreen
        onClose={() => setShowSettings(false)}
        onOpenPremium={() => setShowPremium(true)}
      />
    );
  }

  if (showPremium) {
    return <PremiumScreen onClose={() => setShowPremium(false)} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={GRADIENT} style={styles.gradient}>
        <AdireBackground opacity={0.05} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => {
              haptics.light();
              setShowSettings(true);
            }}
            hitSlop={10}
          >
            <Ionicons name="settings-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>

          {!isPremium && (
            <TouchableOpacity
              style={styles.premiumBtn}
              onPress={() => {
                haptics.light();
                setShowPremium(true);
              }}
              hitSlop={10}
            >
              <Ionicons name="diamond" size={20} color={COLORS.gold} />
            </TouchableOpacity>
          )}

          <Text style={styles.logo}>GRIOT</Text>
          <Text style={styles.subtitle}>LEARN YORÙBÁ</Text>

          {!loading && (
            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Ionicons name="flame" size={16} color={COLORS.terracotta} />
                <AnimatedNumber value={streak} style={styles.statText} />
              </View>
              <View style={styles.statPill}>
                <Ionicons name="flash" size={16} color={COLORS.primary} />
                <AnimatedNumber value={xpTotal} suffix=" XP" style={styles.statText} />
              </View>
              <View style={styles.statPill}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.statText}>
                  {Math.min(xpToday, dailyGoalXp)}/{dailyGoalXp} today
                </Text>
              </View>
            </View>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {!loading && dueCount > 0 && (
            <TouchableOpacity
              style={styles.reviewCard}
              onPress={() => {
                haptics.light();
                setShowReview(true);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh-circle" size={30} color={COLORS.gold} />
              <View style={styles.reviewCardInfo}>
                <Text style={styles.reviewCardTitle}>Review time</Text>
                <Text style={styles.reviewCardSubtitle}>{dueCount} word{dueCount === 1 ? '' : 's'} due</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}

          {YORUBA_COURSE.units.map((unit, unitIndex) => {
            const unitLocked = unitIndex >= FREE_UNIT_COUNT && !isPremium;

            return (
              <View key={unit.id} style={styles.unitBlock}>
                <View style={styles.unitTitleRow}>
                  <Text style={styles.unitTitle}>
                    {unit.subtitle ? unit.subtitle.toUpperCase() : unit.title}
                  </Text>
                  {unitLocked && <Ionicons name="diamond" size={13} color={COLORS.gold} />}
                </View>

                {unit.lessons.map((lesson) => {
                  const progressUnlocked = unlockedLessonIds.has(lesson.id);
                  const accessible = progressUnlocked && !unitLocked;
                  const completed = isLessonCompleted(lesson.id);

                  const handlePress = () => {
                    if (completed) {
                      haptics.light();
                      setActiveLesson(lesson);
                    } else if (unitLocked) {
                      haptics.light();
                      setShowPremium(true);
                    } else if (progressUnlocked) {
                      haptics.light();
                      setActiveLesson(lesson);
                    }
                  };

                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[styles.lessonRow, !accessible && !completed && styles.lessonRowLocked]}
                      activeOpacity={progressUnlocked ? 0.8 : 1}
                      onPress={handlePress}
                    >
                      <View style={[styles.lessonIcon, completed && styles.lessonIconDone]}>
                        <Ionicons
                          name={
                            completed
                              ? 'checkmark'
                              : unitLocked
                              ? 'diamond'
                              : progressUnlocked
                              ? 'play'
                              : 'lock-closed'
                          }
                          size={18}
                          color={completed ? COLORS.bg : unitLocked ? COLORS.gold : COLORS.text}
                        />
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text style={styles.lessonTitle}>{lesson.title}</Text>
                        <Text style={styles.lessonMeta}>
                          {lesson.subtitle ? `${lesson.subtitle} · ` : ''}
                          {lesson.exercises.length} exercises
                        </Text>
                      </View>
                      {completed && <Ionicons name="star" size={18} color={COLORS.gold} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  gradient: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    alignItems: 'center',
    position: 'relative',
  },
  settingsBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 35,
    right: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  premiumBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 35,
    left: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.goldDim,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },
  logo: { fontSize: 32, fontWeight: '900', color: COLORS.text, letterSpacing: 5 },
  subtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 6, fontWeight: '700', letterSpacing: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.goldDim,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  reviewCardInfo: { flex: 1 },
  reviewCardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  reviewCardSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  unitBlock: { marginTop: 24 },
  unitTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  unitTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 14,
  },
  lessonRowLocked: { opacity: 0.5 },
  lessonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonIconDone: { backgroundColor: COLORS.success },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 17, fontFamily: FONTS.yorubaBold, color: COLORS.text },
  lessonMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
