// ================================================================
// RootNavigator.tsx - Onboarding until it's finished, then the tabs.
// The translator is unchanged; it now lives in the Tools tab.
// ================================================================

import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TranslatorScreen from '../TranslatorScreen';
import { useLearnerProfile } from '../context/LearnerProfileContext';
import { useReminderSync } from '../hooks/useReminderSync';
import LearnHomeScreen from '../screens/learn/LearnHomeScreen';
import CultureHomeScreen from '../screens/culture/CultureHomeScreen';
import NameDetailScreen from '../screens/culture/NameDetailScreen';
import NamesScreen from '../screens/culture/NamesScreen';
import FirstLessonScreen from '../screens/lesson/FirstLessonScreen';
import ReviewHomeScreen from '../screens/review/ReviewHomeScreen';
import HabitSettingsScreen from '../screens/settings/HabitSettingsScreen';
import LessonCompleteScreen from '../screens/lesson/LessonCompleteScreen';
import LessonScreen from '../screens/lesson/LessonScreen';
import PaywallScreen from '../screens/paywall/PaywallScreen';
import FirstWinScreen from '../screens/onboarding/FirstWinScreen';
import LanguageScreen from '../screens/onboarding/LanguageScreen';
import LevelScreen from '../screens/onboarding/LevelScreen';
import ReasonScreen from '../screens/onboarding/ReasonScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import { colors } from '../theme/colors';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.cardBorder,
        },
      }}
    >
      <Tab.Screen
        name="Learn"
        component={LearnHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="school-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Review"
        component={ReviewHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="refresh-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Culture"
        component={CultureHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Tools"
        component={TranslatorScreen}
        options={{
          tabBarLabel: 'Translator',
          tabBarIcon: ({ color, size }) => <Ionicons name="language-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { profile, loaded } = useLearnerProfile();
  useReminderSync();

  // Dark placeholder while the profile loads, so there's no white flash.
  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
      {profile.onboardingCompletedAt ? (
        <>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="FirstLesson" component={FirstLessonScreen} />
          <Stack.Screen name="Lesson" component={LessonScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="LessonComplete" component={LessonCompleteScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="HabitSettings" component={HabitSettingsScreen} />
          <Stack.Screen name="Names" component={NamesScreen} />
          <Stack.Screen name="NameDetail" component={NameDetailScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Reason" component={ReasonScreen} />
          <Stack.Screen name="Level" component={LevelScreen} />
          <Stack.Screen name="Language" component={LanguageScreen} />
          <Stack.Screen name="FirstLesson" component={FirstLessonScreen} />
          <Stack.Screen name="FirstWin" component={FirstWinScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen
            name="Paywall"
            component={PaywallScreen}
            options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
