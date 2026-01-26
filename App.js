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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

const AFRICAN_LANGUAGES = [
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪' },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', native: 'Hausa', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', native: 'Igbo', flag: '🇳🇬' },
  { code: 'zu', name: 'Zulu', native: 'isiZulu', flag: '🇿🇦' },
  { code: 'xh', name: 'Xhosa', native: 'isiXhosa', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦' },
  { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
  { code: 'so', name: 'Somali', native: 'Soomaali', flag: '🇸🇴' },
  { code: 'rw', name: 'Kinyarwanda', native: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'ny', name: 'Chichewa', native: 'Chichewa', flag: '🇲🇼' },
  { code: 'sn', name: 'Shona', native: 'Shona', flag: '🇿🇼' },
  { code: 'st', name: 'Sesotho', native: 'Sesotho', flag: '🇱🇸' },
  { code: 'mg', name: 'Malagasy', native: 'Malagasy', flag: '🇲🇬' },
  { code: 'en', name: 'English', native: 'English', flag: '🌍' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
];

export default function App() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('sw');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const translateText = async (text) => {
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
    } catch (error) {
      Alert.alert('Error', 'Translation failed. Please try again.');
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (sourceText.trim()) {
        translateText(sourceText);
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
    Alert.alert('Copied!', 'Text copied to clipboard');
  };

  const speakText = (text, lang) => {
    Speech.speak(text, { language: lang });
  };

  const clearText = () => {
    setSourceText('');
    setTranslatedText('');
  };

  const getLanguageName = (code) => {
    const lang = AFRICAN_LANGUAGES.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code;
  };

  const LanguagePicker = ({ visible, onClose, selectedLang, onSelect, title }) => {
    if (!visible) return null;

    return (
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerScroll}>
            {AFRICAN_LANGUAGES.map((lang) => (
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
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#FF6B35', '#F7931E', '#FDC830']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
          <Text style={styles.headerEmoji}>🌍</Text>
          <Text style={styles.headerTitle}>AfroTranslate</Text>
          <Text style={styles.headerSubtitle}>Connect Through Language</Text>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Language Selector */}
          <View style={styles.languageSelector}>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => setShowSourcePicker(true)}
            >
              <Text style={styles.languageButtonText}>
                {getLanguageName(sourceLang)}
              </Text>
              <Text style={styles.languageButtonIcon}>▼</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.swapButton}
              onPress={swapLanguages}
            >
              <LinearGradient
                colors={['#FF6B35', '#F7931E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.swapButtonGradient}
              >
                <Text style={styles.swapButtonText}>⇄</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => setShowTargetPicker(true)}
            >
              <Text style={styles.languageButtonText}>
                {getLanguageName(targetLang)}
              </Text>
              <Text style={styles.languageButtonIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Input Section */}
          <View style={styles.translationCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Enter Text</Text>
              <View style={styles.cardActions}>
                {sourceText.length > 0 && (
                  <>
                    <TouchableOpacity
                      onPress={() => speakText(sourceText, sourceLang)}
                      style={styles.iconButton}
                    >
                      <Text style={styles.iconButtonText}>🔊</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={clearText}
                      style={styles.iconButton}
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
              onChangeText={setSourceText}
              placeholder="Type or paste text here..."
              placeholderTextColor="#A0AEC0"
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{sourceText.length} characters</Text>
          </View>

          {/* Translation Output */}
          <View style={styles.translationCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Translation</Text>
              <View style={styles.cardActions}>
                {translatedText.length > 0 && (
                  <>
                    <TouchableOpacity
                      onPress={() => speakText(translatedText, targetLang)}
                      style={styles.iconButton}
                    >
                      <Text style={styles.iconButtonText}>🔊</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(translatedText)}
                      style={styles.iconButton}
                    >
                      <Text style={styles.iconButtonText}>📋</Text>
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
                  Translation will appear here...
                </Text>
              )}
            </View>
            <Text style={styles.characterCount}>{translatedText.length} characters</Text>
          </View>

          {/* Quick Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>💡</Text>
            <Text style={styles.infoText}>
              Supports 14+ African languages including Swahili, Hausa, Yoruba, Zulu, and more
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Language Pickers */}
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
    backgroundColor: '#F7FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
    fontWeight: '500',
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
    marginBottom: 20,
    gap: 12,
  },
  languageButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  languageButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
  },
  languageButtonIcon: {
    fontSize: 12,
    color: '#A0AEC0',
    marginLeft: 8,
  },
  swapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  swapButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  translationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 18,
  },
  textInput: {
    fontSize: 16,
    color: '#2D3748',
    minHeight: 120,
    padding: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    lineHeight: 24,
  },
  translationOutput: {
    minHeight: 120,
    padding: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    justifyContent: 'center',
  },
  translatedText: {
    fontSize: 16,
    color: '#2D3748',
    lineHeight: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#FFF5F2',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4DC',
    marginBottom: 20,
  },
  infoEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#744210',
    lineHeight: 20,
    fontWeight: '500',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#718096',
  },
  pickerScroll: {
    padding: 20,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    marginBottom: 8,
  },
  pickerItemSelected: {
    backgroundColor: '#FFF5F2',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  pickerItemFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  pickerItemText: {
    flex: 1,
  },
  pickerItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  pickerItemNative: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 20,
    color: '#FF6B35',
    fontWeight: '700',
  },
});