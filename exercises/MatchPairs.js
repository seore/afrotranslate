import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { haptics } from '../utils/haptics';
import { COLORS, FONTS } from '../theme';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Learner taps a Yoruba word, then its English match, until all pairs are matched.
export default function MatchPairs({ exercise, playAudio, onAnswer, disabled }) {
  const yorubaItems = useMemo(
    () => shuffle(exercise.pairs.map((p) => ({ key: p.yoruba, value: p.yoruba, audioKey: p.audioKey }))),
    [exercise.id]
  );
  const englishItems = useMemo(
    () => shuffle(exercise.pairs.map((p) => ({ key: p.yoruba, value: p.gloss }))),
    [exercise.id]
  );

  const [matchedKeys, setMatchedKeys] = useState([]);
  const [selectedYoruba, setSelectedYoruba] = useState(null);
  const [wrongKey, setWrongKey] = useState(null);
  const completedRef = useRef(false);

  const handleYorubaTap = (item) => {
    if (disabled || matchedKeys.includes(item.key)) return;
    haptics.light();
    setSelectedYoruba(item);
    playAudio(item.audioKey, item.value);
  };

  const handleEnglishTap = (item) => {
    if (disabled || !selectedYoruba || matchedKeys.includes(item.key)) return;

    if (selectedYoruba.key === item.key) {
      haptics.success();
      const nextMatched = [...matchedKeys, item.key];
      setMatchedKeys(nextMatched);
      setSelectedYoruba(null);

      if (nextMatched.length === exercise.pairs.length && !completedRef.current) {
        completedRef.current = true;
        onAnswer(true);
      }
    } else {
      haptics.error();
      setWrongKey(item.key);
      setSelectedYoruba(null);
      setTimeout(() => setWrongKey(null), 400);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>Match the pairs</Text>

      <View style={styles.matchRow}>
        <View style={styles.matchColumn}>
          {yorubaItems.map((item) => {
            const done = matchedKeys.includes(item.key);
            const selected = selectedYoruba?.key === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.matchTile, done && styles.matchTileDone, selected && styles.matchTileSelected]}
                onPress={() => handleYorubaTap(item)}
                disabled={done}
                activeOpacity={0.8}
              >
                <Text style={[styles.matchTileText, styles.matchTileTextYoruba]}>{item.value}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.matchColumn}>
          {englishItems.map((item) => {
            const done = matchedKeys.includes(item.key);
            const wrong = wrongKey === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.matchTile, done && styles.matchTileDone, wrong && styles.matchTileWrong]}
                onPress={() => handleEnglishTap(item)}
                disabled={done}
                activeOpacity={0.8}
              >
                <Text style={styles.matchTileText}>{item.value}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 20 },
  prompt: { fontSize: 16, fontWeight: '700', color: COLORS.textMuted, marginBottom: 24, letterSpacing: 1 },
  matchRow: { flexDirection: 'row', width: '100%', gap: 14 },
  matchColumn: { flex: 1, gap: 10 },
  matchTile: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  matchTileSelected: { borderColor: COLORS.primary },
  matchTileDone: { borderColor: COLORS.success, backgroundColor: COLORS.successDim, opacity: 0.6 },
  matchTileWrong: { borderColor: COLORS.error, backgroundColor: COLORS.errorDim },
  matchTileText: { fontSize: 15, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  matchTileTextYoruba: { fontFamily: FONTS.yoruba, fontSize: 16 },
});
