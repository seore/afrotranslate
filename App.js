import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const AFRICAN_LANGUAGES = [
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', popular: true },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá', flag: '🇳🇬', popular: true },
  { code: 'ha', name: 'Hausa', native: 'Hausa', flag: '🇳🇬', popular: true },
  { code: 'ig', name: 'Igbo', native: 'Igbo', flag: '🇳🇬', popular: true },
  { code: 'zu', name: 'Zulu', native: 'isiZulu', flag: '🇿🇦', popular: true },
  { code: 'xh', name: 'Xhosa', native: 'isiXhosa', flag: '🇿🇦', popular: false },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦', popular: false },
  { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹', popular: true },
  { code: 'so', name: 'Somali', native: 'Soomaali', flag: '🇸🇴', popular: false },
  { code: 'rw', name: 'Kinyarwanda', native: 'Kinyarwanda', flag: '🇷🇼', popular: false },
  { code: 'ny', name: 'Chichewa', native: 'Chichewa', flag: '🇲🇼', popular: false },
  { code: 'sn', name: 'Shona', native: 'Shona', flag: '🇿🇼', popular: false },
  { code: 'st', name: 'Sesotho', native: 'Sesotho', flag: '🇱🇸', popular: false },
  { code: 'mg', name: 'Malagasy', native: 'Malagasy', flag: '🇲🇬', popular: false },
  { code: 'en', name: 'English', native: 'English', flag: '🌍', popular: true },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', popular: true },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', popular: true },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', popular: true },
];

const COMMON_PHRASES = [
  { en: 'Hello', category: 'Greetings' },
  { en: 'Good morning', category: 'Greetings' },
  { en: 'Good evening', category: 'Greetings' },
  { en: 'How are you?', category: 'Greetings' },
  { en: 'Thank you', category: 'Basics' },
  { en: 'Please', category: 'Basics' },
  { en: 'Yes', category: 'Basics' },
  { en: 'No', category: 'Basics' },
  { en: 'Excuse me', category: 'Basics' },
  { en: 'I need help', category: 'Emergency' },
  { en: 'Where is the bathroom?', category: 'Travel' },
  { en: 'How much is this?', category: 'Shopping' },
  { en: 'Can you help me?', category: 'Emergency' },
  { en: 'I love you', category: 'Personal' },
  { en: 'What is your name?', category: 'Social' },
];

