import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ListenChooseExercise as ListenChoose } from '../../content/types';
import { colors } from '../../theme/colors';
import { OptionCard } from '../ui/OptionCard';
import { AudioPrompt } from './AudioPrompt';
import { shuffled, type ExerciseProps } from './types';

export function ListenChooseExercise({ exercise, lexicon, language, play, onAnswer }: ExerciseProps<ListenChoose>) {
  const phrase = lexicon[exercise.itemId];
  const options = useMemo(() => shuffled(exercise.optionIds), [exercise.optionIds]);
  const [choice, setChoice] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => play(phrase), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View>
      <Text style={styles.instruction}>What does this mean?</Text>
      <AudioPrompt phrase={phrase} language={language} play={play} />
      {options.map((id) => {
        const isAnswer = id === exercise.itemId;
        const result = choice === null ? undefined : isAnswer ? 'correct' : id === choice ? 'wrong' : undefined;
        return (
          <OptionCard
            key={id}
            title={lexicon[id].english}
            result={result}
            disabled={choice !== null && !result}
            onPress={() => {
              if (choice !== null) return;
              setChoice(id);
              onAnswer(isAnswer);
            }}
          />
        );
      })}
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
});
