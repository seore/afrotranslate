// Lightweight JSDoc typedefs for course content — no TypeScript toolchain added,
// just editor-level type hints over plain JS data.

/**
 * @typedef {'listen_and_choose' | 'match_pairs' | 'tap_to_build' | 'select_translation'} ExerciseType
 */

/**
 * @typedef {Object} ListenAndChooseExercise
 * @property {string} id
 * @property {'listen_and_choose'} type
 * @property {string} audioKey - key resolved by audioService; falls back to TTS of `yoruba` if no asset exists
 * @property {string} yoruba - the word/phrase that is played
 * @property {string} gloss - correct English meaning
 * @property {string[]} choices - English options shown to the learner, includes `gloss`
 */

/**
 * @typedef {Object} SelectTranslationExercise
 * @property {string} id
 * @property {'select_translation'} type
 * @property {'en_to_yo' | 'yo_to_en'} direction - which language the prompt is in and which the choices are in
 * @property {string} prompt - shown to the learner, in English (en_to_yo) or Yoruba (yo_to_en)
 * @property {string} yoruba - the correct Yoruba form (target of en_to_yo, source of yo_to_en)
 * @property {string} gloss - the correct English form
 * @property {string} audioKey - audio for the Yoruba form
 * @property {string[]} choices - options shown, in Yoruba (en_to_yo) or English (yo_to_en) — the opposite of `prompt`
 */

/**
 * @typedef {Object} TapToBuildExercise
 * @property {string} id
 * @property {'tap_to_build'} type
 * @property {string} gloss - English prompt, e.g. "How do you say 'Good morning'?"
 * @property {string} yoruba - target phrase, exact join of `correctTokens` with spaces
 * @property {string} audioKey - audio for the completed phrase
 * @property {string[]} tokens - word tiles shown to the learner (correct tokens + distractors), pre-shuffled
 * @property {string[]} correctTokens - tokens in correct order
 */

/**
 * @typedef {Object} MatchPairsExercise
 * @property {string} id
 * @property {'match_pairs'} type
 * @property {{ yoruba: string, gloss: string, audioKey: string }[]} pairs
 */

/**
 * @typedef {ListenAndChooseExercise | SelectTranslationExercise | TapToBuildExercise | MatchPairsExercise} Exercise
 */

/**
 * @typedef {Object} Lesson
 * @property {string} id
 * @property {string} title - native-language title
 * @property {string} [subtitle] - English gloss of the title
 * @property {Exercise[]} exercises
 */

/**
 * @typedef {Object} Unit
 * @property {string} id
 * @property {string} title - native-language title
 * @property {string} [subtitle] - English gloss of the title
 * @property {Lesson[]} lessons
 */

/**
 * @typedef {Object} Course
 * @property {string} id
 * @property {string} title
 * @property {string} langCode
 * @property {string} [audioBasePath] - where bundled recordings for this course's audioKeys will live
 * @property {Unit[]} units
 */

export {};
