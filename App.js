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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AFRICAN_LANGUAGES = [
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', popular: true, color: '#e70505' },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá', flag: '🇳🇬', popular: true, color: '#35912d' },
  { code: 'ha', name: 'Hausa', native: 'Hausa', flag: '🇳🇬', popular: true, color: '#35912d' },
  { code: 'ig', name: 'Igbo', native: 'Igbo', flag: '🇳🇬', popular: true, color: '#35912d' },
  { code: 'zu', name: 'Zulu', native: 'isiZulu', flag: '🇿🇦', popular: true, color: '#2133fb' },
  { code: 'xh', name: 'Xhosa', native: 'isiXhosa', flag: '🇿🇦', popular: false, color: '#2133fb' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦', popular: false, color: '#2133fb' },
  { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹', popular: true, color: '#e8fc0c' },
  { code: 'so', name: 'Somali', native: 'Soomaali', flag: '🇸🇴', popular: false, color: '#4D9FFF' },
  { code: 'rw', name: 'Kinyarwanda', native: 'Kinyarwanda', flag: '🇷🇼', popular: false, color: '#bfc20d' },
  { code: 'en', name: 'English', native: 'English', flag: '🌍', popular: true, color: '#054a8f' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', popular: true, color: '#ffffff' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', popular: true, color: '#06ae46' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', popular: true, color: '#d45a5a' },
];

export default function App() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('sw');
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  // Animations
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    startPulseAnimation();
    startGlowAnimation();
    checkNetwork();
    const interval = setInterval(checkNetwork, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const startVoiceInput = () => {
    hapticFeedback();
    setIsListening(true);
    
    // This is a placeholder - real implementation would use expo-speech-recognition
    Alert.alert(
      '🎤 Voice Input Active', 
      'Speak now... (Voice recognition requires additional setup)',
      [
        { 
          text: 'Simulate Translation', 
          onPress: () => {
            setIsListening(false);
            simulateVoiceInput();
          }
        },
        { 
          text: 'Cancel', 
          onPress: () => setIsListening(false),
          style: 'cancel'
        }
      ]
    );
  };

  const simulateVoiceInput = async () => {
    setSourceText('Hello, how are you?');
    await translateText('Hello, how are you?');
  };

  const translateText = async (text) => {
    if (!text.trim()) return;

    setIsTranslating(true);

    try {
      if (!isOnline) {
        Alert.alert('Offline', 'No internet connection.');
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
      
      // Auto-play translation
      setTimeout(() => {
        Speech.speak(translated, { 
          language: targetLang, 
          pitch: 1.0, 
          rate: 0.85 
        });
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

  const getLanguageInfo = (code) => AFRICAN_LANGUAGES.find(l => l.code === code);

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>GRIOT</Text>
            <Text style={styles.subtitle}>African Voice Translator</Text>
          </View>

          {/* Language Display */}
          <View style={styles.langDisplay}>
            <View style={styles.langInfo}>
              <Text style={styles.langFlag}>{getLanguageInfo(sourceLang)?.flag}</Text>
              <Text style={styles.langName}>{getLanguageInfo(sourceLang)?.name}</Text>
            </View>
            
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

          {/* Main Voice Button */}
          <View style={styles.mainContent}>
            <Animated.View style={{
              transform: [{ scale: isListening ? pulseAnim : 1 }]
            }}>
              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  isListening && styles.voiceButtonActive
                ]}
                onPress={startVoiceInput}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={
                    isListening 
                      ? [getLanguageInfo(targetLang)?.color || '#6f6469', '#bbb4bf'] 
                      : [getLanguageInfo(targetLang)?.color || '#9b9e9e', '#4d4e50']
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
          </View>

          {/* Translation Display */}
          {(sourceText || translatedText) && (
            <Animated.View style={[styles.translationCard, { opacity: fadeAnim }]}>
              {sourceText && (
                <View style={styles.textBlock}>
                  <Text style={styles.textLabel}>You said:</Text>
                  <Text style={styles.textContent}>{sourceText}</Text>
                </View>
              )}
              
              {translatedText && (
                <View style={styles.textBlock}>
                  <Text style={styles.textLabel}>Translation:</Text>
                  <Text style={[styles.textContent, styles.translatedText]}>{translatedText}</Text>
                  <TouchableOpacity 
                    style={styles.replayBtn}
                    onPress={() => Speech.speak(translatedText, { language: targetLang })}
                  >
                    <Text style={styles.replayIcon}>🔊</Text>
                    <Text style={styles.replayText}>Play Again</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          )}

          {/* Quick Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>1. Choose target language above</Text>
            <Text style={styles.instructionText}>2. Tap circle and speak</Text>
            <Text style={styles.instructionText}>3. Listen to instant translation</Text>
          </View>
        </ScrollView>

        {!isOnline && (
          <View style={styles.offlineBar}>
            <Text style={styles.offlineText}>📡 Offline</Text>
          </View>
        )}
      </LinearGradient>

      <LanguagePicker />
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
    marginTop: 20,
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
    paddingVertical: 40,
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
  voiceIcon: {
    fontSize: 72,
    display: 'none',
  },
  voiceInstruction: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00F5FF',
    marginTop: 30,
    letterSpacing: 2,
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