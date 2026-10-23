// Draws a phrase's tone pattern: one dot per syllable at high, mid or
// low, joined by a line, with a gap between words. Derived purely from
// the tone marks (lib/tones.ts), so it needs no audio analysis.

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { describeTones, tonePattern, type Tone } from '../../lib/tones';
import { colors } from '../../theme/colors';

interface ToneContourProps {
  text: string;
}

const STEP = 18;
const WORD_GAP = 14;
const HEIGHT = 44;
const PAD = 8;
const LEVEL: Record<Tone, number> = { H: PAD, M: HEIGHT / 2, L: HEIGHT - PAD };

export function ToneContour({ text }: ToneContourProps) {
  const pattern = tonePattern(text);
  if (!pattern.length) return null;

  // Lay out each word's syllables left to right.
  let x = PAD;
  const words = pattern.map((w) => {
    const points = w.tones.map((tone) => {
      const point = { x, y: LEVEL[tone] };
      x += STEP;
      return point;
    });
    x += WORD_GAP - STEP + STEP / 2;
    return points;
  });
  const width = x - WORD_GAP + PAD;

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Tone pattern. ${describeTones(pattern)}`}
    >
      <View style={styles.legend} importantForAccessibility="no-hide-descendants">
        <Text style={styles.legendText}>high</Text>
        <Text style={styles.legendText}>mid</Text>
        <Text style={styles.legendText}>low</Text>
      </View>
      {/* Long phrases scroll sideways rather than squeezing on small screens. */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <Svg width={width} height={HEIGHT}>
          {[LEVEL.H, LEVEL.M, LEVEL.L].map((y) => (
            <Line key={y} x1={0} x2={width} y1={y} y2={y} stroke={colors.cardBorder} strokeWidth={1} />
          ))}
          {words.map((points, i) => (
            <React.Fragment key={i}>
              {points.length > 1 ? (
                <Polyline
                  points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={colors.accent}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                />
              ) : null}
              {points.map((p, j) => (
                <Circle key={j} cx={p.x} cy={p.y} r={4.5} fill={colors.accent} />
              ))}
            </React.Fragment>
          ))}
        </Svg>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  legend: {
    height: HEIGHT,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
});
