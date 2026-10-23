import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { hasToneMarks } from '../../content/languages';
import type { LanguageCode, Phrase } from '../../content/types';
import { colors } from '../../theme/colors';
import { ListenButtons } from './ListenButtons';
import { ToneContour } from './ToneContour';

interface PhraseCardProps {
  phrase: Phrase;
  language: LanguageCode;
  onListen: () => void;
  onListenSlow: () => void;
}

// The phrase is always shown as text too, so audio is never the only way in.
export function PhraseCard({ phrase, language, onListen, onListenSlow }: PhraseCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.listen}>
        <ListenButtons onListen={onListen} onListenSlow={onListenSlow} label={phrase.english} />
      </View>
      <Text style={styles.text} accessibilityLanguage={language} selectable>
        {phrase.text}
      </Text>
      <Text style={styles.english}>{phrase.english}</Text>
      {hasToneMarks(language) ? <ToneContour text={phrase.text} /> : null}
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
  listen: {
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
