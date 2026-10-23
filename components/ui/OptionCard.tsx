import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';

interface OptionCardProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  selected?: boolean;
  disabled?: boolean;
  badge?: string;
  onPress: () => void;
  /** BCP-47 code so VoiceOver reads non-English titles in the right voice. */
  titleLanguage?: string;
  /** Answer feedback colouring for quiz options. */
  result?: 'correct' | 'wrong';
}

// Selectable card in the style of the premium plan cards.
export function OptionCard({
  title,
  subtitle,
  emoji,
  selected = false,
  disabled = false,
  badge,
  onPress,
  titleLanguage,
  result,
}: OptionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityLabel={[title, subtitle, badge].filter(Boolean).join(', ')}
      accessibilityState={{ selected, disabled }}
      style={[
        styles.card,
        selected && styles.selected,
        result === 'correct' && styles.correct,
        result === 'wrong' && styles.wrong,
        disabled && styles.disabled,
      ]}
    >
      {emoji ? (
        <Text style={styles.emoji} importantForAccessibility="no">
          {emoji}
        </Text>
      ) : null}
      <View style={styles.body}>
        <Text style={styles.title} accessibilityLanguage={titleLanguage}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      {result ? (
        <Ionicons
          name={result === 'correct' ? 'checkmark-circle' : 'close-circle'}
          size={24}
          color={result === 'correct' ? colors.success : colors.error}
        />
      ) : selected ? (
        <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    padding: 18,
    marginBottom: 12,
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
  disabled: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 28,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
});
