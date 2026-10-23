import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { MicPermission } from '../../hooks/useAttemptRecorder';
import { colors } from '../../theme/colors';
import { Button } from '../ui/Button';

interface RepeatPanelProps {
  isRecording: boolean;
  hasAttempt: boolean;
  permission: MicPermission;
  onRecordPress: () => void;
  onPlayAttempt: () => void;
  onPlayNative: () => void;
}

// "Your turn": record, then compare your attempt with the native audio.
// Without the mic, the learner can still say it aloud and carry on.
export function RepeatPanel({
  isRecording,
  hasAttempt,
  permission,
  onRecordPress,
  onPlayAttempt,
  onPlayNative,
}: RepeatPanelProps) {
  if (permission === 'denied') {
    return (
      <View style={styles.panel}>
        <Text style={styles.heading}>Your turn: say it out loud</Text>
        <Text style={styles.hint}>
          Microphone access is off, so we can’t record you. Say the phrase aloud, then carry on. You
          can turn the microphone on in Settings › GRIOT.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>{hasAttempt ? 'Compare the two' : 'Your turn: say it'}</Text>
      <TouchableOpacity
        onPress={onRecordPress}
        style={[styles.recordBtn, isRecording && styles.recording]}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? 'Stop recording' : hasAttempt ? 'Record again' : 'Record yourself'}
        accessibilityState={{ busy: isRecording }}
      >
        <Ionicons name={isRecording ? 'stop' : 'mic'} size={32} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.hint}>
        {isRecording ? 'Recording… tap to stop' : hasAttempt ? 'Tap to record again' : 'Tap and speak'}
      </Text>
      {hasAttempt && !isRecording ? (
        <View style={styles.compareRow}>
          <View style={styles.compareBtn}>
            <Button label="Native" icon="volume-high" variant="secondary" onPress={onPlayNative} />
          </View>
          <View style={styles.compareBtn}>
            <Button label="You" icon="person" variant="secondary" onPress={onPlayAttempt} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    padding: 20,
    alignItems: 'center',
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  recordBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recording: {
    backgroundColor: '#ff3b30',
    borderColor: '#ff3b30',
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
  compareRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
    alignSelf: 'stretch',
  },
  compareBtn: {
    flexGrow: 1,
    flexBasis: 120,
  },
});
