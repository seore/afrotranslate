import type { LanguageCode, LanguageOption } from './types';

export function hasToneMarks(code: LanguageCode): boolean {
  return LEARNABLE_LANGUAGES.find((l) => l.code === code)?.toneMarks ?? false;
}

// Learnable languages. Flip `available` once a language has content.
export const LEARNABLE_LANGUAGES: LanguageOption[] = [
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá', flag: '🇳🇬', available: true, toneMarks: true },
  { code: 'ig', name: 'Igbo', native: 'Igbo', flag: '🇳🇬', available: false, toneMarks: false },
  { code: 'ha', name: 'Hausa', native: 'Hausa', flag: '🇳🇬', available: false, toneMarks: false },
];
