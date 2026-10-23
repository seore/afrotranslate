import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useHabit } from '../../context/HabitContext';
import { dateKey } from '../../lib/dates';
import { colors } from '../../theme/colors';

interface HabitBarProps {
  onPressSettings: () => void;
}

// Streak, freezes, XP and today's goal at a glance.
export function HabitBar({ onPressSettings }: HabitBarProps) {
  const { habit, today } = useHabit();
  const minutes = Math.floor(today.seconds / 60);
  const goalProgress = Math.min(1, today.seconds / (habit.goalMinutes * 60));
  const done = goalProgress >= 1;
  const practisedToday = habit.streak.lastGoalDate === dateKey(new Date());

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View
          style={styles.stat}
          accessible
          accessibilityLabel={`${habit.streak.current} day streak${practisedToday ? ', goal met today' : ''}`}
        >
          <Text style={[styles.icon, !practisedToday && styles.dim]}>🔥</Text>
          <Text style={styles.value}>{habit.streak.current}</Text>
        </View>
        <View
          style={styles.stat}
          accessible
          accessibilityLabel={`${habit.streak.freezes} streak ${habit.streak.freezes === 1 ? 'freeze' : 'freezes'}`}
        >
          <Text style={styles.icon}>🧊</Text>
          <Text style={styles.value}>{habit.streak.freezes}</Text>
        </View>
        <View style={styles.stat} accessible accessibilityLabel={`${habit.totalXp} XP`}>
          <Ionicons name="flash" size={18} color={colors.accent} />
          <Text style={styles.value}>{habit.totalXp}</Text>
        </View>
        <TouchableOpacity
          onPress={onPressSettings}
          style={styles.settings}
          accessibilityRole="button"
          accessibilityLabel="Daily goal and reminders"
        >
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.goalRow}>
        <Text style={styles.goalText}>
          {done ? 'Daily goal reached' : `Today: ${minutes} of ${habit.goalMinutes} min`}
        </Text>
        {done ? <Ionicons name="checkmark-circle" size={18} color={colors.success} /> : null}
      </View>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityLabel="Daily goal"
        accessibilityValue={{ min: 0, max: habit.goalMinutes, now: Math.min(minutes, habit.goalMinutes) }}
      >
        <View style={[styles.fill, done && styles.fillDone, { width: `${goalProgress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 18,
  },
  dim: {
    opacity: 0.4,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  settings: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cardBorder,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  fillDone: {
    backgroundColor: colors.success,
  },
});
