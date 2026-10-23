import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { LanguageCode, Phrase } from '../../content/types';
import { colors } from '../../theme/colors';
import { Button } from '../ui/Button';

interface FeedbackPanelProps {
  correct: boolean;
  /** The phrase to reinforce; omitted for match-pairs. */
  phrase?: Phrase;
  language: LanguageCode;
  onContinue: () => void;
}

// Shown in the lesson footer after an answer. Wrong answers always show
// the right phrase, so every mistake is also a chance to learn it.
export function FeedbackPanel({ correct, phrase, language, onContinue }: FeedbackPanelProps) {
  return (
    <View
      style={[styles.panel, correct ? styles.right : styles.wrong]}
      accessibilityLiveRegion="polite"
      accessible
      accessibilityLabel={
        correct
          ? `Correct. ${phrase ? `${phrase.text}, ${phrase.english}` : ''}`
          : `Not quite. The answer is ${phrase?.text}, ${phrase?.english}`
      }
    >
      <View style={styles.headingRow}>
        <Ionicons
          name={correct ? 'checkmark-circle' : 'close-circle'}
          size={26}
          color={correct ? colors.success : colors.error}
        />
        <Text style={[styles.heading, { color: correct ? colors.success : colors.error }]}>
          {correct ? 'Correct!' : 'Not quite'}
        </Text>
      </View>
      {phrase ? (
        <>
          {!correct ? <Text style={styles.label}>Correct answer:</Text> : null}
          <Text style={styles.phrase} accessibilityLanguage={language}>
            {phrase.text}
          </Text>
          <Text style={styles.english}>{phrase.english}</Text>
        </>
      ) : null}
      <View style={styles.action}>
        <Button label="Continue" onPress={onContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
  },
  right: {
    borderColor: colors.success,
    backgroundColor: 'rgba(34,197,94,0.08)',
  },
  wrong: {
    borderColor: colors.error,
    backgroundColor: 'rgba(255,59,48,0.08)',
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 10,
  },
  phrase: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 6,
  },
  english: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 2,
  },
  action: {
    marginTop: 14,
  },
});
