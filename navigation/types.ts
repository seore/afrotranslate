import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Learn: undefined;
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
};
