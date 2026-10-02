import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';

import { playAudioForKey } from './services/audioService';
import { useProgress } from './ProgressContext';
import { useSRS } from './SRSContext';
import { getLessonVocab } from './content/yoruba';
import PronunciationPracticeScreen from './PronunciationPracticeScreen';
import ConfettiBurst from './components/ConfettiBurst';
import AnimatedNumber from './components/AnimatedNumber';
import AdireBackground from './components/AdireBackground';
import { haptics } from './utils/haptics';
import { COLORS, FONTS } from './theme';

import ListenAndChoose from './exercises/ListenAndChoose';
import SelectTranslation from './exercises/SelectTranslation';
import TapToBuild from './exercises/TapToBuild';
import MatchPairs from './exercises/MatchPairs';

const XP_PER_CORRECT = 10;
const CONFETTI_DURATION_MS = 1800;

const EXERCISE_COMPONENTS = {
  listen_and_choose: ListenAndChoose,
  select_translation: SelectTranslation,
  tap_to_build: TapToBuild,
  match_pairs: MatchPairs,
};

export default function LessonPlayerScreen({ lesson, langCode = 'yo', onExit, onComplete }) {
  const { completeLesson, streak } = useProgress();
  const { ensureTracked } = useSRS();
  const player = useAudioPlayer();

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [summary, setSummary] = useState(null);
  const [showPractice, setShowPractice] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const exercise = lesson.exercises[exerciseIndex];
  const isLast = exerciseIndex === lesson.exercises.length - 1;
  const progress = (exerciseIndex + (feedback ? 1 : 0)) / lesson.exercises.length;

  useEffect(() => {
    Animated.timing(progressAnim, { toValue: progress, duration: 350, useNativeDriver: false }).start();
  }, [progress]);

  useEffect(() => {
    if (feedback) {
      feedbackAnim.setValue(0);
      Animated.spring(feedbackAnim, { toValue: 1, friction: 7, useNativeDriver: true }).start();
    }
  }, [feedback]);

  useEffect(() => {
    if (!summary) return;
    haptics.success();
    setShowConfetti(true);
    const timeout = setTimeout(() => setShowConfetti(false), CONFETTI_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [summary]);

  const playAudio = (audioKey, text) => {
    playAudioForKey(player, { audioKey, text, langCode });
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      haptics.success();
    } else {
      haptics.error();
    }
    setFeedback({ correct: isCorrect });
  };

  const handleContinue = async () => {
    haptics.light();
    if (isLast) {
      const xpEarned = correctCount * XP_PER_CORRECT;
      const [{ usedFreeze }] = await Promise.all([
        completeLesson(lesson.id, xpEarned),
        ensureTracked(getLessonVocab(lesson)),
      ]);
      setSummary({ xpEarned, correctCount, total: lesson.exercises.length, usedFreeze });
    } else {
      setFeedback(null);
      setExerciseIndex((i) => i + 1);
    }
  };

  if (showPractice) {
    return <PronunciationPracticeScreen lesson={lesson} langCode={langCode} onExit={() => setShowPractice(false)} />;
  }

  if (summary) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <AdireBackground opacity={0.06} />
        {showConfetti && <ConfettiBurst />}
        <View style={styles.summaryBody}>
          <Ionicons name="ribbon" size={72} color={COLORS.gold} />
          <Text style={styles.summaryTitle}>Lesson complete!</Text>
          <Text style={styles.summarySubtitle}>{lesson.title}</Text>

          <View style={styles.summaryStatsRow}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{summary.correctCount}/{summary.total}</Text>
              <Text style={styles.summaryStatLabel}>Correct</Text>
            </View>
            <View style={styles.summaryStat}>
              <AnimatedNumber value={summary.xpEarned} prefix="+" style={styles.summaryStatValue} />
              <Text style={styles.summaryStatLabel}>XP</Text>
            </View>
            <View style={styles.summaryStat}>
              <AnimatedNumber value={streak} style={styles.summaryStatValue} />
              <Text style={styles.summaryStatLabel}>Day streak</Text>
            </View>
          </View>

          {summary.usedFreeze && (
            <View style={styles.freezeBanner}>
              <Ionicons name="snow" size={16} color={COLORS.primary} />
              <Text style={styles.freezeBannerText}>A streak freeze protected your streak!</Text>
            </View>
          )}

          <TouchableOpacity style={styles.practiceBtn} onPress={() => setShowPractice(true)} activeOpacity={0.85}>
            <Ionicons name="mic" size={18} color={COLORS.primary} />
            <Text style={styles.practiceBtnText}>Practice pronunciation</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneBtn} onPress={onComplete} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const ExerciseComponent = EXERCISE_COMPONENTS[exercise.type];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            haptics.light();
            onExit();
          }}
          style={styles.closeBtn}
          hitSlop={10}
        >
          <Ionicons name="close" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.body}>
        {ExerciseComponent ? (
          <ExerciseComponent
            key={exercise.id}
            exercise={exercise}
            playAudio={playAudio}
            onAnswer={handleAnswer}
            disabled={!!feedback}
          />
        ) : (
          <Text style={styles.unsupported}>Unsupported exercise type: {exercise.type}</Text>
        )}
      </View>

      {feedback && (
        <Animated.View
          style={[
            styles.feedbackBar,
            feedback.correct ? styles.feedbackCorrect : styles.feedbackWrong,
            {
              opacity: feedbackAnim,
              transform: [{ translateY: feedbackAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}
        >
          <View style={styles.feedbackRow}>
            <Ionicons name={feedback.correct ? 'checkmark-circle' : 'close-circle'} size={26} color={COLORS.text} />
            <Text style={styles.feedbackText}>{feedback.correct ? 'Correct!' : 'Not quite'}</Text>
            {!!exercise.audioKey && (
              <TouchableOpacity
                style={styles.replayBtn}
                onPress={() => playAudio(exercise.audioKey, exercise.yoruba)}
                hitSlop={10}
              >
                <Ionicons name="volume-high" size={20} color={COLORS.text} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.continueBtnText}>{isLast ? 'Finish' : 'Continue'}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  closeBtn: { padding: 4 },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 5 },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
  unsupported: { color: COLORS.text, textAlign: 'center', marginTop: 40 },
  feedbackBar: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 2,
  },
  feedbackCorrect: { backgroundColor: COLORS.successDim, borderTopColor: COLORS.success },
  feedbackWrong: { backgroundColor: COLORS.errorDim, borderTopColor: COLORS.error },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  feedbackText: { flex: 1, fontSize: 18, fontWeight: '800', color: COLORS.text },
  replayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtn: {
    backgroundColor: COLORS.cream,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnText: { fontSize: 16, fontWeight: '800', color: COLORS.bg, letterSpacing: 1 },

  summaryBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  summaryTitle: { fontSize: 26, fontWeight: '900', color: COLORS.text, marginTop: 20 },
  summarySubtitle: { fontSize: 18, fontFamily: FONTS.yoruba, color: COLORS.textSecondary, marginTop: 6, marginBottom: 30 },
  summaryStatsRow: { flexDirection: 'row', gap: 28, marginBottom: 40 },
  summaryStat: { alignItems: 'center' },
  summaryStatValue: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  summaryStatLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, fontWeight: '600' },
  freezeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryDim,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  freezeBannerText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  practiceBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  doneBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 60,
  },
  doneBtnText: { fontSize: 16, fontWeight: '800', color: COLORS.cream, letterSpacing: 1 },
});
