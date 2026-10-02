// Stub for pronunciation scoring. NOT wired into any exercise or screen yet —
// per the migration plan, this exists so the eventual "speak the phrase back"
// exercise has a contract to build against, without committing to a scoring
// algorithm yet.
//
// `recordAttempt` is a real, working port of the speech-recognition listening
// logic the old translator used (App.js's ExpoSpeechRecognitionModule +
// EventEmitter pattern), reshaped into a single promise instead of React
// state. `scorePronunciation` is the actual stub: recording works today,
// scoring the recording against a target phrase does not exist yet.

import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { EventEmitter } from 'expo-modules-core';

/**
 * Records a single spoken attempt and resolves with the transcript once
 * recognition ends. There is no Yoruba speech-recognition locale available
 * yet, so recognition currently runs in en-US regardless of `langCode` —
 * good enough to capture *that* something was said, not yet to judge it.
 *
 * @param {Object} params
 * @param {string} [params.langCode]
 * @returns {Promise<string>} transcript
 */
export function recordAttempt({ langCode = 'yo' } = {}) {
  return new Promise((resolve, reject) => {
    const eventEmitter = new EventEmitter(ExpoSpeechRecognitionModule);
    let transcript = '';

    const cleanup = () => {
      resultListener.remove();
      errorListener.remove();
      endListener.remove();
    };

    const resultListener = eventEmitter.addListener('result', (event) => {
      const result = event.results?.[0];
      const text = result?.transcript || result;
      if (text) transcript = text;
    });

    const errorListener = eventEmitter.addListener('error', (event) => {
      cleanup();
      reject(new Error(event.error || 'Speech recognition failed'));
    });

    const endListener = eventEmitter.addListener('end', () => {
      cleanup();
      resolve(transcript);
    });

    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: false,
      maxAlternatives: 1,
      continuous: false,
      requiresOnDeviceRecognition: false,
    }).catch((error) => {
      cleanup();
      reject(error);
    });
  });
}

/**
 * Records a spoken attempt and scores it against `targetText`.
 *
 * Not implemented. Throws rather than returning a fake score, so an
 * accidental wire-up fails loudly instead of silently grading learners
 * against nothing. Replace this once there's a real comparison strategy
 * (e.g. fuzzy transcript match as an English-recognition-only proxy, or a
 * phoneme/tone-aware model once Yoruba ASR exists).
 *
 * @param {Object} params
 * @param {string} params.targetText - the Yoruba phrase the learner should say
 * @param {string} [params.langCode]
 * @returns {Promise<{ transcript: string, score: number, passed: boolean }>}
 */
export async function scorePronunciation({ targetText, langCode = 'yo' } = {}) {
  throw new Error('scorePronunciation is not implemented yet — stub only, not wired into any exercise.');
}
