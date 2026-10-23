import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { OptionCard } from '../../components/ui/OptionCard';
import { Screen } from '../../components/ui/Screen';
import { StepHeader } from '../../components/ui/StepHeader';
import { LEVELS } from '../../content/reasons';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Level'>;

export default function LevelScreen({ navigation }: Props) {
  const { profile, updateProfile } = useLearnerProfile();

  return (
    <Screen>
      <StepHeader
        title="How much do you know?"
        subtitle="No wrong answers. Many heritage learners understand more than they speak."
        progress={2 / 4}
        onBack={navigation.goBack}
      />
      {LEVELS.map((level) => (
        <OptionCard
          key={level.id}
          emoji={level.emoji}
          title={level.title}
          subtitle={level.subtitle}
          selected={profile.level === level.id}
          onPress={() => {
            updateProfile({ level: level.id });
            navigation.navigate('Language');
          }}
        />
      ))}
    </Screen>
  );
}
