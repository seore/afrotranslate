import type { FirstLesson, LanguageCode } from './types';
import yoFirstLesson from './yo/firstLesson.json';

const FIRST_LESSONS: Partial<Record<LanguageCode, FirstLesson>> = {
  yo: yoFirstLesson as FirstLesson,
};

export function getFirstLesson(language: LanguageCode): FirstLesson | undefined {
  return FIRST_LESSONS[language];
}
