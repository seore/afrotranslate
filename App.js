import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Vibration,
  Easing,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AFRICAN_LANGUAGES = [
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', popular: true, color: '#00F5FF' },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá', flag: '🇳🇬', popular: true, color: '#FF0080' },
  { code: 'ha', name: 'Hausa', native: 'Hausa', flag: '🇳🇬', popular: true, color: '#00FF94' },
  { code: 'ig', name: 'Igbo', native: 'Igbo', flag: '🇳🇬', popular: true, color: '#FFD700' },
  { code: 'zu', name: 'Zulu', native: 'isiZulu', flag: '🇿🇦', popular: true, color: '#FF6B35' },
  { code: 'xh', name: 'Xhosa', native: 'isiXhosa', flag: '🇿🇦', popular: false, color: '#9D00FF' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦', popular: false, color: '#FF3366' },
  { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹', popular: true, color: '#00FFD1' },
  { code: 'so', name: 'Somali', native: 'Soomaali', flag: '🇸🇴', popular: false, color: '#4D9FFF' },
  { code: 'rw', name: 'Kinyarwanda', native: 'Kinyarwanda', flag: '🇷🇼', popular: false, color: '#FF0066' },
  { code: 'ny', name: 'Chichewa', native: 'Chichewa', flag: '🇲🇼', popular: false, color: '#00FFAA' },
  { code: 'sn', name: 'Shona', native: 'Shona', flag: '🇿🇼', popular: false, color: '#FFAA00' },
  { code: 'st', name: 'Sesotho', native: 'Sesotho', flag: '🇱🇸', popular: false, color: '#AA00FF' },
  { code: 'mg', name: 'Malagasy', native: 'Malagasy', flag: '🇲🇬', popular: false, color: '#FF5500' },
  { code: 'en', name: 'English', native: 'English', flag: '🌍', popular: true, color: '#1E90FF' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', popular: true, color: '#FF69B4' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', popular: true, color: '#00E5FF' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', popular: true, color: '#FF4444' },
];

const COMMON_PHRASES = [
  { en: 'Hello', category: 'Greetings', icon: '👋' },
  { en: 'Good morning', category: 'Greetings', icon: '🌅' },
  { en: 'Good evening', category: 'Greetings', icon: '🌆' },
  { en: 'How are you?', category: 'Greetings', icon: '😊' },
  { en: 'Thank you', category: 'Basics', icon: '🙏' },
  { en: 'Please', category: 'Basics', icon: '🤝' },
  { en: 'Yes', category: 'Basics', icon: '✅' },
  { en: 'No', category: 'Basics', icon: '❌' },
  { en: 'Excuse me', category: 'Basics', icon: '🙋' },
  { en: 'I need help', category: 'Emergency', icon: '🆘' },
  { en: 'Where is the bathroom?', category: 'Travel', icon: '🚻' },
  { en: 'How much?', category: 'Shopping', icon: '💰' },
  { en: 'Water please', category: 'Food', icon: '💧' },
  { en: 'I am lost', category: 'Emergency', icon: '🗺️' },
  { en: 'Call the police', category: 'Emergency', icon: '👮' },
  { en: 'Where is the hospital?', category: 'Emergency', icon: '🏥' },
  { en: 'Goodbye', category: 'Greetings', icon: '👋' },
  { en: 'See you later', category: 'Greetings', icon: '👀' },
  { en: 'My name is', category: 'Basics', icon: '📛' },
  { en: 'Nice to meet you', category: 'Basics', icon: '🤝' },
];

// Offline phrase translations (basic common phrases)
const OFFLINE_TRANSLATIONS = {
  'sw': {
    'Hello': 'Habari',
    'Thank you': 'Asante',
    'Yes': 'Ndiyo',
    'No': 'Hapana',
    'Please': 'Tafadhali',
    'Good morning': 'Habari ya asubuhi',
    'Good evening': 'Habari ya jioni',
    'How are you?': 'Habari yako?',
  },
  'yo': {
    'Hello': 'Bawo',
    'Thank you': 'E se',
    'Yes': 'Bẹẹni',
    'No': 'Rara',
    'Please': 'Jọwọ',
  },
  'ha': {
    'Hello': 'Sannu',
    'Thank you': 'Na gode',
    'Yes': 'Eh',
    'No': 'A\'a',
    'Please': 'Don Allah',
  },
  'zu': {
    'Hello': 'Sawubona',
    'Thank you': 'Ngiyabonga',
    'Yes': 'Yebo',
    'No': 'Cha',
    'Please': 'Ngiyacela',
  },
  'ig': {
    'Hello': 'Ndewo',
    'Thank you': 'Daalụ',
    'Yes': 'Ee',
    'No': 'Mba',
    'Please': 'Biko',
  },
};

export default function App() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('sw');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [translationSource, setTranslationSource] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [activeTab, setActiveTab] = useState('translate');
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [characterCount, setCharacterCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [showPhrasebook, setShowPhrasebook] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));
  const [translateAnim] = useState(new Animated.Value(1));
  const [fabScale] = useState(new Animated.Value(1));
  const [tabIndicatorAnim] = useState(new Animated.Value(0));
  const [loadingDots] = useState(new Animated.Value(0));
  const [toastAnim] = useState(new Animated.Value(0));
  
  // Button press animations
  const [speakPressAnim] = useState(new Animated.Value(1));
  const [copyPressAnim] = useState(new Animated.Value(1));
  const [favoritePressAnim] = useState(new Animated.Value(1));
  const [sharePressAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    startGlowAnimation();
    startLoadingDotsAnimation();
    loadData();
    
    // Check network status by trying to fetch a small resource
    const checkNetworkStatus = async () => {
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
    
    checkNetworkStatus();
    
    // Check network status every 10 seconds
    const intervalId = setInterval(checkNetworkStatus, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Show toast when going offline
  useEffect(() => {
    if (!isOnline) {
      showToast('📡 Offline - Limited features');
    }
  }, [isOnline]);

  useEffect(() => {
    const tabIndex = activeTab === 'translate' ? 0 : 1;
    Animated.spring(tabIndicatorAnim, {
      toValue: tabIndex,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

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

  const startLoadingDotsAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingDots, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(loadingDots, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const hapticFeedback = (type = 'light') => {
    if (Platform.OS === 'ios') {
      if (type === 'light') {
        Vibration.vibrate(10);
      } else if (type === 'medium') {
        Vibration.vibrate(20);
      } else if (type === 'heavy') {
        Vibration.vibrate([0, 30]);
      } else if (type === 'success') {
        Vibration.vibrate([0, 10, 50, 10]);
      }
    } else {
      Vibration.vibrate(50);
    }
  };

  const animateButtonPress = (animValue) => {
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(animValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showToast = (message) => {
    setToastMessage(message);
    setShowCopiedToast(true);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowCopiedToast(false));
  };

  const loadData = async () => {
    try {
      const [savedHistory, savedFavorites] = await Promise.all([
        AsyncStorage.getItem('translation_history'),
        AsyncStorage.getItem('favorites'),
      ]);
      
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const toggleFavorite = async (item) => {
    hapticFeedback('success');
    animateButtonPress(favoritePressAnim);
    
    const exists = favorites.find(f => f.source === item.source && f.translated === item.translated);
    let updated;
    
    if (exists) {
      updated = favorites.filter(f => !(f.source === item.source && f.translated === item.translated));
      showToast('⭐ Removed from favorites');
    } else {
      updated = [{...item, id: Date.now().toString()}, ...favorites];
      showToast('⭐ Added to favorites');
    }
    
    setFavorites(updated);
    await AsyncStorage.setItem('favorites', JSON.stringify(updated));
  };

  // Try offline translation first, fall back to online
  const translateText = async (text) => {
    if (!text.trim()) {
      setTranslatedText('');
      setTranslationSource(null);
      return;
    }

    setIsTranslating(true);

    try {
      // Try offline first for common phrases
      if (OFFLINE_TRANSLATIONS[targetLang] && OFFLINE_TRANSLATIONS[targetLang][text.trim()]) {
        const translated = OFFLINE_TRANSLATIONS[targetLang][text.trim()];
        setTranslatedText(translated);
        setTranslationSource({ 
          type: 'offline',
          method: 'Offline'
        });
        hapticFeedback('light');
        
        const newItem = {
          id: Date.now().toString(),
          source: text,
          translated,
          sourceLang,
          targetLang,
          timestamp: new Date().toISOString(),
        };
        
        const updated = [newItem, ...history].slice(0, 50);
        setHistory(updated);
        await AsyncStorage.setItem('translation_history', JSON.stringify(updated));
        setIsTranslating(false);
        return;
      }

      // Check if online
      if (!isOnline) {
        Alert.alert('Offline', 'No internet connection. Only common phrases available offline.');
        setIsTranslating(false);
        return;
      }

      // Online Google Translate
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      const translated = data[0].map(item => item[0]).join('');
      
      setTranslatedText(translated);
      setTranslationSource({ 
        type: 'google',
        method: 'Google Translate'
      });
      
      hapticFeedback('light');
      
      const newItem = {
        id: Date.now().toString(),
        source: text,
        translated,
        sourceLang,
        targetLang,
        timestamp: new Date().toISOString(),
      };
      
      const updated = [newItem, ...history].slice(0, 50);
      setHistory(updated);
      await AsyncStorage.setItem('translation_history', JSON.stringify(updated));

    } catch (error) {
      Alert.alert('Error', 'Translation failed. Check your internet connection.');
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const startVoiceInput = async () => {
    hapticFeedback('medium');
    setIsListening(true);
    
    Alert.alert(
      '🎤 Voice Input', 
      'Voice input requires additional setup. For now, please type your text.',
      [{ text: 'OK', onPress: () => setIsListening(false) }]
    );
  };

  // Auto-detect language (simple heuristic)
  const detectLanguage = (text) => {
    // Simple detection based on character patterns
    if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic
    if (/[\u1200-\u137F]/.test(text)) return 'am'; // Amharic
    // Add more patterns as needed
    return 'en'; // Default to English
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (sourceText.trim()) {
        translateText(sourceText);
      } else {
        setTranslatedText('');
        setTranslationSource(null);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [sourceText, sourceLang, targetLang]);

  const swapLanguages = () => {
    hapticFeedback('medium');
    const tempLang = sourceLang;
    const tempText = sourceText;
    
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  useEffect(() => {
    setCharacterCount(sourceText.length);
  }, [sourceText]);

  const copyToClipboard = async (text) => {
    hapticFeedback('success');
    animateButtonPress(copyPressAnim);
    await Clipboard.setStringAsync(text);
    showToast('📋 Copied to clipboard');
  };

  const shareTranslation = async () => {
    hapticFeedback('success');
    animateButtonPress(sharePressAnim);
    
    try {
      await Share.share({
        message: `${sourceText}\n\n${getLanguageInfo(sourceLang)?.flag} → ${getLanguageInfo(targetLang)?.flag}\n\n${translatedText}\n\nTranslated with GRIOT`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const speakText = (text, lang) => {
    if (!text.trim()) return;
    hapticFeedback('light');
    animateButtonPress(speakPressAnim);
    Speech.speak(text, { language: lang, pitch: 1.0, rate: 0.85 });
  };

  const getLanguageInfo = (code) => AFRICAN_LANGUAGES.find(l => l.code === code);
  const getLanguageColor = (code) => getLanguageInfo(code)?.color || '#00F5FF';

  const loadHistoryItem = (item) => {
    hapticFeedback('light');
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setSourceText(item.source);
    setTranslatedText(item.translated);
    setTranslationSource({ type: item.translationType });
    setActiveTab('translate');
  };

  const translatePhrase = (phrase) => {
    hapticFeedback('light');
    setSourceText(phrase);
    setShowPhrasebook(false);
    setActiveTab('translate');
  };

  const LoadingDots = () => {
    const dot1Opacity = loadingDots.interpolate({
      inputRange: [0, 0.33, 0.66, 1],
      outputRange: [0.3, 1, 0.3, 0.3],
    });
    const dot2Opacity = loadingDots.interpolate({
      inputRange: [0, 0.33, 0.66, 1],
      outputRange: [0.3, 0.3, 1, 0.3],
    });
    const dot3Opacity = loadingDots.interpolate({
      inputRange: [0, 0.33, 0.66, 1],
      outputRange: [0.3, 0.3, 0.3, 1],
    });

    return (
      <View style={styles.loadingDotsContainer}>
        <Animated.View style={[styles.loadingDot, { opacity: dot1Opacity }]} />
        <Animated.View style={[styles.loadingDot, { opacity: dot2Opacity }]} />
        <Animated.View style={[styles.loadingDot, { opacity: dot3Opacity }]} />
      </View>
    );
  };

  const ToastNotification = () => {
    if (!showCopiedToast) return null;

    return (
      <Animated.View style={[
        styles.toast,
        {
          opacity: toastAnim,
          transform: [{
            translateY: toastAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            })
          }]
        }
      ]}>
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>
    );
  };

  const LanguagePicker = ({ visible, onClose, selectedLang, onSelect, title }) => {
    if (!visible) return null;

    const popularLangs = AFRICAN_LANGUAGES.filter(l => l.popular);
    const otherLangs = AFRICAN_LANGUAGES.filter(l => !l.popular);

    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.pickerOverlay}>
          <TouchableOpacity style={styles.pickerBackdrop} activeOpacity={1} onPress={onClose} />
          <Animated.View style={[styles.pickerContainer, { opacity: fadeAnim }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.pickerClose}>
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
                    selectedLang === lang.code && { borderColor: lang.color, backgroundColor: lang.color + '15' },
                  ]}
                  onPress={() => {
                    hapticFeedback('light');
                    onSelect(lang.code);
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pickerFlag}>{lang.flag}</Text>
                  <View style={styles.pickerInfo}>
                    <Text style={styles.pickerName}>{lang.name}</Text>
                    <Text style={styles.pickerNative}>{lang.native}</Text>
                  </View>
                  {selectedLang === lang.code && (
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
                    selectedLang === lang.code && { borderColor: lang.color, backgroundColor: lang.color + '15' },
                  ]}
                  onPress={() => {
                    hapticFeedback('light');
                    onSelect(lang.code);
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pickerFlag}>{lang.flag}</Text>
                  <View style={styles.pickerInfo}>
                    <Text style={styles.pickerName}>{lang.name}</Text>
                    <Text style={styles.pickerNative}>{lang.native}</Text>
                  </View>
                  {selectedLang === lang.code && (
                    <View style={[styles.pickerCheck, { backgroundColor: lang.color }]}>
                      <Text style={styles.pickerCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  // Phrasebook Modal
  const PhrasebookModal = () => {
    const categories = ['All', ...new Set(COMMON_PHRASES.map(p => p.category))];
    const filteredPhrases = selectedCategory === 'All' 
      ? COMMON_PHRASES 
      : COMMON_PHRASES.filter(p => p.category === selectedCategory);

    return (
      <Modal visible={showPhrasebook} transparent animationType="slide" onRequestClose={() => setShowPhrasebook(false)}>
        <View style={styles.pickerOverlay}>
          <TouchableOpacity style={styles.pickerBackdrop} activeOpacity={1} onPress={() => setShowPhrasebook(false)} />
          <View style={styles.phrasebookContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>📚 Common Phrases</Text>
              <TouchableOpacity onPress={() => setShowPhrasebook(false)} style={styles.pickerClose}>
                <Text style={styles.pickerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                  onPress={() => {
                    hapticFeedback('light');
                    setSelectedCategory(cat);
                  }}
                >
                  <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <ScrollView style={styles.phrasebookScroll}>
              {filteredPhrases.map((phrase, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.phraseItem}
                  onPress={() => translatePhrase(phrase.en)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.phraseIcon}>{phrase.icon}</Text>
                  <View style={styles.phraseInfo}>
                    <Text style={styles.phraseText}>{phrase.en}</Text>
                    <Text style={styles.phraseCategory}>{phrase.category}</Text>
                  </View>
                  <Text style={styles.phraseArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const TranslateTab = React.useMemo(() => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.tabContainer}
    >
      <ScrollView 
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Offline indicator */}
        {!isOnline && (
          <View style={styles.offlineBar}>
            <Text style={styles.offlineText}>📡 Offline Mode - Limited to common phrases</Text>
          </View>
        )}

        <View style={styles.languageSelector}>
          <TouchableOpacity
            style={[styles.langButton, { borderColor: getLanguageColor(sourceLang) }]}
            onPress={() => {
              hapticFeedback('light');
              setShowSourcePicker(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.langFlag}>{getLanguageInfo(sourceLang)?.flag}</Text>
            <Text style={[styles.langText, { color: getLanguageColor(sourceLang) }]}>
              {getLanguageInfo(sourceLang)?.name}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.swapBtn} onPress={swapLanguages} activeOpacity={0.7}>
            <LinearGradient
              colors={['#00F5FF', '#FF0080']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.swapGradient}
            >
              <Text style={styles.swapText}>⇄</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langButton, { borderColor: getLanguageColor(targetLang) }]}
            onPress={() => {
              hapticFeedback('light');
              setShowTargetPicker(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.langFlag}>{getLanguageInfo(targetLang)?.flag}</Text>
            <Text style={[styles.langText, { color: getLanguageColor(targetLang) }]}>
              {getLanguageInfo(targetLang)?.name}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick phrase button */}
        <TouchableOpacity 
          style={styles.phraseButton}
          onPress={() => {
            hapticFeedback('light');
            setShowPhrasebook(true);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.phraseButtonText}>📚 Common Phrases</Text>
        </TouchableOpacity>

        <View style={[styles.card, { borderLeftColor: getLanguageColor(sourceLang) }]}>
          <View style={styles.cardTop}>
            <Text style={[styles.cardLabel, { color: getLanguageColor(sourceLang) }]}>FROM</Text>
            <View style={styles.cardActions}>
              <Animated.View style={{ transform: [{ scale: speakPressAnim }] }}>
                <TouchableOpacity 
                  onPress={startVoiceInput} 
                  style={[styles.actionBtn, isListening && styles.actionBtnActive]}
                >
                  <Text style={styles.actionIcon}>🎤</Text>
                </TouchableOpacity>
              </Animated.View>
              
              {sourceText.length > 0 && (
                <>
                  <Animated.View style={{ transform: [{ scale: speakPressAnim }] }}>
                    <TouchableOpacity 
                      onPress={() => speakText(sourceText, sourceLang)} 
                      style={styles.actionBtn}
                    >
                      <Text style={styles.actionIcon}>🔊</Text>
                    </TouchableOpacity>
                  </Animated.View>
                  <TouchableOpacity 
                    onPress={() => {
                      hapticFeedback('light');
                      setSourceText('');
                    }} 
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionIcon}>✕</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
          <TextInput
            style={styles.input}
            value={sourceText}
            onChangeText={setSourceText}
            placeholder="Type or speak..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
            maxLength={500}
            autoFocus={false}
            blurOnSubmit={false}
          />
          {sourceText.length > 0 && (
            <Text style={styles.charCount}>{characterCount}/500 characters</Text>
          )}
        </View>

        <View style={[styles.card, { borderLeftColor: getLanguageColor(targetLang) }]}>
          <View style={styles.cardTop}>
            <Text style={[styles.cardLabel, { color: getLanguageColor(targetLang) }]}>TO</Text>
            {translatedText.length > 0 && (
              <View style={styles.cardActions}>
                <Animated.View style={{ transform: [{ scale: speakPressAnim }] }}>
                  <TouchableOpacity 
                    onPress={() => speakText(translatedText, targetLang)} 
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionIcon}>🔊</Text>
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: copyPressAnim }] }}>
                  <TouchableOpacity 
                    onPress={() => copyToClipboard(translatedText)} 
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionIcon}>📋</Text>
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: sharePressAnim }] }}>
                  <TouchableOpacity 
                    onPress={shareTranslation} 
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionIcon}>📤</Text>
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: favoritePressAnim }] }}>
                  <TouchableOpacity
                    onPress={() => toggleFavorite({ 
                      source: sourceText, 
                      translated: translatedText, 
                      sourceLang, 
                      targetLang 
                    })}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionIcon}>
                      {favorites.find(f => f.source === sourceText && f.translated === translatedText) ? '⭐' : '☆'}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            )}
          </View>
          <View style={styles.output}>
            {isTranslating ? (
              <View style={styles.loading}>
                <LoadingDots />
                <Text style={styles.loadingText}>Translating...</Text>
              </View>
            ) : translatedText ? (
              <>
                <Text style={styles.outputText}>{translatedText}</Text>
                {translationSource && (
                  <View style={styles.sourceIndicator}>
                    <Text style={styles.sourceText}>
                      {translationSource.type === 'offline' ? '📱 Offline' : '🌐 Online'}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.placeholder}>Translation appears here...</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <ToastNotification />
    </KeyboardAvoidingView>
  ), [sourceText, translatedText, isTranslating, sourceLang, targetLang, characterCount, favorites, isListening, showCopiedToast, toastAnim, speakPressAnim, copyPressAnim, favoritePressAnim, sharePressAnim, translationSource, isOnline]);

  const HistoryTab = () => (
    <View style={styles.tabContainer}>
      <View style={styles.tabHeaderBar}>
        <Text style={styles.tabHeaderTitle}>📜 History</Text>
        {history.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              hapticFeedback('medium');
              Alert.alert(
                'Clear History',
                'Are you sure you want to clear all translation history?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Clear', 
                    style: 'destructive',
                    onPress: () => {
                      setHistory([]);
                      AsyncStorage.removeItem('translation_history');
                      showToast('🗑️ History cleared');
                    }
                  }
                ]
              );
            }}
            style={styles.clearBtn}
          >
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>No history yet</Text>
          <Text style={styles.emptySubtext}>Your translations will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.historyCard} 
              onPress={() => loadHistoryItem(item)} 
              activeOpacity={0.8}
            >
              <View style={styles.historyTop}>
                <Text style={styles.historyLang}>
                  {getLanguageInfo(item.sourceLang)?.flag} → {getLanguageInfo(item.targetLang)?.flag}
                </Text>
                <TouchableOpacity onPress={() => toggleFavorite(item)}>
                  <Text style={styles.favoriteBtn}>
                    {favorites.find(f => f.source === item.source && f.translated === item.translated) ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.historySource}>{item.source}</Text>
              <Text style={styles.historyTrans}>{item.translated}</Text>
              <Text style={styles.historyTime}>
                {new Date(item.timestamp).toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A']}
        style={styles.header}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <Text style={styles.logo}>GRIOT</Text>
          <Text style={styles.subtitle}>African Language Translator</Text>
          <Animated.View style={[styles.logoGlow, {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.8]
            })
          }]} />
        </Animated.View>
      </LinearGradient>

      <View style={styles.tabBar}>
        <Animated.View style={[
          styles.tabIndicator,
          {
            transform: [{
              translateX: tabIndicatorAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, width / 2],
              })
            }]
          }
        ]} />
        
        <TouchableOpacity
          style={styles.tab}
          onPress={() => {
            hapticFeedback('light');
            setActiveTab('translate');
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'translate' && styles.tabTextActive]}>Translate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.tab}
          onPress={() => {
            hapticFeedback('light');
            setActiveTab('history');
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'translate' && TranslateTab}
        {activeTab === 'history' && <HistoryTab />}
      </View>

      <LanguagePicker
        visible={showSourcePicker}
        onClose={() => setShowSourcePicker(false)}
        selectedLang={sourceLang}
        onSelect={setSourceLang}
        title="Select Language"
      />

      <LanguagePicker
        visible={showTargetPicker}
        onClose={() => setShowTargetPicker(false)}
        selectedLang={targetLang}
        onSelect={setTargetLang}
        title="Translate To"
      />

      <PhrasebookModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 1,
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 40,
    backgroundColor: '#00F5FF',
    borderRadius: 20,
    opacity: 0.3,
    shadowColor: '#00F5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingTop: 8,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width / 2,
    height: 2,
    backgroundColor: '#00F5FF',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#00F5FF',
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
  },
  tabScroll: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
    paddingBottom: 100,
  },
  offlineBar: {
    backgroundColor: '#FF6B3540',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF6B35',
    alignItems: 'center',
  },
  offlineText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  langButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 2,
  },
  langFlag: {
    fontSize: 24,
  },
  langText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  swapBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  swapGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  phraseButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF0080',
    alignItems: 'center',
  },
  phraseButtonText: {
    color: '#FF0080',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnActive: {
    backgroundColor: '#FF008040',
  },
  actionIcon: {
    fontSize: 14,
  },
  input: {
    fontSize: 18,
    color: '#FFFFFF',
    minHeight: 80,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
  },
  charCount: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
    textAlign: 'right',
    fontWeight: '600',
  },
  output: {
    minHeight: 80,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    justifyContent: 'center',
  },
  outputText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  placeholder: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
  loading: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#00F5FF',
    marginTop: 8,
    fontWeight: '600',
  },
  loadingDotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00F5FF',
  },
  sourceIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(0,245,255,0.1)',
    marginTop: 8,
  },
  sourceText: {
    fontSize: 10,
    color: '#00F5FF',
    fontWeight: '700',
  },
  toast: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: '#00FF94',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#00FF94',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  tabHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tabHeaderTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  clearBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,0,128,0.2)',
  },
  clearText: {
    color: '#FF0080',
    fontWeight: '700',
    fontSize: 13,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  historyCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  historyLang: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
  },
  favoriteBtn: {
    fontSize: 18,
  },
  historySource: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 6,
  },
  historyTrans: {
    fontSize: 15,
    color: '#999',
    marginBottom: 6,
  },
  historyTime: {
    fontSize: 11,
    color: '#555',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
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
  phrasebookContainer: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.75,
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
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 5,
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
  categoryScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#00F5FF',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
  },
  categoryChipTextActive: {
    color: '#000',
  },
  phrasebookScroll: {
    flex: 1,
    padding: 20,
  },
  phraseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 2,
  },
  phraseIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  phraseInfo: {
    flex: 1,
  },
  phraseText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  phraseCategory: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  phraseArrow: {
    fontSize: 18,
    color: '#00F5FF',
    fontWeight: '700',
  },
});