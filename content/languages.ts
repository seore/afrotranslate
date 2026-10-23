import type { LanguageOption } from './types';

// Learnable languages. Flip `available` once a language has content.
export const LEARNABLE_LANGUAGES: LanguageOption[] = [
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá', flag: '🇳🇬', available: true },
  { code: 'ig', name: 'Igbo', native: 'Igbo', flag: '🇳🇬', available: false },
  { code: 'ha', name: 'Hausa', native: 'Hausa', flag: '🇳🇬', available: false },
];
