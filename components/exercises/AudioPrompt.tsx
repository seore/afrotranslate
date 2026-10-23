import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { LanguageCode, Phrase } from '../../content/types';
import { colors } from '../../theme/colors';

interface AudioPromptProps {
  phrase: Phrase;
  language: LanguageCode;
  play: (phrase: Phrase) => void;
  /** Show the text from the start instead of behind "Show text". */
  textVisible?: boolean;
}

// Big replay button. The text is one tap away ("Show text") so the
// exercise stays audio-first but is still usable without sound.
export function AudioPrompt({ phrase, language, play, textVisible = false }: AudioPromptProps) {
  const [showText, setShowText] = useState(textVisible);

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        onPress={() => play(phrase)}
        style={styles.playBtn}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Play the phrase again"
      >
        <Ionicons name="volume-high" size={40} color={colors.onAccent} />
      </TouchableOpacity>
      {showText ? (
        <Text style={styles.text} accessibilityLanguage={language}>
          {phrase.text}
        </Text>
      ) : (
        <TouchableOpacity
          onPress={() => setShowText(true)}
          accessibilityRole="button"
          accessibilityLabel="Show text"
          accessibilityHint="Shows the phrase written down"
        >
          <Text style={styles.showText}>Show text</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  playBtn: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 26,
    lineHeight: 36,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
  },
  showText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 16,
    padding: 8,
  },
});
