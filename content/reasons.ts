import type { LearningReason, StartingLevel } from '../context/LearnerProfileContext';

// Onboarding answers and the copy tied to them. Reused later for
// reminder notifications and the personalised paywall headline.
export const REASONS: {
  id: LearningReason;
  emoji: string;
  title: string;
  subtitle: string;
  firstWinNudge: string;
  /** Reminder notification lines; {language} is replaced with the language name. */
  reminderLines: string[];
}[] = [
  {
    id: 'family',
    emoji: '👵🏾',
    title: 'Talk with family',
    subtitle: 'Grandparents, parents, aunties and uncles',
    firstWinNudge: 'Try your new morning greeting on an elder in your family tomorrow.',
    reminderLines: [
      'A few minutes of {language} today brings you closer to your family.',
      'Your family will notice the effort. Time for today’s {language}.',
      'Practise a greeting now, use it on family later.',
    ],
  },
  {
    id: 'visiting',
    emoji: '✈️',
    title: 'Visit Nigeria',
    subtitle: 'Get by and be welcomed on your next trip',
    firstWinNudge: 'Greeting people properly is the first thing you’ll use on your trip.',
    reminderLines: [
      'Your trip gets easier with every phrase. Quick {language} session?',
      'Five minutes of {language} now, more confidence when you land.',
      'Keep your {language} ready for the trip.',
    ],
  },
  {
    id: 'teaching_kids',
    emoji: '👧🏾',
    title: 'Teach my children',
    subtitle: 'Pass the language on at home',
    firstWinNudge: 'Teach your children “thank you” tonight. It’s the easiest one to start with.',
    reminderLines: [
      'Learn it tonight, teach it tomorrow. Time for {language}.',
      'Your children learn by hearing you. Practise your {language} now.',
      'A short {language} session keeps you a step ahead of the kids.',
    ],
  },
  {
    id: 'culture',
    emoji: '🥁',
    title: 'Reconnect with my culture',
    subtitle: 'Understand the music, films and proverbs',
    firstWinNudge: 'Listen out for these greetings in the next Nollywood film or song you hear.',
    reminderLines: [
      'Keep the connection going with a few minutes of {language}.',
      'Every phrase is a link to where you come from. {language} time.',
      'Your {language} streak is waiting.',
    ],
  },
];

export const LEVELS: { id: StartingLevel; emoji: string; title: string; subtitle: string }[] = [
  { id: 'none', emoji: '🌱', title: 'Brand new', subtitle: 'I don’t know any words yet' },
  { id: 'understand_some', emoji: '👂🏾', title: 'I understand some', subtitle: 'I follow a bit, but I don’t speak it' },
  { id: 'speak_little', emoji: '💬', title: 'I speak a little', subtitle: 'I know greetings and a few phrases' },
];
