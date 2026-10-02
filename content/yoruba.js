// Yoruba course content — compiled from content/yorubaSeed.json.
//
// The seed file is the source of truth: a normalized `lexicon` (each Yoruba
// word/phrase, its gloss, and its audioKey defined exactly once) plus
// exercises that reference lexicon entries by key. This module expands that
// into the flat per-exercise shape the screens/exercise components already
// consume (see courseTypes.js), so editing content only ever means editing
// the JSON — this file shouldn't need to change alongside it.

import seed from './yorubaSeed.json';

/** @typedef {import('./courseTypes').Course} Course */

const { course, lexicon, units } = seed;

function lex(key) {
  const entry = lexicon[key];
  if (!entry) {
    throw new Error(`Unknown lexicon key "${key}" in Yoruba seed content`);
  }
  return entry;
}

function buildExercise(raw, id) {
  switch (raw.type) {
    case 'listen_and_choose': {
      const target = lex(raw.item);
      return {
        id,
        type: 'listen_and_choose',
        audioKey: target.audioKey,
        yoruba: target.yoruba,
        gloss: target.english,
        choices: raw.options.map((key) => lex(key).english),
      };
    }

    case 'select_translation': {
      const target = lex(raw.item);
      const direction = raw.direction === 'yo_to_en' ? 'yo_to_en' : 'en_to_yo';
      return {
        id,
        type: 'select_translation',
        direction,
        prompt: direction === 'en_to_yo' ? target.english : target.yoruba,
        yoruba: target.yoruba,
        gloss: target.english,
        audioKey: target.audioKey,
        choices:
          direction === 'en_to_yo'
            ? raw.options.map((key) => lex(key).yoruba)
            : raw.options.map((key) => lex(key).english),
      };
    }

    case 'tap_to_build': {
      const target = lex(raw.item);
      return {
        id,
        type: 'tap_to_build',
        gloss: `How do you say '${target.english}'?`,
        yoruba: raw.answer.join(' '),
        audioKey: target.audioKey,
        tokens: raw.tokens,
        correctTokens: raw.answer,
      };
    }

    case 'match_pairs': {
      return {
        id,
        type: 'match_pairs',
        pairs: raw.pairs.map((key) => {
          const entry = lex(key);
          return { yoruba: entry.yoruba, gloss: entry.english, audioKey: entry.audioKey };
        }),
      };
    }

    default:
      throw new Error(`Unknown exercise type "${raw.type}" in Yoruba seed content`);
  }
}

function buildCourse() {
  return {
    id: course.id,
    title: course.nativeName,
    langCode: course.id,
    audioBasePath: course.audioBasePath,
    units: units.map((unit) => ({
      id: unit.id,
      title: unit.title,
      subtitle: unit.subtitle,
      lessons: unit.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        subtitle: lesson.subtitle,
        exercises: lesson.exercises.map((raw, i) => buildExercise(raw, `${lesson.id}-e${i + 1}`)),
      })),
    })),
  };
}

/** @type {Course} */
export const YORUBA_COURSE = buildCourse();

/**
 * The distinct vocabulary items (by audioKey) drilled in a lesson, in the
 * order they first appear. Used both to seed spaced-repetition review pool
 * and to build the pronunciation-practice word list — both just need
 * {yoruba, gloss, audioKey}, not the exercise shape itself.
 * @param {import('./courseTypes').Lesson} lesson
 * @returns {{ yoruba: string, gloss: string, audioKey: string }[]}
 */
export function getLessonVocab(lesson) {
  const seen = new Set();
  const items = [];

  for (const ex of lesson.exercises) {
    const candidates = ex.type === 'match_pairs' ? ex.pairs : [{ yoruba: ex.yoruba, gloss: ex.gloss, audioKey: ex.audioKey }];
    for (const candidate of candidates) {
      if (candidate.audioKey && !seen.has(candidate.audioKey)) {
        seen.add(candidate.audioKey);
        items.push(candidate);
      }
    }
  }

  return items;
}

export default YORUBA_COURSE;
