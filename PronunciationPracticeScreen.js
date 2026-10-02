import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync } from 'expo-audio';

import { playAudioForKey, playAudioFile } from './services/audioService';
import { getLessonVocab } from './content/yoruba';
import { haptics } from './utils/haptics';
import { COLORS, FONTS } from './theme';

// Honest v1: there is no Yoruba speech-recognition model available (see
// services/pronunciationScoringService.js), so this doesn't auto-score
// pronunciation - it lets the learner hear the target audio, record
// themselves, and play both back to compare by ear. That's a real technique
// (shadowing), not a placeholder for a score we can't actually compute yet.
export default function PronunciationPracticeScreen({ lesson, langCode = 'yo', onExit }) {
  const [items] = useState(() => getLessonVocab(lesson));
  const [index, setIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  const player = useAudioPlayer();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const current = items[index];

  useEffect(() => {
    setHasRecording(false);
    setIsRecording(false);
  }, [index]);

  const playTarget = () => {
    if (current) playAudioForKey(player, { audioKey: current.audioKey, text: current.yoruba, langCode });
  };

  const playMine = () => {
    if (recorder.uri) playAudioFile(player, recorder.uri);
  };

  const startRecording = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Microphone access needed',
          'Enable microphone access for GRIOT in your device settings to practice pronunciation.'
        );
        return;
      }
      haptics.light();
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      setHasRecording(false);
    } catch (error) {
      console.error('Recording start error:', error);
      Alert.alert('Error', 'Could not start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();
      haptics.success();
      setIsRecording(false);
      setHasRecording(true);
    } catch (error) {
      console.error('Recording stop error:', error);
    }
  };

  const goNext = () => {
    haptics.light();
    setIndex((i) => Math.min(i + 1, items.length - 1));
  };
  const goPrev = () => {
    haptics.light();
    setIndex((i) => Math.max(i - 1, 0));
  };

  if (!current) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.emptyBody}>
          <Text style={styles.emptyText}>No words to practice in this lesson.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={onExit}>
            <Text style={styles.doneBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.closeBtn} hitSlop={10}>
          <Ionicons name="close" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pronunciation Practice</Text>
        <View style={styles.closeBtn} />
      </View>

      <Text style={styles.caption}>Listen, record yourself, then compare by ear.</Text>

      <View style={styles.body}>
        <Text style={styles.counter}>
          {index + 1} / {items.length}
        </Text>
        <Text style={styles.yorubaText}>{current.yoruba}</Text>
        <Text style={styles.glossText}>{current.gloss}</Text>

        <TouchableOpacity style={styles.targetBtn} onPress={playTarget} activeOpacity={0.85}>
          <Ionicons name="volume-high" size={22} color={COLORS.cream} />
          <Text style={styles.targetBtnText}>Hear it</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
          onPress={isRecording ? stopRecording : startRecording}
          activeOpacity={0.85}
        >
          <Ionicons name={isRecording ? 'stop' : 'mic'} size={32} color={COLORS.cream} />
        </TouchableOpacity>
        <Text style={styles.recordLabel}>{isRecording ? 'Recording... tap to stop' : 'Tap to record yourself'}</Text>

        {hasRecording && (
          <TouchableOpacity style={styles.playMineBtn} onPress={playMine} activeOpacity={0.85}>
            <Ionicons name="play" size={18} color={COLORS.primary} />
            <Text style={styles.playMineBtnText}>Play my recording</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, index === 0 && styles.navBtnDisabled]}
          onPress={goPrev}
          disabled={index === 0}
        >
          <Ionicons name="chevron-back" size={22} color={index === 0 ? '#444' : COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navBtn, index === items.length - 1 && styles.navBtnDisabled]}
          onPress={goNext}
          disabled={index === items.length - 1}
        >
          <Ionicons name="chevron-forward" size={22} color={index === items.length - 1 ? '#444' : COLORS.text} />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 8,
  },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: COLORS.text },
  caption: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginBottom: 20 },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: 24 },
  counter: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 16 },
  yorubaText: { fontSize: 32, fontFamily: FONTS.yorubaBold, color: COLORS.text, textAlign: 'center' },
  glossText: { fontSize: 16, color: COLORS.primary, marginTop: 6, marginBottom: 30 },
  targetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 36,
  },
  targetBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.cream },
  recordBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnActive: { backgroundColor: COLORS.terracottaDark },
  recordLabel: { fontSize: 13, color: COLORS.textMuted, marginTop: 12, fontWeight: '600' },
  playMineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  playMineBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.4 },
  emptyBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 24, textAlign: 'center' },
  doneBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 40 },
  doneBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.cream },
});
