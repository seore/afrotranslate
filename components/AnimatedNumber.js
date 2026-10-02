import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';

// Ticks a number up/down to `value` instead of jumping straight to it -
// used for XP/streak counters so progress feels earned rather than instant.
export default function AnimatedNumber({ value, prefix = '', suffix = '', style, duration = 600 }) {
  const animated = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const id = animated.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(animated, { toValue: value, duration, useNativeDriver: false }).start();
    return () => animated.removeListener(id);
  }, [value]);

  return (
    <Text style={style}>
      {prefix}
      {display}
      {suffix}
    </Text>
  );
}
