// Proverb-of-the-day selection, name search and content checks for
// content/<lang>/culture.json. Pure functions, testable from Node.

import type { CultureContent, NameMeaning, Proverb } from '../content/types';
import { daysBetween, type DateKey } from './dates.ts';

const EPOCH: DateKey = '2026-01-01';

/** Same proverb all day for everyone, moving on at local midnight. */
export function proverbOfTheDay(proverbs: Proverb[], today: DateKey): Proverb | undefined {
  if (!proverbs.length) return undefined;
  const n = daysBetween(EPOCH, today);
  return proverbs[((n % proverbs.length) + proverbs.length) % proverbs.length];
}

/** Lowercase, with tone marks and underdots removed, so "adebayo" finds "Adébáyọ̀". */
export function foldForSearch(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function searchNames(
  names: NameMeaning[],
  query: string,
  gender: 'all' | 'boy' | 'girl' = 'all',
): NameMeaning[] {
  const q = foldForSearch(query.trim());
  return names
    .filter((n) => gender === 'all' || n.gender === gender || n.gender === 'any')
    .filter((n) => !q || foldForSearch(`${n.name} ${n.meaning} ${n.theme}`).includes(q))
    .sort((a, b) => foldForSearch(a.name).localeCompare(foldForSearch(b.name)));
}

export function validateCulture(content: CultureContent): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const check = (kind: string, id: string, fields: Record<string, string | undefined>) => {
    if (ids.has(id)) errors.push(`${kind}.${id}: duplicate id`);
    ids.add(id);
    for (const [field, value] of Object.entries(fields)) {
      if (!value?.trim()) errors.push(`${kind}.${id}: missing ${field}`);
      else if (value !== value.normalize('NFC')) errors.push(`${kind}.${id}: ${field} is not NFC-normalised`);
    }
  };
  for (const p of content.proverbs) {
    check('proverb', p.id, { text: p.text, literal: p.literal, meaning: p.meaning, audioKey: p.audioKey });
  }
  for (const n of content.names) {
    check('name', n.id, { name: n.name, meaning: n.meaning, theme: n.theme, audioKey: n.audioKey });
    if (!['boy', 'girl', 'any'].includes(n.gender)) errors.push(`name.${n.id}: gender must be boy, girl or any`);
  }
  return errors;
}
