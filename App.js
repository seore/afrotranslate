import React, { useState, useEffect, useRef } from 'react';
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
  Image,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AFRICAN_LANGUAGES = [
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', greeting: 'Jambo', popular: true, color: '#FF6B35' },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá', flag: '🇳🇬', greeting: 'Ẹ káàbọ̀', popular: true, color: '#F7931E' },
  { code: 'ha', name: 'Hausa', native: 'Hausa', flag: '🇳🇬', greeting: 'Sannu', popular: true, color: '#00A859' },
  { code: 'ig', name: 'Igbo', native: 'Igbo', flag: '🇳🇬', greeting: 'Ndewo', popular: true, color: '#009245' },
  { code: 'zu', name: 'Zulu', native: 'isiZulu', flag: '🇿🇦', greeting: 'Sawubona', popular: true, color: '#007A3D' },
  { code: 'xh', name: 'Xhosa', native: 'isiXhosa', flag: '🇿🇦', greeting: 'Molo', popular: false, color: '#00843D' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦', greeting: 'Hallo', popular: false, color: '#FFB612' },
  { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹', greeting: 'ሰላም', popular: true, color: '#DA291C' },
  { code: 'so', name: 'Somali', native: 'Soomaali', flag: '🇸🇴', greeting: 'Nabad', popular: false, color: '#4189DD' },
  { code: 'rw', name: 'Kinyarwanda', native: 'Kinyarwanda', flag: '🇷🇼', greeting: 'Muraho', popular: false, color: '#00A1DE' },
  { code: 'ny', name: 'Chichewa', native: 'Chichewa', flag: '🇲🇼', greeting: 'Moni', popular: false, color: '#CE1126' },
  { code: 'sn', name: 'Shona', native: 'Shona', flag: '🇿🇼', greeting: 'Mhoro', popular: false, color: '#319F43' },
  { code: 'st', name: 'Sesotho', native: 'Sesotho', flag: '🇱🇸', greeting: 'Lumela', popular: false, color: '#00209F' },
  { code: 'mg', name: 'Malagasy', native: 'Malagasy', flag: '🇲🇬', greeting: 'Salama', popular: false, color: '#FC3D32' },
  { code: 'en', name: 'English', native: 'English', flag: '🌍', greeting: 'Hello', popular: true, color: '#1E88E5' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', greeting: 'Bonjour', popular: true, color: '#0055A4' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', greeting: 'مرحبا', popular: true, color: '#006C35' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', greeting: 'Olá', popular: true, color: '#FF0000' },
];

const PHRASE_OF_DAY = [
  { text: 'Harambee', translation: 'Pull together (Swahili)', meaning: 'Community working together for a common goal' },
  { text: 'Ubuntu', translation: 'I am because we are (Zulu)', meaning: 'Humanity towards others, interconnectedness' },
  { text: 'Sawubona', translation: 'I see you (Zulu)', meaning: 'Deeper than hello - I acknowledge your existence' },
  { text: 'Akwaaba', translation: 'Welcome (Akan)', meaning: 'You are welcome here, feel at home' },
];

const CULTURAL_NOTES = {
  'Jambo': 'In Swahili culture, greetings are important. Take time to greet properly before starting a conversation.',
  'Sawubona': 'This Zulu greeting literally means "I see you" - acknowledging someone\'s humanity and existence.',
  'Ubuntu': 'A philosophy meaning "I am because we are" - emphasizing community and interconnectedness.',
  'Harambee': 'Kenya\'s national motto meaning "pull together" - reflecting the spirit of community self-help.',
};

export default function App() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('sw');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  
  const [activeMode, setActiveMode] = useState('simple'); // simple, conversation
  const [conversations, setConversations] = useState([]);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showCulturalNote, setShowCulturalNote] = useState(null);
  const [dailyPhrase, setDailyPhrase] = useState(null);
  
  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [pulseAnim] = useState(new Animated.Value(1));
  const scrollViewRef = useRef(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    
    loadData();
    setDailyPhraseOfDay();
    startPulseAnimation();
  }, []);

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

  const setDailyPhraseOfDay = () => {
    const today = new Date().getDate();
    const phraseIndex = today % PHRASE_OF_DAY.length;
    setDailyPhrase(PHRASE_OF_DAY[phraseIndex]);
  };

  const loadData = async () => {
    try {
      const [savedHistory, savedFavorites, savedConversations] = await Promise.all([
        AsyncStorage.getItem('translation_history'),
        AsyncStorage.getItem('favorites'),
        AsyncStorage.getItem('conversations'),
      ]);
      
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedConversations) setConversations(JSON.parse(savedConversations));
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const saveToHistory = async (source, translated, srcLang, tgtLang) => {
    const newItem = {
      id: Date.now().toString(),
      source,
      translated,
      sourceLang: srcLang,
      targetLang: tgtLang,
      timestamp: new Date().toISOString(),
    };
    
    const updated = [newItem, ...history].slice(0, 50);
    setHistory(updated);
    await AsyncStorage.setItem('translation_history', JSON.stringify(updated));
  };

  const addToConversation = async (source, translated, srcLang, tgtLang) => {
    const newMessage = {
      id: Date.now().toString(),
      source,
      translated,
      sourceLang: srcLang,
      targetLang: tgtLang,
      timestamp: Date.now(),
    };
    
    const updated = [...conversations, newMessage];
    setConversations(updated);
    await AsyncStorage.setItem('conversations', JSON.stringify(updated));
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const toggleFavorite = async (item) => {
    const exists = favorites.find(f => f.source === item.source && f.translated === item.translated);
    let updated;
    
    if (exists) {
      updated = favorites.filter(f => !(f.source === item.source && f.translated === item.translated));
      Alert.alert('✓', 'Removed from favorites');
    } else {
      updated = [{...item, id: Date.now().toString()}, ...favorites];
      Alert.alert('✓', 'Added to favorites');
    }
    
    setFavorites(updated);
    await AsyncStorage.setItem('favorites', JSON.stringify(updated));
  };

  const translateText = async (text, showInHistory = true) => {
    if (!text.trim()) {
      setTranslatedText('');
      return;
    }

    setIsTranslating(true);

    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      const translated = data[0].map(item => item[0]).join('');
      setTranslatedText(translated);
      
      if (showInHistory && text.length > 2) {
        await saveToHistory(text, translated, sourceLang, targetLang);
      }

      // Check for cultural notes
      checkCulturalNote(text, translated);
    } catch (error) {
      Alert.alert('Error', 'Translation failed. Check your internet connection.');
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const checkCulturalNote = (source, translation) => {
    const text = source + ' ' + translation;
    for (const [phrase, note] of Object.entries(CULTURAL_NOTES)) {
      if (text.toLowerCase().includes(phrase.toLowerCase())) {
        setTimeout(() => setShowCulturalNote({ phrase, note }), 1000);
        break;
      }
    }
  };

  const handleSendConversation = () => {
    if (sourceText.trim() && translatedText.trim()) {
      addToConversation(sourceText, translatedText, sourceLang, targetLang);
      setSourceText('');
      setTranslatedText('');
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (sourceText.trim()) {
        translateText(sourceText);
      } else {
        setTranslatedText('');
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [sourceText, sourceLang, targetLang]);

  const swapLanguages = () => {
    const tempLang = sourceLang;
    const tempText = sourceText;
    
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('✓ Copied!', 'Text copied to clipboard');
  };

  const speakText = (text, lang) => {
    if (!text.trim()) return;
    Speech.speak(text, { 
      language: lang,
      pitch: 1.0,
      rate: 0.85,
    });
  };

  const getLanguageInfo = (code) => {
    return AFRICAN_LANGUAGES.find(l => l.code === code);
  };

  const getLanguageColor = (code) => {
    return getLanguageInfo(code)?.color || '#8B5CF6';
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
            <LinearGradient
              colors={['#FF6B35', '#F7931E', '#FDC830']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.pickerHeaderGradient}
            >
              <Text style={styles.pickerTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </LinearGradient>
            
            <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.languageSectionTitle}>POPULAR</Text>
              {popularLangs.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.pickerItem,
                    selectedLang === lang.code && { backgroundColor: lang.color + '20', borderColor: lang.color },
                  ]}
                  onPress={() => {
                    onSelect(lang.code);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerItemFlag}>{lang.flag}</Text>
                  <View style={styles.pickerItemText}>
                    <Text style={styles.pickerItemName}>{lang.name}</Text>
                    <Text style={styles.pickerItemNative}>{lang.native}</Text>
                    <Text style={styles.pickerItemGreeting}>{lang.greeting}</Text>
                  </View>
                  {selectedLang === lang.code && (
                    <View style={[styles.checkmarkCircle, { backgroundColor: lang.color }]}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              
              <Text style={styles.languageSectionTitle}>ALL LANGUAGES</Text>
              {otherLangs.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.pickerItem,
                    selectedLang === lang.code && { backgroundColor: lang.color + '20', borderColor: lang.color },
                  ]}
                  onPress={() => {
                    onSelect(lang.code);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerItemFlag}>{lang.flag}</Text>
                  <View style={styles.pickerItemText}>
                    <Text style={styles.pickerItemName}>{lang.name}</Text>
                    <Text style={styles.pickerItemNative}>{lang.native}</Text>
                    <Text style={styles.pickerItemGreeting}>{lang.greeting}</Text>
                  </View>
                  {selectedLang === lang.code && (
                    <View style={[styles.checkmarkCircle, { backgroundColor: lang.color }]}>
                      <Text style={styles.checkmark}>✓</Text>
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

  const CulturalNoteModal = () => {
    if (!showCulturalNote) return null;

    return (
      <Modal transparent visible={true} animationType="fade">
        <View style={styles.culturalOverlay}>
          <TouchableOpacity 
            style={styles.culturalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowCulturalNote(null)} 
          />
          <View style={styles.culturalCard}>
            <Text style={styles.culturalEmoji}>🎭</Text>
            <Text style={styles.culturalTitle}>Cultural Insight</Text>
            <Text style={styles.culturalPhrase}>"{showCulturalNote.phrase}"</Text>
            <Text style={styles.culturalNote}>{showCulturalNote.note}</Text>
            <TouchableOpacity 
              style={styles.culturalButton}
              onPress={() => setShowCulturalNote(null)}
            >
              <Text style={styles.culturalButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#FF6B35', '#F7931E', '#FDC830']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <Animated.Text style={[styles.headerEmoji, { transform: [{ scale: pulseAnim }] }]}>
            🌍
          </Animated.Text>
          <Text style={styles.headerTitle}>Sanfoka</Text>
          <Text style={styles.headerSubtitle}>Reclaim Your Voice</Text>
        </Animated.View>
        
        {dailyPhrase && (
          <Animated.View style={[styles.dailyPhraseContainer, { opacity: fadeAnim }]}>
            <Text style={styles.dailyPhraseLabel}>Phrase of the Day</Text>
            <Text style={styles.dailyPhraseText}>"{dailyPhrase.text}"</Text>
            <Text style={styles.dailyPhraseTranslation}>{dailyPhrase.translation}</Text>
          </Animated.View>
        )}
      </LinearGradient>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, activeMode === 'simple' && styles.modeButtonActive]}
          onPress={() => setActiveMode('simple')}
          activeOpacity={0.7}
        >
          <Text style={styles.modeIcon}>💬</Text>
          <Text style={[styles.modeText, activeMode === 'simple' && styles.modeTextActive]}>
            Simple
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.modeButton, activeMode === 'conversation' && styles.modeButtonActive]}
          onPress={() => setActiveMode('conversation')}
          activeOpacity={0.7}
        >
          <Text style={styles.modeIcon}>🗣️</Text>
          <Text style={[styles.modeText, activeMode === 'conversation' && styles.modeTextActive]}>
            Conversation
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {activeMode === 'simple' ? (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.languageSelector}>
              <TouchableOpacity
                style={[styles.languageButton, { borderColor: getLanguageColor(sourceLang) }]}
                onPress={() => setShowSourcePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.languageFlag}>{getLanguageInfo(sourceLang)?.flag}</Text>
                <Text style={styles.languageButtonText}>{getLanguageInfo(sourceLang)?.name}</Text>
                <Text style={styles.languageButtonIcon}>▼</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.swapButton} onPress={swapLanguages} activeOpacity={0.7}>
                <LinearGradient
                  colors={['#FF6B35', '#F7931E']}
                  style={styles.swapButtonGradient}
                >
                  <Text style={styles.swapButtonText}>⇄</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.languageButton, { borderColor: getLanguageColor(targetLang) }]}
                onPress={() => setShowTargetPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.languageFlag}>{getLanguageInfo(targetLang)?.flag}</Text>
                <Text style={styles.languageButtonText}>{getLanguageInfo(targetLang)?.name}</Text>
                <Text style={styles.languageButtonIcon}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.translationCard, { borderLeftColor: getLanguageColor(sourceLang) }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>You say</Text>
                <View style={styles.cardActions}>
                  {sourceText.length > 0 && (
                    <>
                      <TouchableOpacity
                        onPress={() => speakText(sourceText, sourceLang)}
                        style={styles.actionButton}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionButtonText}>🔊</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => setSourceText('')} 
                        style={styles.actionButton}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionButtonText}>✕</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
              <TextInput
                style={styles.textInput}
                value={sourceText}
                onChangeText={(text) => setSourceText(text)}
                placeholder="Type here..."
                placeholderTextColor="rgba(0,0,0,0.3)"
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={[styles.translationCard, { borderLeftColor: getLanguageColor(targetLang) }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>Translation</Text>
                <View style={styles.cardActions}>
                  {translatedText.length > 0 && (
                    <>
                      <TouchableOpacity
                        onPress={() => speakText(translatedText, targetLang)}
                        style={styles.actionButton}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionButtonText}>🔊</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => copyToClipboard(translatedText)}
                        style={styles.actionButton}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionButtonText}>📋</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => toggleFavorite({
                          source: sourceText,
                          translated: translatedText,
                          sourceLang,
                          targetLang,
                        })}
                        style={styles.actionButton}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionButtonText}>⭐</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
              <View style={styles.translationOutput}>
                {isTranslating ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6B35" />
                    <Text style={styles.loadingText}>Translating...</Text>
                  </View>
                ) : translatedText ? (
                  <Text style={styles.translatedText}>{translatedText}</Text>
                ) : (
                  <Text style={styles.placeholderText}>
                    Translation appears here...
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.conversationContainer}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.conversationScroll}
              contentContainerStyle={styles.conversationContent}
              showsVerticalScrollIndicator={false}
            >
              {conversations.map((msg, index) => (
                <View key={msg.id} style={styles.messageGroup}>
                  <View style={[styles.messageBubble, styles.messageBubbleLeft]}>
                    <Text style={styles.messageLangLabel}>
                      {getLanguageInfo(msg.sourceLang)?.flag} {getLanguageInfo(msg.sourceLang)?.name}
                    </Text>
                    <Text style={styles.messageText}>{msg.source}</Text>
                  </View>
                  <View style={[styles.messageBubble, styles.messageBubbleRight]}>
                    <Text style={styles.messageLangLabel}>
                      {getLanguageInfo(msg.targetLang)?.flag} {getLanguageInfo(msg.targetLang)?.name}
                    </Text>
                    <Text style={styles.messageText}>{msg.translated}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.conversationInput}>
              <TextInput
                style={styles.conversationTextInput}
                value={sourceText}
                onChangeText={(text) => setSourceText(text)}
                placeholder={`Type in ${getLanguageInfo(sourceLang)?.name}...`}
                placeholderTextColor="rgba(0,0,0,0.3)"
                multiline
                maxLength={200}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendConversation}
                disabled={!sourceText.trim() || !translatedText.trim()}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={sourceText.trim() && translatedText.trim() ? ['#FF6B35', '#F7931E'] : ['#ccc', '#aaa']}
                  style={styles.sendButtonGradient}
                >
                  <Text style={styles.sendButtonText}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

      <LanguagePicker
        visible={showSourcePicker}
        onClose={() => setShowSourcePicker(false)}
        selectedLang={sourceLang}
        onSelect={setSourceLang}
        title="Choose Language"
      />

      <LanguagePicker
        visible={showTargetPicker}
        onClose={() => setShowTargetPicker(false)}
        selectedLang={targetLang}
        onSelect={setTargetLang}
        title="Translate To"
      />

      <CulturalNoteModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 1,
  },
  dailyPhraseContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dailyPhraseLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  dailyPhraseText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dailyPhraseTranslation: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  modeSelector: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F7F7F7',
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: '#FFF0EB',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  modeIcon: {
    fontSize: 20,
  },
  modeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  modeTextActive: {
    color: '#FF6B35',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  languageButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
  },
  languageButtonIcon: {
    fontSize: 12,
    color: '#999',
  },
  swapButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  swapButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  translationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  textInput: {
    fontSize: 18,
    color: '#2D3748',
    minHeight: 100,
    padding: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    lineHeight: 26,
  },
  translationOutput: {
    minHeight: 100,
    padding: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    justifyContent: 'center',
  },
  translatedText: {
    fontSize: 18,
    color: '#2D3748',
    lineHeight: 26,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#FF6B35',
    marginTop: 12,
    fontWeight: '500',
  },
  conversationContainer: {
    flex: 1,
  },
  conversationScroll: {
    flex: 1,
  },
  conversationContent: {
    padding: 20,
  },
  messageGroup: {
    marginBottom: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
    marginBottom: 8,
  },
  messageBubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0EB',
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#E8F5E9',
    borderBottomRightRadius: 4,
  },
  messageLangLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 16,
    color: '#2D3748',
    lineHeight: 22,
  },
  conversationInput: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  conversationTextInput: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.75,
  },
  pickerHeaderGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  pickerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pickerScroll: {
    padding: 24,
  },
  languageSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#999',
    marginTop: 20,
    marginBottom: 16,
    letterSpacing: 1.5,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pickerItemFlag: {
    fontSize: 32,
    marginRight: 14,
  },
  pickerItemText: {
    flex: 1,
  },
  pickerItemName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: 0.2,
  },
  pickerItemNative: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  pickerItemGreeting: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  checkmarkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  culturalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  culturalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  culturalCard: {
    width: width - 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  culturalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  culturalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 12,
  },
  culturalPhrase: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 16,
    textAlign: 'center',
  },
  culturalNote: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  culturalButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  culturalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});