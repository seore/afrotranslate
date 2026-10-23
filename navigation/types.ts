import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Learn: undefined;
  Review: undefined;
  Culture: undefined;
  Tools: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Reason: undefined;
  Level: undefined;
  Language: undefined;
  FirstLesson: { mode: 'onboarding' | 'practice' };
  FirstWin: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  /** A course lesson id, or lib/review's REVIEW_LESSON_ID for a review session. */
  Lesson: { lessonId: string };
  LessonComplete: {
    lessonId: string;
    accuracy: number;
    xp: number;
    goalJustMet: boolean;
    streak: number;
    firstCourseLessonJustDone: boolean;
  };
  HabitSettings: undefined;
  Names: undefined;
  NameDetail: { nameId: string };
};
