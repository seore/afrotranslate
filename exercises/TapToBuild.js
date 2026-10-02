import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { haptics } from '../utils/haptics';
import { COLORS, FONTS } from '../theme';

// Learner taps word tiles, in order, to build the target Yoruba phrase.
export default function TapToBuild({ exercise, playAudio, onAnswer, disabled }) {
  const [pool, setPool] = useState(exercise.tokens);
  const [answer, setAnswer] = useState([]);
  const [checked, setChecked] = useState(false);

  const tapPoolToken = (token, index) => {
    if (disabled || checked) return;
    haptics.light();

    const nextPool = [...pool];
    nextPool.splice(index, 1);
    setPool(nextPool);

    const nextAnswer = [...answer, token];
    setAnswer(nextAnswer);

    if (nextAnswer.length === exercise.correctTokens.length) {
      const isCorrect = nextAnswer.every((t, i) => t === exercise.correctTokens[i]);
      setChecked(true);
      if (isCorrect) {
        playAudio(exercise.audioKey, exercise.yoruba);
      }
      onAnswer(isCorrect);
    }
  };

  const tapAnswerToken = (token, index) => {
    if (disabled || checked) return;

    const nextAnswer = [...answer];
    nextAnswer.splice(index, 1);
    setAnswer(nextAnswer);
    setPool([...pool, token]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{exercise.gloss}</Text>

      <View style={styles.answerRow}>
        {answer.length === 0 && <View style={styles.answerPlaceholder} />}
        {answer.map((token, i) => (
          <TouchableOpacity
            key={`ans-${token}-${i}`}
            style={styles.answerTile}
            onPress={() => tapAnswerToken(token, i)}
            activeOpacity={0.8}
          >
            <Text style={styles.answerTileTextYoruba}>{token}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.poolRow}>
        {pool.map((token, i) => (
          <TouchableOpacity
            key={`pool-${token}-${i}`}
            style={styles.poolTile}
            onPress={() => tapPoolToken(token, i)}
            activeOpacity={0.8}
          >
            <Text style={styles.poolTileTextYoruba}>{token}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 20 },
  prompt: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 30, textAlign: 'center' },
  answerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56,
    width: '100%',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 16,
    marginBottom: 30,
  },
  answerPlaceholder: { height: 44 },
  answerTile: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  poolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  poolTile: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  answerTileTextYoruba: { fontSize: 17, fontFamily: FONTS.yorubaBold, color: '#fff' },
  poolTileTextYoruba: { fontSize: 17, fontFamily: FONTS.yorubaBold, color: COLORS.text },
});
