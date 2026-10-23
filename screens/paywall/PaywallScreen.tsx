// ================================================================
// PaywallScreen.tsx - The one paywall, used from the learning screens
// (as a route) and the translator (as a modal via <Paywall />).
// Plans, prices and trials come from RevenueCat's current offering;
// wording rules live in lib/paywall.ts. Always closable, with Restore
// Purchases, Terms and Privacy visible (App Store Guideline 3.1.2).
// ================================================================

import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PurchasesPackage } from 'react-native-purchases';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Button } from '../../components/ui/Button';
import { Screen } from '../../components/ui/Screen';
import { LEARNABLE_LANGUAGES } from '../../content/languages';
import { REASONS } from '../../content/reasons';
import { useLearnerProfile } from '../../context/LearnerProfileContext';
import { usePremiumStatus } from '../../hooks/usePremiumStatus';
import type { PaywallSource } from '../../lib/entitlements';
import {
  annualSavingsPercent,
  ctaLabel,
  defaultPackage,
  disclosure,
  freeTrial,
  orderPackages,
  planName,
  priceLabel,
  trialBadge,
} from '../../lib/paywall';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

const PRIVACY_URL = 'https://seore.github.io/afrotranslate-privacy/privacy.html';
const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

const BENEFITS = [
  'Every lesson, plus new units as they’re released',
  'Daily review that makes phrases stick',
  'Conversation mode in the translator',
  '7 more translator languages, including Amharic and Arabic',
];

interface PaywallProps {
  onClose: () => void;
  source: PaywallSource;
}

