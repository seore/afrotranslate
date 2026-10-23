// Daily goal and reminder time. The notification permission is asked
// for here, only when the learner switches reminders on.

import React, { useState } from 'react';
import { Linking, StyleSheet, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { OptionCard } from '../../components/ui/OptionCard';
import { Screen } from '../../components/ui/Screen';
import { StepHeader } from '../../components/ui/StepHeader';
import { useHabit } from '../../context/HabitContext';
import { GOAL_OPTIONS_MINUTES } from '../../lib/streak';
import type { RootStackParamList } from '../../navigation/types';
import { requestReminderPermission } from '../../services/reminderService';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'HabitSettings'>;

const GOAL_LABELS: Record<number, string> = { 3: 'Casual', 5: 'Regular', 10: 'Serious', 15: 'Intense' };

export default function HabitSettingsScreen({ navigation }: Props) {
  const { habit, update } = useHabit();
  const { reminder } = habit;
  const [denied, setDenied] = useState(false);

  const time = new Date();
  time.setHours(reminder.hour, reminder.minute, 0, 0);

  const toggleReminders = async (on: boolean) => {
    if (on && !(await requestReminderPermission())) {
      setDenied(true);
      return;
    }
    setDenied(false);
    update({ reminder: { ...reminder, enabled: on }, reminderPromptDismissed: true });
  };

  return (
    <Screen>
      <StepHeader title="Goal & reminders" onBack={navigation.goBack} />

      <Text style={styles.section}>DAILY GOAL</Text>
      {GOAL_OPTIONS_MINUTES.map((minutes) => (
        <OptionCard
          key={minutes}
          title={`${minutes} minutes a day`}
          subtitle={GOAL_LABELS[minutes]}
          selected={habit.goalMinutes === minutes}
          onPress={() => update({ goalMinutes: minutes })}
        />
      ))}
      <Text style={styles.note}>
        Meet your goal to keep your streak. Every 7 days in a row earns a streak freeze 🧊, which covers a missed
        day automatically (you can hold 2).
      </Text>

      <Text style={styles.section}>DAILY REMINDER</Text>
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Remind me to practise</Text>
          <Switch
            value={reminder.enabled}
            onValueChange={toggleReminders}
            trackColor={{ true: colors.accent }}
            accessibilityLabel="Daily reminder"
          />
        </View>
        {reminder.enabled ? (
          <View style={styles.timeRow}>
            <Text style={styles.label}>Time</Text>
            <DateTimePicker
              value={time}
              mode="time"
              display="compact"
              themeVariant="dark"
              accessibilityLabel="Reminder time"
              onChange={(_, date) => {
                if (date) update({ reminder: { ...reminder, hour: date.getHours(), minute: date.getMinutes() } });
              }}
            />
          </View>
        ) : null}
        {reminder.enabled ? (
          <Text style={styles.hint}>We skip the reminder on days you’ve already met your goal.</Text>
        ) : null}
        {denied ? (
          <Text style={styles.hint}>
            Notifications are off for GRIOT.{' '}
            <Text style={styles.link} onPress={() => Linking.openSettings()} accessibilityRole="link">
              Open Settings
            </Text>{' '}
            to allow them.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 12,
  },
  note: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    padding: 16,
    gap: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  link: {
    color: colors.accent,
    fontWeight: '700',
  },
});
