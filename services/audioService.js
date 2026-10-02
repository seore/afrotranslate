import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';
import { API_KEY } from '@env';

import { applyHausaPronunciation } from '../pronounciation-hausa.js';
import { applyIgboTones } from '../pronounciation-igbo.js';
import { applySwahiliPronunciation } from '../pronounciation-swahili.js';
import { applyYorubaTones } from '../pronounciation-yoruba.js';
import { applyZuluPronunciation } from '../pronounciation-zulu.js';

import VoiceTranslationService from './voiceTranslationService';

export const convertToSSML = (text, langCode) => {
  let ssml = '<speak>';

  switch (langCode) {
    case 'yo':
      ssml += applyYorubaTones(text);
      break;
    case 'ha':
      ssml += applyHausaPronunciation(text);
      break;
    case 'ig':
      ssml += applyIgboTones(text);
      break;
    case 'sw':
      ssml += applySwahiliPronunciation(text);
      break;
    case 'zu':
      ssml += applyZuluPronunciation(text);
      break;
    default:
      ssml += text;
  }
  ssml += '</speak>';
  return ssml;
};

export const getPitchForLanguage = (langCode) => {
  const pitchMap = {
    yo: 3,
    ig: 2,
    ha: -1,
    sw: -2,
    zu: -1,
    xh: -1,
    am: 0,
    so: 0,
    rw: -1,
    af: -2,
    fr: 1,
    pt: 0,
    ar: 0,
    en: 0,
  };
  return pitchMap[langCode] || 0;
};

export const getRateForLanguage = (langCode) => {
  const rateMap = {
    yo: 0.85,
    ig: 0.85,
    ha: 0.90,
    sw: 0.95,
    zu: 0.90,
    xh: 0.90,
    am: 0.90,
    so: 0.95,
    rw: 0.90,
    af: 0.95,
    fr: 1.0,
    pt: 0.95,
    ar: 0.90,
    en: 1.0,
  };
  return rateMap[langCode] || 0.95;
};

const getVoiceName = (languageCode) => {
  const voiceNames = {
    'sw-KE': 'sw-KE-Standard-A',
    'af-ZA': 'af-ZA-Standard-A',
    'fr-FR': 'fr-FR-Neural2-A',
    'ar-XA': 'ar-XA-Standard-A',
    'pt-PT': 'pt-PT-Standard-A',
  };

  return voiceNames[languageCode] || null;
};

export const playAudioFile = async (player, uri) => {
  try {
    console.log('Playing audio:', uri);

    player.replace(uri);
    player.volume = 1.0;

    setTimeout(() => {
      player.play();
    }, 100);
  } catch (error) {
    console.error('Audio playback error:', error);
  }
};

export const fallbackToExpoSpeech = async (text, langCode) => {
  try {
    console.log('Using fallback expo-speech');

    const voices = await Speech.getAvailableVoicesAsync();

    const voicePreferences = {
      sw: ['sw-KE', 'en-ZA', 'en-GB'],
      yo: ['en-ZA', 'en-GB'],
      ha: ['en-ZA', 'en-GB'],
      ig: ['en-ZA', 'en-GB'],
      zu: ['zu-ZA', 'en-ZA'],
      xh: ['xh-ZA', 'en-ZA'],
      af: ['af-ZA', 'en-ZA'],
      am: ['en-ZA', 'en-GB'],
      so: ['en-ZA', 'en-GB'],
      rw: ['en-ZA', 'en-GB'],
      en: ['en-ZA', 'en-GB', 'en-AU'],
      fr: ['fr-FR', 'fr-CA'],
      ar: ['ar-SA', 'ar-EG'],
      pt: ['pt-PT', 'pt-BR'],
    };

    const preferredLocales = voicePreferences[langCode] || [langCode];
    let selectedVoice = null;

    for (const locale of preferredLocales) {
      selectedVoice = voices.find(
        (voice) => voice.language && voice.language.toLowerCase().startsWith(locale.toLowerCase())
      );
      if (selectedVoice) {
        console.log(`Found voice: ${selectedVoice.name} (${selectedVoice.language})`);
        break;
      }
    }

    await Speech.speak(text, {
      language: selectedVoice?.language || langCode,
      voice: selectedVoice?.identifier,
      pitch: 1.0,
      rate: 0.75,
      volume: 1.0,
    });
  } catch (error) {
    console.error('Fallback speech error:', error);
  }
};

