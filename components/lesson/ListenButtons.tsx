import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';

interface ListenButtonsProps {
  onListen: () => void;
  onListenSlow: () => void;
  /** Spoken label for what's being played, e.g. "Good morning". */
  label: string;
  size?: 'medium' | 'large';
}

// Normal-speed play button with a smaller slow (tortoise) button beside it.
export function ListenButtons({ onListen, onListenSlow, label, size = 'medium' }: ListenButtonsProps) {
  const big = size === 'large' ? 96 : 72;
  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={onListen}
        style={[styles.play, { width: big, height: big, borderRadius: big / 2 }]}
        accessibilityRole="button"
        accessibilityLabel={`Listen to ${label}`}
        activeOpacity={0.8}
      >
        <Ionicons name="volume-high" size={big * 0.42} color={colors.onAccent} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onListenSlow}
        style={styles.slow}
        accessibilityRole="button"
        accessibilityLabel={`Listen slowly to ${label}`}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="tortoise" size={24} color={colors.accent} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  play: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
