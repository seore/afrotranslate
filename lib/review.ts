// Builds a review session as an ordinary Lesson, so the lesson screen
// and engine run it unchanged. Wrong options come from other phrases the
// learner already knows, never from unseen content.

import type { Exercise, Lesson, Phrase } from '../content/types';
import { tokenize } from './course.ts';

export const REVIEW_LESSON_ID = 'review';

type Rng = () => number;

function pick<T>(items: T[], count: number, rng: Rng): T[] {
  const pool = [...items];
  const out: T[] = [];
  while (pool.length && out.length < count) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return out;
}

export function buildReviewLesson(
  dueIds: string[],
  learnedIds: string[],
  lexicon: Record<string, Phrase>,
  rng: Rng = Math.random,
): Lesson {
  const known = learnedIds.filter((id) => lexicon[id]);

  const exercises: Exercise[] = dueIds.map((itemId, i): Exercise => {
    const phrase = lexicon[itemId];
    const words = tokenize(phrase.text);
    const otherWords = [...new Set(known.filter((id) => id !== itemId).flatMap((id) => tokenize(lexicon[id].text)))]
      .filter((w) => !words.includes(w));

    // Multi-word phrases alternate with tile-building for active recall.
    if (words.length >= 2 && otherWords.length >= 2 && i % 2 === 1) {
      return { type: 'translate_phrase', id: `rv_${i}_${itemId}`, itemId, distractors: pick(otherWords, 2, rng) };
    }

    const others = known.filter((id) => id !== itemId && lexicon[id].english !== phrase.english);
    return {
      type: 'listen_choose',
      id: `rv_${i}_${itemId}`,
      itemId,
      optionIds: [itemId, ...pick(others, 2, rng)],
    };
  });

  return {
    id: REVIEW_LESSON_ID,
    title: 'Review',
    description: 'Practise phrases you’ve learned.',
    newItemIds: [],
    exercises,
  };
}
