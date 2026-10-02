import React, { useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { COLORS } from '../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SPACING = 28;

// A subtle adire-inspired diagonal lattice - gold and indigo lines crossing
// at 45°, like a resist-dye crosshatch. Meant to sit at very low opacity
// behind the home and lesson-complete screens: a recognizable signature,
// not a pattern anyone consciously notices. Built from individual SVG lines
// rather than react-native-svg's <Pattern> tag, which has historically had
// uneven Android support - plain <Line> elements render consistently on both.
export default function AdireBackground({ opacity = 0.05 }) {
  const offsets = useMemo(() => {
    const arr = [];
    for (let x = -SCREEN_H; x < SCREEN_W + SCREEN_H; x += SPACING) arr.push(x);
    return arr;
  }, []);

  return (
    <Svg width={SCREEN_W} height={SCREEN_H} style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      {offsets.map((x, i) => (
        <Line key={`g${i}`} x1={x} y1={0} x2={x + SCREEN_H} y2={SCREEN_H} stroke={COLORS.gold} strokeWidth={1.5} />
      ))}
      {offsets.map((x, i) => (
        <Line key={`p${i}`} x1={x} y1={0} x2={x - SCREEN_H} y2={SCREEN_H} stroke={COLORS.primaryLight} strokeWidth={1.5} />
      ))}
    </Svg>
  );
}
