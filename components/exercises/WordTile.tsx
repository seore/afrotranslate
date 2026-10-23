import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors } from '../../theme/colors';

interface WordTileProps {
  label: string;
  onPress: () => void;
  language?: string;
  disabled?: boolean;
  /** Keeps the tile's space in the bank once it's been used. */
  placeholder?: boolean;
  result?: 'correct' | 'wrong' | 'selected';
  accessibilityHint?: string;
}

export function WordTile({ label, onPress, language, disabled, placeholder, result, accessibilityHint }: WordTileProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || placeholder}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityLanguage={language}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || placeholder, selected: result === 'selected' }}
      style={[
        styles.tile,
        result === 'selected' && styles.selected,
        result === 'correct' && styles.correct,
        result === 'wrong' && styles.wrong,
        placeholder && styles.placeholder,
      ]}
    >
      <Text style={[styles.label, placeholder && styles.hidden]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  selected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  correct: {
    borderColor: colors.success,
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  wrong: {
    borderColor: colors.error,
    backgroundColor: 'rgba(255,59,48,0.1)',
  },
  placeholder: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  label: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.text,
  },
  hidden: {
    opacity: 0,
  },
});
