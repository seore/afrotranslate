import { buildCourse, validateCourse, type RawCourse } from '../lib/course';
import type { Course, CultureContent, FirstLesson, LanguageCode } from './types';
import yoCourse from './yo/course.json';
import yoCulture from './yo/culture.json';
import yoFirstLesson from './yo/firstLesson.json';

const FIRST_LESSONS: Partial<Record<LanguageCode, FirstLesson>> = {
  yo: yoFirstLesson as FirstLesson,
};

const RAW_COURSES: Partial<Record<LanguageCode, RawCourse>> = {
  yo: yoCourse as unknown as RawCourse,
};

const CULTURE: Partial<Record<LanguageCode, CultureContent>> = {
  yo: yoCulture as CultureContent,
};

const courseCache: Partial<Record<LanguageCode, Course>> = {};

export function getFirstLesson(language: LanguageCode): FirstLesson | undefined {
  return FIRST_LESSONS[language];
}

export function getCulture(language: LanguageCode): CultureContent | undefined {
  return CULTURE[language];
}

export function getCourse(language: LanguageCode): Course | undefined {
  if (courseCache[language]) return courseCache[language];
  const raw = RAW_COURSES[language];
  if (!raw) return undefined;

  const course = buildCourse(raw);
  if (__DEV__) {
    const errors = validateCourse(course);
    if (errors.length) console.warn(`Content problems in ${language}/course.json:\n${errors.join('\n')}`);
  }
  courseCache[language] = course;
  return course;
}
