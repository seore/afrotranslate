import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ListenRepeatExercise as ListenRepeat } from '../../content/types';
import { useAttemptRecorder } from '../../hooks/useAttemptRecorder';
import { colors } from '../../theme/colors';
import { PhraseCard } from '../lesson/PhraseCard';
import { RepeatPanel } from '../lesson/RepeatPanel';
import { Button } from '../ui/Button';
import type { ExerciseProps } from './types';

// Self-assessed for now; Phase 4 adds pitch comparison and a score.
export function ListenRepeatExercise({ exercise, lexicon, language, play, playSlow, onAnswer }: ExerciseProps<ListenRepeat>) {
  const phrase = lexicon[exercise.itemId];
  const recorder = useAttemptRecorder();

  useEffect(() => {
    const timer = setTimeout(() => play(phrase), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const done = () => {
    if (recorder.isRecording) recorder.stop();
    onAnswer(true);
  };

  const canContinue = recorder.attemptUri !== null || recorder.permission === 'denied';

  return (
    <View>
      <Text style={styles.instruction}>Say it out loud</Text>
      <PhraseCard
        phrase={phrase}
        language={language}
        onListen={() => play(phrase)}
        onListenSlow={() => playSlow(phrase)}
      />
      <RepeatPanel
        isRecording={recorder.isRecording}
        hasAttempt={recorder.attemptUri !== null}
        permission={recorder.permission}
        onRecordPress={() => (recorder.isRecording ? recorder.stop() : recorder.start())}
        onPlayAttempt={recorder.playAttempt}
        onPlayNative={() => play(phrase)}
      />
      <View style={styles.actions}>
        {canContinue ? (
          <Button label="Sounded right" icon="checkmark" onPress={done} />
        ) : (
          <Button
            label="Can’t speak right now"
            variant="text"
            onPress={done}
            accessibilityHint="Skips recording this phrase"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  instruction: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  actions: {
    marginTop: 20,
  },
});
