import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { FillGapExercise as FillGap } from '../../content/types';
import { colors } from '../../theme/colors';
import { WordTile } from './WordTile';
import { shuffled, type ExerciseProps } from './types';

const BLANK = '＿＿＿';

export function FillGapExercise({ exercise, lexicon, language, play, onAnswer }: ExerciseProps<FillGap>) {
  const phrase = lexicon[exercise.itemId];
  const options = useMemo(() => shuffled(exercise.options), [exercise.options]);
  const [choice, setChoice] = useState<string | null>(null);

  // Blank out the first occurrence of the gap word, keeping punctuation.
  const text = phrase.text.normalize('NFC');
  const gap = exercise.gap.normalize('NFC');
  const at = text.indexOf(gap);
  const before = text.slice(0, at);
  const after = text.slice(at + gap.length);

  const choose = (option: string) => {
    if (choice !== null) return;
    setChoice(option);
    play(phrase);
    onAnswer(option.normalize('NFC') === gap);
  };

  return (
    <View>
      <Text style={styles.instruction}>Complete the phrase</Text>
      <Text style={styles.prompt}>{exercise.prompt}</Text>
      <Text
        style={styles.sentence}
        accessibilityLanguage={language}
        accessibilityLabel={choice ? text : `${before} blank ${after}`}
      >
        {before}
        <Text style={choice ? styles.filled : styles.blank}>{choice ?? BLANK}</Text>
        {after}
      </Text>
      <View style={styles.options}>
        {options.map((option) => (
          <WordTile
            key={option}
            label={option}
            language={language}
            disabled={choice !== null && option !== choice && option !== exercise.gap}
            result={
              choice === null
                ? undefined
                : option === exercise.gap
                  ? 'correct'
                  : option === choice
                    ? 'wrong'
                    : undefined
            }
            onPress={() => choose(option)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  instruction: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  prompt: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  sentence: {
    fontSize: 28,
    lineHeight: 40,
    fontWeight: '800',
    color: colors.text,
    marginTop: 28,
    textAlign: 'center',
  },
  blank: {
    color: colors.accent,
  },
  filled: {
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 32,
  },
});
