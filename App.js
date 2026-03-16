import React, { useState, useEffect, useRef } from 'react';
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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import { useAudioPlayer, AudioSource } from 'expo-audio';
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import { EventEmitter } from 'expo-modules-core';
import { API_KEY } from '@env';

// Import pronunciation functions
import { applyHausaPronunciation } from './pronounciation-hausa.js';
import { applyIgboTones } from './pronounciation-igbo.js';
import { applySwahiliPronunciation } from './pronounciation-swahili.js';
import { applyYorubaTones } from './pronounciation-yoruba.js';
import { applyZuluPronunciation } from './pronounciation-zulu.js';

// Import premium features
import { PremiumProvider, usePremium } from './PremiumContext';
import PremiumScreen from './PremiumScreen';
import AdvancedConversationMode from './AdvancedConversationMode.js';
import SettingsScreen from './settingsScreen.js';

const { width, height } = Dimensions.get('window');

const AFRICAN_LANGUAGES = [
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', popular: true, color: '#ff7b00', premium: false },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá', flag: '🇳🇬', popular: true, color: '#058924', premium: false },
  { code: 'ha', name: 'Hausa', native: 'Hausa', flag: '🇳🇬', popular: true, color: '#0ac82a', premium: false },
  { code: 'ig', name: 'Igbo', native: 'Igbo', flag: '🇳🇬', popular: true, color: '#1eff00', premium: false },
  { code: 'zu', name: 'Zulu', native: 'isiZulu', flag: '🇿🇦', popular: true, color: '#ed4e14', premium: false },
  { code: 'en', name: 'English', native: 'English', flag: '🌍', popular: true, color: '#1E90FF', premium: false },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', popular: true, color: '#ffffff', premium: false },
  { code: 'xh', name: 'Xhosa', native: 'isiXhosa', flag: '🇿🇦', popular: false, color: '#ec7907', premium: true },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦', popular: false, color: '#FF3366', premium: true },
  { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹', popular: true, color: '#ffdd00', premium: true },
  { code: 'so', name: 'Somali', native: 'Soomaali', flag: '🇸🇴', popular: false, color: '#4D9FFF', premium: true },
  { code: 'rw', name: 'Kinyarwanda', native: 'Kinyarwanda', flag: '🇷🇼', popular: false, color: '#f6ff00', premium: true },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', popular: true, color: '#73ff00', premium: true },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', popular: true, color: '#ec0404', premium: true },
];

const OFFLINE_PACKS = {
  'sw': {
    'Hello': 'Habari',
    'Good morning': 'Habari za asubuhi',
    'Good evening': 'Habari za jioni',
    'Thank you': 'Asante',
    'Please': 'Tafadhali',
    'Yes': 'Ndiyo',
    'No': 'Hapana',
    'How are you?': 'Hujambo?',
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

const convertToSSML = (text, langCode) => {
  let ssml = '<speak>';

  switch(langCode) {
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
}

const getPitchForLanguage = (langCode) => {
  const pitchMap = {
    'yo': 3,      
    'ig': 2,      
    'ha': -1,    
    'sw': -2,     
    'zu': -1,     
    'xh': -1,     
    'am': 0,      
    'so': 0,     
    'rw': -1,     
    'af': -2,    
    'fr': 1,      
    'pt': 0,     
    'ar': 0,      
    'en': 0,      
  };
  return pitchMap[langCode] || 0;
};

const getRateForLanguage = (langCode) => {
  const rateMap = {
    'yo': 0.85,  
    'ig': 0.85,   
    'ha': 0.90,   
    'sw': 0.95,   
    'zu': 0.90,   
    'xh': 0.90,  
    'am': 0.90,   
    'so': 0.95,   
    'rw': 0.90,   
    'af': 0.95,  
    'fr': 1.0,    
    'pt': 0.95,   
    'ar': 0.90,   
    'en': 1.0,    
  };
  return rateMap[langCode] || 0.95;
};

function App() {
  // Premium hook
  const {
    isPremium,
    canTranslate,
    isLanguageUnlocked,
    getRemainingTranslations,
    incrementTranslationCount,
  } = usePremium();

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
  const [downloadedPacks, setDownloadedPacks] = useState(['sw', 'yo', 'ha', 'zu', 'ig']);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showConversation, setShowConversationMode] = useState(false);
  const [autoDetectMode, setAutoDetectMode] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);
  const [showPremiumScreen, setShowPremiumScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));

  const player = useAudioPlayer();

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

  useEffect(() => {
    if (isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim1, {
            toValue: 1.4,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim1, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim1.setValue(1);
    }
  }, [isOnline]);

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
  }, [sourceLang, targetLang]); 

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
    
    if (!canTranslate()) {
      Alert.alert(
        'Translation Limit Reached',
        `You've used all ${getRemainingTranslations()} free translations today. Upgrade to Premium for unlimited translations!`,
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade Now', onPress: () => setShowPremiumScreen(true) },
        ]
      );
      return;
    }
    
    try {
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

    if (!canTranslate()) {
      Alert.alert(
        'Translation Limit Reached',
        `Upgrade to Premium for unlimited translations!`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => setShowPremiumScreen(true) },
        ]
      );
      return;
    }

    if (!isLanguageUnlocked(targetLang)) {
      const langInfo = getLanguageInfo(targetLang);
      Alert.alert(
        'Premium Language',
        `${langInfo?.name} is a Premium language. Upgrade to unlock all 14 languages!`,
        [
          { text: 'Choose Free Language', style: 'cancel', onPress: () => setShowLangPicker(true) },
          { text: 'Upgrade Now', onPress: () => setShowPremiumScreen(true) },
        ]
      );
      return;
    }

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

      if (!isOnline || downloadedPacks.includes(targetLang)) {
        const offlinePack = OFFLINE_PACKS[targetLang];
        if (offlinePack && offlinePack[text]) {
          const translated = offlinePack[text];
          setTranslatedText(translated);
          
          if (conversationMode) {
            setConversationHistory(prev => [...prev, {
              source: text,
              translated,
              sourceLang: fromLang,
              targetLang,
              timestamp: new Date(),
            }]);
          }
          
          if (!isPremium) {
            await incrementTranslationCount();
          }
          
          setTimeout(() => {
            speakWithAfricanVoice(translated, targetLang);
          }, 500);
          
          setIsTranslating(false);
          return;
        }
      }

      if (!isOnline) {
        Alert.alert('Offline', 'No internet connection and phrase not in offline pack.');
        setIsTranslating(false);
        return;
      }

      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      const translated = data[0].map(item => item[0]).join('');
      
      setTranslatedText(translated);
      
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

      if (!isPremium) {
        await incrementTranslationCount();
      }
      
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
      if (!API_KEY) {
        console.warn('Google TTS API key not found, using fallback');
        fallbackToExpoSpeech(text, langCode);
        return;
      }

      const googleLangCodes = {
        'sw': 'sw-KE',  
        'af': 'af-ZA',  
        'fr': 'fr-FR',  
        'ar': 'ar-XA',  
        'pt': 'pt-PT',  
        'en': 'en-US',  
        'yo': 'en-US',  
        'ha': 'en-US',  
        'ig': 'en-US',  
        'zu': 'en-US',  
        'xh': 'en-US',  
        'am': 'en-US',  
        'so': 'en-US',  
        'rw': 'en-US',  
      };

      const languageCode = googleLangCodes[langCode] || 'en-US';
      const ssml = convertToSSML(text, langCode);
      const voiceName = getVoiceName(languageCode);
      
      console.log(`Speaking with SSML pronunciation in ${languageCode}`);

      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { 
              ssml: ssml
            },
            voice: {
              languageCode: languageCode, 
              ...(voiceName && {name: voiceName}),
              ssmlGender: 'FEMALE',
            },
            audioConfig: {
              audioEncoding: 'MP3',
              pitch: getPitchForLanguage(langCode),
              speakingRate: getRateForLanguage(langCode),
              volumeGainDb: 0,
            },
          }),
        }
      );

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

          player.replace(fileUri);

          setTimeout(() => {
            player.play();
            console.log('Playing Google TTS with SSML pronunciation!');
          }, 100)
          
          setTimeout(() => {
            FileSystem.deleteAsync(fileUri, {idempotent: true});
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
  }
      

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

  const fallbackToExpoSpeech = async (text, langCode) => {
    try {
      console.log('Using fallback expo-speech');
      
      const voices = await Speech.getAvailableVoicesAsync();
      
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
          console.log(`Found voice: ${selectedVoice.name} (${selectedVoice.language})`);
          break;
        }
      }

      await Speech.speak(text, {
        language: selectedVoice?.language || langCode,
        voice: selectedVoice?.identifier,
        pitch: 1.0,
        rate: 0.75, 
      });
      
    } catch (error) {
      console.error('Fallback speech error:', error);
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
                <Ionicons name="close" size={22} color={"#fff"}/>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
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
                <MaterialIcons name='auto-awesome' size={22} color={"#00F5FF"}/>
                <View style={styles.pickerInfo}>
                  <Text style={styles.pickerName}> Auto-Detect</Text>
                  <Text style={styles.pickerNative}> Detects language automatically</Text>
                </View>
                {autoDetectMode && (
                  <View style={[styles.pickerCheck, { backgroundColor: '#00F5FF' }]}>
                    <Ionicons name='checkmark-circle' size={22} color={"#fff"}/>
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
                      <Ionicons name='checkmark-circle' size={22} color={"#fff"}/>
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
                      <Ionicons name='checkmark-circle' size={22} color={"#fff"}/>
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
                <Ionicons name="close" size={22} color={"#fff"}/>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.pickerSectionTitle}>POPULAR</Text>
              {popularLangs.map((lang) => {
                const locked = !isLanguageUnlocked(lang.code);
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.pickerItem,
                      targetLang === lang.code && { borderColor: lang.color, backgroundColor: lang.color + '15' },
                      locked && styles.lockedItem,
                    ]}
                    onPress={() => {
                      if (locked) {
                        setShowLangPicker(false);
                        setTimeout(() => setShowPremiumScreen(true), 300);
                        return;
                      }
                      hapticFeedback();
                      setTargetLang(lang.code);
                      setShowLangPicker(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pickerFlag}>{lang.flag}</Text>
                    <View style={styles.pickerInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.pickerName}>{lang.name}</Text>
                        {locked && <Ionicons name="lock-closed" size={14} color="#00F5FF" />}
                      </View>
                      <Text style={styles.pickerNative}>{lang.native}</Text>
                    </View>
                    {targetLang === lang.code && (
                      <View style={[styles.pickerCheck, { backgroundColor: lang.color }]}>
                        <Ionicons name='checkmark-circle' size={22} color={"#fff"}/>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
              
              <Text style={styles.pickerSectionTitle}>ALL LANGUAGES</Text>
              {otherLangs.map((lang) => {
                const locked = !isLanguageUnlocked(lang.code);
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.pickerItem,
                      targetLang === lang.code && { borderColor: lang.color, backgroundColor: lang.color + '15' },
                      locked && styles.lockedItem,
                    ]}
                    onPress={() => {
                      if (locked) {
                        setShowLangPicker(false);
                        setTimeout(() => setShowPremiumScreen(true), 300);
                        return;
                      }
                      hapticFeedback();
                      setTargetLang(lang.code);
                      setShowLangPicker(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.pickerFlag}>{lang.flag}</Text>
                    <View style={styles.pickerInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.pickerName}>{lang.name}</Text>
                        {locked && <Ionicons name="lock-closed" size={14} color="#00F5FF" />}
                      </View>
                      <Text style={styles.pickerNative}>{lang.native}</Text>
                    </View>
                    {targetLang === lang.code && (
                      <View style={[styles.pickerCheck, { backgroundColor: lang.color }]}>
                        <Ionicons name='checkmark-circle' size={22} color={"#fff"}/>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
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
            <Text style={styles.subtitle}>African Voice Translator</Text>

            {/* Header Actions */}
            <View style={styles.headerActions}>
              <TouchableOpacity
                 style={styles.settingsBtn}
                 onPress={() => setShowSettings(true)}
              >
                <Ionicons name="settings-outline" size={24} color="#fff"/>
              </TouchableOpacity>
            </View>
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
              <Ionicons name='swap-horizontal' size={24} color={"#fff"}/>
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
            
            {/* Translation Counter - Only for free users */}
            {!isPremium && (
              <View style={styles.translationCounter}>
                <Text style={styles.counterText}>
                  {getRemainingTranslations()} translations left today
                </Text>
                <TouchableOpacity
                  style={styles.upgradeBtn}
                  onPress={() => setShowPremiumScreen(true)}
                >
                  <Ionicons name="diamond" size={16} color="#000" />
                  <Text style={styles.upgradeBtnText}>Upgrade</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Conversation Mode Toggle */}
            <TouchableOpacity 
              style={styles.conversationToggle}
              onPress={() => {
                hapticFeedback();

                if (!isPremium) {
                  Alert.alert(
                    "Premium Feature",
                    "Conversation Mode is available for Premium users only. Upgrade to unlock unlimited conversations with conversation history!",
                    [
                      { text: "Not Now", style: "cancel"},
                      {
                        text: "Upgrade Now",
                        onPress: () => setShowPremiumScreen(true),
                        style: 'default'
                      }
                    ]
                  );
                  return;
                }
                setShowConversationMode(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name='chatbubble-ellipses' size={24} color={"#ffffff"}/>
              <Text style={styles.conversationToggleText}>
                Conversation Mode
              </Text>
              {!isPremium && (
                <View style={styles.premiumLockBadge}>
                  <Ionicons name='lock-closed' size={12} color='#FFD700'/>
                </View>
              )}
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
                  <View style={styles.cardBottomRow}>
                    {downloadedPacks.includes(targetLang) && (
                      <View style={styles.offlinePackBadge}>
                        <Text style={styles.offlinePackText}>Works Offline</Text>
                      </View>
                    )}
                    <TouchableOpacity 
                      style={styles.playAgainBtn}
                      onPress={() => speakWithAfricanVoice(translatedText, targetLang)}
                    >
                      <Ionicons name='volume-high' size={22} color={"#fff"}/>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Animated.View>
          )}

          {/* Conversation Mode Modal */}
          {showConversation && (
            <Modal 
              visible={showConversation}
              animationType="slide"
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

          {/* Settings Screen Modal */}
          {showSettings && (
            <Modal 
              visible={showSettings}
              animationType='slide'
              
            >
              <SettingsScreen 
                onClose={() => setShowSettings(false)}
                onOpenPremium={() => {
                  setShowSettings(false);
                  setShowPremiumScreen(true);
                }}
              />
            </Modal>
          )}

          {/* Premium Screen Modal */}
          {showPremiumScreen && (
            <Modal
              visible={showPremiumScreen}
              animationType="slide"
              presentationStyle="fullScreen"
            >
              <PremiumScreen onClose={() => setShowPremiumScreen(false)} />
            </Modal>
          )}

          {!hasInteracted && (
            <View style={styles.instructions}>
              <Text style={styles.instructionText}>1. Choose target language above</Text>
              <Text style={styles.instructionText}>2. Tap circle and speak</Text>
              <Text style={styles.instructionText}>3. Listen to instant translation</Text>
              {!isPremium && (
                <Text style={styles.instructionHighlight}>
                  💎 Upgrade for unlimited translations
                </Text>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.connectionStatus}>
          <Animated.View 
            style={[
              styles.statusDot, 
              { 
                backgroundColor: isOnline ? "#22c55e" : "#ef4444", 
                transform: [{ scale: pulseAnim1 }],
              }
            ]}
          />
          <Text style={styles.statusText}>
            {isOnline ? "Online" : "Offline"}
          </Text>
        </View>
      </LinearGradient>
      <LanguagePicker />
      <SourceLanguagePicker />
    </View>
  );
}

// Main app wrapper with Premium Provider
export default function AppWrapper() {
  return (
    <PremiumProvider>
      <App />
    </PremiumProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingTop: 25,
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
    paddingBottom: 25,
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    marginTop: 26,
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
  headerActions:{
    position:'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,

  },
  settingsBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  premiumBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  premiumLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
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
  translationCounter: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    width: width - 40,
  },
  counterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F5FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  upgradeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  autoDetectItem: {
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  conversationToggle: {
    position: 'relative',
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
  conversationToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
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
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 10,
  },
  offlinePackBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  offlinePackText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  playAgainBtn: {
    flexDirection: 'row',
    backgroundColor: '#00F5FF',
    padding: 6,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#00F5FF',
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
  instructionHighlight: {
    fontSize: 14,
    color: '#00F5FF',
    marginTop: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  connectionStatus: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 25,
    left: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5, 
    marginRight: 6,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 6, 
    elevation: 6,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
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
  lockedItem: {
    opacity: 0.7,
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
});