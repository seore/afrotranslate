// Plays a phrase: recorded native audio if present, otherwise the same
// TTS chain the translator uses (services/ttsService.js).

import { useCallback, useEffect, useMemo } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';

import type { LanguageCode, Phrase } from '../content/types';
import { AUDIO_ASSETS } from '../services/audioAssets';
import { createSpeaker } from '../services/ttsService';

export function usePhraseAudio(language: LanguageCode) {
  const player = useAudioPlayer();
  const speaker = useMemo(
    () => createSpeaker(player, () => ({ useNativeVoice: true, voiceGender: 'male' })),
    [player],
  );

  // Learners often have the silent switch on; lesson audio should still play.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch((error) =>
      console.error('Audio mode error:', error),
    );
  }, []);

  const play = useCallback(
    (phrase: Phrase) => {
      const asset = AUDIO_ASSETS[phrase.audioKey];
      if (asset) {
        player.replace(asset);
        player.seekTo(0);
        player.play();
        return;
      }
      speaker.speakWithAfricanVoice(phrase.text, language);
    },
    [player, speaker, language],
  );

  return { play };
}
