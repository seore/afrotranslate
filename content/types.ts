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

// ---------- First lesson (onboarding) ----------

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

// ---------- Course: units -> lessons -> exercises ----------
// Exercises reference phrases in the course lexicon by id, so each
// phrase's text, meaning and audio are written exactly once.

/** Hear the phrase, pick its English meaning. */
export interface ListenChooseExercise {
  type: 'listen_choose';
  id: string;
  itemId: string;
  /** Lexicon ids whose English meanings are offered; must include itemId. */
  optionIds: string[];
}

/** Hear the phrase, record yourself, compare. Self-assessed until Phase 4. */
export interface ListenRepeatExercise {
  type: 'listen_repeat';
  id: string;
  itemId: string;
}

/** Match each phrase to its English meaning. */
export interface MatchPairsExercise {
  type: 'match_pairs';
  id: string;
  itemIds: string[];
}

/** Build the target-language phrase for an English prompt from word tiles. */
export interface TranslatePhraseExercise {
  type: 'translate_phrase';
  id: string;
  itemId: string;
  /** Extra wrong tiles mixed in with the answer's words. */
  distractors: string[];
}

/** Complete the phrase by choosing the missing word. */
export interface FillGapExercise {
  type: 'fill_gap';
  id: string;
  itemId: string;
  /** Situation shown above the phrase, e.g. "Thank your grandmother". */
  prompt: string;
  /** The word removed from the phrase; must appear in it. */
  gap: string;
  /** Choices offered; must include `gap`. */
  options: string[];
}

export type Exercise =
  | ListenChooseExercise
  | ListenRepeatExercise
  | MatchPairsExercise
  | TranslatePhraseExercise
  | FillGapExercise;

export type ExerciseType = Exercise['type'];

export interface Lesson {
  id: string;
  title: string;
  description: string;
  /** Introduced with a listen card before the exercises start. */
  newItemIds: string[];
  exercises: Exercise[];
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  language: LanguageCode;
  lexicon: Record<string, Phrase>;
  units: Unit[];
}
