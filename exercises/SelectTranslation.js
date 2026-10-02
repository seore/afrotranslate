import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { haptics } from '../utils/haptics';
import { COLORS, FONTS } from '../theme';

// en_to_yo: shows an English phrase, learner picks the correct Yoruba translation.
// yo_to_en: plays/shows the Yoruba phrase, learner picks the correct English meaning.
export default function SelectTranslation({ exercise, playAudio, onAnswer, disabled }) {
  const [selected, setSelected] = useState(null);
  const isYoToEn = exercise.direction === 'yo_to_en';
  const correctChoice = isYoToEn ? exercise.gloss : exercise.yoruba;

  useEffect(() => {
    if (isYoToEn) {
      playAudio(exercise.audioKey, exercise.yoruba);
    }
    setSelected(null);
  }, [exercise.id]);

  const handleChoice = (choice) => {
    if (disabled || selected) return;
    haptics.light();
    setSelected(choice);
    const isCorrect = choice === correctChoice;
    if (isCorrect && !isYoToEn) {
      playAudio(exercise.audioKey, exercise.yoruba);
    }
    onAnswer(isCorrect);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{isYoToEn ? 'What does this mean?' : 'How do you say...'}</Text>

      {isYoToEn ? (
        <TouchableOpacity
          style={styles.promptPlayable}
          onPress={() => playAudio(exercise.audioKey, exercise.yoruba)}
          activeOpacity={0.8}
        >
          <Text style={styles.promptYoruba}>{exercise.prompt}</Text>
          <Ionicons name="volume-high" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      ) : (
        <Text style={styles.promptEnglish}>{exercise.prompt}</Text>
      )}

      <View style={styles.choices}>
        {exercise.choices.map((choice) => {
          const isSelected = selected === choice;
          const isCorrectChoice = choice === correctChoice;
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
              <Text style={[styles.choiceText, !isYoToEn && styles.choiceTextYoruba]}>{choice}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 20 },
  prompt: { fontSize: 16, fontWeight: '700', color: COLORS.textMuted, marginBottom: 8, letterSpacing: 1 },
  promptEnglish: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 36, textAlign: 'center' },
  promptPlayable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 36,
  },
  promptYoruba: { fontSize: 28, fontFamily: FONTS.yorubaBold, color: COLORS.text, textAlign: 'center', marginBottom: 20 },
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
  choiceTextYoruba: { fontFamily: FONTS.yoruba, fontSize: 18 },
});
