import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  Alert,
  Modal,
  Vibration,
} from 'react-native';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import { EventEmitter } from 'expo-modules-core';
import { API_KEY } from '@env';
import AdvancedConversationMode from './AdvancedConversationMode.js';

const { width, height } = Dimensions.get('window');

const AFRICAN_LANGUAGES = [
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', popular: true, color: '#ff7b00' },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá', flag: '🇳🇬', popular: true, color: '#058924' },
  { code: 'ha', name: 'Hausa', native: 'Hausa', flag: '🇳🇬', popular: true, color: '#0ac82a' },
  { code: 'ig', name: 'Igbo', native: 'Igbo', flag: '🇳🇬', popular: true, color: '#1eff00' },
  { code: 'zu', name: 'Zulu', native: 'isiZulu', flag: '🇿🇦', popular: true, color: '#ed4e14' },
  { code: 'xh', name: 'Xhosa', native: 'isiXhosa', flag: '🇿🇦', popular: false, color: '#ec7907' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦', popular: false, color: '#FF3366' },
  { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹', popular: true, color: '#ffdd00' },
  { code: 'so', name: 'Somali', native: 'Soomaali', flag: '🇸🇴', popular: false, color: '#4D9FFF' },
  { code: 'rw', name: 'Kinyarwanda', native: 'Kinyarwanda', flag: '🇷🇼', popular: false, color: '#f6ff00' },
  { code: 'en', name: 'English', native: 'English', flag: '🌍', popular: true, color: '#1E90FF' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', popular: true, color: '#ffffff' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', popular: true, color: '#73ff00' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', popular: true, color: '#ec0404' },
];

// Offline translation packs - common phrases that work without internet
const OFFLINE_PACKS = {
  'sw': {
    'Hello': 'Habari',
    'Good morning': 'Habari ya asubuhi',
    'Good evening': 'Habari ya jioni',
    'Thank you': 'Asante',
    'Please': 'Tafadhali',
    'Yes': 'Ndiyo',
    'No': 'Hapana',
    'How are you?': 'Habari yako?',
    'Goodbye': 'Kwaheri',
    'I need help': 'Nahitaji msaada',
    'Where is the bathroom?': 'Choo kiko wapi?',
    'How much?': 'Bei gani?',
    'Water': 'Maji',
    'Food': 'Chakula',
    'Help': 'Msaada',
  },
  'yo': {
    'Hello': 'Bawo',
    'Good morning': 'E kaaro',
    'Good evening': 'E kaasan',
    'Thank you': 'E se',
    'Please': 'Jọwọ',
    'Yes': 'Bẹẹni',
    'No': 'Rara',
    'How are you?': 'Bawo ni?',
    'Goodbye': 'O dabo',
    'I need help': 'Mo nilo iranlọwọ',
    'Where is the bathroom?': 'Nibo ni baluwe wa?',
    'How much?': 'Elo ni?',
    'Water': 'Omi',
    'Food': 'Ounjẹ',
    'Help': 'Iranlọwọ',
  },
  'ha': {
    'Hello': 'Sannu',
    'Good morning': 'Ina kwana',
    'Good evening': 'Ina yamma',
    'Thank you': 'Na gode',
    'Please': 'Don Allah',
    'Yes': 'Eh',
    'No': 'A\'a',
    'How are you?': 'Yaya dai?',
    'Goodbye': 'Sai an jima',
    'I need help': 'Ina buƙatar taimako',
    'Where is the bathroom?': 'Ina toilet?',
    'How much?': 'Nawa ne?',
    'Water': 'Ruwa',
    'Food': 'Abinci',
    'Help': 'Taimako',
  },
  'zu': {
    'Hello': 'Sawubona',
    'Good morning': 'Sawubona ekuseni',
    'Good evening': 'Sawubona ntambama',
    'Thank you': 'Ngiyabonga',
    'Please': 'Ngiyacela',
    'Yes': 'Yebo',
    'No': 'Cha',
    'How are you?': 'Unjani?',
    'Goodbye': 'Sala kahle',
    'I need help': 'Ngidinga usizo',
    'Where is the bathroom?': 'Ikuphi indlu yangasese?',
    'How much?': 'Malini?',
    'Water': 'Amanzi',
    'Food': 'Ukudla',
    'Help': 'Usizo',
  },
  'ig': {
    'Hello': 'Ndewo',
    'Good morning': 'Ụtụtụ ọma',
    'Good evening': 'Mgbede ọma',
    'Thank you': 'Daalụ',
    'Please': 'Biko',
    'Yes': 'Ee',
    'No': 'Mba',
    'How are you?': 'Kedu ka ị mere?',
    'Goodbye': 'Ka ọ dị',
    'I need help': 'Achọrọ m enyemaka',
    'Where is the bathroom?': 'Olee ebe ụlọ mposi dị?',
    'How much?': 'Ego ole?',
    'Water': 'Mmiri',
    'Food': 'Nri',
    'Help': 'Enyemaka',
  },
};

export default function App() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('sw');
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showSourceLangPicker, setShowSourceLangPicker] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [recognizing, setRecognizing] = useState(false);
  const [interimResults, setInterimResults] = useState('');
  const [conversationMode, setConversationMode] = useState(false);
  const [downloadedPacks, setDownloadedPacks] = useState(['sw', 'yo', 'ha', 'zu', 'ig']); // Pre-loaded packs
  const [hasInteracted, setHasInteracted] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [missingVoice, setMissingVoice] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [showConversation, setShowConversationMode] = useState(false);
  const [autoDetectMode, setAutoDetectMode] = useState(false);
  
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    startPulseAnimation();
    startGlowAnimation();
    checkNetwork();
    requestPermissions();
    
    const interval = setInterval(checkNetwork, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Separate effect for speech recognition listeners that updates when languages change
  useEffect(() => {
    const eventEmitter = new EventEmitter(ExpoSpeechRecognitionModule);
    
    const startListener = eventEmitter.addListener('start', () => {
      console.log("Speech recognition started");
      setRecognizing(true);
      setIsListening(true);
    });

    const audioStartListener = eventEmitter.addListener('audiostart', () => {
      console.log("Audio started");
    });

    const resultListener = eventEmitter.addListener('result', (event) => {
      console.log("Speech result:", event);
      console.log("Current target language:", targetLang); 
      
      if (event.results && event.results.length > 0) {
        const result = event.results[0];
        const transcript = result.transcript || result;
        
        if (transcript) {
          setInterimResults(transcript);
          
          if (result.isFinal || event.isFinal) {
            setSourceText(transcript);
            // Call translate with current state
            translateText(transcript);
            setInterimResults('');
          }
        }
      }
    });

    const errorListener = eventEmitter.addListener('error', (event) => {
      console.error("Speech recognition error:", event);
      Alert.alert("Error", `Speech recognition failed: ${event.error || 'Unknown error'}`);
      setIsListening(false);
      setRecognizing(false);
    });

    const audioEndListener = eventEmitter.addListener('audioend', () => {
      console.log("Audio ended");
    });

    const endListener = eventEmitter.addListener('end', () => {
      console.log("Speech recognition ended");
      setRecognizing(false);
      setIsListening(false);
    });
    
    return () => {
      startListener.remove();
      audioStartListener.remove();
      resultListener.remove();
      errorListener.remove();
      audioEndListener.remove();
      endListener.remove();
    };
  }, [sourceLang, targetLang]); // Re-register listeners when languages change

  const requestPermissions = async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      
      if (!result.granted) {
        Alert.alert(
          "Microphone Permission",
          "Please enable microphone access in settings to use voice translation.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Permission error:", error);
    }
  };

  const checkNetwork = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      setIsOnline(true);
    } catch (error) {
      setIsOnline(false);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startGlowAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const hapticFeedback = () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(10);
    } else {
      Vibration.vibrate(50);
    }
  };

  const startVoiceInput = async () => {
    hapticFeedback();

    setHasInteracted(true);
    
    try {
      // Stop if already listening
      if (recognizing) {
        await ExpoSpeechRecognitionModule.stop();
        return;
      }

      const recognitionLang = autoDetectMode ? 'en-US' 
                                : sourceLang === 'en' ? 'en-US' :
                                  sourceLang === 'fr' ? 'fr-FR' : 
                                  sourceLang === 'ar' ? 'ar-SA' : 
                                  sourceLang === 'pt' ? 'pt-PT' : 
                                  sourceLang === 'sw' ? 'sw-KE' : 
                                  'en-US';

      // Start speech recognition
      await ExpoSpeechRecognitionModule.start({
        lang: recognitionLang,
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
      });
      
    } catch (error) {
      console.error("Speech recognition start error:", error);
      Alert.alert("Error", "Could not start voice recognition. Please try again.");
      setIsListening(false);
      setRecognizing(false);
    }
  };

  const translateText = async (text) => {
    if (!text.trim()) return;

    setIsTranslating(true);

    try {
      let fromLang = sourceLang;

      if (autoDetectMode) {
        const detected = await detectLanguage(text);
        if (detected) {
          fromLang = detected;
          console.log('Auto detected language:', fromLang);
        }
      }

      // Try offline translation first if offline or pack is downloaded
      if (!isOnline || downloadedPacks.includes(targetLang)) {
        const offlinePack = OFFLINE_PACKS[targetLang];
        if (offlinePack && offlinePack[text]) {
          const translated = offlinePack[text];
          setTranslatedText(translated);
          
          // Add to conversation history if in conversation mode
          if (conversationMode) {
            setConversationHistory(prev => [...prev, {
              source: text,
              translated,
              sourceLang: fromLang,
              targetLang,
              timestamp: new Date(),
            }]);
          }
          
          // Auto-play translation
          setTimeout(() => {
            speakWithAfricanVoice(translated, targetLang);
          }, 500);
          
          setIsTranslating(false);
          return;
        }
      }

      // Fall back to online translation
      if (!isOnline) {
        Alert.alert('Offline', 'No internet connection and phrase not in offline pack.');
        setIsTranslating(false);
        return;
      }

      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      const translated = data[0].map(item => item[0]).join('');
      
      setTranslatedText(translated);
      
      // Add to conversation history if in conversation mode
      if (conversationMode) {
        setConversationHistory(prev => [...prev, {
          source: text,
          translated,
          sourceLang: fromLang,
          targetLang,
          timestamp: new Date(),
          autoDetected: autoDetectMode,
        }]);
      }
      
      // Auto-play translation
      setTimeout(() => {
        speakWithAfricanVoice(translated, targetLang);
      }, 500);

    } catch (error) {
      Alert.alert('Error', 'Translation failed.');
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleConversationMode = () => {
    setConversationMode(!conversationMode);
    hapticFeedback('medium');
    if (!conversationMode) {
      setConversationHistory([]);
    }
  };

  const swapLanguages = () => {
    hapticFeedback();
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  const detectLanguage = async (text) => {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`
      );
      
      const data = await response.json();
    
      // The detected language is in data[2]
      if (data && data[2]) {
        const detectedLang = data[2];
        console.log('Detected language:', detectedLang);
        return detectedLang;
      }
      
      return null;
    } catch (error) {
      console.error('Language detection error:', error);
      return null;
    }
  };

  const getLanguageInfo = (code) => AFRICAN_LANGUAGES.find(l => l.code === code);
  
  const speakWithAfricanVoice = async (text, langCode) => {
  if (!text.trim()) return;

  try {
    // Check if API key is available
    if (!API_KEY) {
      console.warn('Google TTS API key not found, using fallback');
      fallbackToExpoSpeech(text, langCode);
      return;
    }

    // Map language codes to Google Cloud language codes
    const googleLangCodes = {
      'sw': 'sw-KE',  // Swahili - NATIVE
      'af': 'af-ZA',  // Afrikaans - NATIVE
      'fr': 'fr-FR',  // French - NATIVE
      'ar': 'ar-XA',  // Arabic - NATIVE
      'pt': 'pt-PT',  // Portuguese - NATIVE
      'en': 'en-ZA',  // English - South African accent
      
      // Fallback to South African English (best African accent available) 🇿🇦
      'yo': 'en-ZA',  // Yoruba → SA English
      'ha': 'en-ZA',  // Hausa → SA English
      'ig': 'en-ZA',  // Igbo → SA English
      'zu': 'en-ZA',  // Zulu → SA English
      'xh': 'en-ZA',  // Xhosa → SA English
      'am': 'en-ZA',  // Amharic → SA English
      'so': 'en-ZA',  // Somali → SA English
      'rw': 'en-ZA',  // Kinyarwanda → SA English
    };

    const languageCode = googleLangCodes[langCode] || 'en-US';
    
    console.log(`🗣️ Speaking "${text}" in ${languageCode} using Google TTS`);

    // Call Google Cloud TTS API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: languageCode,
            name: getVoiceName(languageCode),
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: 0,
            speakingRate: 0.85,
            volumeGainDb: 0,
          },
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      console.error('❌ Google TTS API error:', data.error);
      fallbackToExpoSpeech(text, langCode);
      return;
    }

    if (data.audioContent) {
      console.log('✅ Got audio from Google TTS');
      
      // Since we don't have expo-av, we'll use expo-speech as fallback
      // The API call succeeded, so we know the backend works
      // When expo-av is fixed, we can play the actual audio
      
      // For now, use expo-speech with improved settings
      fallbackToExpoSpeech(text, langCode);
      
      console.log('🔊 Audio playback (using fallback until expo-av is fixed)');
    }
  } catch (error) {
    console.error('❌ Google TTS error:', error);
    fallbackToExpoSpeech(text, langCode);
  }
};


  const getVoiceName = (languageCode) => {
  const voiceNames = {
    'sw-KE': 'sw-KE-Standard-A',
    'zu-ZA': 'zu-ZA-Standard-A',
    'af-ZA': 'af-ZA-Standard-A',
    'en-NG': 'en-NG-Standard-A',
    'en-ZA': 'en-ZA-Standard-A',
    'fr-FR': 'fr-FR-Neural2-A',
    'ar-SA': 'ar-XA-Standard-A',
    'pt-PT': 'pt-PT-Standard-A',
  };

  return voiceNames[languageCode] || null;
};

// Fallback to expo-speech if Google TTS fails
const fallbackToExpoSpeech = async (text, langCode) => {
  try {
    console.log('🔄 Using fallback expo-speech');
    
    // Get available voices
    const voices = await Speech.getAvailableVoicesAsync();
    
    // Voice preferences - prioritize African accents
    const voicePreferences = {
      'sw': ['sw-KE', 'en-ZA', 'en-GB'],
      'yo': ['en-ZA', 'en-GB'],
      'ha': ['en-ZA', 'en-GB'],
      'ig': ['en-ZA', 'en-GB'],
      'zu': ['zu-ZA', 'en-ZA'],
      'xh': ['xh-ZA', 'en-ZA'],
      'af': ['af-ZA', 'en-ZA'],
      'am': ['en-ZA', 'en-GB'],
      'so': ['en-ZA', 'en-GB'],
      'rw': ['en-ZA', 'en-GB'],
      'en': ['en-ZA', 'en-GB', 'en-AU'],
      'fr': ['fr-FR', 'fr-CA'],
      'ar': ['ar-SA', 'ar-EG'],
      'pt': ['pt-PT', 'pt-BR'],
    };

    const preferredLocales = voicePreferences[langCode] || [langCode];
    let selectedVoice = null;

    for (const locale of preferredLocales) {
      selectedVoice = voices.find(voice => 
        voice.language && voice.language.toLowerCase().startsWith(locale.toLowerCase())
      );
      if (selectedVoice) {
        console.log(`✅ Found voice: ${selectedVoice.name} (${selectedVoice.language})`);
        break;
      }
    }

    await Speech.speak(text, {
      language: selectedVoice?.language || langCode,
      voice: selectedVoice?.identifier,
      pitch: 1.0,
      rate: 0.7, // Slower for better pronunciation
    });
    
    console.log('🔊 Expo-speech playback started');
  } catch (error) {
    console.error('❌ Fallback speech error:', error);
  }
};

  const SourceLanguagePicker = () => {
  if (!showSourceLangPicker) return null;

  const popularLangs = AFRICAN_LANGUAGES.filter(l => l.popular);
  const otherLangs = AFRICAN_LANGUAGES.filter(l => !l.popular);

  return (
    <Modal visible={showSourceLangPicker} transparent animationType="slide" onRequestClose={() => setShowSourceLangPicker(false)}>
      <View style={styles.pickerOverlay}>
        <TouchableOpacity style={styles.pickerBackdrop} activeOpacity={1} onPress={() => setShowSourceLangPicker(false)} />
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Speak From</Text>
            <TouchableOpacity onPress={() => setShowSourceLangPicker(false)} style={styles.pickerClose}>
              <Text style={styles.pickerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
            {/* Auto-Detect Option */}
            <TouchableOpacity
              style={[
                styles.pickerItem,
                styles.autoDetectItem,
                autoDetectMode && { borderColor: '#00F5FF', backgroundColor: 'rgba(0,245,255,0.15)' },
              ]}
              onPress={() => {
                hapticFeedback();
                setAutoDetectMode(true);
                setShowSourceLangPicker(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.pickerFlag}>🔍</Text>
              <View style={styles.pickerInfo}>
                <Text style={styles.pickerName}>Auto-Detect</Text>
                <Text style={styles.pickerNative}>Detects language automatically</Text>
              </View>
              {autoDetectMode && (
                <View style={[styles.pickerCheck, { backgroundColor: '#00F5FF' }]}>
                  <Text style={styles.pickerCheckText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.pickerSectionTitle}>POPULAR</Text>
            {popularLangs.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.pickerItem,
                  sourceLang === lang.code && !autoDetectMode && { borderColor: lang.color, backgroundColor: lang.color + '15' },
                ]}
                onPress={() => {
                  hapticFeedback();
                  setSourceLang(lang.code);
                  setAutoDetectMode(false);
                  setShowSourceLangPicker(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.pickerFlag}>{lang.flag}</Text>
                <View style={styles.pickerInfo}>
                  <Text style={styles.pickerName}>{lang.name}</Text>
                  <Text style={styles.pickerNative}>{lang.native}</Text>
                </View>
                {sourceLang === lang.code && !autoDetectMode && (
                  <View style={[styles.pickerCheck, { backgroundColor: lang.color }]}>
                    <Text style={styles.pickerCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            
            <Text style={styles.pickerSectionTitle}>ALL LANGUAGES</Text>
            {otherLangs.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.pickerItem,
                  sourceLang === lang.code && !autoDetectMode && { borderColor: lang.color, backgroundColor: lang.color + '15' },
                ]}
                onPress={() => {
                  hapticFeedback();
                  setSourceLang(lang.code);
                  setAutoDetectMode(false);
                  setShowSourceLangPicker(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.pickerFlag}>{lang.flag}</Text>
                <View style={styles.pickerInfo}>
                  <Text style={styles.pickerName}>{lang.name}</Text>
                  <Text style={styles.pickerNative}>{lang.native}</Text>
                </View>
                {sourceLang === lang.code && !autoDetectMode && (
                  <View style={[styles.pickerCheck, { backgroundColor: lang.color }]}>
                    <Text style={styles.pickerCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

  const LanguagePicker = () => {
    if (!showLangPicker) return null;

    const popularLangs = AFRICAN_LANGUAGES.filter(l => l.popular);
    const otherLangs = AFRICAN_LANGUAGES.filter(l => !l.popular);

    return (
      <Modal visible={showLangPicker} transparent animationType="slide" onRequestClose={() => setShowLangPicker(false)}>
        <View style={styles.pickerOverlay}>
          <TouchableOpacity style={styles.pickerBackdrop} activeOpacity={1} onPress={() => setShowLangPicker(false)} />
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Translate To</Text>
              <TouchableOpacity onPress={() => setShowLangPicker(false)} style={styles.pickerClose}>
                <Text style={styles.pickerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.pickerSectionTitle}>POPULAR</Text>
              {popularLangs.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.pickerItem,
                    targetLang === lang.code && { borderColor: lang.color, backgroundColor: lang.color + '15' },
                  ]}
                  onPress={() => {
                    hapticFeedback();
                    setTargetLang(lang.code);
                    setShowLangPicker(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pickerFlag}>{lang.flag}</Text>
                  <View style={styles.pickerInfo}>
                    <Text style={styles.pickerName}>{lang.name}</Text>
                    <Text style={styles.pickerNative}>{lang.native}</Text>
                  </View>
                  {targetLang === lang.code && (
                    <View style={[styles.pickerCheck, { backgroundColor: lang.color }]}>
                      <Text style={styles.pickerCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              
              <Text style={styles.pickerSectionTitle}>ALL LANGUAGES</Text>
              {otherLangs.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.pickerItem,
                    targetLang === lang.code && { borderColor: lang.color, backgroundColor: lang.color + '15' },
                  ]}
                  onPress={() => {
                    hapticFeedback();
                    setTargetLang(lang.code);
                    setShowLangPicker(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pickerFlag}>{lang.flag}</Text>
                  <View style={styles.pickerInfo}>
                    <Text style={styles.pickerName}>{lang.name}</Text>
                    <Text style={styles.pickerNative}>{lang.native}</Text>
                  </View>
                  {targetLang === lang.code && (
                    <View style={[styles.pickerCheck, { backgroundColor: lang.color }]}>
                      <Text style={styles.pickerCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A', '#0A0A0A']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>GRIOT</Text>
            <Text style={styles.subtitle}>Africa Voice Translator</Text>
          </View>

          <View style={styles.langDisplay}>
            <TouchableOpacity 
              style={styles.langInfo}
              onPress={() => setShowSourceLangPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.langFlag}>
                {autoDetectMode ? '🔍' : getLanguageInfo(sourceLang)?.flag}
              </Text>
              <Text style={styles.langName}>
                {autoDetectMode ? 'Auto-Detect' : getLanguageInfo(sourceLang)?.name}
              </Text>
              <Text style={styles.langChange}>TAP TO CHANGE</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.swapBtn} onPress={swapLanguages} activeOpacity={0.7}>
              <Text style={styles.swapText}>⇄</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.langInfo} 
              onPress={() => setShowLangPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.langFlag}>{getLanguageInfo(targetLang)?.flag}</Text>
              <Text style={styles.langName}>{getLanguageInfo(targetLang)?.name}</Text>
              <Text style={styles.langChange}>TAP TO CHANGE</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mainContent}>
            <Animated.View style={{
              transform: [{ scale: isListening ? pulseAnim : 1 }]
            }}>
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={startVoiceInput}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={
                    isListening 
                      ? [getLanguageInfo(targetLang)?.color || '#373737', '#c0c0c0'] 
                      : [getLanguageInfo(targetLang)?.color || '#595959', '#fafafa']
                  }
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.voiceGradient}
                >
                  <Animated.View style={{
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.8]
                    })
                  }}>
                    <View style={styles.voiceGlow} />
                  </Animated.View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.voiceInstruction}>
              {isListening ? 'Listening...' : isTranslating ? 'Translating...' : 'TAP TO SPEAK'}
            </Text>
            
            {/* Conversation Mode Toggle */}
            <TouchableOpacity 
              style={styles.conversationToggle}
              onPress={() => {
                hapticFeedback();
                setShowConversationMode(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.conversationToggleIcon}>💬</Text>
              <Text style={styles.conversationToggleText}>
                Conversation Mode
              </Text>
            </TouchableOpacity>
          </View>

          {(sourceText || translatedText || interimResults) && (
            <Animated.View style={[styles.translationCard, { opacity: fadeAnim }]}>
              {(interimResults && isListening) && (
                <View style={styles.textBlock}>
                  <Text style={styles.textLabel}>Listening...</Text>
                  <Text style={[styles.textContent, styles.interimText]}>{interimResults}</Text>
                </View>
              )}
              
              {sourceText && !isListening && (
                <View style={styles.textBlock}>
                  <Text style={styles.textLabel}>You said:</Text>
                  <Text style={styles.textContent}>{sourceText}</Text>
                </View>
              )}
              
              {translatedText && (
                <View style={styles.textBlock}>
                  <Text style={styles.textLabel}>Translation:</Text>
                  <Text style={[styles.textContent, styles.translatedText]}>{translatedText}</Text>
                  {downloadedPacks.includes(targetLang) && (
                    <View style={styles.offlinePackBadge}>
                      <Text style={styles.offlinePackText}>📦 Works Offline</Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.replayBtn}
                    onPress={() => speakWithAfricanVoice(translatedText, targetLang)}
                  >
                    <Text style={styles.replayIcon}>🔊</Text>
                    <Text style={styles.replayText}>Play Again</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          )}

          {/* Conversation Mode Modal */}
          {showConversation && (
            <Modal 
              visible={showConversation}
              animationType="slide"
              //presentationStyle="fullscreen"
            >
              <AdvancedConversationMode
                sourceLang={sourceLang}
                targetLang={targetLang}
                onExit={() => setShowConversationMode(false)}
                translateFunction={async (text, from, to) => {
                  try {
                    if (!isOnline || downloadedPacks.includes(to)) {
                      const offlinePack = OFFLINE_PACKS[to];
                      if (offlinePack && offlinePack[text]) {
                        return offlinePack[text];
                      }
                    }

                    const response = await fetch(
                      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
                    );
                    const data = await response.json();
                    const translated = data[0].map(item => item[0]).join('');
                    return translated;
                  } catch (error) {
                    console.error('Translation error:', error);
                    return null;
                  }
                }}
                speakFunction={speakWithAfricanVoice}
              />
            </Modal>
          )}

          {/* Conversation History */}
          {conversationMode && conversationHistory.length > 0 && (
            <View style={styles.conversationHistory}>
              <Text style={styles.conversationHistoryTitle}>💬 Recent Exchanges</Text>
              {conversationHistory.slice(-5).reverse().map((item, index) => (
                <View key={index} style={styles.conversationItem}>
                  <View style={styles.conversationBubbleYou}>
                    <Text style={styles.conversationLabel}>You</Text>
                    <Text style={styles.conversationSource}>{item.source}</Text>
                  </View>
                  <View style={styles.conversationBubbleThem}>
                    <Text style={styles.conversationLabel}>Translation</Text>
                    <Text style={styles.conversationTranslated}>{item.translated}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Instructions - only shown before */}
          {!hasInteracted && (
            <View style={styles.instructions}>
            <Text style={styles.instructionText}>1. Choose target language above</Text>
            <Text style={styles.instructionText}>2. Tap circle and speak</Text>
            <Text style={styles.instructionText}>3. Listen to instant translation</Text>
          </View>
          )}
        </ScrollView>

        {!isOnline && (
          <View style={styles.offlineBar}>
            <Text style={styles.offlineText}>📡 Offline</Text>
          </View>
        )}

        {missingVoice && (
          <View style={styles.voiceHintBar}>
            <Text style={styles.voiceHintText}>💡 Download {getLanguageInfo(targetLang)?.name} voice in Settings for better accent</Text>
            <TouchableOpacity onPress={() => setMissingVoice(false)} style={styles.voiceHintClose}>
              <Text style={styles.voiceHintCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      <LanguagePicker />
      <SourceLanguagePicker />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logo: {
    marginTop: 25,
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 2,
  },
  langDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginBottom: 20
  },
  langInfo: {
    alignItems: 'center',
    flex: 1,
  },
  langFlag: {
    fontSize: 48,
    marginBottom: 8,
  },
  langName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  langChange: {
    fontSize: 10,
    color: '#00F5FF',
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 1,
  },
  swapBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  swapText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  voiceButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    elevation: 20,
  },
  voiceGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  voiceGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF',
    opacity: 0.2,
  },
  voiceInstruction: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00F5FF',
    marginTop: 15,
    letterSpacing: 2,
  },
  autoDetectItem: {
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  conversationToggle: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  conversationToggleActive: {
    backgroundColor: 'rgba(0,245,255,0.15)',
    borderColor: '#00F5FF',
  },
  conversationToggleIcon: {
    fontSize: 20,
  },
  conversationToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  conversationToggleTextActive: {
    color: '#00F5FF',
  },
  translationCard: {
    marginHorizontal: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  textBlock: {
    marginBottom: 16,
  },
  textLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
    letterSpacing: 1,
  },
  textContent: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 26,
  },
  translatedText: {
    color: '#00F5FF',
    fontWeight: '600',
  },
  interimText: {
    color: '#999',
    fontStyle: 'italic',
  },
  offlinePackBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,255,148,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  offlinePackText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00FF94',
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,245,255,0.1)',
    borderRadius: 20,
  },
  replayIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  replayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00F5FF',
  },
  instructions: {
    paddingHorizontal: 40,
    marginTop: 30,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  offlineBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    alignSelf: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  voiceHintBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,245,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00F5FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceHintText: {
    flex: 1,
    color: '#00F5FF',
    fontSize: 12,
    fontWeight: '600',
  },
  voiceHintClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceHintCloseText: {
    color: '#00F5FF',
    fontSize: 14,
    fontWeight: '700',
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  pickerContainer: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pickerClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCloseText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  pickerScroll: {
    padding: 20,
  },
  pickerSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#666',
    marginTop: 16,
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pickerFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  pickerInfo: {
    flex: 1,
  },
  pickerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pickerNative: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  pickerCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCheckText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '900',
  },
  conversationHistory: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 16,
  },
  conversationHistoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00F5FF',
    marginBottom: 12,
  },
  conversationItem: {
    marginBottom: 16,
    gap: 8,
  },
  conversationBubbleYou: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  conversationBubbleThem: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,245,255,0.15)',
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  conversationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  conversationSource: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  conversationTranslated: {
    fontSize: 14,
    color: '#00F5FF',
    fontWeight: '600',
  },
});