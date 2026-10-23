import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { MatchPairsExercise as MatchPairs } from '../../content/types';
import { colors } from '../../theme/colors';
import { WordTile } from './WordTile';
import { shuffled, type ExerciseProps } from './types';

// Tap a phrase (you hear it), then its meaning. Finishes when all pairs
// are matched; it counts as correct only if there were no mismatches.
export function MatchPairsExercise({ exercise, lexicon, language, play, onAnswer }: ExerciseProps<MatchPairs>) {
  const left = useMemo(() => shuffled(exercise.itemIds), [exercise.itemIds]);
  const right = useMemo(() => shuffled(exercise.itemIds), [exercise.itemIds]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const mistakes = useRef(0);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
  }, []);

  const pickLeft = (id: string) => {
    setSelected(id);
    play(lexicon[id]);
  };

  const pickRight = (id: string) => {
    if (!selected) return;
    if (id === selected) {
      const next = [...matched, id];
      setMatched(next);
      setSelected(null);
      if (next.length === exercise.itemIds.length) onAnswer(mistakes.current === 0);
    } else {
      mistakes.current += 1;
      setWrongPair([selected, id]);
      setSelected(null);
      wrongTimer.current = setTimeout(() => setWrongPair(null), 700);
    }
  };

  const tileResult = (id: string, side: 0 | 1) =>
    matched.includes(id)
      ? ('correct' as const)
      : wrongPair?.[side] === id
        ? ('wrong' as const)
        : side === 0 && selected === id
          ? ('selected' as const)
          : undefined;

  return (
    <View>
      <Text style={styles.instruction}>Match the pairs</Text>
      <Text style={styles.hint}>Tap a phrase to hear it, then tap its meaning.</Text>
      <View style={styles.columns}>
        <View style={styles.column}>
          {left.map((id) => (
            <WordTile
              key={id}
              label={lexicon[id].text}
              language={language}
              result={tileResult(id, 0)}
              disabled={matched.includes(id)}
              onPress={() => pickLeft(id)}
            />
          ))}
        </View>
        <View style={styles.column}>
          {right.map((id) => (
            <WordTile
              key={id}
              label={lexicon[id].english}
              result={tileResult(id, 1)}
              disabled={matched.includes(id) || !selected}
              onPress={() => pickRight(id)}
            />
          ))}
        </View>
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
  hint: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 20,
  },
  columns: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 10,
  },
});
