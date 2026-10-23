// Tests for the pure learning logic in lib/. Run: npm run test:logic
// Plain node:assert, no test framework. Exits non-zero on failure.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { sanitizeProperties } from '../lib/analytics.ts';
import { buildCourse, tokenize, validateCourse, type RawCourse } from '../lib/course.ts';
import { foldForSearch, proverbOfTheDay, searchNames, validateCulture } from '../lib/culture.ts';
import { addDays, dateKey, daysBetween } from '../lib/dates.ts';
import { canStartLesson, canStartReview, FREE_COURSE_LESSONS } from '../lib/entitlements.ts';
import { annualSavingsPercent, ctaLabel, defaultPackage, disclosure, freeTrial, orderPackages, priceLabel, trialBadge, type PackageLike } from '../lib/paywall.ts';
import { accuracy, advance, answer, createLessonState, currentStep, isFinished } from '../lib/lessonEngine.ts';
import { findByEnglish, findByTarget } from '../lib/phraseLookup.ts';
import { planReminders } from '../lib/reminders.ts';
import { buildReviewLesson } from '../lib/review.ts';
import { addCards, dueItemIds, gradeCard, MAX_BOX } from '../lib/srs.ts';
import { describeTones, tonePattern } from '../lib/tones.ts';
import { EMPTY_STREAK, MAX_FREEZES, meetGoal, reconcileStreak, type StreakState } from '../lib/streak.ts';

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const raw = JSON.parse(readFileSync(join(import.meta.dirname, '../content/yo/course.json'), 'utf8')) as RawCourse;
const course = buildCourse(raw);

// ---------- content ----------
test('validator catches broken content', () => {
  const bad = structuredClone(raw);
  bad.units[0].lessons[0].newItemIds.push('nope');
  bad.lexicon.e_se.text = 'Ẹ ṣé';
  const errors = validateCourse(buildCourse(bad));
  assert.ok(errors.some((e) => e.includes('unknown newItemId "nope"')));
  assert.ok(errors.some((e) => e.includes('not NFC')));
});

test('tokenize keeps tone marks and strips punctuation', () => {
  assert.deepEqual(tokenize('Ṣé àlàáfíà ni, bàbá?'), ['Ṣé', 'àlàáfíà', 'ni', 'bàbá']);
  assert.deepEqual(tokenize('Ẹ ṣé'), tokenize('Ẹ ṣé'));
});

// ---------- lesson engine ----------
const lesson = course.units[0].lessons[0];
function run(wrongIds: string[] = []) {
  let s = createLessonState(lesson);
  let misses = 0;
  while (!isFinished(s)) {
    const step = currentStep(s)!;
    if (step.kind === 'exercise') {
      const wrong = wrongIds.includes(step.exercise.id);
      if (wrong) misses++;
      s = answer(s, !wrong);
    }
    s = advance(s);
  }
  return { s, misses };
}

test('engine: all correct scores 100%', () => {
  assert.equal(accuracy(run().s, lesson), 1);
});

test('engine: a miss is retried once and lowers accuracy', () => {
  const { s, misses } = run(['l1_e1']);
  assert.equal(misses, 2);
  const scored = lesson.exercises.filter((e) => e.type !== 'listen_repeat').length;
  assert.equal(accuracy(s, lesson), (scored - 1) / scored);
});

// ---------- dates ----------
test('dates: month/year rollover and day differences', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(daysBetween('2026-10-23', '2026-10-30'), 7);
  assert.equal(daysBetween('2026-03-28', '2026-03-30'), 2); // across UK DST change
  assert.equal(dateKey(new Date(2026, 0, 5)), '2026-01-05');
});

// ---------- streak ----------
function streakAfter(days: string[], start: StreakState = EMPTY_STREAK) {
  return days.reduce((s, d) => meetGoal(s, d), start);
}

