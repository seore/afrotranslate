// Validates every course JSON file. Run: npm run check:content
// Exits non-zero on any problem, so it can run before a release build.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import type { CultureContent } from '../content/types.ts';
import { buildCourse, validateCourse, type RawCourse } from '../lib/course.ts';
import { validateCulture } from '../lib/culture.ts';

const contentDir = join(import.meta.dirname, '..', 'content');
let failed = false;

for (const lang of readdirSync(contentDir, { withFileTypes: true })) {
  const file = join(contentDir, lang.name, 'course.json');
  if (!lang.isDirectory() || !existsSync(file)) continue;

  const course = buildCourse(JSON.parse(readFileSync(file, 'utf8')) as RawCourse);
  const errors = validateCourse(course);
  const lessons = course.units.reduce((n, u) => n + u.lessons.length, 0);
  const exercises = course.units.reduce((n, u) => n + u.lessons.reduce((m, l) => m + l.exercises.length, 0), 0);

  if (errors.length) {
    failed = true;
    console.error(`✗ ${lang.name}: ${errors.length} problem(s)`);
    for (const e of errors) console.error(`  - ${e}`);
  } else {
    console.log(`✓ ${lang.name}: ${Object.keys(course.lexicon).length} phrases, ${lessons} lessons, ${exercises} exercises`);
  }
}

for (const lang of readdirSync(contentDir, { withFileTypes: true })) {
  const file = join(contentDir, lang.name, 'culture.json');
  if (!lang.isDirectory() || !existsSync(file)) continue;

  const culture = JSON.parse(readFileSync(file, 'utf8')) as CultureContent;
  const errors = validateCulture(culture);
  if (errors.length) {
    failed = true;
    console.error(`✗ ${lang.name} culture: ${errors.length} problem(s)`);
    for (const e of errors) console.error(`  - ${e}`);
  } else {
    console.log(`✓ ${lang.name} culture: ${culture.proverbs.length} proverbs, ${culture.names.length} names`);
  }
}

process.exit(failed ? 1 : 0);
