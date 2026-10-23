// ================================================================
// FirstLessonScreen.tsx - The two-minute first win: hear three phrases,
// say each one, compare with the native audio, then one quick check.
// Used at the end of onboarding and later as "practise again".
// ================================================================

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PhraseCard } from '../../components/lesson/PhraseCard';
import { RepeatPanel } from '../../components/lesson/RepeatPanel';
import { Button } from '../../components/ui/Button';
import { OptionCard } from '../../components/ui/OptionCard';
import { Screen } from '../../components/ui/Screen';
import { StepHeader } from '../../components/ui/StepHeader';
import { getFirstLesson } from '../../content';
import { useHabit } from '../../context/HabitContext';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import { useAttemptRecorder } from '../../hooks/useAttemptRecorder';
import { usePhraseAudio } from '../../hooks/usePhraseAudio';
import { XP } from '../../lib/streak';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'FirstLesson'>;

export default function FirstLessonScreen({ navigation, route }: Props) {
  const { profile, updateProfile } = useLearnerProfile();
  const language = profile.language ?? 'yo';
  const lesson = getFirstLesson(language);

  const audio = usePhraseAudio(language);
  const recorder = useAttemptRecorder();
  const { recordSession } = useHabit();
  const startedAt = useRef(Date.now());
  const [step, setStep] = useState(0);
  const [choiceId, setChoiceId] = useState<string | null>(null);

  const phraseCount = lesson?.phrases.length ?? 0;
  const isCheckStep = step === phraseCount;
  const phrase = lesson?.phrases[step];

  // Play each new phrase automatically; the learner can replay any time.
  useEffect(() => {
    recorder.reset();
    if (!phrase) return;
    const timer = setTimeout(() => audio.play(phrase), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (!lesson) return null;

  const finish = async () => {
    await recordSession((Date.now() - startedAt.current) / 1000, XP.starter);
    if (!profile.firstLessonCompletedAt) {
      await updateProfile({ firstLessonCompletedAt: new Date().toISOString() });
    }
    if (route.params.mode === 'onboarding') {
      navigation.replace('FirstWin');
    } else {
      navigation.goBack();
    }
  };

  const goBack = () => {
    if (recorder.isRecording) recorder.stop();
    if (step === 0) navigation.goBack();
    else setStep(step - 1);
  };

  const onRecordPress = () => {
    if (recorder.isRecording) recorder.stop();
    else recorder.start();
  };

  const canContinue = recorder.attemptUri !== null || recorder.permission === 'denied';

  const footer = isCheckStep ? (
    <Button label="Finish" onPress={finish} disabled={choiceId === null} />
  ) : canContinue ? (
    <Button label="Sounded right" icon="checkmark" onPress={() => setStep(step + 1)} />
  ) : (
    <Button
      label="Can’t speak right now"
      variant="text"
      onPress={() => setStep(step + 1)}
      accessibilityHint="Skips recording this phrase"
    />
  );

  return (
    <Screen footer={footer}>
      <StepHeader
        title={isCheckStep ? 'Quick check' : lesson.title}
        progress={step / (phraseCount + 1)}
        onBack={goBack}
      />

      {phrase ? (
        <>
          <PhraseCard phrase={phrase} language={language} onListen={() => audio.play(phrase)} />
          <RepeatPanel
            isRecording={recorder.isRecording}
            hasAttempt={recorder.attemptUri !== null}
            permission={recorder.permission}
            onRecordPress={onRecordPress}
            onPlayAttempt={recorder.playAttempt}
            onPlayNative={() => audio.play(phrase)}
          />
        </>
      ) : (
        <View>
          <Text style={styles.prompt}>{lesson.check.prompt}</Text>
          {lesson.check.optionIds.map((id) => {
            const option = lesson.phrases.find((p) => p.id === id);
            if (!option) return null;
            const answered = choiceId !== null;
            const isAnswer = id === lesson.check.answerId;
            return (
              <OptionCard
                key={id}
                title={option.text}
                titleLanguage={language}
                subtitle={answered ? option.english : undefined}
                selected={answered && isAnswer}
                disabled={answered && !isAnswer && id !== choiceId}
                onPress={() => {
                  if (answered) return;
                  setChoiceId(id);
                  audio.play(option);
                }}
              />
            );
          })}
          {choiceId !== null ? (
            <Text
              style={[styles.feedback, choiceId === lesson.check.answerId ? styles.right : styles.wrong]}
              accessibilityLiveRegion="polite"
            >
              {choiceId === lesson.check.answerId ? lesson.check.correctFeedback : lesson.check.wrongFeedback}
            </Text>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  prompt: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  feedback: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  right: {
    color: colors.success,
  },
  wrong: {
    color: colors.textSecondary,
  },
});
