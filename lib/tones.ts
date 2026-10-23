// ================================================================
// lib/tones.ts - Tone pattern from Yorùbá spelling.
// Acute (á) = high, grave (à) = low, unmarked = mid. Each vowel carries
// one tone; a syllabic n/m only when it bears a tone mark (ń, ǹ, ḿ).
// Underdots (ẹ ọ ṣ) are letters, not tones, and are ignored.
// A teaching aid, not a full tonal analysis (no tone spreading or
// contour tones on single syllables).
// ================================================================

export type Tone = 'H' | 'M' | 'L';

export interface WordTones {
  word: string;
  tones: Tone[];
}

const ACUTE = '́';
const GRAVE = '̀';
const MACRON = '̄';
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const SYLLABIC_NASALS = new Set(['n', 'm']);

export function toneOfSyllables(word: string): Tone[] {
  const chars = [...word.normalize('NFD').toLowerCase()];
  const tones: Tone[] = [];
  for (let i = 0; i < chars.length; i++) {
    const base = chars[i];
    // Collect the combining marks that follow this letter.
    let marks = '';
    while (i + 1 < chars.length && /\p{M}/u.test(chars[i + 1])) marks += chars[++i];

    const tone: Tone = marks.includes(ACUTE) ? 'H' : marks.includes(GRAVE) ? 'L' : 'M';
    if (VOWELS.has(base)) tones.push(tone);
    else if (SYLLABIC_NASALS.has(base) && (marks.includes(ACUTE) || marks.includes(GRAVE) || marks.includes(MACRON))) {
      tones.push(tone);
    }
  }
  return tones;
}

export function tonePattern(text: string): WordTones[] {
  return text
    .normalize('NFC')
    .replace(/[?!.,;:“”"]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({ word, tones: toneOfSyllables(word) }))
    .filter((w) => w.tones.length > 0);
}

const TONE_NAMES: Record<Tone, string> = { H: 'high', M: 'mid', L: 'low' };

/** Screen-reader description, e.g. "Ẹ: mid. káàárọ̀: high, low, high, low". */
export function describeTones(pattern: WordTones[]): string {
  return pattern.map((w) => `${w.word}: ${w.tones.map((t) => TONE_NAMES[t]).join(', ')}`).join('. ');
}
