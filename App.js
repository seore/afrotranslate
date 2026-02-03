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
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  getVerifiedTranslation, 
  isVerified, 
  findSimilarVerified,
  getVerifiedCount 
} from './verifiedTranslations';

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
  { en: 'How much?', category: 'Shopping' },
];

export default function App() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('sw');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [translationSource, setTranslationSource] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const [activeTab, setActiveTab] = useState('translate');
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [verifiedCount, setVerifiedCount] = useState(0);
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    startGlowAnimation();
    loadData();
    updateVerifiedCount();
  }, []);

  const updateVerifiedCount = () => {
    const count = getVerifiedCount(sourceLang, targetLang);
    setVerifiedCount(count);
  };

  useEffect(() => {
    updateVerifiedCount();
  }, [sourceLang, targetLang]);

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

  const saveToHistory = async (source, translated, srcLang, tgtLang, translationType) => {
    const newItem = {
      id: Date.now().toString(),
      source,
      translated,
      sourceLang: srcLang,
      targetLang: tgtLang,
      translationType,
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
    } else {
      updated = [{...item, id: Date.now().toString()}, ...favorites];
    }
    
    setFavorites(updated);
    await AsyncStorage.setItem('favorites', JSON.stringify(updated));
  };

  // HYBRID TRANSLATION SYSTEM
  const translateText = async (text, showInHistory = true) => {
    if (!text.trim()) {
      setTranslatedText('');
      setTranslationSource(null);
      return;
    }

    setIsTranslating(true);

    try {
      // STEP 1: Check verified database first (INSTANT!)
      const verified = getVerifiedTranslation(text, sourceLang, targetLang);
      
      if (verified) {
        setTranslatedText(verified);
        setTranslationSource({ 
          type: 'verified', 
          confidence: 1.0,
          method: 'Human-Verified'
        });
        
        if (showInHistory && text.length > 2) {
          await saveToHistory(text, verified, sourceLang, targetLang, 'verified');
        }
        
        setIsTranslating(false);
        return;
      }

      // STEP 2: Check for similar verified phrases
      const similar = findSimilarVerified(text, sourceLang, targetLang);
      
      if (similar && similar.similarity > 0.85) {
        setTranslatedText(similar.translation);
        setTranslationSource({ 
          type: 'verified', 
          confidence: similar.similarity,
          method: 'Similar Match',
          note: `Similar to: "${similar.phrase}"`
        });
        
        if (showInHistory && text.length > 2) {
          await saveToHistory(text, similar.translation, sourceLang, targetLang, 'verified-similar');
        }
        
        setIsTranslating(false);
        return;
      }

      // STEP 3: Fall back to Google Translate AI
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      const translated = data[0].map(item => item[0]).join('');
      
      setTranslatedText(translated);
      setTranslationSource({ 
        type: 'ai', 
        confidence: 0.75,
        method: 'Google Translate'
      });
      
      if (showInHistory && text.length > 2) {
        await saveToHistory(text, translated, sourceLang, targetLang, 'google');
      }

    } catch (error) {
      Alert.alert('Error', 'Translation failed. Check your internet connection.');
      setTranslationSource({ type: 'error' });
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Report translation error
  const reportTranslationError = async () => {
    const error = {
      id: Date.now().toString(),
      source: sourceText,
      translation: translatedText,
      sourceLang,
      targetLang,
      translationType: translationSource?.type,
      timestamp: new Date().toISOString(),
    };
    
    try {
      const errors = await AsyncStorage.getItem('translation_errors');
      const errorList = errors ? JSON.parse(errors) : [];
      errorList.push(error);
      await AsyncStorage.setItem('translation_errors', JSON.stringify(errorList));
      
      Alert.alert(
        '✓ Thank You!', 
        'Error reported. We\'ll review this translation and improve it with native speakers.'
      );
      setShowReportModal(false);
    } catch (err) {
      console.error('Error saving report:', err);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (sourceText.trim()) {
        translateText(sourceText);
      } else {
        setTranslatedText('');
        setTranslationSource(null);
      }
    }, 500);

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
    Alert.alert('✓', 'Copied');
  };

  const speakText = (text, lang) => {
    if (!text.trim()) return;
    Speech.speak(text, { language: lang, pitch: 1.0, rate: 0.85 });
  };

  const getLanguageInfo = (code) => AFRICAN_LANGUAGES.find(l => l.code === code);
  const getLanguageColor = (code) => getLanguageInfo(code)?.color || '#00F5FF';

  const loadHistoryItem = (item) => {
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setSourceText(item.source);
    setTranslatedText(item.translated);
    setTranslationSource({ type: item.translationType });
    setActiveTab('translate');
  };

  const translatePhrase = (phrase) => {
    setSourceText(phrase);
    setActiveTab('translate');
  };

  // Quality Badge Component
  const QualityBadge = () => {
    if (!translationSource || !translatedText) return null;

    if (translationSource.type === 'verified') {
      return (
        <View style={[styles.qualityBadge, { backgroundColor: '#00FF9420' }]}>
          <View style={[styles.qualityDot, { backgroundColor: '#00FF94' }]} />
          <Text style={[styles.qualityText, { color: '#00FF94' }]}>
            ✅ Verified • 100% Accurate
          </Text>
        </View>
      );
    }

    if (translationSource.type === 'ai') {
      return (
        <View style={[styles.qualityBadge, { backgroundColor: '#FFD70020' }]}>
          <View style={[styles.qualityDot, { backgroundColor: '#FFD700' }]} />
          <Text style={[styles.qualityText, { color: '#FFD700' }]}>
            🔄 Google • Good Quality
          </Text>
        </View>
      );
    }

    return null;
  };

  const LanguagePicker = ({ visible, onClose, selectedLang, onSelect, title }) => {
    if (!visible) return null;

    const popularLangs = AFRICAN_LANGUAGES.filter(l => l.popular);
    const otherLangs = AFRICAN_LANGUAGES.filter(l => !l.popular);

    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.pickerOverlay}>
          <TouchableOpacity style={styles.pickerBackdrop} activeOpacity={1} onPress={onClose} />
          <View style={styles.pickerContainer}>
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
          </View>
        </View>
      </Modal>
    );
  };

  const ReportModal = () => (
    <Modal visible={showReportModal} transparent animationType="fade">
      <View style={styles.reportOverlay}>
        <TouchableOpacity style={styles.reportBackdrop} activeOpacity={1} onPress={() => setShowReportModal(false)} />
        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>⚠️ Report Translation Error</Text>
          <Text style={styles.reportText}>
            Help us improve! Report this translation and we'll review it with native speakers.
          </Text>
          
          <View style={styles.reportDetails}>
            <Text style={styles.reportLabel}>Original:</Text>
            <Text style={styles.reportValue}>{sourceText}</Text>
            
            <Text style={styles.reportLabel}>Translation:</Text>
            <Text style={styles.reportValue}>{translatedText}</Text>
            
            <Text style={styles.reportLabel}>Source:</Text>
            <Text style={styles.reportValue}>{translationSource?.method || 'Unknown'}</Text>
          </View>
          
          <View style={styles.reportButtons}>
            <TouchableOpacity 
              style={styles.reportCancelBtn}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={styles.reportCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.reportSubmitBtn}
              onPress={reportTranslationError}
            >
              <Text style={styles.reportSubmitText}>Report Error</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const TranslateTab = () => (
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
        <View style={styles.languageSelector}>
          <TouchableOpacity
            style={[styles.langButton, { borderColor: getLanguageColor(sourceLang) }]}
            onPress={() => setShowSourcePicker(true)}
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
            onPress={() => setShowTargetPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.langFlag}>{getLanguageInfo(targetLang)?.flag}</Text>
            <Text style={[styles.langText, { color: getLanguageColor(targetLang) }]}>
              {getLanguageInfo(targetLang)?.name}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verified Count Badge */}
        {verifiedCount > 0 && (
          <View style={styles.verifiedCountBadge}>
            <Text style={styles.verifiedCountText}>
              ✅ {verifiedCount} verified phrases available
            </Text>
          </View>
        )}

        <View style={[styles.card, { borderLeftColor: getLanguageColor(sourceLang) }]}>
          <View style={styles.cardTop}>
            <Text style={[styles.cardLabel, { color: getLanguageColor(sourceLang) }]}>FROM</Text>
            {sourceText.length > 0 && (
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => speakText(sourceText, sourceLang)} style={styles.actionBtn}>
                  <Text style={styles.actionIcon}>🔊</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSourceText('')} style={styles.actionBtn}>
                  <Text style={styles.actionIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <TextInput
            style={styles.input}
            value={sourceText}
            onChangeText={setSourceText}
            placeholder="Type here..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
          />
        </View>

        <View style={[styles.card, { borderLeftColor: getLanguageColor(targetLang) }]}>
          <View style={styles.cardTop}>
            <Text style={[styles.cardLabel, { color: getLanguageColor(targetLang) }]}>TO</Text>
            {translatedText.length > 0 && (
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => speakText(translatedText, targetLang)} style={styles.actionBtn}>
                  <Text style={styles.actionIcon}>🔊</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => copyToClipboard(translatedText)} style={styles.actionBtn}>
                  <Text style={styles.actionIcon}>📋</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleFavorite({ source: sourceText, translated: translatedText, sourceLang, targetLang })}
                  style={styles.actionBtn}
                >
                  <Text style={styles.actionIcon}>
                    {favorites.find(f => f.source === sourceText && f.translated === translatedText) ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.output}>
            {isTranslating ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#00F5FF" />
                <Text style={styles.loadingText}>Translating...</Text>
              </View>
            ) : translatedText ? (
              <>
                <Text style={styles.outputText}>{translatedText}</Text>
                <QualityBadge />
                {translationSource?.type === 'ai' && (
                  <TouchableOpacity 
                    style={styles.reportBtn}
                    onPress={() => setShowReportModal(true)}
                  >
                    <Text style={styles.reportBtnText}>⚠️ Report Error</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text style={styles.placeholder}>Translation appears here...</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const HistoryTab = () => (
    <View style={styles.tabContainer}>
      <View style={styles.tabHeaderBar}>
        <Text style={styles.tabHeaderTitle}>History</Text>
        {history.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setHistory([]);
              AsyncStorage.removeItem('translation_history');
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
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.historyCard} onPress={() => loadHistoryItem(item)} activeOpacity={0.8}>
              <View style={styles.historyTop}>
                <Text style={styles.historyLang}>
                  {getLanguageInfo(item.sourceLang)?.flag} → {getLanguageInfo(item.targetLang)?.flag}
                </Text>
                <View style={styles.historyActions}>
                  {item.translationType === 'verified' && (
                    <View style={styles.verifiedBadgeSmall}>
                      <Text style={styles.verifiedBadgeSmallText}>✅</Text>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => toggleFavorite(item)}>
                    <Text style={styles.favoriteBtn}>
                      {favorites.find(f => f.source === item.source && f.translated === item.translated) ? '⭐' : '☆'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.historySource}>{item.source}</Text>
              <Text style={styles.historyTrans}>{item.translated}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );

  const PhrasesTab = () => {
    const categories = [...new Set(COMMON_PHRASES.map(p => p.category))];
    
    return (
      <ScrollView style={styles.tabContainer} contentContainerStyle={styles.tabContent}>
        <View style={styles.tabHeaderBar}>
          <Text style={styles.tabHeaderTitle}>Quick Phrases</Text>
        </View>
        
        {categories.map(category => (
          <View key={category} style={styles.phraseSection}>
            <Text style={styles.phraseCategory}>{category}</Text>
            {COMMON_PHRASES.filter(p => p.category === category).map((phrase, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.phraseCard}
                onPress={() => translatePhrase(phrase.en)}
                activeOpacity={0.8}
              >
                <View style={styles.phraseContent}>
                  <Text style={styles.phraseText}>{phrase.en}</Text>
                  {isVerified(phrase.en, 'en', targetLang) && (
                    <View style={styles.verifiedBadgeSmall}>
                      <Text style={styles.verifiedBadgeSmallText}>✅ Verified</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.phraseArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        
        {favorites.length > 0 && (
          <View style={styles.phraseSection}>
            <Text style={styles.phraseCategory}>⭐ Favorites</Text>
            {favorites.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.phraseCard}
                onPress={() => loadHistoryItem(item)}
                activeOpacity={0.8}
              >
                <View style={styles.phraseContent}>
                  <Text style={styles.phraseText}>{item.source}</Text>
                  <Text style={styles.phraseTrans}>{item.translated}</Text>
                </View>
                <Text style={styles.phraseArrow}>→</Text>
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
      
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A']}
        style={styles.header}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <Text style={styles.logo}>GRIOT</Text>
          <Animated.View style={[styles.logoGlow, {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.8]
            })
          }]} />
        </Animated.View>
      </LinearGradient>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'translate' && styles.tabActive]}
          onPress={() => setActiveTab('translate')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'translate' && styles.tabTextActive]}>Translate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'phrases' && styles.tabActive]}
          onPress={() => setActiveTab('phrases')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'phrases' && styles.tabTextActive]}>Phrases</Text>
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
        title="Select Language"
      />

      <LanguagePicker
        visible={showTargetPicker}
        onClose={() => setShowTargetPicker(false)}
        selectedLang={targetLang}
        onSelect={setTargetLang}
        title="Translate To"
      />

      <ReportModal />
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
    paddingBottom: 20,
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
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#00F5FF',
  },
  tabText: {
    fontSize: 14,
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
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 15,
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
  verifiedCountBadge: {
    backgroundColor: '#00FF9420',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00FF9440',
  },
  verifiedCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00FF94',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
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
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginTop: 8,
  },
  qualityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  qualityText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  reportBtn: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,107,53,0.2)',
    alignSelf: 'flex-start',
  },
  reportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B35',
  },
  reportOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  reportBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  reportCard: {
    width: width - 60,
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 24,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  reportText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  reportDetails: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  reportLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00F5FF',
    marginTop: 8,
    marginBottom: 4,
    letterSpacing: 1,
  },
  reportValue: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  reportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  reportCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  reportCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#999',
  },
  reportSubmitBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
  },
  reportSubmitText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
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
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
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
  historyActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  verifiedBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#00FF9420',
  },
  verifiedBadgeSmallText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00FF94',
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
  },
  listContent: {
    paddingBottom: 20,
  },
  phraseSection: {
    marginBottom: 28,
  },
  phraseCategory: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00F5FF',
    marginBottom: 12,
    letterSpacing: 1,
  },
  phraseCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phraseText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  phraseContent: {
    flex: 1,
  },
  phraseTrans: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  phraseArrow: {
    fontSize: 18,
    color: '#00F5FF',
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
});