// ================================================================
// LessonScreen.tsx - Runs one lesson or a review session: intro cards
// for new phrases, then exercises, with feedback after each answer.
// Flow rules live in lib/lessonEngine.ts; this screen renders the
// current step and records the result (progress, XP, streak, reviews).
// ================================================================

import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { FillGapExercise } from '../../components/exercises/FillGapExercise';
import { ListenChooseExercise } from '../../components/exercises/ListenChooseExercise';
import { ListenRepeatExercise } from '../../components/exercises/ListenRepeatExercise';
import { MatchPairsExercise } from '../../components/exercises/MatchPairsExercise';
import { TranslatePhraseExercise } from '../../components/exercises/TranslatePhraseExercise';
import type { ExerciseProps } from '../../components/exercises/types';
import { FeedbackPanel } from '../../components/lesson/FeedbackPanel';
import { PhraseCard } from '../../components/lesson/PhraseCard';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { StepHeader } from '../../components/ui/StepHeader';
import { getCourse } from '../../content';
import type { Exercise, Lesson } from '../../content/types';
import { useHabit } from '../../context/HabitContext';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import { useProgress } from '../../context/ProgressContext';
import { usePhraseAudio } from '../../hooks/usePhraseAudio';
import { findLesson } from '../../lib/course';
import { dateKey } from '../../lib/dates';
import {
  accuracy,
  advance,
  answer,
  createLessonState,
  currentStep,
  isFinished,
  progress,
  type LessonState,
} from '../../lib/lessonEngine';
import { buildReviewLesson, REVIEW_LESSON_ID } from '../../lib/review';
import { dueItemIds } from '../../lib/srs';
import { XP, lessonXp } from '../../lib/streak';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;

function ExerciseView(props: ExerciseProps<Exercise>) {
  const { exercise } = props;
  switch (exercise.type) {
    case 'listen_choose':
      return <ListenChooseExercise {...props} exercise={exercise} />;
    case 'listen_repeat':
      return <ListenRepeatExercise {...props} exercise={exercise} />;
    case 'match_pairs':
      return <MatchPairsExercise {...props} exercise={exercise} />;
    case 'translate_phrase':
      return <TranslatePhraseExercise {...props} exercise={exercise} />;
    case 'fill_gap':
      return <FillGapExercise {...props} exercise={exercise} />;
  }
}

export default function LessonScreen({ navigation, route }: Props) {
  const { profile } = useLearnerProfile();
  const { progress: learnerProgress, recordLessonComplete, recordReview } = useProgress();
  const { recordSession } = useHabit();
  const language = profile.language ?? 'yo';
  const course = getCourse(language);
  const isReview = route.params.lessonId === REVIEW_LESSON_ID;

  // Fixed for the whole session, even as progress updates underneath.
  const [lesson] = useState<Lesson | null>(() => {
    if (!course) return null;
    if (!isReview) return findLesson(course, route.params.lessonId)?.lesson ?? null;
    const due = dueItemIds(learnerProgress.cards, dateKey(new Date()));
    return due.length ? buildReviewLesson(due, learnerProgress.learnedItemIds, course.lexicon) : null;
  });

  const audio = usePhraseAudio(language);
  const [state, setState] = useState<LessonState | null>(() => (lesson ? createLessonState(lesson) : null));
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const startedAt = useRef(Date.now());

  const finished = state ? isFinished(state) : false;

  useEffect(() => {
    if (!finished || !state || !lesson) return;
    const score = accuracy(state, lesson);
    const seconds = (Date.now() - startedAt.current) / 1000;

    const save = async () => {
      let xp: number;
      let firstCourseLessonJustDone = false;
      if (isReview) {
        const results = lesson.exercises.map((ex) => ({
          itemId: ex.type === 'match_pairs' ? ex.itemIds[0] : ex.itemId,
          correct: state.firstTry[ex.id] === true,
        }));
        await recordReview(results);
        xp = Math.max(5, results.filter((r) => r.correct).length * XP.reviewPerItem);
      } else {
        firstCourseLessonJustDone = Object.keys(learnerProgress.lessons).length === 0;
        await recordLessonComplete(lesson.id, score, lesson.newItemIds);
        xp = lessonXp(score);
      }
      const session = await recordSession(seconds, xp);
      navigation.replace('LessonComplete', {
        lessonId: lesson.id,
        accuracy: score,
        xp,
        goalJustMet: session.goalJustMet,
        streak: session.streak.current,
        firstCourseLessonJustDone,
      });
    };
    save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // Intro cards play their phrase on arrival.
  const step = state ? currentStep(state) : undefined;
  useEffect(() => {
    if (step?.kind !== 'intro' || !course) return;
    const timer = setTimeout(() => audio.play(course.lexicon[step.itemId]), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.index]);

  if (!course || !lesson || !state) {
    return (
      <Screen footer={<Button label="Back" onPress={() => navigation.goBack()} />}>
        <Text style={styles.empty}>{isReview ? 'Nothing to review right now. Come back tomorrow!' : 'Lesson not found.'}</Text>
      </Screen>
    );
  }

  const quit = () =>
    Alert.alert(
      isReview ? 'Leave this review?' : 'Leave this lesson?',
      'Your answers so far won’t be saved.',
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() },
      ],
    );

  const next = () => {
    setFeedback(null);
    setState(advance(state));
  };

  const onAnswer = (correct: boolean) => {
    const answered = answer(state, correct);
    // Repeat-after-me has nothing to mark, so move straight on.
    if (step?.kind === 'exercise' && step.exercise.type === 'listen_repeat') {
      setState(advance(answered));
      return;
    }
    setState(answered);
    setFeedback(correct);
  };

  let footer: React.ReactNode = null;
  if (feedback !== null && step?.kind === 'exercise') {
    const phraseId = step.exercise.type === 'match_pairs' ? undefined : step.exercise.itemId;
    footer = (
      <FeedbackPanel
        correct={feedback}
        phrase={phraseId ? course.lexicon[phraseId] : undefined}
        language={language}
        onContinue={next}
      />
    );
  } else if (step?.kind === 'intro') {
    footer = <Button label="Continue" onPress={next} />;
  }

  return (
    <Screen footer={footer}>
      <StepHeader title="" progress={progress(state)} onBack={quit} backIcon="close" />

      {step?.kind === 'intro' ? (
        <View>
          <Text style={styles.label}>NEW PHRASE</Text>
          <PhraseCard
            phrase={course.lexicon[step.itemId]}
            language={language}
            onListen={() => audio.play(course.lexicon[step.itemId])}
          />
        </View>
      ) : null}

      {step?.kind === 'exercise' ? (
        <View>
          {step.isRetry ? <Text style={styles.label}>LET’S TRY THAT AGAIN</Text> : null}
          <ExerciseView
            key={state.index}
            exercise={step.exercise}
            lexicon={course.lexicon}
            language={language}
            play={audio.play}
            onAnswer={onAnswer}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.accent,
    marginBottom: 12,
  },
  empty: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
    textAlign: 'center',
    marginTop: 80,
  },
});
