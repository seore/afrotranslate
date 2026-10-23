// ================================================================
// content/types.ts - Shapes for language content files.
// All learner-facing language data lives in content/<lang>/*.json and
// is described by these types, so adding a language is adding content.
// ================================================================

export type LanguageCode = 'yo' | 'ig' | 'ha';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  native: string;
  flag: string;
  available: boolean;
}

export interface Phrase {
  id: string;
  /** Target-language text with full tone marks, NFC-normalised. */
  text: string;
  english: string;
  /** Key into services/audioAssets.ts; falls back to TTS when no recording exists. */
  audioKey: string;
  /** Short cultural or usage note shown under the phrase. */
  note?: string;
}

export interface RecognitionCheck {
  prompt: string;
  answerId: string;
  optionIds: string[];
  correctFeedback: string;
  wrongFeedback: string;
}

export interface FirstLesson {
  language: LanguageCode;
  title: string;
  phrases: Phrase[];
  check: RecognitionCheck;
}
