import type { LearningReason, StartingLevel } from '../context/LearnerProfileContext';

// Onboarding answers and the copy tied to them. Reused later for
// reminder notifications and the personalised paywall headline.
export const REASONS: {
  id: LearningReason;
  emoji: string;
  title: string;
  subtitle: string;
  firstWinNudge: string;
}[] = [
  {
    id: 'family',
    emoji: '👵🏾',
    title: 'Talk with family',
    subtitle: 'Grandparents, parents, aunties and uncles',
    firstWinNudge: 'Try your new morning greeting on an elder in your family tomorrow.',
  },
  {
    id: 'visiting',
    emoji: '✈️',
    title: 'Visit Nigeria',
    subtitle: 'Get by and be welcomed on your next trip',
    firstWinNudge: 'Greeting people properly is the first thing you’ll use on your trip.',
  },
  {
    id: 'teaching_kids',
    emoji: '👧🏾',
    title: 'Teach my children',
    subtitle: 'Pass the language on at home',
    firstWinNudge: 'Teach your children “thank you” tonight. It’s the easiest one to start with.',
  },
  {
    id: 'culture',
    emoji: '🥁',
    title: 'Reconnect with my culture',
    subtitle: 'Understand the music, films and proverbs',
    firstWinNudge: 'Listen out for these greetings in the next Nollywood film or song you hear.',
  },
];

export const LEVELS: { id: StartingLevel; emoji: string; title: string; subtitle: string }[] = [
  { id: 'none', emoji: '🌱', title: 'Brand new', subtitle: 'I don’t know any words yet' },
  { id: 'understand_some', emoji: '👂🏾', title: 'I understand some', subtitle: 'I follow a bit, but I don’t speak it' },
  { id: 'speak_little', emoji: '💬', title: 'I speak a little', subtitle: 'I know greetings and a few phrases' },
];
