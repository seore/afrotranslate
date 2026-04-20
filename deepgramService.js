import { createClient } from '@deepgram/sdk';
import { DEEPGRAM_API_KEY } from '@env';

class DeepgramService {
  constructor() {
    this.client = createClient(DEEPGRAM_API_KEY);
    this.liveConnection = null;
  }

  /**
   * Transcribe pre-recorded audio file
   * @param {string} audioUri - Local file URI or audio blob
   * @param {string} language - Language code (en, es, fr, etc.)
   * @returns {Promise<{text: string, confidence: number}>}
   */
  async transcribeAudio(audioUri, language = 'en') {
    try {
      console.log('Starting Deepgram transcription...');

      // Read audio file
      const audioData = await this.readAudioFile(audioUri);

      // Send to Deepgram
      const response = await this.client.listen.prerecorded.transcribeFile(
        audioData,
        {
          model: 'nova-2',           // Latest, most accurate model
          language: language,
          smart_format: true,        // Auto-punctuation
          punctuate: true,
          diarize: false,            // Don't separate speakers
          detect_language: false,    // We know the language
          filler_words: false,       // Remove "um", "uh", etc.
        }
      );

      const transcript = response.result.results.channels[0].alternatives[0].transcript;
      const confidence = response.result.results.channels[0].alternatives[0].confidence;

      console.log('Deepgram transcription:', transcript);
      console.log(`   Confidence: ${(confidence * 100).toFixed(1)}%`);

      return {
        text: transcript,
        confidence: confidence,
      };

    } catch (error) {
      console.error('Deepgram transcription error:', error);
      throw error;
    }
  }

  /**
   * Start live transcription (real-time streaming)
   * @param {string} language - Language code
   * @param {function} onTranscript - Callback for transcripts
   * @returns {Promise<Connection>}
   */
  async startLiveTranscription(language = 'en', onTranscript) {
    try {
      console.log('🎤 Starting Deepgram live transcription...');

      const connection = this.client.listen.live({
        model: 'nova-2',
        language: language,
        smart_format: true,
        interim_results: true,      // Get results as user speaks
        endpointing: 300,           // Detect silence (300ms)
        utterance_end_ms: 1000,     // End of sentence
        vad_events: true,           // Voice activity detection
      });

      // Handle connection opened
      connection.on('open', () => {
        console.log('Deepgram connection opened');
      });

      // Handle transcription results
      connection.on('Results', (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        const isFinal = data.is_final;
        const confidence = data.channel.alternatives[0].confidence;

        if (transcript) {
          onTranscript({
            text: transcript,
            isFinal: isFinal,
            confidence: confidence,
          });
        }
      });

      // Handle errors
      connection.on('error', (error) => {
        console.error('Deepgram error:', error);
      });

      // Handle connection close
      connection.on('close', () => {
        console.log('Deepgram connection closed');
        this.liveConnection = null;
      });

      this.liveConnection = connection;
      return connection;

    } catch (error) {
      console.error('Error starting live transcription:', error);
      throw error;
    }
  }

  /**
   * Stop live transcription
   */
  stopLiveTranscription() {
    if (this.liveConnection) {
      this.liveConnection.finish();
      this.liveConnection = null;
      console.log('Live transcription stopped');
    }
  }

  /**
   * Send audio data to live connection
   * @param {Buffer} audioData - Raw audio data
   */
  sendAudioData(audioData) {
    if (this.liveConnection) {
      this.liveConnection.send(audioData);
    }
  }

  /**
   * Read audio file from URI
   */
  async readAudioFile(uri) {
    try {
      // For React Native, read file as base64 then convert to buffer
      const FileSystem = require('expo-file-system').default;
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Audio, 'base64');
      return buffer;

    } catch (error) {
      console.error('Error reading audio file:', error);
      throw error;
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'nl', name: 'Dutch' },
      { code: 'pl', name: 'Polish' },
      { code: 'ru', name: 'Russian' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'hi', name: 'Hindi' },
      { code: 'ar', name: 'Arabic' },
      { code: 'tr', name: 'Turkish' },
      { code: 'sv', name: 'Swedish' },
      { code: 'da', name: 'Danish' },
      { code: 'no', name: 'Norwegian' },
      { code: 'fi', name: 'Finnish' },
      // Add more as needed
    ];
  }

  /**
   * Add custom vocabulary (for African names/places)
   * Helps Deepgram recognize specific terms better
   */
  getCustomVocabulary() {
    return [
      // African names
      'Ọlátúndé', 'Adébáyọ̀', 'Chukwuemeka', 'Mwangi', 'Thabo',
      
      // African cities
      'Lagos', 'Nairobi', 'Addis Ababa', 'Dar es Salaam', 'Kano',
      
      // Common African terms
      'Yoruba', 'Swahili', 'Hausa', 'Igbo', 'Zulu',
      
      // Add more as needed
    ];
  }
}

export default new DeepgramService();