test('streak: consecutive days count up, same day twice counts once', () => {
  const s = streakAfter(['2026-10-01', '2026-10-02', '2026-10-02', '2026-10-03']);
  assert.equal(s.current, 3);
  assert.equal(s.longest, 3);
});

test('streak: a missed day with no freeze resets', () => {
  const s = streakAfter(['2026-10-01', '2026-10-02', '2026-10-04']);
  assert.equal(s.current, 1);
  assert.equal(s.longest, 2);
});

test('streak: today not yet practised is not a miss', () => {
  const s = streakAfter(['2026-10-01', '2026-10-02']);
  assert.equal(reconcileStreak(s, '2026-10-03').current, 2);
});

test('streak: 7 days earns a freeze, which covers one missed day', () => {
  const week = Array.from({ length: 7 }, (_, i) => addDays('2026-10-01', i));
  const s = streakAfter(week);
  assert.equal(s.freezes, 1);
  const after = meetGoal(s, '2026-10-09'); // missed 10-08
  assert.equal(after.current, 8);
  assert.equal(after.freezes, 0);
  assert.deepEqual(after.frozenDates, ['2026-10-08']);
});

test('streak: freezes cap at MAX_FREEZES and too many misses still reset', () => {
  const days = Array.from({ length: 35 }, (_, i) => addDays('2026-01-01', i));
  const s = streakAfter(days);
  assert.equal(s.freezes, MAX_FREEZES);
  const reconciled = reconcileStreak(s, addDays(days[34], 4)); // 3 missed > 2 freezes
  assert.equal(reconciled.current, 0);
  assert.equal(reconciled.freezes, MAX_FREEZES);
});

// ---------- spaced repetition ----------
test('srs: new cards are due tomorrow, correct answers climb boxes, misses reset', () => {
  let cards = addCards({}, ['a', 'b'], '2026-10-23');
  assert.equal(cards.a.due, '2026-10-24');
  assert.deepEqual(dueItemIds(cards, '2026-10-23'), []);
  assert.deepEqual(dueItemIds(cards, '2026-10-24').sort(), ['a', 'b']);

  let a = cards.a;
  for (let i = 0; i < 10; i++) a = gradeCard(a, true, '2026-10-24');
  assert.equal(a.box, MAX_BOX);
  assert.equal(gradeCard(a, false, '2026-10-24').box, 1);

  cards = addCards(cards, ['a'], '2026-11-01');
  assert.equal(cards.a.due, '2026-10-24', 'existing cards are not reset');
});

test('srs: most overdue first, limited to session size', () => {
  const cards = {
    late: { box: 3, due: '2026-10-01' },
    weak: { box: 1, due: '2026-10-20' },
    strong: { box: 4, due: '2026-10-20' },
    future: { box: 1, due: '2026-12-01' },
  };
  assert.deepEqual(dueItemIds(cards, '2026-10-23', 2), ['late', 'weak']);
});

// ---------- review sessions ----------
test('review: builds a valid lesson using only known phrases as options', () => {
  const learned = [...course.units[0].lessons[0].newItemIds, ...course.units[0].lessons[1].newItemIds];
  const review = buildReviewLesson(learned.slice(0, 6), learned, course.lexicon, () => 0.42);
  assert.equal(review.exercises.length, 6);
  assert.deepEqual(validateCourse({ ...course, units: [{ id: 'u', title: '', description: '', lessons: [review] }] }), []);
  for (const ex of review.exercises) {
    if (ex.type === 'listen_choose') for (const id of ex.optionIds) assert.ok(learned.includes(id));
  }
  assert.ok(review.exercises.some((e) => e.type === 'translate_phrase'));
});