export const speakWithGoogleTTS = async (player, text, langCode) => {
  try {
    if (!API_KEY) {
      console.warn('Google TTS API key not found, using fallback');
      fallbackToExpoSpeech(text, langCode);
      return;
    }

    const googleLangCodes = {
      sw: 'sw-KE',
      af: 'af-ZA',
      fr: 'fr-FR',
      ar: 'ar-XA',
      pt: 'pt-PT',
      en: 'en-US',
      yo: 'en-US',
      ha: 'en-US',
      ig: 'en-US',
      zu: 'en-US',
      xh: 'en-US',
      am: 'en-US',
      so: 'en-US',
      rw: 'en-US',
    };

    const languageCode = googleLangCodes[langCode] || 'en-US';
    const ssml = convertToSSML(text, langCode);
    const voiceName = getVoiceName(languageCode);

    console.log(`Speaking with SSML pronunciation in ${languageCode}`);

    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          ssml: ssml,
        },
        voice: {
          languageCode: languageCode,
          ...(voiceName && { name: voiceName }),
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: getPitchForLanguage(langCode),
          speakingRate: getRateForLanguage(langCode),
          volumeGainDb: 10.0,
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Google TTS API error:', data.error);
      fallbackToExpoSpeech(text, langCode);
      return;
    }

    if (data.audioContent) {
      console.log('Got SSML audio from Google! Playing now...');

      try {
        const fileUri = `${FileSystem.cacheDirectory}tts_${Date.now()}.mp3`;
        await FileSystem.writeAsStringAsync(fileUri, data.audioContent, {
          encoding: 'base64',
        });

        console.log('Audio saved, playing...');

        await playAudioFile(player, fileUri);

        setTimeout(() => {
          FileSystem.deleteAsync(fileUri, { idempotent: true });
        }, 10000);
      } catch (error) {
        console.error('Audio error:', error);
        fallbackToExpoSpeech(text, langCode);
      }
    }
  } catch (error) {
    console.error('Google TTS error:', error);
    fallbackToExpoSpeech(text, langCode);
  }
};

/**
 * Speak `text` in `langCode` using the full fallback chain:
 * ElevenLabs native voice -> Google Cloud TTS (SSML) -> on-device expo-speech.
 */
export const speakWithNativeVoice = async (player, text, langCode, options = {}) => {
  const { useNativeVoice = true, voiceGender = 'male' } = options;

  if (!text?.trim()) return;

  try {
    if (useNativeVoice && VoiceTranslationService.hasNativeVoice(langCode, voiceGender)) {
      console.log('Using ElevenLabs native voice');

      const result = await VoiceTranslationService.translateTextWithVoice(text, langCode, langCode, {
        gender: voiceGender,
      });

      if (result.audioUri) {
        await playAudioFile(player, result.audioUri);
        return;
      }

      console.warn('ElevenLabs failed, falling back to Google TTS');
    }

    await speakWithGoogleTTS(player, text, langCode);
  } catch (error) {
    console.error('Voice generation error:', error);
    await speakWithGoogleTTS(player, text, langCode);
  }
};

/**
 * Single entrypoint for lesson exercise audio. `audioKey` is reserved for a
 * future bundled-asset lookup (assets/audio/<audioKey>.mp3); no such assets
 * exist yet, so this always falls through to the TTS chain via `text`/`langCode`.
 */
export const playAudioForKey = async (player, { audioKey, text, langCode = 'yo', gender = 'male' }) => {
  if (audioKey) {
    console.log(`No bundled asset for "${audioKey}" yet, using TTS fallback`);
  }
  return speakWithNativeVoice(player, text, langCode, { useNativeVoice: true, voiceGender: gender });
};
