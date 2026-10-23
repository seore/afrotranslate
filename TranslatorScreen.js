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
  TextInput,
  Keyboard,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, AudioSource } from 'expo-audio';
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import { EventEmitter } from 'expo-modules-core';

import { usePremium } from './PremiumContext';
import { PaywallModalContent } from './screens/paywall/PaywallScreen';
import AdvancedConversationMode from './AdvancedConversationMode.js';
import SettingsScreen from './settingsScreen.js';

import VoiceTranslationService from './services/voiceTranslationService';
import ElevenLabsService from './services/elevenlabsService.js';
import { createSpeaker } from './services/ttsService';
import { lookupCoursePhrase } from './services/coursePhrases';

const { height } = Dimensions.get('window');

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
  // Tone-marked to match the lessons (content/yo/course.json).
  'yo': {
    'Hello': 'Báwo ni',
    'Good morning': 'Ẹ káàárọ̀',
    'Good evening': 'Ẹ káalẹ́',
    'Thank you': 'Ẹ ṣé',
    'Please': 'Ẹ jọ̀wọ́',
    'Yes': 'Bẹ́ẹ̀ni',
    'No': 'Rárá',
    'How are you?': 'Báwo ni?',
    'Goodbye': 'Ó dàbọ̀',
    'I need help': 'Mo nílò ìrànlọ́wọ́',
    'Where is the bathroom?': 'Níbo ni ilé ìgbọ̀nsẹ̀ wà?',
    'How much?': 'Èló ni?',
    'Water': 'Omi',
    'Food': 'Oúnjẹ',
    'Help': 'Ìrànlọ́wọ́',
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

// Source languages voice input supports; others are typed.
const SPEECH_RECOGNITION_LANGS = ['en', 'fr', 'ar', 'pt', 'sw'];

export default function TranslatorScreen() {
  // Premium hook
  const {
    isPremium,
    isLanguageUnlocked,
    incrementTranslationCount,
  } = usePremium();

  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('sw');
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  // Where the result came from: 'course' | 'offline' | 'machine'
  const [translationSource, setTranslationSource] = useState(null);
  const [translationAudio, setTranslationAudio] = useState(null);
  const [typedText, setTypedText] = useState('');
  const [inputMode, setInputMode] = useState('voice');
  const typeInputRef = useRef(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showSourceLangPicker, setShowSourceLangPicker] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [recognizing, setRecognizing] = useState(false);
  const [interimResults, setInterimResults] = useState('');
  const [conversationMode, setConversationMode] = useState(false);
  const [downloadedPacks, setDownloadedPacks] = useState(['sw', 'yo', 'ha', 'zu', 'ig']);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showConversation, setShowConversationMode] = useState(false);
  const [autoDetectMode, setAutoDetectMode] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);
  const [showPremiumScreen, setShowPremiumScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [useNativeVoice, setUseNativeVoice] = useState(true);
  const [voiceGender, setVoiceGender] = useState('male');
  
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));

  const player = useAudioPlayer();

  useEffect(() => {
    startPulseAnimation();
    startGlowAnimation();
    checkNetwork();
    configureAudio();
    loadVoiceIds();
    
    const interval = setInterval(checkNetwork, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const configureAudio = async () => {
    try {
      console.log('Audio configured for loud playback');
    } catch (error) {
      console.error('Audio configuration error:', error);
    }
  };

  const loadVoiceIds = () => {
    // ElevenLabsService.setVoiceId('yo', 'male', 'YOUR_YORUBA_MALE_VOICE_ID');
    // ElevenLabsService.setVoiceId('yo', 'female', 'YOUR_YORUBA_FEMALE_VOICE_ID');
    
    console.log('Voice IDs loaded (add actual IDs after cloning voices)');
  };

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
            setInputMode('voice');
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

  // Asked when the mic is first needed, not on launch. Returns whether granted.
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
      return result.granted;
    } catch (error) {
      console.error("Permission error:", error);
      return false;
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
    
    try {
      if (recognizing) {
        await ExpoSpeechRecognitionModule.stop();
        return;
      }

      // Don't silently listen in English for languages iOS can't recognise.
      if (!autoDetectMode && !SPEECH_RECOGNITION_LANGS.includes(sourceLang)) {
        const name = getLanguageInfo(sourceLang)?.name;
        Alert.alert(
          'Voice input not available',
          `Speech recognition doesn't support ${name} yet. Type your ${name} in the box below instead.`,
          [{ text: 'OK', onPress: () => typeInputRef.current?.focus() }]
        );
        return;
      }

      if (!(await requestPermissions())) return;

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

  const submitTypedText = () => {
    const text = typedText.trim();
    if (!text) return;
    Keyboard.dismiss();
    hapticFeedback();
    setInputMode('text');
    setSourceText(text);
    setTypedText('');
    translateText(text);
  };

  const translateText = async (text) => {
    if (!text.trim()) return;

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

      // Phrases the course teaches: answer with the checked course text
      // (and its native recording) instead of machine translation.
      const known = lookupCoursePhrase(text, fromLang, targetLang);
      if (known) {
        setTranslatedText(known.text);
        setTranslationSource('course');
        setTranslationAudio(known.audio);

        if (conversationMode) {
          setConversationHistory(prev => [...prev, {
            source: text,
            translated: known.text,
            sourceLang: fromLang,
            targetLang,
            timestamp: new Date(),
          }]);
        }

        if (!isPremium) {
          await incrementTranslationCount();
        }

        setTimeout(() => {
          speakTranslation(known.text, targetLang, known.audio);
        }, 500);

        setIsTranslating(false);
        return;
      }

      if (!isOnline || downloadedPacks.includes(targetLang)) {
        const offlinePack = OFFLINE_PACKS[targetLang];
        if (offlinePack && offlinePack[text]) {
          const translated = offlinePack[text];
          setTranslatedText(translated);
          setTranslationSource('offline');
          setTranslationAudio(null);
          
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
      setTranslationSource('machine');
      setTranslationAudio(null);
      
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
  
  const { speakWithAfricanVoice, playAudioFile } = createSpeaker(player, () => ({ useNativeVoice, voiceGender }));

  // Course phrases with a native recording play it; everything else uses TTS.
  const speakTranslation = (text, langCode, audio) =>
    audio ? playAudioFile(audio) : speakWithAfricanVoice(text, langCode);

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
                const hasNativeVoice = VoiceTranslationService.hasNativeVoice(lang.code, voiceGender);
                
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
                        {hasNativeVoice && isPremium && (
                          <View style={styles.nativeVoiceBadge}>
                            <Ionicons name="mic" size={12} color="#00F5FF" />
                          </View>
                        )}
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
                const hasNativeVoice = VoiceTranslationService.hasNativeVoice(lang.code, voiceGender);
                
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
                        {hasNativeVoice && isPremium && (
                          <View style={styles.nativeVoiceBadge}>
                            <Ionicons name="mic" size={12} color="#00F5FF" />
                          </View>
                        )}
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
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
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

            {/* Typed input: works for every language, including ones voice input can't hear */}
            <View style={styles.typeRow}>
              <TextInput
                ref={typeInputRef}
                style={styles.typeInput}
                value={typedText}
                onChangeText={setTypedText}
                placeholder={`Or type in ${autoDetectMode ? 'any language' : getLanguageInfo(sourceLang)?.name}`}
                placeholderTextColor="#666"
                returnKeyType="go"
                onSubmitEditing={submitTypedText}
                autoCorrect={false}
                accessibilityLabel="Type text to translate"
              />
              <TouchableOpacity
                style={[styles.typeSend, !typedText.trim() && styles.typeSendDisabled]}
                onPress={submitTypedText}
                disabled={!typedText.trim()}
                accessibilityRole="button"
                accessibilityLabel="Translate"
              >
                <Ionicons name="arrow-forward" size={22} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Translations are unlimited for everyone; extra languages need Premium */}
            {!isPremium && (
              <TouchableOpacity
                onPress={() => setShowPremiumScreen(true)}
                style={styles.premiumLink}
                accessibilityRole="link"
                accessibilityLabel="7 more languages with Premium. See plans"
              >
                <Text style={styles.premiumLinkText}>💎 7 more languages with Premium ›</Text>
              </TouchableOpacity>
            )}
            
            
            {/* Conversation Mode Toggle */}
            <TouchableOpacity 
              style={styles.conversationToggle}
              onPress={async () => {
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
                if (!(await requestPermissions())) return;
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
                  <Text style={styles.textLabel}>{inputMode === 'text' ? 'You typed:' : 'You said:'}</Text>
                  <Text style={styles.textContent}>{sourceText}</Text>
                </View>
              )}
              
              {translatedText && (
                <View style={styles.textBlock}>
                  <Text style={styles.textLabel}>Translation:</Text>
                  <Text style={[styles.textContent, styles.translatedText]}>{translatedText}</Text>
                  {translationSource ? (
                    <Text style={[styles.sourceNote, translationSource === 'course' && styles.sourceNoteCourse]}>
                      {translationSource === 'course'
                        ? '✓ From GRIOT lessons'
                        : translationSource === 'offline'
                          ? 'Offline phrase'
                          : 'Machine translation · may not be exact'}
                    </Text>
                  ) : null}
                  
                  {/* NEW: Native Voice Badge */}
                  {useNativeVoice && isPremium && VoiceTranslationService.hasNativeVoice(targetLang, voiceGender) && (
                    <View style={styles.nativeVoiceActiveBadge}>
                      <Ionicons name="mic" size={14} color="#00F5FF" />
                      <Text style={styles.nativeVoiceActiveText}>Native Voice</Text>
                    </View>
                  )}
                  
                  <View style={styles.cardBottomRow}>
                    {downloadedPacks.includes(targetLang) && (
                      <View style={styles.offlinePackBadge}>
                        <Text style={styles.offlinePackText}>Works Offline</Text>
                      </View>
                    )}
                    <TouchableOpacity 
                      style={styles.playAgainBtn}
                      onPress={() => speakTranslation(translatedText, targetLang, translationAudio)}
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
              <PaywallModalContent onClose={() => setShowPremiumScreen(false)} source="translator" />
            </Modal>
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
    paddingBottom: 10,
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
  nativeVoiceBadge: {
    backgroundColor: 'rgba(0, 245, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00F5FF',
  },
  nativeVoiceActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 245, 255, 0.15)',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00F5FF',
    alignSelf: 'flex-start',
    gap: 6,
  },
  nativeVoiceActiveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00F5FF',
  },
  langDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    marginBottom: 10
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
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
    marginHorizontal: 20,
    marginTop: 28,
  },
  typeInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#FFFFFF',
    fontSize: 16,
  },
  typeSend: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00F5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeSendDisabled: {
    opacity: 0.4,
  },
  sourceNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontWeight: '600',
  },
  sourceNoteCourse: {
    color: '#22c55e',
  },
  premiumLink: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  premiumLinkText: {
    fontSize: 14,
    color: '#00F5FF',
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