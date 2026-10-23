// ================================================================
// lib/course.ts - Turning content JSON into a Course, and checking it.
// Pure functions (no React Native imports) so content can be validated
// from a plain Node script: npm run check:content
// ================================================================

import type { Course, Exercise, Lesson, Phrase } from '../content/types';

export interface RawCourse extends Omit<Course, 'lexicon'> {
  lexicon: Record<string, Omit<Phrase, 'id'>>;
}

/** Lexicon entries are keyed by id in JSON; copy the key onto each entry. */
export function buildCourse(raw: RawCourse): Course {
  const lexicon: Record<string, Phrase> = {};
  for (const [id, entry] of Object.entries(raw.lexicon)) {
    lexicon[id] = { id, ...entry };
  }
  return { ...raw, lexicon };
}

/**
 * Words of a phrase for word-tile exercises: punctuation stripped,
 * tone marks kept. Comparing NFC strings keeps "ọ̀" typed either way equal.
 */
export function tokenize(text: string): string[] {
  return text
    .normalize('NFC')
    .replace(/[?!.,;:“”"]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

export function findLesson(course: Course, lessonId: string): { lesson: Lesson; unitIndex: number; lessonIndex: number } | null {
  for (let u = 0; u < course.units.length; u++) {
    const l = course.units[u].lessons.findIndex((lesson) => lesson.id === lessonId);
    if (l !== -1) return { lesson: course.units[u].lessons[l], unitIndex: u, lessonIndex: l };
  }
  return null;
}

/** Lessons in course order, for "next lesson" and unlocking. */
export function allLessons(course: Course): Lesson[] {
  return course.units.flatMap((unit) => unit.lessons);
}

/** Every content mistake found, as readable messages. Empty means valid. */
export function validateCourse(course: Course): string[] {
  const errors: string[] = [];
  const has = (id: string) => id in course.lexicon;
  const seenIds = new Set<string>();

  for (const [id, phrase] of Object.entries(course.lexicon)) {
    if (phrase.text !== phrase.text.normalize('NFC')) errors.push(`lexicon.${id}: text is not NFC-normalised`);
    if (!phrase.text.trim() || !phrase.english.trim()) errors.push(`lexicon.${id}: missing text or english`);
    if (!phrase.audioKey) errors.push(`lexicon.${id}: missing audioKey`);
  }

  for (const unit of course.units) {
    for (const lesson of unit.lessons) {
      const where = `${lesson.id}`;
      if (seenIds.has(lesson.id)) errors.push(`${where}: duplicate lesson id`);
      seenIds.add(lesson.id);
      for (const id of lesson.newItemIds) if (!has(id)) errors.push(`${where}: unknown newItemId "${id}"`);
      if (lesson.exercises.length === 0) errors.push(`${where}: no exercises`);

      for (const ex of lesson.exercises) {
        const at = `${where}/${ex.id}`;
        if (seenIds.has(ex.id)) errors.push(`${at}: duplicate exercise id`);
        seenIds.add(ex.id);
        errors.push(...validateExercise(ex, at, has, course.lexicon));
      }
    }
  }
  return errors;
}

function validateExercise(
  ex: Exercise,
  at: string,
  has: (id: string) => boolean,
  lexicon: Record<string, Phrase>,
): string[] {
  const errors: string[] = [];
  const ids = ex.type === 'match_pairs' ? ex.itemIds : [ex.itemId];
  for (const id of ids) if (!has(id)) errors.push(`${at}: unknown item "${id}"`);
  if (errors.length) return errors;

  switch (ex.type) {
    case 'listen_choose': {
      if (!ex.optionIds.includes(ex.itemId)) errors.push(`${at}: optionIds must include itemId`);
      for (const id of ex.optionIds) if (!has(id)) errors.push(`${at}: unknown option "${id}"`);
      const meanings = ex.optionIds.filter(has).map((id) => lexicon[id].english);
      if (new Set(meanings).size !== meanings.length) errors.push(`${at}: two options share an English meaning`);
      break;
    }
    case 'match_pairs': {
      if (ex.itemIds.length < 2 || ex.itemIds.length > 5) errors.push(`${at}: use 2–5 pairs`);
      const meanings = ex.itemIds.map((id) => lexicon[id].english);
      if (new Set(meanings).size !== meanings.length) errors.push(`${at}: two pairs share an English meaning`);
      break;
    }
    case 'translate_phrase': {
      const answer = tokenize(lexicon[ex.itemId].text);
      for (const d of ex.distractors) {
        if (answer.includes(d.normalize('NFC'))) errors.push(`${at}: distractor "${d}" is part of the answer`);
      }
      break;
    }
    case 'fill_gap': {
      const words = tokenize(lexicon[ex.itemId].text);
      if (!words.includes(ex.gap.normalize('NFC'))) errors.push(`${at}: gap "${ex.gap}" is not a word in the phrase`);
      if (!ex.options.includes(ex.gap)) errors.push(`${at}: options must include the gap word`);
      break;
    }
    case 'listen_repeat':
      break;
  }
  return errors;
}
