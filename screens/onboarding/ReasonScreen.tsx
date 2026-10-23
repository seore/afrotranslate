import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { OptionCard } from '../../components/ui/OptionCard';
import { Screen } from '../../components/ui/Screen';
import { StepHeader } from '../../components/ui/StepHeader';
import { REASONS } from '../../content/reasons';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Reason'>;

export default function ReasonScreen({ navigation }: Props) {
  const { profile, updateProfile } = useLearnerProfile();

  return (
    <Screen>
      <StepHeader
        title="Why are you learning?"
        subtitle="We’ll shape your lessons and reminders around this."
        progress={1 / 4}
        onBack={navigation.goBack}
      />
      {REASONS.map((reason) => (
        <OptionCard
          key={reason.id}
          emoji={reason.emoji}
          title={reason.title}
          subtitle={reason.subtitle}
          selected={profile.reason === reason.id}
          onPress={() => {
            updateProfile({ reason: reason.id });
            navigation.navigate('Level');
          }}
        />
      ))}
    </Screen>
  );
}
