// Shared design tokens — Phase 1 of the GRIOT design overhaul.
//
// Palette: indigo (adire resist-dye) + gold/ochre (aso-oke) + terracotta +
// warm cream, on a warm dark base — not the flat navy/purple this replaces.
// Reviewed and approved as a token preview before being wired in here; see
// that artifact for the full swatch/type/spacing reference.
//
// Every screen already reads colors through the semantic names below
// (COLORS.primary, COLORS.card, COLORS.text, ...), so changing the values
// here re-themes the whole app without touching per-screen StyleSheets.

const RAW = {
  bg: '#140F1F',
  bgMid: '#201A35',
  bgElevated: '#1E1730',
  bgElevated2: '#2A2140',

  indigo900: '#1C1842',
  indigo600: '#352A6E',
  indigo500: '#4C3F91',
  indigo300: '#8B7FD4',

  gold700: '#8C621F',
  gold600: '#B8842E',
  gold500: '#E0A947',
  gold300: '#F3CD83',

  terracotta600: '#9C4A32',
  terracotta500: '#C96A45',
  terracotta300: '#E3977A',

  cream: '#F3E9D8',
  creamMuted: '#C9BBA3',
  creamFaint: '#8A7F6E',

  success: '#5FA35A',
  error: '#C2483A',
};

export const COLORS = {
  ...RAW,

  // Semantic aliases — what the screens actually reference.
  bg: RAW.bg,
  card: RAW.bgElevated,
  cardRaised: RAW.bgElevated2,
  cardBorder: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.12)',

  primary: RAW.indigo500,
  primaryDim: 'rgba(76,63,145,0.22)',
  primaryBorder: 'rgba(76,63,145,0.45)',
  primaryLight: RAW.indigo300,

  gold: RAW.gold500,
  goldDim: 'rgba(224,169,71,0.15)',
  goldBorder: 'rgba(224,169,71,0.4)',

  terracotta: RAW.terracotta500,
  terracottaDark: RAW.terracotta600,

  success: RAW.success,
  successDim: 'rgba(95,163,90,0.15)',
  successBorder: 'rgba(95,163,90,0.4)',
  error: RAW.error,
  errorDim: 'rgba(194,72,58,0.15)',
  errorBorder: 'rgba(194,72,58,0.4)',

  text: RAW.cream,
  textOnGold: RAW.bg, // dark ink on a gold surface, not white
  textSecondary: RAW.creamMuted,
  textMuted: RAW.creamFaint,
};

export const GRADIENT = [COLORS.bg, COLORS.bgMid, COLORS.bg];

export const FONTS = {
  yoruba: 'Fraunces_600SemiBold',
  yorubaBold: 'Fraunces_700Bold',
};

// Type scale — Fraunces for Yoruba/display moments, system font for English/UI.
export const TYPE = {
  display: { fontFamily: FONTS.yorubaBold, fontSize: 36 },
  h1: { fontFamily: FONTS.yorubaBold, fontSize: 26 },
  h2: { fontFamily: FONTS.yoruba, fontSize: 20 },
  body: { fontSize: 16, fontWeight: '500' },
  bodySmall: { fontSize: 14 },
  caption: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
};

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 };

export const RADII = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 };

// Flat black drop-shadows barely read on a dark background, so elevation and
// emphasis use soft color glows instead. Note: iOS renders these as true
// colored glows (shadowColor/shadowOpacity/shadowRadius); Android's
// `elevation` can't be colored, so glow* degrades to a plain dark elevation
// shadow there — still gives real elevation feedback, just not the color.
export const SHADOWS = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  glowGold: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  glowIndigo: {
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
};
