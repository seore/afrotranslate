import type { Exercise, LanguageCode, Phrase } from '../../content/types';

/** What every exercise component receives from the lesson screen. */
export interface ExerciseProps<T extends Exercise> {
  exercise: T;
  lexicon: Record<string, Phrase>;
  language: LanguageCode;
  play: (phrase: Phrase) => void;
  playSlow: (phrase: Phrase) => void;
  /** Called once when the learner commits an answer. */
  onAnswer: (correct: boolean) => void;
}

/** Fisher–Yates shuffle into a new array. */
export function shuffled<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
