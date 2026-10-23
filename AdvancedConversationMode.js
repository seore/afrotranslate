import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
  Share,
} from 'react-native';
import { Svg, Defs, LinearGradient as SvgLinearGradient, Stop, Mask, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import { EventEmitter } from 'expo-modules-core';

const AdvancedConversationMode = ({
  sourceLang,
  targetLang,
  onExit,
  translateFunction,
  speakFunction,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentSpeaker, setCurrentSpeaker] = useState('you'); 
  const [interimText, setInterimText] = useState('');
  const [continuousMode, setContinuousMode] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const scrollViewRef = useRef(null);
  const conversationStartTime = useRef(new Date());

  // Speech recognition event listeners
  useEffect(() => {
    const eventEmitter = new EventEmitter(ExpoSpeechRecognitionModule);
    
    const startListener = eventEmitter.addListener('start', () => {
      console.log("Advanced conversation: Speech recognition started");
      setIsListening(true);
    });

    const resultListener = eventEmitter.addListener('result', (event) => {
      console.log("Advanced conversation: Speech result:", event);
      
      if (event.results && event.results.length > 0) {
        const result = event.results[0];
        const transcript = result.transcript || result;
        
        if (transcript) {
          setInterimText(transcript);
          
          if (result.isFinal || event.isFinal) {
            handleVoiceInput(transcript);
          }
        }
      }
    });

    const errorListener = eventEmitter.addListener('error', (event) => {
      console.error("Advanced conversation: Speech recognition error:", event);
      setIsListening(false);
    });

    const endListener = eventEmitter.addListener('end', () => {
      console.log("Advanced conversation: Speech recognition ended");
      setIsListening(false);
      setInterimText('');
    });
    
    return () => {
      startListener.remove();
      resultListener.remove();
      errorListener.remove();
      endListener.remove();
    };
  }, [currentSpeaker, sourceLang, targetLang, continuousMode]);

  useEffect(() => {
    if (conversation.length > 0 && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [conversation]);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const startConversation = () => {
    setIsActive(true);
    conversationStartTime.current = new Date();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const addMessage = (originalText, translatedText, speaker, fromLang, toLang) => {
    const message = {
      id: Date.now(),
      original: originalText,
      translated: translatedText,
      speaker: speaker,
      fromLang: fromLang,
      toLang: toLang,
      timestamp: new Date(),
    };
    
    setConversation(prev => [...prev, message]);
    
    if (continuousMode) {
      setCurrentSpeaker(speaker === 'you' ? 'them' : 'you');
    }
  };

  const handleVoiceInput = async (text) => {
    if (!text.trim()) return;
    
    setIsListening(false);
    
    const fromLang = currentSpeaker === 'you' ? sourceLang : targetLang;
    const toLang = currentSpeaker === 'you' ? targetLang : sourceLang;
    
    const translated = await translateFunction(text, fromLang, toLang);
    
    if (translated) {
      addMessage(text, translated, currentSpeaker, fromLang, toLang);
      
      await speakFunction(translated, toLang);
      
      if (continuousMode && !isPaused) {
        setTimeout(() => {
          startListening();
        }, 1500); 
      }
    }
  };

  const startListening = async () => {
    setIsListening(true);
    
    try {
      const listenLang = currentSpeaker === 'you' ? sourceLang : targetLang;
      
      // Start expo-speech-recognition
      await ExpoSpeechRecognitionModule.start({
        lang: listenLang === 'en' ? 'en-US' : 
              listenLang === 'fr' ? 'fr-FR' : 
              listenLang === 'ar' ? 'ar-SA' : 
              listenLang === 'pt' ? 'pt-PT' : 
              listenLang === 'sw' ? 'sw-KE' : 
              'en-US',
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
      });
    } catch (error) {
      console.error('Speech recognition error:', error);
      setIsListening(false);
    }
  };

  /*
  const exportConversation = async () => {
    if (conversation.length === 0) {
      Alert.alert('No Conversation', 'No messages to export');
      return;
    }

    let exportText = `GRIOT Conversation\n`;
    exportText += `Started: ${conversationStartTime.current.toLocaleString()}\n`;
    exportText += `Duration: ${Math.floor((new Date() - conversationStartTime.current) / 60000)} minutes\n`;
    exportText += `Messages: ${conversation.length}\n`;
    exportText += `\n---\n\n`;
    
    conversation.forEach((msg, index) => {
      const speaker = msg.speaker === 'you' ? 'You' : 'Them';
      const time = msg.timestamp.toLocaleTimeString();
      exportText += `[${time}] ${speaker}:\n`;
      exportText += `  ${msg.original}\n`;
      exportText += `  → ${msg.translated}\n\n`;
    });

    try {
      await Share.share({
        message: exportText,
        title: 'GRIOT Conversation',
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share conversation');
    }
  };
  */

  // Clear conversation
  const clearConversation = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear all messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setConversation([]);
            conversationStartTime.current = new Date();
          },
        },
      ]
    );
  };

  const replayMessage = async (message) => {
    await speakFunction(message.translated, message.toLang);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Conversation Mode</Text>
          <Text style={styles.headerSubtitle}>
            {sourceLang.toUpperCase()} ↔ {targetLang.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Conversation History */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.conversationList}
        contentContainerStyle={styles.conversationContent}
      >
        {conversation.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles" size={22} color="#00F5FF" />
            <Text style={styles.emptyTitle}>Start a Conversation</Text>
            <Text style={styles.emptySubtitle}>
              Tap the microphone to begin translating
            </Text>
            <Text style={styles.emptyHint}>
              Continuous mode: Mic stays active for natural dialogue
            </Text>
          </View>
        ) : (
          conversation.map((msg, index) => (
            <View key={msg.id} style={styles.messageContainer}>
              <View style={[
                styles.messageBubble,
                msg.speaker === 'you' ? styles.bubbleYou : styles.bubbleThem
              ]}>
                {/* Speaker label */}
                <Text style={styles.speakerLabel}>
                  {msg.speaker === 'you' ? 'You' : 'Them'} ({msg.fromLang.toUpperCase()})
                </Text>
                
                {/* Original text */}
                <Text style={styles.originalText}>{msg.original}</Text>
                
                {/* Translation */}
                <View style={styles.translationBox}>
                  <Ionicons name="arrow-forward" size={15} color="#fff" />
                  <Text style={styles.translatedText}>{msg.translated}</Text>
                </View>
                
                {/* Timestamp and replay */}
                <View style={styles.messageFooter}>
                  <Text style={styles.timestamp}>
                    {msg.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => replayMessage(msg)}
                    style={styles.replayButton}
                  >
                    <Ionicons name="volume-high" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Active speaker indicator */}
      {isListening && (
        <View style={styles.listeningIndicator}>
          <Animated.View style={[
            styles.listeningPulse,
            { transform: [{ scale: pulseAnim }] }
          ]}>
            <Ionicons name="mic-circle" size={36} color="#00F5FF" />
          </Animated.View>
          <Text style={styles.listeningText}>
            Listening to {currentSpeaker === 'you' ? 'You' : 'Them'}...
          </Text>
          {interimText && (
            <Text style={styles.interimText}>"{interimText}"</Text>
          )}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {/* Continuous mode toggle */}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            continuousMode && styles.toggleButtonActive
          ]}
          onPress={() => setContinuousMode(!continuousMode)}
        >
          <Ionicons 
            name={continuousMode ? 'infinite' : 'pause'}
            size={20}
            style={styles.toggleIcon}
          />
          <Text style={styles.toggleLabel}>
            {continuousMode ? 'Continuous' : 'Manual'}
          </Text>
        </TouchableOpacity>

        {/* Main mic button */}
        <TouchableOpacity
          style={[
            styles.micButton,
            isListening && styles.micButtonActive
          ]}
          onPress={isListening ? () => setIsListening(false) : startListening}
          activeOpacity={0.9}
        >
          <Animated.View 
            style={[
              styles.micGlow,
              { opacity: isListening ? 0.6 : 0.3, transform: [{ scale: pulseAnim }] },
            ]}
          />
          <Ionicons
            name='mic'
            size={50}
            color={ isListening ? '#41f1f7' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Clear conversation */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearConversation}
          disabled={conversation.length === 0}
        >
          <Ionicons 
            name='trash-outline'
            size={20}
            style={[
              styles.clearIcon,
              conversation.length === 0 && styles.clearIconDisabled
            ]}
          />
          <Text style={styles.clearLabel}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Stats footer */}
      {conversation.length > 0 && (
        <View style={styles.statsFooter}>
          <Text style={styles.statsText}>
            {conversation.length} messages • {
              Math.floor((new Date() - conversationStartTime.current) / 60000)
            } min
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    minWidth: 70,
  },
  backText: {
    fontSize: 17,
    color: '#00F5FF',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#00F5FF',
    marginTop: 2,
    fontWeight: '600',
  },
  exportButton: {
    padding: 8,
    minWidth: 70,
    alignItems: 'flex-end',
  },
  exportText: {
    fontSize: 22,
  },
  conversationList: {
    flex: 1,
  },
  conversationContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 12,
  },
  bubbleYou: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0, 245, 255, 0.15)',
    borderWidth: 2,
    width: 150,
    borderColor: 'rgba(0, 245, 255, 0.3)',
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: 150,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  speakerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00F5FF',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  originalText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  translationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  translatedText: {
    flex: 1,
    fontSize: 14,
    color: '#CCC',
    fontStyle: 'italic',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
  },
  replayButton: {
    padding: 4,
  },
  replayIcon: {
    fontSize: 14,
  },
  listeningIndicator: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  listeningPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 245, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  listeningIcon: {
    fontSize: 32,
  },
  listeningText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00F5FF',
    marginBottom: 8,
  },
  interimText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    paddingHorizontal: 40,
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  toggleButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: 80,
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(0, 245, 255, 0.15)',
  },
  toggleIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: '#ffffff',
  },
  toggleLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    overflow: 'hidden',
    justifyContent: 'center',
    //elevation: 20,
  },
  micButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  micGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1ff1f8',
    shadowColor: '#16ceb2',
    blurRadius: 20,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
  },
  clearButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: 80,
  },
  clearIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: "#fff"
  },
  clearIconDisabled: {
    opacity: 0.3,
  },
  clearLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  statsFooter: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
});

export default AdvancedConversationMode;