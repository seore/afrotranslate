// Shared design tokens for the learning app's screens. Previously every
// screen hardcoded its own hex values (mostly copied from the old
// translator's generic dark-cyan tech-app look); this pulls them into one
// place so the palette can change once and apply everywhere, and so it
// actually reads as a Yoruba-heritage brand rather than a random dark UI.
//
// Palette is drawn from adire (indigo-dyed cloth) for the primary accent and
// aso-oke (gold-threaded cloth) for premium/celebration accents, instead of
// the previous generic neon cyan.

export const COLORS = {
  bg: '#0D0B1A',
  bgMid: '#161225',
  card: '#1C1730',
  cardBorder: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.12)',

  primary: '#6C5CE7', // adire indigo-violet — replaces the old #00F5FF cyan
  primaryDim: 'rgba(108,92,231,0.15)',
  primaryBorder: 'rgba(108,92,231,0.35)',

  gold: '#E8B93D', // aso-oke gold — premium, streaks, celebration
  goldDim: 'rgba(232,185,61,0.15)',
  goldBorder: 'rgba(232,185,61,0.35)',

  terracotta: '#E2725B', // warm secondary accent

  success: '#22c55e',
  successDim: 'rgba(34,197,94,0.15)',
  error: '#ef4444',
  errorDim: 'rgba(239,68,68,0.15)',

  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
};

export const GRADIENT = [COLORS.bg, COLORS.bgMid, COLORS.bg];

export const FONTS = {
  yoruba: 'Fraunces_600SemiBold',
  yorubaBold: 'Fraunces_700Bold',
};
