import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

import { COLORS } from '../theme';

const PARTICLE_COUNT = 24;
const PARTICLE_COLORS = [COLORS.gold, COLORS.primary, COLORS.terracotta, COLORS.success, COLORS.cream];

function Particle({ color, delay }) {
  const progress = useRef(new Animated.Value(0)).current;
  const angle = useMemo(() => Math.random() * Math.PI * 2, []);
  const distance = useMemo(() => 80 + Math.random() * 120, []);
  const size = useMemo(() => 6 + Math.random() * 6, []);
  const rotateStart = useMemo(() => Math.random() * 360, []);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 900 + Math.random() * 400,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * distance] });
  // + a downward drift so the burst falls like confetti rather than expanding evenly outward.
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * distance + 70] });
  const opacity = progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
  const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: [`${rotateStart}deg`, `${rotateStart + 180}deg`] });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          width: size,
          height: size,
          opacity,
          transform: [{ translateX }, { translateY }, { rotate }],
        },
      ]}
    />
  );
}

// A one-shot celebratory particle burst - mount it (e.g. `{show && <ConfettiBurst />}`)
// to play it, unmount to reset. Plain Animated views rather than a confetti
// library, since that's plenty for a single burst and avoids a new dependency.
export default function ConfettiBurst() {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        key: i,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        delay: Math.random() * 150,
      })),
    []
  );

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.origin}>
        {particles.map((p) => (
          <Particle key={p.key} color={p.color} delay={p.delay} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  origin: { width: 1, height: 1 },
  particle: { position: 'absolute', borderRadius: 3 },
});
