import React from 'react';
import Svg, { Path, Line, Circle } from 'react-native-svg';

import { COLORS } from '../theme';

// A simple geometric mark evoking a dùndún (Yoruba talking drum) - an
// hourglass body with laced strings, used as a small recurring brand glyph
// in place of a generic icon. This is NOT illustrated character art (a real
// mascot needs an actual designer/artwork); it's a lightweight SVG shape
// built from primitives, scoped to fit what's buildable here.
export default function GriotMark({ size = 32, color = COLORS.primary, laceColor = COLORS.gold }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d="M14 8 H50 L36 32 L50 56 H14 L28 32 Z" fill={color} />
      <Circle cx={14} cy={8} r={3} fill={laceColor} />
      <Circle cx={50} cy={8} r={3} fill={laceColor} />
      <Circle cx={14} cy={56} r={3} fill={laceColor} />
      <Circle cx={50} cy={56} r={3} fill={laceColor} />
      <Line x1={20} y1={16} x2={32} y2={30} stroke={laceColor} strokeWidth={2} />
      <Line x1={44} y1={16} x2={32} y2={30} stroke={laceColor} strokeWidth={2} />
      <Line x1={20} y1={48} x2={32} y2={34} stroke={laceColor} strokeWidth={2} />
      <Line x1={44} y1={48} x2={32} y2={34} stroke={laceColor} strokeWidth={2} />
    </Svg>
  );
}
