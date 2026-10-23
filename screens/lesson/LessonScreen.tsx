// ================================================================
// LessonScreen.tsx - Runs one lesson: intro cards for new phrases, then
// exercises, with feedback after each answer. Flow rules live in
// lib/lessonEngine.ts; this screen only renders the current step.
// ================================================================

import React, { useEffect, useState } from 'react';
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
import type { Exercise } from '../../content/types';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import { useProgress } from '../../context/ProgressContext';
import { usePhraseAudio } from '../../hooks/usePhraseAudio';
import { findLesson } from '../../lib/course';
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
  const { recordLessonComplete } = useProgress();
  const language = profile.language ?? 'yo';
  const course = getCourse(language);
  const found = course ? findLesson(course, route.params.lessonId) : null;

  const audio = usePhraseAudio(language);
  const [state, setState] = useState<LessonState | null>(() => (found ? createLessonState(found.lesson) : null));
  const [feedback, setFeedback] = useState<boolean | null>(null);

  const finished = state ? isFinished(state) : false;

  useEffect(() => {
    if (!finished || !state || !found) return;
    const score = accuracy(state, found.lesson);
    recordLessonComplete(found.lesson.id, score, found.lesson.newItemIds).then(() =>
      navigation.replace('LessonComplete', { lessonId: found.lesson.id, accuracy: score }),
    );
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

  if (!course || !found || !state) return null;

  const quit = () =>
    Alert.alert('Leave this lesson?', 'Your answers in this lesson won’t be saved.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() },
    ]);

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
});
