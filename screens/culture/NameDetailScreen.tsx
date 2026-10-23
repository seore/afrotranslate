import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ShareCard } from '../../components/culture/ShareCard';
import { ListenButtons } from '../../components/lesson/ListenButtons';
import { ToneContour } from '../../components/lesson/ToneContour';
import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { StepHeader } from '../../components/ui/StepHeader';
import { getCulture } from '../../content';
import { hasToneMarks, LEARNABLE_LANGUAGES } from '../../content/languages';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import { usePhraseAudio } from '../../hooks/usePhraseAudio';
import type { RootStackParamList } from '../../navigation/types';
import { shareCard } from '../../services/shareCard';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'NameDetail'>;

const GENDER_LABEL = { boy: 'Usually a boy’s name', girl: 'Usually a girl’s name', any: 'Given to boys and girls' };

export default function NameDetailScreen({ navigation, route }: Props) {
  const { profile } = useLearnerProfile();
  const language = profile.language ?? 'yo';
  const languageName = LEARNABLE_LANGUAGES.find((l) => l.code === language)?.native ?? '';
  const entry = getCulture(language)?.names.find((n) => n.id === route.params.nameId);
  const audio = usePhraseAudio(language);
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  if (!entry) return null;
  const speakable = { text: entry.name, audioKey: entry.audioKey };

  const share = async () => {
    setSharing(true);
    await shareCard(cardRef, `Share ${entry.name}`);
    setSharing(false);
  };

  return (
    <Screen
      footer={<Button label="Share this name" icon="share-outline" onPress={share} loading={sharing} />}
    >
      <StepHeader title="" onBack={navigation.goBack} />

      <ShareCard
        ref={cardRef}
        label={`${languageName.toUpperCase()} NAME`}
        title={entry.name}
        subtitle={entry.meaning}
        body={entry.note}
        language={language}
        languageName={languageName}
      />

      <View style={styles.listen}>
        <ListenButtons
          label={entry.name}
          onListen={() => audio.play(speakable)}
          onListenSlow={() => audio.playSlow(speakable)}
        />
      </View>
      {hasToneMarks(language) ? <ToneContour text={entry.name} /> : null}

      <View style={styles.facts}>
        <Text style={styles.fact}>Theme: {entry.theme}</Text>
        <Text style={styles.fact}>{GENDER_LABEL[entry.gender]}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  listen: {
    marginTop: 20,
  },
  facts: {
    marginTop: 20,
    gap: 6,
  },
  fact: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
