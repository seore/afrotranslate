// Colours taken from the existing translator/premium screens so new
// screens match the current GRIOT look. Not a redesign.
export const colors = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  gradient: ['#0A0A0A', '#1A1A1A', '#0A0A0A'] as const,
  card: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.1)',
  accent: '#00F5FF',
  accentSoft: 'rgba(0,245,255,0.05)',
  text: '#FFFFFF',
  // Existing label grey. Body copy uses textSecondary for readable contrast.
  textMuted: '#666',
  textSecondary: '#A3A3A3',
  success: '#22c55e',
  onAccent: '#000',
};
