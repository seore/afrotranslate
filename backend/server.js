// server.js - Google Cloud TTS Backend
// Place this in: /Users/seore/Documents/GitHub/afrotranslate/backend/server.js

const express = require('express');
const cors = require('cors');
const textToSpeech = require('@google-cloud/text-to-speech');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google Cloud TTS client
const client = new textToSpeech.TextToSpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
});

// Voice mapping
const getVoiceConfig = (langCode) => {
  const voiceMap = {
    'sw': { languageCode: 'sw-KE', name: 'sw-KE-Standard-A' },  // Swahili ⭐
    'yo': { languageCode: 'en-NG', name: 'en-NG-Standard-A' },  // Yoruba (Nigerian English)
    'ha': { languageCode: 'en-NG', name: 'en-NG-Standard-A' },  // Hausa (Nigerian English)
    'ig': { languageCode: 'en-NG', name: 'en-NG-Standard-A' },  // Igbo (Nigerian English)
    'zu': { languageCode: 'zu-ZA', name: 'zu-ZA-Standard-A' },  // Zulu ⭐
    'xh': { languageCode: 'xh-ZA', name: 'xh-ZA-Standard-A' },  // Xhosa
    'af': { languageCode: 'af-ZA', name: 'af-ZA-Standard-A' },  // Afrikaans ⭐
    'am': { languageCode: 'en-ZA', name: 'en-ZA-Standard-A' },  // Amharic (SA English)
    'so': { languageCode: 'en-ZA', name: 'en-ZA-Standard-A' },  // Somali (SA English)
    'rw': { languageCode: 'en-ZA', name: 'en-ZA-Standard-A' },  // Kinyarwanda (SA English)
    'en': { languageCode: 'en-ZA', name: 'en-ZA-Standard-A' },  // English (SA accent)
    'fr': { languageCode: 'fr-FR', name: 'fr-FR-Neural2-A' },   // French ⭐
    'ar': { languageCode: 'ar-XA', name: 'ar-XA-Standard-A' },  // Arabic ⭐
    'pt': { languageCode: 'pt-PT', name: 'pt-PT-Standard-A' },  // Portuguese ⭐
  };

  return voiceMap[langCode] || { languageCode: 'en-US', name: 'en-US-Standard-A' };
};

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Text-to-Speech endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, langCode } = req.body;

    if (!text || !langCode) {
      return res.status(400).json({ error: 'Missing text or langCode' });
    }

    console.log(`🗣️ TTS Request: "${text}" in ${langCode}`);

    const voiceConfig = getVoiceConfig(langCode);

    // Construct the request
    const request = {
      input: { text },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceConfig.name,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: 0,
        speakingRate: 0.85,
      },
    };

    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    // Return audio as base64
    const audioBase64 = response.audioContent.toString('base64');

    console.log(`✅ Generated ${audioBase64.length} bytes of audio`);

    res.json({
      success: true,
      audio: audioBase64,
      languageCode: voiceConfig.languageCode,
      voiceName: voiceConfig.name,
    });

  } catch (error) {
    console.error('❌ TTS Error:', error);
    res.status(500).json({
      error: 'Text-to-speech failed',
      message: error.message,
    });
  }
});

// Alternative endpoint that returns audio URL (for caching)
app.post('/api/tts-url', async (req, res) => {
  try {
    const { text, langCode } = req.body;

    if (!text || !langCode) {
      return res.status(400).json({ error: 'Missing text or langCode' });
    }

    const voiceConfig = getVoiceConfig(langCode);

    const request = {
      input: { text },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceConfig.name,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: 0,
        speakingRate: 0.85,
      },
    };

    const [response] = await client.synthesizeSpeech(request);

    // Create a data URL
    const audioBase64 = response.audioContent.toString('base64');
    const audioDataUrl = `data:audio/mp3;base64,${audioBase64}`;

    res.json({
      success: true,
      audioUrl: audioDataUrl,
      languageCode: voiceConfig.languageCode,
    });

  } catch (error) {
    console.error('❌ TTS Error:', error);
    res.status(500).json({
      error: 'Text-to-speech failed',
      message: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Google TTS Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🗣️ TTS endpoint: http://localhost:${PORT}/api/tts`);
});

module.exports = app;