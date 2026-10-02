import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';

import { getToneContour } from '../utils/toneContour';
import { COLORS } from '../theme';

const TONE_Y = { high: 8, mid: 24, low: 40 };
const TONE_COLOR = { high: COLORS.primary, mid: COLORS.textSecondary, low: COLORS.terracotta };
const DOT_SPACING = 24;
const PADDING_X = 12;
const HEIGHT = 48;

// A word/phrase's tone contour (high/mid/low per vowel) as a small pitch-line
// glyph — Yoruba is tonal and this is the thing a generic (non-tonal-aware)
// language app has no equivalent of. Pass `text` directly; the contour is
// derived from its diacritics via utils/toneContour.js.
export default function ToneContour({ text, style }) {
  const contour = getToneContour(text);
  if (contour.length === 0) return null;

  const width = PADDING_X * 2 + DOT_SPACING * Math.max(contour.length - 1, 0);
  const points = contour.map((tone, i) => `${PADDING_X + i * DOT_SPACING},${TONE_Y[tone]}`).join(' ');

  return (
    <View style={[styles.container, style]}>
      <Svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`}>
        <Polyline points={points} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2} />
        {contour.map((tone, i) => (
          <Circle key={i} cx={PADDING_X + i * DOT_SPACING} cy={TONE_Y[tone]} r={5} fill={TONE_COLOR[tone]} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
