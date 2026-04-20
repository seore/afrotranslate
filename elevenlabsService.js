import { ELEVENLABS_API_KEY } from '@env';
import * as FileSystem from 'expo-file-system';

class ElevenLabsService {
  constructor() {
    this.apiKey = ELEVENLABS_API_KEY;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    
    // Voice IDs will be populated after cloning voices
    this.voiceMap = {
      'yo': {  // Yoruba
        male: null,   // Add after cloning
        female: null,
      },
      'sw': {  // Swahili
        male: null,
        female: null,
      },
      'ha': {  // Hausa
        male: null,
        female: null,
      },
      'ig': {  // Igbo
        male: null,
        female: null,
      },
      'zu': {  // Zulu
        male: null,
        female: null,
      },
      'am': {  // Amharic
        male: null,
        female: null,
      },
      'so': {  // Somali
        male: null,
        female: null,
      },
    };
  }

  /**
   * Generate speech from text using cloned native voice
   * @param {string} text - Text to convert to speech
   * @param {string} languageCode - Language code (yo, sw, ha, etc.)
   * @param {object} options - Voice settings
   * @returns {Promise<{audioUri: string, duration: number}>}
   */
  async textToSpeech(text, languageCode, options = {}) {
    const {
      gender = 'male',
      stability = 0.6,
      similarityBoost = 0.8,
      style = 0.3,
      speed = 1.0,
    } = options;

    try {
      // Get voice ID for this language
      const voiceId = this.getVoiceId(languageCode, gender);
      
      if (!voiceId) {
        console.warn(`No voice cloned for ${languageCode} ${gender}, using fallback`);
        // Fall back to Google TTS
        return null;
      }

      console.log(`🎤 Generating speech with ElevenLabs: "${text.substring(0, 50)}..."`);

      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: stability,
              similarity_boost: similarityBoost,
              style: style,
              use_speaker_boost: true,
            }
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('ElevenLabs API error:', error);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      // Get audio data as base64
      const arrayBuffer = await response.arrayBuffer();
      const base64Audio = this.arrayBufferToBase64(arrayBuffer);

      // Save to file system
      const audioUri = await this.saveAudioToFile(base64Audio, text, languageCode);

      console.log('ElevenLabs audio generated successfully');

      return {
        audioUri: audioUri,
        duration: await this.getAudioDuration(audioUri),
      };

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }

  /**
   * Get voice ID for language and gender
   */
  getVoiceId(languageCode, gender) {
    return this.voiceMap[languageCode]?.[gender];
  }

  /**
   * Set voice ID after cloning (called during setup)
   */
  setVoiceId(languageCode, gender, voiceId) {
    if (!this.voiceMap[languageCode]) {
      this.voiceMap[languageCode] = {};
    }
    this.voiceMap[languageCode][gender] = voiceId;
    console.log(`Voice ID set: ${languageCode} ${gender} → ${voiceId}`);
  }

  /**
   * Save audio data to file system
   */
  async saveAudioToFile(base64Audio, text, languageCode) {
    // Create unique filename
    const timestamp = Date.now();
    const hash = this.simpleHash(text);
    const filename = `${languageCode}_${hash}_${timestamp}.mp3`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    // Write file
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri;
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Simple hash function for caching
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 8);
  }

  /**
   * Get audio duration (approximate)
   */
  async getAudioDuration(uri) {
    // Simplified - actual duration calculation would need audio library
    // For now, estimate based on text length (avg 150 words/min)
    return 3; // seconds
  }

  /**
   * Get recommended voice settings per language type
   */
  getRecommendedSettings(languageCode) {
    // Tonal languages need higher stability
    const tonalLanguages = ['yo', 'ig', 'ha']; // Yoruba, Igbo, Hausa
    
    if (tonalLanguages.includes(languageCode)) {
      return {
        stability: 0.7,        // Higher for consistent tones
        similarityBoost: 0.85,
        style: 0.2,            // Less variation
        speed: 1.0,
      };
    }
    
    // Non-tonal languages can be more expressive
    return {
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.4,
      speed: 1.0,
    };
  }

  /**
   * List all available voices for user's account
   */
  async listVoices() {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices;

    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  /**
   * Check character usage (for billing awareness)
   */
  async getCharacterUsage() {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch usage: ${response.status}`);
      }

      const data = await response.json();
      return {
        characterCount: data.subscription.character_count,
        characterLimit: data.subscription.character_limit,
        percentUsed: (data.subscription.character_count / data.subscription.character_limit) * 100,
      };

    } catch (error) {
      console.error('Error fetching usage:', error);
      return null;
    }
  }
}

export default new ElevenLabsService();