// ---------- reminders ----------
test('reminders: skips today once goal met or time passed, fills the week', () => {
  const lines = ['A {language}', 'B'];
  const base = { hour: 19, minute: 0, lines, languageName: 'Yorùbá' };
  const morning = new Date(2026, 9, 23, 9, 0);
  assert.equal(planReminders({ ...base, now: morning, goalMetToday: false }).length, 7);
  assert.equal(planReminders({ ...base, now: morning, goalMetToday: true }).length, 6);
  assert.equal(planReminders({ ...base, now: new Date(2026, 9, 23, 20, 0), goalMetToday: false }).length, 6);
  const all = planReminders({ ...base, now: morning, goalMetToday: false });
  assert.ok(all.every((r) => r.date.getHours() === 19 && !r.body.includes('{language}')));
});

// ---------- tones ----------
test('tones: pattern follows tone marks; underdots ignored; tone-marked nasals count', () => {
  const p = (t: string) => tonePattern(t).map((w) => w.tones.join(''));
  assert.deepEqual(p('Ẹ káàárọ̀'), ['M', 'HLHL']);
  assert.deepEqual(p('Ṣé àlàáfíà ni?'), ['H', 'LLHHL', 'M']);
  assert.deepEqual(p('Ẹ̀gbọ́n'), ['LH']);
  assert.deepEqual(p('Ẹ ǹlẹ́ o'), ['M', 'LH', 'M']);
  assert.deepEqual(p('E\u0323\u0300gbo\u0323\u0301n'), ['LH'], 'decomposed input gives the same result');
  assert.equal(describeTones(tonePattern('Ó dàbọ̀')), 'Ó: high. dàbọ̀: low, low');
});

test('tones: every Unit 1 phrase has at least one tone-bearing syllable', () => {
  for (const [id, phrase] of Object.entries(course.lexicon)) {
    assert.ok(tonePattern(phrase.text).length > 0, id);
  }
});

// ---------- culture ----------
const culture = JSON.parse(readFileSync(join(import.meta.dirname, '../content/yo/culture.json'), 'utf8'));

test('culture: proverb of the day is stable within a day and cycles through all', () => {
  const seen = new Set<string>();
  for (let i = 0; i < culture.proverbs.length; i++) seen.add(proverbOfTheDay(culture.proverbs, addDays('2026-10-23', i))!.id);
  assert.equal(seen.size, culture.proverbs.length);
  assert.equal(proverbOfTheDay(culture.proverbs, '2026-10-23'), proverbOfTheDay(culture.proverbs, '2026-10-23'));
  assert.ok(proverbOfTheDay(culture.proverbs, '2025-06-01'), 'dates before the epoch still work');
});

test('culture: name search ignores tone marks and filters by gender', () => {
  assert.equal(foldForSearch('Adébáyọ̀'), 'adebayo');
  assert.deepEqual(searchNames(culture.names, 'adebayo').map((n) => n.id), ['adebayo']);
  assert.ok(searchNames(culture.names, 'twin').length >= 2, 'matches meaning/theme too');
  assert.ok(searchNames(culture.names, '', 'girl').every((n) => n.gender !== 'boy'));
  assert.deepEqual(validateCulture(culture), []);
});

// ---------- paywall & entitlements ----------
const pkg = (packageType: string, id: string, price: number, priceString: string, trialDays?: number): PackageLike => ({
  identifier: '$rc_' + packageType.toLowerCase(),
  packageType,
  product: {
    identifier: id,
    title: id,
    price,
    priceString,
    introPrice: trialDays ? { price: 0, priceString: '£0.00', periodUnit: 'DAY', periodNumberOfUnits: trialDays } : null,
  },
});
const lifetime = pkg('LIFETIME', 'griot_lifetime', 79.99, '£79.99');
const monthly = pkg('MONTHLY', 'griot_monthly', 4.99, '£4.99');
const annual = pkg('ANNUAL', 'griot_yearly', 39.99, '£39.99', 7);

test('paywall: annual first and preselected; prices only from store data', () => {
  assert.deepEqual(orderPackages([lifetime, monthly, annual]).map((p) => p.packageType), ['ANNUAL', 'MONTHLY', 'LIFETIME']);
  assert.equal(defaultPackage([lifetime, monthly, annual]), annual);
  assert.equal(defaultPackage([lifetime, monthly]), monthly);
  assert.equal(priceLabel(annual), '£39.99/year');
  assert.equal(priceLabel(lifetime), '£79.99');
  assert.equal(annualSavingsPercent([monthly, annual]), 33);
});

