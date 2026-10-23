// ================================================================
// lib/lessonEngine.ts - Lesson flow as plain state transitions.
// Teach first (an intro card per new phrase), then exercises. A missed
// exercise comes back once at the end, Duolingo-style. Accuracy counts
// first attempts only. No React here, so it can be tested from Node.
// ================================================================

import type { Exercise, Lesson } from '../content/types';

export type LessonStep =
  | { kind: 'intro'; itemId: string }
  | { kind: 'exercise'; exercise: Exercise; isRetry: boolean };

export interface LessonState {
  steps: LessonStep[];
  index: number;
  /** First-attempt result per exercise id. */
  firstTry: Record<string, boolean>;
}

// Self-assessed or matched-until-done: never "wrong", so never retried or scored.
const UNSCORED: Exercise['type'][] = ['listen_repeat'];
const NO_RETRY: Exercise['type'][] = ['listen_repeat', 'match_pairs'];

export function createLessonState(lesson: Lesson): LessonState {
  return {
    steps: [
      ...lesson.newItemIds.map((itemId): LessonStep => ({ kind: 'intro', itemId })),
      ...lesson.exercises.map((exercise): LessonStep => ({ kind: 'exercise', exercise, isRetry: false })),
    ],
    index: 0,
    firstTry: {},
  };
}

export function currentStep(state: LessonState): LessonStep | undefined {
  return state.steps[state.index];
}

/** Record an answer to the current exercise. Call `advance` after showing feedback. */
export function answer(state: LessonState, correct: boolean): LessonState {
  const step = currentStep(state);
  if (!step || step.kind !== 'exercise') return state;
  const { exercise } = step;

  const firstTry =
    exercise.id in state.firstTry ? state.firstTry : { ...state.firstTry, [exercise.id]: correct };

  const shouldRetry = !correct && !step.isRetry && !NO_RETRY.includes(exercise.type);
  const steps = shouldRetry
    ? [...state.steps, { kind: 'exercise' as const, exercise, isRetry: true }]
    : state.steps;

  return { ...state, steps, firstTry };
}

export function advance(state: LessonState): LessonState {
  return { ...state, index: Math.min(state.index + 1, state.steps.length) };
}

export function isFinished(state: LessonState): boolean {
  return state.index >= state.steps.length;
}

/** 0–1 through the lesson. Retries extend the lesson, so the bar can ease back slightly. */
export function progress(state: LessonState): number {
  return state.steps.length ? state.index / state.steps.length : 0;
}

/** Share of scored exercises answered correctly first time, 0–1. */
export function accuracy(state: LessonState, lesson: Lesson): number {
  const scored = lesson.exercises.filter((ex) => !UNSCORED.includes(ex.type));
  if (!scored.length) return 1;
  const right = scored.filter((ex) => state.firstTry[ex.id] === true).length;
  return right / scored.length;
}
