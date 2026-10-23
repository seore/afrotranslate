import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { LanguageCode, Phrase } from '../../content/types';
import { colors } from '../../theme/colors';

interface PhraseCardProps {
  phrase: Phrase;
  language: LanguageCode;
  onListen: () => void;
}

// The phrase is always shown as text too, so audio is never the only way in.
export function PhraseCard({ phrase, language, onListen }: PhraseCardProps) {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={onListen}
        style={styles.listenBtn}
        accessibilityRole="button"
        accessibilityLabel={`Listen to ${phrase.english}`}
        activeOpacity={0.8}
      >
        <Ionicons name="volume-high" size={30} color={colors.onAccent} />
      </TouchableOpacity>
      <Text style={styles.text} accessibilityLanguage={language} selectable>
        {phrase.text}
      </Text>
      <Text style={styles.english}>{phrase.english}</Text>
      {phrase.note ? <Text style={styles.note}>{phrase.note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  listenBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 34,
    // Room above and below for stacked tone marks and underdots (ọ̀, ẹ́).
    lineHeight: 46,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  english: {
    fontSize: 18,
    color: colors.accent,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  note: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});
