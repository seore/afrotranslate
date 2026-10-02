import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';

import { playAudioForKey } from './services/audioService';
import { useSRS } from './SRSContext';
import { haptics } from './utils/haptics';
import { COLORS, FONTS } from './theme';

const REVIEW_SESSION_SIZE = 10;

export default function ReviewSessionScreen({ langCode = 'yo', onExit }) {
  const { getDueItems, gradeItem } = useSRS();
  const player = useAudioPlayer();

  const [items] = useState(() => getDueItems(REVIEW_SESSION_SIZE));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const current = items[index];

  useEffect(() => {
    if (current) {
      playAudioForKey(player, { audioKey: current.audioKey, text: current.yoruba, langCode });
    }
    setRevealed(false);
  }, [index]);

  const replay = () => {
    if (current) playAudioForKey(player, { audioKey: current.audioKey, text: current.yoruba, langCode });
  };

  const handleGrade = async (remembered) => {
    remembered ? haptics.success() : haptics.error();
    await gradeItem(current.audioKey, remembered);
    setReviewedCount((c) => c + 1);
    setIndex((i) => i + 1);
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.emptyBody}>
          <Ionicons name="checkmark-done-circle" size={72} color={COLORS.success} />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>No words due for review right now.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={onExit} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (index >= items.length) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.emptyBody}>
          <Ionicons name="ribbon" size={72} color={COLORS.gold} />
          <Text style={styles.emptyTitle}>Review complete!</Text>
          <Text style={styles.emptySubtitle}>{reviewedCount} words reviewed.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={onExit} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
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
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(index / items.length) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.prompt}>Do you remember this word?</Text>

        <TouchableOpacity style={styles.playButton} onPress={replay} activeOpacity={0.85}>
          <Ionicons name="volume-high" size={40} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.yorubaText}>{current.yoruba}</Text>

        {revealed ? (
          <>
            <Text style={styles.glossText}>{current.gloss}</Text>
            <View style={styles.gradeRow}>
              <TouchableOpacity
                style={[styles.gradeBtn, styles.gradeBtnWrong]}
                onPress={() => handleGrade(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.gradeBtnText}>Still learning</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.gradeBtn, styles.gradeBtnRight]}
                onPress={() => handleGrade(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.gradeBtnText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity style={styles.revealBtn} onPress={() => setRevealed(true)} activeOpacity={0.85}>
            <Text style={styles.revealBtnText}>Show meaning</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  closeBtn: { padding: 4 },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 5 },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40 },
  prompt: { fontSize: 16, fontWeight: '700', color: COLORS.textMuted, marginBottom: 30, letterSpacing: 1 },
  playButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  yorubaText: { fontSize: 30, fontFamily: FONTS.yorubaBold, color: COLORS.text, textAlign: 'center', marginBottom: 20 },
  glossText: { fontSize: 20, fontWeight: '700', color: COLORS.primary, textAlign: 'center', marginBottom: 30 },
  revealBtn: {
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  revealBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  gradeRow: { flexDirection: 'row', gap: 12, width: '100%' },
  gradeBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  gradeBtnWrong: { backgroundColor: COLORS.errorDim, borderWidth: 2, borderColor: COLORS.error },
  gradeBtnRight: { backgroundColor: COLORS.successDim, borderWidth: 2, borderColor: COLORS.success },
  gradeBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  emptyBody: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  emptyTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginTop: 20 },
  emptySubtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 8, marginBottom: 30 },
  doneBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 50 },
  doneBtnText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1 },
});
