// Recorded native-speaker audio, keyed by a phrase's `audioKey`.
// Anything missing here falls back to TTS. To add a recording:
//   1. put the file in assets/audio/<lang>/, e.g. assets/audio/yo/yo_e_kaaro.m4a
//   2. add: yo_e_kaaro: require('../assets/audio/yo/yo_e_kaaro.m4a'),
export const AUDIO_ASSETS: Record<string, number> = {};
