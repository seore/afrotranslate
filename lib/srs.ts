// ================================================================
// lib/srs.ts - Leitner spaced repetition for learned phrases.
// Each phrase sits in a box 1-6. A correct review moves it up a box and
// pushes its next review further out; a miss sends it back to box 1.
// ================================================================

import { addDays, type DateKey } from './dates.ts';

/** Days until the next review, indexed by box. */
export const BOX_INTERVAL_DAYS = [0, 1, 2, 4, 7, 14, 30];
export const MAX_BOX = BOX_INTERVAL_DAYS.length - 1;
export const REVIEW_SESSION_SIZE = 10;

export interface SrsCard {
  box: number;
  due: DateKey;
  lastReviewed?: DateKey;
}

export type SrsCards = Record<string, SrsCard>;

/** New phrases start in box 1, first due tomorrow. Existing cards are left alone. */
export function addCards(cards: SrsCards, itemIds: string[], today: DateKey): SrsCards {
  const next = { ...cards };
  for (const id of itemIds) {
    if (!next[id]) next[id] = { box: 1, due: addDays(today, BOX_INTERVAL_DAYS[1]) };
  }
  return next;
}

export function gradeCard(card: SrsCard, correct: boolean, today: DateKey): SrsCard {
  const box = correct ? Math.min(card.box + 1, MAX_BOX) : 1;
  return { box, due: addDays(today, BOX_INTERVAL_DAYS[box]), lastReviewed: today };
}

/** Ids due today or earlier, most overdue and weakest first. */
export function dueItemIds(cards: SrsCards, today: DateKey, limit = REVIEW_SESSION_SIZE): string[] {
  return Object.entries(cards)
    .filter(([, card]) => card.due <= today)
    .sort(([, a], [, b]) => (a.due === b.due ? a.box - b.box : a.due < b.due ? -1 : 1))
    .slice(0, limit)
    .map(([id]) => id);
}
