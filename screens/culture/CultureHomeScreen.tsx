// Culture tab: today's proverb (shareable) and the names guide.

import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ShareCard } from '../../components/culture/ShareCard';
import { ListenButtons } from '../../components/lesson/ListenButtons';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { getCulture } from '../../content';
import { LEARNABLE_LANGUAGES } from '../../content/languages';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import { usePhraseAudio } from '../../hooks/usePhraseAudio';
import { proverbOfTheDay } from '../../lib/culture';
import { dateKey } from '../../lib/dates';
import type { RootStackParamList } from '../../navigation/types';
import { shareCard } from '../../services/shareCard';
import { colors } from '../../theme/colors';

export default function CultureHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useLearnerProfile();
  const language = profile.language ?? 'yo';
  const languageName = LEARNABLE_LANGUAGES.find((l) => l.code === language)?.native ?? '';
  const culture = getCulture(language);
  const proverb = culture ? proverbOfTheDay(culture.proverbs, dateKey(new Date())) : undefined;
  const audio = usePhraseAudio(language);
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const share = async () => {
    setSharing(true);
    await shareCard(cardRef, 'Share this proverb');
    setSharing(false);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Culture
        </Text>
        <Text style={styles.subtitle}>Proverbs and names that carry {languageName} wisdom.</Text>
      </View>

      {proverb ? (
        <View style={styles.section}>
          <ShareCard
            ref={cardRef}
            label="PROVERB OF THE DAY"
            title={proverb.text}
            subtitle={`“${proverb.literal}”`}
            body={proverb.meaning}
            language={language}
            languageName={languageName}
          />
          <View style={styles.actions}>
            <ListenButtons
              label="the proverb"
              onListen={() => audio.play(proverb)}
              onListenSlow={() => audio.playSlow(proverb)}
            />
            <View style={styles.shareBtn}>
              <Button label="Share" icon="share-outline" variant="secondary" onPress={share} loading={sharing} />
            </View>
          </View>
          <Text style={styles.hint}>A new proverb every day.</Text>
        </View>
      ) : null}

      {culture?.names.length ? (
        <TouchableOpacity
          style={styles.entry}
          onPress={() => navigation.navigate('Names')}
          accessibilityRole="button"
          accessibilityLabel={`${languageName} names and their meanings`}
          activeOpacity={0.8}
        >
          <Text style={styles.entryEmoji} importantForAccessibility="no">
            📜
          </Text>
          <View style={styles.flex}>
            <Text style={styles.entryTitle}>{languageName} names</Text>
            <Text style={styles.entryBody}>
              What {culture.names.length} names mean, how to say them, and the stories behind them.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 16,
  },
  shareBtn: {
    flexGrow: 1,
    minWidth: 140,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 10,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
  },
  entryEmoji: {
    fontSize: 30,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  entryBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
