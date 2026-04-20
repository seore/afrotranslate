import DeepgramService from './DeepgramService';
import ElevenLabsService from './ElevenLabsService';
import { API_KEY } from '@env'; // Google Translate API key

class VoiceTranslationService {
  
  /**
   * Complete voice-to-voice translation pipeline
   * @param {string} audioUri - Recorded audio file URI
   * @param {string} sourceLang - Source language code (en, es, etc.)
   * @param {string} targetLang - Target language code (yo, sw, ha, etc.)
   * @param {object} options - Additional options
   * @returns {Promise<{sourceText, translatedText, audioUri}>}
   */
  async translateVoiceToVoice(audioUri, sourceLang, targetLang, options = {}) {
    try {
      console.log(`Starting voice translation: ${sourceLang} → ${targetLang}`);

      // STEP 1: Speech-to-Text (Deepgram)
      console.log('Step 1: Converting speech to text...');
      const transcription = await DeepgramService.transcribeAudio(audioUri, sourceLang);
      
      if (!transcription.text || transcription.text.trim() === '') {
        throw new Error('No speech detected');
      }

      const sourceText = transcription.text;
      console.log(`Recognized: "${sourceText}"`);
      console.log(`   Confidence: ${(transcription.confidence * 100).toFixed(1)}%`);

      // STEP 2: Text Translation (Google Translate)
      console.log('Step 2: Translating text...');
      const translatedText = await this.translateText(sourceText, sourceLang, targetLang);
      console.log(`Translated: "${translatedText}"`);

      // STEP 3: Text-to-Speech (ElevenLabs with native voice!)
      console.log('Step 3: Generating native voice...');
      const voiceSettings = {
        gender: options.gender || 'male',
        ...ElevenLabsService.getRecommendedSettings(targetLang),
      };

      const audioResult = await ElevenLabsService.textToSpeech(
        translatedText,
        targetLang,
        voiceSettings
      );

      if (!audioResult) {
        console.warn('ElevenLabs failed, falling back to Google TTS');
        // Fall back to Google TTS (existing implementation)
        return {
          sourceText,
          translatedText,
          audioUri: null,
          usedFallback: true,
        };
      }

      console.log('Voice translation complete!');

      return {
        sourceText: sourceText,
        translatedText: translatedText,
        audioUri: audioResult.audioUri,
        confidence: transcription.confidence,
        usedFallback: false,
      };

    } catch (error) {
      console.error('Voice translation error:', error);
      throw error;
    }
  }

  /**
   * Translate text using Google Translate API
   */
  async translateText(text, sourceLang, targetLang) {
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: 'text',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.translations[0].translatedText;

    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  /**
   * Text-only translation with native voice output
   * (User types instead of speaking)
   */
  async translateTextWithVoice(text, sourceLang, targetLang, options = {}) {
    try {
      console.log(`Translating text: "${text}"`);

      // Step 1: Translate
      const translatedText = await this.translateText(text, sourceLang, targetLang);
      console.log(`Translated: "${translatedText}"`);

      // Step 2: Generate voice
      const voiceSettings = {
        gender: options.gender || 'male',
        ...ElevenLabsService.getRecommendedSettings(targetLang),
      };

      const audioResult = await ElevenLabsService.textToSpeech(
        translatedText,
        targetLang,
        voiceSettings
      );

      return {
        translatedText: translatedText,
        audioUri: audioResult?.audioUri,
        usedFallback: !audioResult,
      };

    } catch (error) {
      console.error('Text translation error:', error);
      throw error;
    }
  }

  /**
   * Get ElevenLabs usage stats
   */
  async getUsageStats() {
    return await ElevenLabsService.getCharacterUsage();
  }

  /**
   * Check if native voice is available for language
   */
  hasNativeVoice(languageCode, gender = 'male') {
    const voiceId = ElevenLabsService.getVoiceId(languageCode, gender);
    return voiceId !== null;
  }

  /**
   * Get list of languages with native voices
   */
  getLanguagesWithNativeVoices() {
    const languages = [];
    const voiceMap = ElevenLabsService.voiceMap;

    for (const [code, genders] of Object.entries(voiceMap)) {
      if (genders.male || genders.female) {
        languages.push({
          code: code,
          hasMale: !!genders.male,
          hasFemale: !!genders.female,
        });
      }
    }

    return languages;
  }
}

export default new VoiceTranslationService();