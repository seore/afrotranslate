import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LEARNABLE_LANGUAGES } from '../../content/languages';
import type { TranslatePhraseExercise as TranslatePhrase } from '../../content/types';
import { tokenize } from '../../lib/course';
import { colors } from '../../theme/colors';
import { Button } from '../ui/Button';
import { WordTile } from './WordTile';
import { shuffled, type ExerciseProps } from './types';

// Build the phrase from word tiles. Tiles are tracked by bank position,
// so the same word can appear twice without confusion.
export function TranslatePhraseExercise({ exercise, lexicon, language, play, onAnswer }: ExerciseProps<TranslatePhrase>) {
  const phrase = lexicon[exercise.itemId];
  const languageName = LEARNABLE_LANGUAGES.find((l) => l.code === language)?.native ?? '';
  const answerWords = useMemo(() => tokenize(phrase.text), [phrase.text]);
  const bank = useMemo(
    () => shuffled([...answerWords, ...exercise.distractors.map((d) => d.normalize('NFC'))]),
    [answerWords, exercise.distractors],
  );
  const [picked, setPicked] = useState<number[]>([]);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const check = () => {
    const correct = picked.map((i) => bank[i]).join(' ') === answerWords.join(' ');
    setResult(correct ? 'correct' : 'wrong');
    play(phrase);
    onAnswer(correct);
  };

  return (
    <View>
      <Text style={styles.instruction}>Build this in {languageName}</Text>
      <Text style={styles.english}>{phrase.english}</Text>

      <View style={[styles.answer, result === 'correct' && styles.answerRight, result === 'wrong' && styles.answerWrong]}>
        {picked.length === 0 ? <Text style={styles.placeholderText}>Tap the words below</Text> : null}
        {picked.map((bankIndex, position) => (
          <WordTile
            key={`${bankIndex}-${position}`}
            label={bank[bankIndex]}
            language={language}
            disabled={result !== null}
            accessibilityHint="Removes this word"
            onPress={() => setPicked(picked.filter((_, p) => p !== position))}
          />
        ))}
      </View>

      <View style={styles.bank}>
        {bank.map((word, i) => (
          <WordTile
            key={i}
            label={word}
            language={language}
            placeholder={picked.includes(i)}
            disabled={result !== null}
            accessibilityHint="Adds this word"
            onPress={() => setPicked([...picked, i])}
          />
        ))}
      </View>

      {result === null ? (
        <View style={styles.actions}>
          <Button label="Check" onPress={check} disabled={picked.length === 0} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  instruction: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  english: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.accent,
    marginTop: 12,
  },
  answer: {
    minHeight: 72,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  answerRight: {
    borderColor: colors.success,
  },
  answerWrong: {
    borderColor: colors.error,
  },
  placeholderText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  bank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 24,
  },
  actions: {
    marginTop: 24,
  },
});