export function Paywall({ onClose }: PaywallProps) {
  const { profile } = useLearnerProfile();
  const premium = usePremiumStatus();
  const { offering, offeringsStatus, introEligibility } = premium;

  const packages = useMemo(() => orderPackages(offering?.availablePackages ?? []), [offering]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected: PurchasesPackage | undefined =
    packages.find((p) => p.identifier === selectedId) ?? defaultPackage(packages);
  const [busy, setBusy] = useState<'purchase' | 'restore' | null>(null);
  const [justUnlocked, setJustUnlocked] = useState(false);

  // Retry once on open if plans failed to load earlier (e.g. offline at launch).
  useEffect(() => {
    if (offeringsStatus === 'error') premium.refreshOfferings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const languageName = LEARNABLE_LANGUAGES.find((l) => l.code === (profile.language ?? 'yo'))?.native ?? '';
  const headline = (
    REASONS.find((r) => r.id === profile.reason)?.paywallHeadline ?? 'Learn {language} with GRIOT Premium.'
  ).replaceAll('{language}', languageName);
  const savings = annualSavingsPercent(packages);
  const trial = selected ? freeTrial(selected, introEligibility) : null;

  const purchase = async () => {
    if (!selected) return;
    setBusy('purchase');
    const { status } = await premium.purchasePremium(selected, { silent: true });
    setBusy(null);
    if (status === 'success') setJustUnlocked(true);
    else if (status === 'pending') {
      Alert.alert('Waiting for approval', 'Your purchase will complete once it’s approved (for example, Ask to Buy).');
    } else if (status === 'error') {
      Alert.alert('Purchase didn’t go through', 'You haven’t been charged. Please try again in a moment.');
    }
  };

  const restore = async () => {
    setBusy('restore');
    const { status } = await premium.restorePurchases({ silent: true });
    setBusy(null);
    if (status === 'restored') setJustUnlocked(true);
    else if (status === 'none') Alert.alert('Nothing to restore', 'We couldn’t find an active purchase for this Apple ID.');
    else Alert.alert('Restore failed', 'Please check your connection and try again.');
  };

  const closeButton = (
    <TouchableOpacity
      onPress={onClose}
      style={styles.close}
      accessibilityRole="button"
      accessibilityLabel="Close"
      hitSlop={12}
    >
      <Ionicons name="close" size={22} color={colors.text} />
    </TouchableOpacity>
  );

  if (premium.isPremium || justUnlocked) {
    return (
      <Screen footer={<Button label="Continue" onPress={onClose} />}>
        <View style={styles.closeRow}>{closeButton}</View>
        <View style={styles.done}>
          <Ionicons name="checkmark-circle" size={72} color={colors.success} />
          <Text style={styles.headline} accessibilityRole="header">
            {justUnlocked ? 'Welcome to Premium!' : 'You’re on Premium'}
          </Text>
          <Text style={styles.sub}>Every lesson, review and translator feature is unlocked.</Text>
        </View>
      </Screen>
    );
  }

  const footer = (
    <>
      {offeringsStatus === 'ready' && selected ? (
        <>
          <Button label={ctaLabel(selected, trial)} onPress={purchase} loading={busy === 'purchase'} disabled={busy !== null} />
          <Text style={styles.disclosure}>{disclosure(selected, trial)}</Text>
        </>
      ) : null}
      <View style={styles.links}>
        <TouchableOpacity onPress={restore} disabled={busy !== null} accessibilityRole="button">
          <Text style={styles.link}>{busy === 'restore' ? 'Restoring…' : 'Restore Purchases'}</Text>
        </TouchableOpacity>
        <Text style={styles.dot}>·</Text>
        <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)} accessibilityRole="link">
          <Text style={styles.link}>Terms</Text>
        </TouchableOpacity>
        <Text style={styles.dot}>·</Text>
        <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)} accessibilityRole="link">
          <Text style={styles.link}>Privacy</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <Screen footer={footer}>
      <View style={styles.closeRow}>{closeButton}</View>

      <View style={styles.hero}>
        <Image source={require('../../assets/images/griot-logo.png')} style={styles.logo} accessible={false} />
        <Text style={styles.label}>GRIOT PREMIUM</Text>
        <Text style={styles.headline} accessibilityRole="header">
          {headline}
        </Text>
      </View>

      <View style={styles.benefits}>
        {BENEFITS.map((benefit) => (
          <View key={benefit} style={styles.benefit}>
            <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      {offeringsStatus === 'loading' ? (
        <ActivityIndicator color={colors.accent} style={styles.loading} accessibilityLabel="Loading plans" />
      ) : null}

      {offeringsStatus === 'error' ? (
        <View style={styles.error}>
          <Text style={styles.sub}>We couldn’t load the plans. Check your connection and try again.</Text>
          <View style={styles.retry}>
            <Button label="Try again" variant="secondary" onPress={premium.refreshOfferings} />
          </View>
        </View>
      ) : null}

      {offeringsStatus === 'ready'
        ? packages.map((pkg) => {
            const isSelected = pkg.identifier === selected?.identifier;
            const pkgTrial = freeTrial(pkg, introEligibility);
            const perMonth = pkg.packageType === 'ANNUAL' ? pkg.product.pricePerMonthString : null;
            return (
              <TouchableOpacity
                key={pkg.identifier}
                onPress={() => setSelectedId(pkg.identifier)}
                style={[styles.plan, isSelected && styles.planSelected]}
                activeOpacity={0.85}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={[planName(pkg), priceLabel(pkg), pkgTrial ? trialBadge(pkgTrial) : null]
                  .filter(Boolean)
                  .join(', ')}
              >
                <View style={styles.planTop}>
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={isSelected ? colors.accent : colors.textMuted}
                  />
                  <Text style={styles.planName}>{planName(pkg)}</Text>
                  {pkg.packageType === 'ANNUAL' && savings ? (
                    <Text style={styles.badge}>SAVE {savings}%</Text>
                  ) : null}
                </View>
                <Text style={styles.planPrice}>{priceLabel(pkg)}</Text>
                {perMonth ? <Text style={styles.planNote}>Just {perMonth}/month</Text> : null}
                {pkg.packageType === 'LIFETIME' ? <Text style={styles.planNote}>Pay once, keep it forever</Text> : null}
                {pkgTrial ? <Text style={styles.trial}>{trialBadge(pkgTrial)}</Text> : null}
              </TouchableOpacity>
            );
          })
        : null}
    </Screen>
  );
}

/** For a React Native <Modal>, which needs its own safe-area provider. */
export function PaywallModalContent(props: PaywallProps) {
  return (
    <SafeAreaProvider>
      <Paywall {...props} />
    </SafeAreaProvider>
  );
}

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

/** Route version for the learning screens. */
export default function PaywallScreen({ navigation, route }: Props) {
  const { updateProfile } = useLearnerProfile();
  const { source } = route.params;

  const close = () => {
    // After the first win, leaving the paywall (either way) finishes onboarding.
    if (source === 'first_win') updateProfile({ onboardingCompletedAt: new Date().toISOString() });
    else navigation.goBack();
  };

  return <Paywall onClose={close} source={source} />;
}

const styles = StyleSheet.create({
  closeRow: {
    alignItems: 'flex-end',
  },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: colors.accent,
    marginTop: 14,
  },
  headline: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  sub: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
  benefits: {
    gap: 10,
    marginBottom: 20,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  },
  loading: {
    marginVertical: 24,
  },
  error: {
    marginVertical: 12,
  },
  retry: {
    marginTop: 12,
  },
  plan: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 10,
  },
  planSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  badge: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    color: colors.onAccent,
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginTop: 8,
    marginLeft: 32,
  },
  planNote: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    marginLeft: 32,
  },
  trial: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 6,
    marginLeft: 32,
  },
  done: {
    alignItems: 'center',
    marginTop: 60,
  },
  disclosure: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
    paddingVertical: 6,
  },
  dot: {
    color: colors.textMuted,
  },
});
