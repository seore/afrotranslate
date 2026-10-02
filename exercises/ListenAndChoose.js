import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { haptics } from '../utils/haptics';
import { COLORS } from '../theme';

// Plays a Yoruba word/phrase, learner picks its English meaning from 4 choices.
export default function ListenAndChoose({ exercise, playAudio, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    playAudio(exercise.audioKey, exercise.yoruba);
    setSelected(null);
  }, [exercise.id]);

  const handleChoice = (choice) => {
    if (disabled || selected) return;
    haptics.light();
    setSelected(choice);
    onAnswer(choice === exercise.gloss);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>What does this mean?</Text>

      <TouchableOpacity
        style={styles.playButton}
        onPress={() => playAudio(exercise.audioKey, exercise.yoruba)}
        activeOpacity={0.85}
      >
        <Ionicons name="volume-high" size={40} color={COLORS.cream} />
      </TouchableOpacity>

      <View style={styles.choices}>
        {exercise.choices.map((choice) => {
          const isSelected = selected === choice;
          const isCorrectChoice = choice === exercise.gloss;
          const showState = !!selected;

          return (
            <TouchableOpacity
              key={choice}
              style={[
                styles.choiceBtn,
                showState && isCorrectChoice && styles.choiceCorrect,
                showState && isSelected && !isCorrectChoice && styles.choiceWrong,
              ]}
              onPress={() => handleChoice(choice)}
              disabled={showState}
              activeOpacity={0.8}
            >
              <Text style={styles.choiceText}>{choice}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 20 },
  prompt: { fontSize: 16, fontWeight: '700', color: COLORS.textMuted, marginBottom: 30, letterSpacing: 1 },
  playButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  choices: { width: '100%', gap: 12 },
  choiceBtn: {
    padding: 18,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
  },
  choiceCorrect: { borderColor: COLORS.success, backgroundColor: COLORS.successDim },
  choiceWrong: { borderColor: COLORS.error, backgroundColor: COLORS.errorDim },
  choiceText: { fontSize: 17, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
});
