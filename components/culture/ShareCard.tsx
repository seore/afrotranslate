// A GRIOT-branded card that is both shown on screen and captured as the
// image people share, so what they see is exactly what gets sent.

import React, { forwardRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import type { LanguageCode } from '../../content/types';
import { colors } from '../../theme/colors';

interface ShareCardProps {
  label: string;
  /** Large target-language text. */
  title: string;
  /** Under the title, e.g. the literal translation or name meaning. */
  subtitle: string;
  /** Smaller explanatory line. */
  body?: string;
  language: LanguageCode;
  languageName: string;
}

export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard(
  { label, title, subtitle, body, language, languageName },
  ref,
) {
  return (
    // collapsable={false} keeps the view real on Android so it can be captured.
    <View ref={ref} collapsable={false} style={styles.outer}>
      <LinearGradient colors={['#0A0A0A', '#14262A', '#0A0A0A']} style={styles.card}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.title} accessibilityLanguage={language}>
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {body ? <Text style={styles.body}>{body}</Text> : null}
        <View style={styles.footer}>
          <Image source={require('../../assets/images/griot-logo.png')} style={styles.logo} accessible={false} />
          <Text style={styles.brand}>GRIOT</Text>
          <Text style={styles.tagline}>· Learn {languageName}</Text>
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  outer: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,245,255,0.25)',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: colors.accent,
  },
  title: {
    fontSize: 28,
    lineHeight: 40,
    fontWeight: '900',
    color: colors.text,
    marginTop: 14,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 7,
  },
  brand: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 3,
    color: colors.text,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
