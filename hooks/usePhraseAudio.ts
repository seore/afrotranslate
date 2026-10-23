// Plays a phrase: recorded native audio if present, otherwise the same
// TTS chain the translator uses (services/ttsService.js). `slow` plays
// at reduced speed with pitch correction, so the tones stay true.

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';

import type { LanguageCode, Phrase } from '../content/types';
import { AUDIO_ASSETS } from '../services/audioAssets';
import { createSpeaker } from '../services/ttsService';

export const SLOW_RATE = 0.6;

/** Anything with text to speak and an audio key: lesson phrases, proverbs, names. */
export type Speakable = Pick<Phrase, 'text' | 'audioKey'>;

export function usePhraseAudio(language: LanguageCode) {
  const player = useAudioPlayer();
  const rate = useRef(1);
  const speaker = useMemo(
    () => createSpeaker(player, () => ({ useNativeVoice: true, voiceGender: 'male', rate: rate.current })),
    [player],
  );

  // Learners often have the silent switch on; lesson audio should still play.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch((error) =>
      console.error('Audio mode error:', error),
    );
  }, []);

  const play = useCallback(
    (item: Speakable, options: { slow?: boolean } = {}) => {
      rate.current = options.slow ? SLOW_RATE : 1;
      const asset = AUDIO_ASSETS[item.audioKey];
      if (asset) {
        player.replace(asset);
        player.setPlaybackRate(rate.current, 'high');
        player.seekTo(0);
        player.play();
        return;
      }
      speaker.speakWithAfricanVoice(item.text, language);
    },
    [player, speaker, language],
  );

  const playSlow = useCallback((item: Speakable) => play(item, { slow: true }), [play]);

  return { play, playSlow };
}