export default function App() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('sw');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  
  const [activeTab, setActiveTab] = useState('translate');
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  
  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 25,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 25,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    
    loadHistory();
    loadFavorites();
  }, []);

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('translation_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (error) {
      console.log('Error loading history:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem('favorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch (error) {
      console.log('Error loading favorites:', error);
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

  const toggleFavorite = async (item) => {
    const exists = favorites.find(f => f.source === item.source && f.translated === item.translated);
    let updated;
    
    if (exists) {
      updated = favorites.filter(f => !(f.source === item.source && f.translated === item.translated));
      Alert.alert('✓', 'Removed from favorites');
    } else {
      updated = [item, ...favorites];
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

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      const translated = data[0].map(item => item[0]).join('');
      setTranslatedText(translated);
      
      if (showInHistory && text.length > 2) {
        await saveToHistory(text, translated, sourceLang, targetLang);
      }
    } catch (error) {
      Alert.alert('Error', 'Translation failed. Check your internet connection.');
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
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

  const clearText = () => {
    setSourceText('');
    setTranslatedText('');
  };

  const getLanguageName = (code) => {
    const lang = AFRICAN_LANGUAGES.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code;
  };

  const loadHistoryItem = (item) => {
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setSourceText(item.source);
    setTranslatedText(item.translated);
    setActiveTab('translate');
  };

  const translatePhrase = async (phrase) => {
    setSourceText(phrase);
    setActiveTab('translate');
  };

  const LanguagePicker = ({ visible, onClose, selectedLang, onSelect, title }) => {
    if (!visible) return null;

    const popularLangs = AFRICAN_LANGUAGES.filter(l => l.popular);
    const otherLangs = AFRICAN_LANGUAGES.filter(l => !l.popular);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.pickerOverlay}>
          <TouchableOpacity 
            style={styles.pickerBackdrop} 
            activeOpacity={1} 
            onPress={onClose}
          />
          <Animated.View style={[styles.pickerContainer, { opacity: fadeAnim }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.languageSectionTitle}>POPULAR</Text>
              {popularLangs.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.pickerItem,
                    selectedLang === lang.code && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(lang.code);
                    onClose();
                  }}
                >
                  <Text style={styles.pickerItemFlag}>{lang.flag}</Text>
                  <View style={styles.pickerItemText}>
                    <Text style={styles.pickerItemName}>{lang.name}</Text>
                    <Text style={styles.pickerItemNative}>{lang.native}</Text>
                  </View>
                  {selectedLang === lang.code && (
                    <View style={styles.checkmarkCircle}>
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
                    selectedLang === lang.code && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(lang.code);
                    onClose();
                  }}
                >
                  <Text style={styles.pickerItemFlag}>{lang.flag}</Text>
                  <View style={styles.pickerItemText}>
                    <Text style={styles.pickerItemName}>{lang.name}</Text>
                    <Text style={styles.pickerItemNative}>{lang.native}</Text>
                  </View>
                  {selectedLang === lang.code && (
                    <View style={styles.checkmarkCircle}>
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

  const TranslateTab = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.tabContainer}
    >
      <ScrollView 
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.languageSelector}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowSourcePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.languageButtonText}>
              {getLanguageName(sourceLang)}
            </Text>
            <Text style={styles.languageButtonIcon}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.swapButton} 
            onPress={swapLanguages}
            activeOpacity={0.7}
          >
            <View style={styles.swapButtonInner}>
              <Text style={styles.swapButtonText}>⇄</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowTargetPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.languageButtonText}>
              {getLanguageName(targetLang)}
            </Text>
            <Text style={styles.languageButtonIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.translationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <View style={styles.cardTitleDot} />
              <Text style={styles.cardTitle}>Enter Text</Text>
            </View>
            <View style={styles.cardActions}>
              {sourceText.length > 0 && (
                <>
                  <TouchableOpacity
                    onPress={() => speakText(sourceText, sourceLang)}
                    style={styles.iconButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.iconButtonText}>🔊</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={clearText} 
                    style={styles.iconButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.iconButtonText}>✕</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
          <TextInput
            style={styles.textInput}
            value={sourceText}
            onChangeText={(text) => setSourceText(text)}
            placeholder="Type or paste text here..."
            placeholderTextColor="rgba(139, 92, 246, 0.3)"
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{sourceText.length} characters</Text>
        </View>

        <View style={styles.translationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <View style={[styles.cardTitleDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.cardTitle}>Translation</Text>
            </View>
            <View style={styles.cardActions}>
              {translatedText.length > 0 && (
                <>
                  <TouchableOpacity
                    onPress={() => speakText(translatedText, targetLang)}
                    style={styles.iconButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.iconButtonText}>🔊</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(translatedText)}
                    style={styles.iconButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.iconButtonText}>📋</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => toggleFavorite({
                      id: Date.now().toString(),
                      source: sourceText,
                      translated: translatedText,
                      sourceLang,
                      targetLang,
                    })}
                    style={styles.iconButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.iconButtonText}>⭐</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
          <View style={styles.translationOutput}>
            {isTranslating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Translating...</Text>
              </View>
            ) : translatedText ? (
              <Text style={styles.translatedText}>{translatedText}</Text>
            ) : (
              <Text style={styles.placeholderText}>
                Translation will appear here...
              </Text>
            )}
          </View>
          <Text style={styles.characterCount}>{translatedText.length} characters</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const HistoryTab = () => (
    <View style={styles.tabContainer}>
      <View style={styles.tabHeader}>
        <Text style={styles.tabHeaderTitle}>Recent Translations</Text>
        {history.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Clear History',
                'Are you sure you want to delete all history?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => {
                      setHistory([]);
                      AsyncStorage.removeItem('translation_history');
                    },
                  },
                ]
              );
            }}
            style={styles.clearButton}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>📚</Text>
          <Text style={styles.emptyStateText}>No translation history yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Your translations will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historyItem}
              onPress={() => loadHistoryItem(item)}
              activeOpacity={0.8}
            >
              <View style={styles.historyItemHeader}>
                <Text style={styles.historyLangs}>
                  {getLanguageName(item.sourceLang)} → {getLanguageName(item.targetLang)}
                </Text>
                <TouchableOpacity onPress={() => toggleFavorite(item)}>
                  <Text style={styles.favoriteIcon}>
                    {favorites.find(f => f.source === item.source && f.translated === item.translated) ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.historySource}>{item.source}</Text>
              <Text style={styles.historyTranslated}>{item.translated}</Text>
              <Text style={styles.historyTime}>
                {new Date(item.timestamp).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );

  const PhrasesTab = () => {
    const categories = [...new Set(COMMON_PHRASES.map(p => p.category))];
    
    return (
      <ScrollView 
        style={styles.tabContainer}
        contentContainerStyle={styles.tabScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabHeader}>
          <Text style={styles.tabHeaderTitle}>Common Phrases</Text>
        </View>
        
        {categories.map(category => (
          <View key={category} style={styles.phraseCategory}>
            <Text style={styles.phraseCategoryTitle}>{category}</Text>
            {COMMON_PHRASES.filter(p => p.category === category).map((phrase, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.phraseItem}
                onPress={() => translatePhrase(phrase.en)}
                activeOpacity={0.7}
              >
                <Text style={styles.phraseText}>{phrase.en}</Text>
                <View style={styles.phraseArrowCircle}>
                  <Text style={styles.phraseArrow}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        
        {favorites.length > 0 && (
          <View style={styles.phraseCategory}>
            <Text style={styles.phraseCategoryTitle}>⭐ Your Favorites</Text>
            {favorites.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.phraseItem}
                onPress={() => loadHistoryItem(item)}
                activeOpacity={0.7}
              >
                <View style={styles.favoritePhrase}>
                  <Text style={styles.phraseText}>{item.source}</Text>
                  <Text style={styles.phraseTranslation}>{item.translated}</Text>
                </View>
                <View style={styles.phraseArrowCircle}>
                  <Text style={styles.phraseArrow}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with gradient background */}
      <View style={styles.header}>
        <View style={styles.headerGradient} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AfroTranslate</Text>
          <Text style={styles.headerSubtitle}>Connecting Africa Through Language</Text>
        </View>
        <View style={styles.headerPattern} />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'translate' && styles.tabActive]}
          onPress={() => setActiveTab('translate')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'translate' && styles.tabTextActive]}>
            Translate
          </Text>
          {activeTab === 'translate' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
          {activeTab === 'history' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'phrases' && styles.tabActive]}
          onPress={() => setActiveTab('phrases')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'phrases' && styles.tabTextActive]}>
            Phrases
          </Text>
          {activeTab === 'phrases' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'translate' && <TranslateTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'phrases' && <PhrasesTab />}
      </View>

      <LanguagePicker
        visible={showSourcePicker}
        onClose={() => setShowSourcePicker(false)}
        selectedLang={sourceLang}
        onSelect={setSourceLang}
        title="Select Source Language"
      />

      <LanguagePicker
        visible={showTargetPicker}
        onClose={() => setShowTargetPicker(false)}
        selectedLang={targetLang}
        onSelect={setTargetLang}
        title="Select Target Language"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1E1B4B',
    opacity: 1,
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 100,
    transform: [{ translateX: 80 }, { translateY: -80 }],
  },
  headerContent: {
    padding: 20,
    alignItems: 'center',
    zIndex: 2,
  },
  headerEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(139, 92, 246, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
    // Active state handled by indicator
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.2,
  },
  tabTextActive: {
    color: '#A78BFA',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flex: 1,
  },
  tabScrollView: {
    flex: 1,
  },
  tabScrollContent: {
    padding: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  languageButton: {
    flex: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  languageButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  languageButtonIcon: {
    fontSize: 12,
    color: 'rgba(139, 92, 246, 0.7)',
    marginLeft: 8,
  },
  swapButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  swapButtonInner: {
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
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  iconButtonText: {
    fontSize: 16,
  },
  textInput: {
    fontSize: 17,
    color: '#FFFFFF',
    minHeight: 110,
    padding: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 16,
    lineHeight: 26,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  translationOutput: {
    minHeight: 110,
    padding: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  translatedText: {
    fontSize: 17,
    color: '#FFFFFF',
    lineHeight: 26,
  },
  placeholderText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(139, 92, 246, 0.7)',
    marginTop: 12,
    fontWeight: '500',
  },
  characterCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 10,
    fontWeight: '500',
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
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.75,
    borderTopWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
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
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#A78BFA',
    fontWeight: '600',
  },
  pickerScroll: {
    padding: 24,
  },
  languageSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(167, 139, 250, 0.6)',
    marginTop: 20,
    marginBottom: 16,
    letterSpacing: 1.5,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderColor: '#8B5CF6',
    borderWidth: 2,
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
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  pickerItemNative: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  checkmarkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tabHeaderTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  clearButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  clearButtonText: {
    color: '#F87171',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateEmoji: {
    fontSize: 72,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  historyItem: {
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyLangs: {
    fontSize: 12,
    color: 'rgba(167, 139, 250, 0.8)',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  favoriteIcon: {
    fontSize: 22,
  },
  historySource: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 22,
  },
  historyTranslated: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    lineHeight: 22,
  },
  historyTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
  },
  phraseCategory: {
    marginBottom: 32,
  },
  phraseCategoryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  phraseItem: {
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  phraseText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
  phraseArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phraseArrow: {
    fontSize: 16,
    color: '#A78BFA',
    fontWeight: '700',
  },
  favoritePhrase: {
    flex: 1,
  },
  phraseTranslation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
});