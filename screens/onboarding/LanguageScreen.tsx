import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { OptionCard } from '../../components/ui/OptionCard';
import { Screen } from '../../components/ui/Screen';
import { StepHeader } from '../../components/ui/StepHeader';
import { LEARNABLE_LANGUAGES } from '../../content/languages';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Language'>;

export default function LanguageScreen({ navigation }: Props) {
  const { profile, updateProfile } = useLearnerProfile();

  return (
    <Screen>
      <StepHeader
        title="Choose a language"
        subtitle="More languages are on the way."
        progress={3 / 4}
        onBack={navigation.goBack}
      />
      {LEARNABLE_LANGUAGES.map((language) => (
        <OptionCard
          key={language.code}
          emoji={language.flag}
          title={language.native}
          titleLanguage={language.code}
          subtitle={language.name}
          badge={language.available ? undefined : 'Coming soon'}
          disabled={!language.available}
          selected={profile.language === language.code}
          onPress={() => {
            updateProfile({ language: language.code });
            navigation.navigate('FirstLesson', { mode: 'onboarding' });
          }}
        />
      ))}
    </Screen>
  );
}
