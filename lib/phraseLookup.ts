// ================================================================
// lib/phraseLookup.ts - Match translator input against course phrases.
// When someone translates a phrase the course already teaches, the
// translator answers with the course's checked, tone-marked text (and
// its recorded audio) instead of machine translation.
// ================================================================

import type { Phrase } from '../content/types';
import { foldForSearch } from './culture.ts';

/** "What’s your name?" -> "whats your name". */
export function normalizeEnglish(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’'`]/g, '')
    .replace(/[?!.,;:“”"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function withoutNote(english: string): string {
  return english.replace(/\([^)]*\)/g, '');
}

/**
 * Target-language text compared without tone marks, case or punctuation,
 * and with repeated vowels collapsed: people type "e kaaro" for káàárọ̀.
 */
function normalizeTarget(text: string): string {
  return foldForSearch(text)
    .replace(/[?!.,;:“”"]/g, '')
    .replace(/([aeiou])\1+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * English -> course phrase. An exact meaning wins over one that only
 * matches after dropping a note like "(to a friend)", so "Thank you"
 * finds the respectful Ẹ ṣé rather than O ṣé.
 */
export function findByEnglish(text: string, lexicon: Record<string, Phrase>): Phrase | undefined {
  const wanted = normalizeEnglish(text);
  if (!wanted) return undefined;
  const phrases = Object.values(lexicon);
  return (
    phrases.find((p) => normalizeEnglish(p.english) === wanted) ??
    phrases.find((p) => normalizeEnglish(withoutNote(p.english)) === wanted)
  );
}

/** Target language -> course phrase, forgiving missing tone marks ("e kaaro"). */
export function findByTarget(text: string, lexicon: Record<string, Phrase>): Phrase | undefined {
  const wanted = normalizeTarget(text);
  if (!wanted) return undefined;
  return Object.values(lexicon).find((p) => normalizeTarget(p.text) === wanted);
}