test('paywall: trial shown only when offered AND eligible', () => {
  assert.equal(freeTrial(annual, {}), null);
  assert.equal(freeTrial(annual, { griot_yearly: false }), null);
  const trial = freeTrial(annual, { griot_yearly: true });
  assert.ok(trial);
  assert.equal(trialBadge(trial!), '7-day free trial');
  assert.equal(ctaLabel(annual, trial), 'Start free trial');
  assert.match(disclosure(annual, trial), /^7-day free trial, then £39\.99\/year\..*Renews automatically.*Cancel anytime/);
  assert.equal(freeTrial(monthly, { griot_monthly: true }), null, 'no intro offer configured');
  assert.equal(ctaLabel(monthly, null), 'Subscribe');
  assert.equal(disclosure(lifetime, null), 'One-time payment of £79.99. No subscription.');
});

test('entitlements: free lessons and one free review, Premium unlocks all', () => {
  assert.ok(canStartLesson(0, false) && canStartLesson(FREE_COURSE_LESSONS - 1, false));
  assert.ok(!canStartLesson(FREE_COURSE_LESSONS, false));
  assert.ok(canStartLesson(99, true));
  assert.ok(canStartReview(0, false) && !canStartReview(1, false) && canStartReview(5, true));
});

// ---------- translator phrase lookup ----------
test('lookup: English finds the course phrase, preferring exact meanings', () => {
  assert.equal(findByEnglish('Thank you', course.lexicon)?.id, 'e_se');
  assert.equal(findByEnglish('thank you!', course.lexicon)?.id, 'e_se');
  assert.equal(findByEnglish('What’s your name?', course.lexicon)?.id, 'oruko_re');
  assert.equal(findByEnglish('good evening', course.lexicon)?.id, 'e_kaale');
  assert.equal(findByEnglish('Where is the station?', course.lexicon), undefined);
});

test('lookup: Yorùbá input matches without tone marks', () => {
  assert.equal(findByTarget('e kaaro', course.lexicon)?.english, 'Good morning');
  assert.equal(findByTarget('Ẹ káàárọ̀!', course.lexicon)?.id, 'e_kaaro');
  assert.equal(findByTarget('kini oruko re', course.lexicon), undefined, 'word boundaries matter');
  assert.equal(findByTarget('ki ni oruko re', course.lexicon)?.id, 'oruko_re');
});

// ---------- analytics privacy ----------
test('analytics: only allowed, identifier-like properties are sent', () => {
  assert.deepEqual(
    sanitizeProperties('lesson_complete', { lesson_id: 'yo_u1_l1', kind: 'lesson', accuracy: 0.8333, xp: 15, duration_s: 182.4 }),
    { lesson_id: 'yo_u1_l1', kind: 'lesson', accuracy: 0.83, xp: 15, duration_s: 182.4 },
  );
  assert.deepEqual(sanitizeProperties('purchase', { plan: '$rc_annual', source: 'first_win' }), { plan: '$rc_annual', source: 'first_win' });
});

test('analytics: free text, unknown keys and odd values never get through', () => {
  const out = sanitizeProperties('lesson_start', {
    lesson_id: 'Good morning, grandma', // a sentence
    kind: 'lesson',
    text: 'my secret', // not an allowed key
    email: 'a@b.com',
  });
  assert.deepEqual(out, { kind: 'lesson' });
  assert.deepEqual(sanitizeProperties('app_open', { anything: 'x' }), {});
  assert.deepEqual(sanitizeProperties('streak_day', { streak: NaN }), {});
  assert.deepEqual(sanitizeProperties('paywall_view', { source: 'x'.repeat(41) }), {});
});

console.log(`✓ ${passed} logic tests passed`);
