import ElevenLabsService from './ElevenLabsService';
import { API_KEY } from '@env'; 

class VoiceTranslationService {
  
  /**
   * Text-only translation with native voice output
   * (User already transcribed via expo-speech-recognition)
   */
  async translateTextWithVoice(text, sourceLang, targetLang, options = {}) {
    try {
      console.log(`Translating: "${text}" from ${sourceLang} to ${targetLang}`);

      let translatedText = text;

      // Skip translation if same language
      if (sourceLang !== targetLang) {
        translatedText = await this.translateText(text, sourceLang, targetLang);
        console.log(`Translated: "${translatedText}"`);
      } else {
        console.log(`Skipping translation (same language: ${sourceLang})`);
      }

      // Step 2: Generate native voice with ElevenLabs
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