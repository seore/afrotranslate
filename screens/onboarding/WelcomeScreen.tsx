import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const { updateProfile } = useLearnerProfile();

  // Existing translator users can go straight to the tool they know.
  const skipToTranslator = () => {
    updateProfile({ onboardingCompletedAt: new Date().toISOString() });
  };

  return (
    <Screen
      footer={
        <>
          <Button label="Start learning" onPress={() => navigation.navigate('Reason')} />
          <Button
            label="Skip to translator"
            variant="text"
            onPress={skipToTranslator}
            accessibilityHint="Skips setup and opens the translator"
          />
        </>
      }
    >
      <View style={styles.hero}>
        <Image
          source={require('../../assets/images/griot-logo.png')}
          style={styles.logoImage}
          accessibilityIgnoresInvertColors
          accessible={false}
        />
        <Text style={styles.logo} accessibilityRole="header">
          GRIOT
        </Text>
        <Text style={styles.subtitle}>AFRICAN VOICE TRANSLATOR</Text>
        <Text style={styles.headline}>Speak the language of your family.</Text>
        <Text style={styles.body}>
          Short audio lessons in african languages. Hear native speech, say it yourself, and use it with the
          people who matter.
        </Text>
        <Text style={styles.body}>Your first three phrases take about two minutes.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoImage: {
    width: 96,
    height: 96,
    // Matches the iOS icon's rounded corners and hides the crop's corner edges.
    borderRadius: 22,
    marginBottom: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginTop: 48,
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});
