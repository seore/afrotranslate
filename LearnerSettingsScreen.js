import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, StatusBar, Alert, Linking, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useProgress } from './ProgressContext';
import { usePremium } from './PremiumContext';
import { isReminderEnabled, enableDailyReminder, disableDailyReminder, REMINDER_TIME_LABEL } from './services/notificationsService';
import { haptics } from './utils/haptics';
import { COLORS } from './theme';

const DAILY_GOAL_OPTIONS = [
  { xp: 10, label: 'Casual' },
  { xp: 30, label: 'Regular' },
  { xp: 50, label: 'Serious' },
];

// Same links/copy as the old translator-era settingsScreen.js's Legal and
// Support sections - carried over as-is, minus the Account/Premium section
// (not applicable while payments are disconnected).
const LEGAL_LINKS = [
  {
    icon: 'shield-checkmark',
    label: 'Privacy Policy',
    url: 'https://seore.github.io/afrotranslate-privacy/privacy.html',
  },
  {
    icon: 'document-text',
    label: 'Terms of Service',
    url: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
  },
];

const SUPPORT_LINKS = [
  {
    icon: 'help-circle',
    label: 'Help & Support',
    url: 'https://seore.github.io/griot-support/support.html',
  },
  {
    icon: 'mail',
    label: 'Contact Us',
    url: 'mailto:seorem2021@gmail.com',
  },
];

function SettingsRow({ icon, label, value, onPress, last, right }) {
  return (
    <TouchableOpacity
      style={[styles.row, last && styles.rowLast]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {right}
        {!right && !!value && <Text style={styles.rowValue}>{value}</Text>}
        {!right && !!onPress && <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />}
      </View>
    </TouchableOpacity>
  );
}

export default function LearnerSettingsScreen({ onClose, onOpenPremium }) {
  const { streak, longestStreak, xpTotal, dailyGoalXp, setDailyGoal, resetProgress, streakFreezes, hasUnlimitedFreezes } =
    useProgress();
  const { isPremium } = usePremium();

  const [reminderEnabled, setReminderEnabled] = useState(false);

  useEffect(() => {
    isReminderEnabled().then(setReminderEnabled);
  }, []);

  const confirmReset = () => {
    Alert.alert(
      'Reset progress?',
      'This clears your streak, XP, and completed lessons. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetProgress },
      ]
    );
  };

  const openURL = async (url, title) => {
    try {
      if (url.startsWith('mailto:') || (await Linking.canOpenURL(url))) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${title}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${title}`);
    }
  };

  const handleRate = () => {
    Alert.alert('Rate GRIOT', 'Thank you for using GRIOT! App Store link coming soon.');
  };

  const toggleReminder = async (value) => {
    if (value) {
      const { granted } = await enableDailyReminder();
      if (!granted) {
        Alert.alert(
          'Notifications disabled',
          'Enable notifications for GRIOT in your device settings to get a daily reminder.'
        );
        return;
      }
      setReminderEnabled(true);
    } else {
      await disableDailyReminder();
      setReminderEnabled(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={10}>
          <Ionicons name="close" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.closeBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.statsCard}>
          <SettingsRow
            icon="diamond"
            label={isPremium ? 'Premium Active' : 'Upgrade to Premium'}
            value={isPremium ? '✓' : ''}
            onPress={isPremium ? null : () => { onClose(); onOpenPremium(); }}
            last
          />
        </View>

        <Text style={styles.sectionTitle}>DAILY GOAL</Text>
        <View style={styles.goalRow}>
          {DAILY_GOAL_OPTIONS.map((option) => {
            const selected = dailyGoalXp === option.xp;
            return (
              <TouchableOpacity
                key={option.xp}
                style={[styles.goalPill, selected && styles.goalPillSelected]}
                onPress={() => {
                  haptics.light();
                  setDailyGoal(option.xp);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.goalPillLabel, selected && styles.goalPillLabelSelected]}>
                  {option.label}
                </Text>
                <Text style={[styles.goalPillXp, selected && styles.goalPillLabelSelected]}>{option.xp} XP</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>PROGRESS</Text>
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Current streak</Text>
            <Text style={styles.statValue}>{streak} days</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Longest streak</Text>
            <Text style={styles.statValue}>{longestStreak} days</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total XP</Text>
            <Text style={styles.statValue}>{xpTotal}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Streak freezes</Text>
            <Text style={styles.statValue}>{hasUnlimitedFreezes ? 'Unlimited' : streakFreezes}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={confirmReset} activeOpacity={0.8}>
          <Ionicons name="refresh" size={18} color={COLORS.error} />
          <Text style={styles.resetBtnText}>Reset progress</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>REMINDERS</Text>
        <View style={styles.statsCard}>
          <SettingsRow
            icon="notifications"
            label={`Daily reminder (${REMINDER_TIME_LABEL})`}
            right={
              <Switch
                value={reminderEnabled}
                onValueChange={toggleReminder}
                trackColor={{ false: '#333', true: COLORS.primary }}
                thumbColor="#fff"
              />
            }
            last
          />
        </View>

        <Text style={styles.sectionTitle}>LEGAL</Text>
        <View style={styles.statsCard}>
          {LEGAL_LINKS.map((link, i) => (
            <SettingsRow
              key={link.label}
              icon={link.icon}
              label={link.label}
              onPress={() => openURL(link.url, link.label)}
              last={i === LEGAL_LINKS.length - 1}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <View style={styles.statsCard}>
          {SUPPORT_LINKS.map((link) => (
            <SettingsRow key={link.label} icon={link.icon} label={link.label} onPress={() => openURL(link.url, link.label)} />
          ))}
          <SettingsRow icon="star" label="Rate GRIOT" onPress={handleRate} last />
        </View>

        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.statsCard}>
          <SettingsRow icon="information-circle" label="Version" value="1.0.0" />
          <SettingsRow icon="code-slash" label="Developer" value="Seore Soyannwo" last />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginTop: 24,
    marginBottom: 12,
  },
  goalRow: { flexDirection: 'row', gap: 10 },
  goalPill: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  goalPillSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDim },
  goalPillLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  goalPillLabelSelected: { color: COLORS.primary },
  goalPillXp: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  statValue: { fontSize: 14, color: COLORS.text, fontWeight: '700' },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(239,68,68,0.4)',
  },
  resetBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.error },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowLast: { borderBottomWidth: 0 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowValue: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
});
