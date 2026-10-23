// Lets the translator answer with checked course phrases (and their
// recorded audio) when the input is something the course teaches.

import { getCourse } from '../content';
import type { LanguageCode } from '../content/types';
import { findByEnglish, findByTarget } from '../lib/phraseLookup';
import { AUDIO_ASSETS } from './audioAssets';

export interface CourseTranslation {
  text: string;
  /** Recorded native audio for the result, when there is one. */
  audio: number | null;
}

const hasCourse = (code: string): code is LanguageCode => Boolean(getCourse(code as LanguageCode));

/** Course answer for `text` translated from `from` to `to`, or null to use machine translation. */
export function lookupCoursePhrase(text: string, from: string, to: string): CourseTranslation | null {
  if (from === 'en' && hasCourse(to)) {
    const phrase = findByEnglish(text, getCourse(to)!.lexicon);
    return phrase ? { text: phrase.text, audio: AUDIO_ASSETS[phrase.audioKey] ?? null } : null;
  }
  if (to === 'en' && hasCourse(from)) {
    const phrase = findByTarget(text, getCourse(from)!.lexicon);
    return phrase ? { text: phrase.english.replace(/\s*\([^)]*\)/g, ''), audio: null } : null;
  }
  return null;
}
