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

  const scrollViewRef = useRef(null);
  const conversationStartTime = useRef(new Date());
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  // Auto-scroll to bottom when new message
  useEffect(() => {
    if (conversation.length > 0 && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [conversation]);

  // Pulse animation for active listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
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
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  // Start conversation mode
  const startConversation = () => {
    setIsActive(true);
    conversationStartTime.current = new Date();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Add message to conversation
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
    
    // Auto-switch speaker for next turn
    if (continuousMode) {
      setCurrentSpeaker(speaker === 'you' ? 'them' : 'you');
    }
  };

  // Handle voice input
  const handleVoiceInput = async (text) => {
    if (!text.trim()) return;
    
    setIsListening(false);
    
    // Determine translation direction based on current speaker
    const fromLang = currentSpeaker === 'you' ? sourceLang : targetLang;
    const toLang = currentSpeaker === 'you' ? targetLang : sourceLang;
    
    // Translate
    const translated = await translateFunction(text, fromLang, toLang);
    
    if (translated) {
      // Add to conversation
      addMessage(text, translated, currentSpeaker, fromLang, toLang);
      
      // Speak translation
      await speakFunction(translated, toLang);
      
      // If continuous mode, start listening for next speaker
      if (continuousMode && !isPaused) {
        setTimeout(() => {
          startListening();
        }, 1500); 
      }
    }
  };

  // Start listening
  const startListening = async () => {
    setIsListening(true);
    
    try {
      // Determine which language to listen for based on current speaker
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

  // Export conversation
  const exportConversation = async () => {
    if (conversation.length === 0) {
      Alert.alert('No Conversation', 'No messages to export');
      return;
    }

    // Format conversation as text
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

  // Replay message audio
  const replayMessage = async (message) => {
    await speakFunction(message.translated, message.toLang);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Conversation Mode</Text>
          <Text style={styles.headerSubtitle}>
            {sourceLang.toUpperCase()} ↔ {targetLang.toUpperCase()}
          </Text>
        </View>
        
        <TouchableOpacity onPress={exportConversation} style={styles.exportButton}>
          <Text style={styles.exportText}>📤</Text>
        </TouchableOpacity>
      </View>

      {/* Conversation History */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.conversationList}
        contentContainerStyle={styles.conversationContent}
      >
        {conversation.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
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
                  <Text style={styles.translationArrow}>→</Text>
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
                    <Text style={styles.replayIcon}>🔊</Text>
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
            <Text style={styles.listeningIcon}>🎤</Text>
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
          <Text style={styles.toggleIcon}>
            {continuousMode ? '🔄' : '⏸️'}
          </Text>
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
        >
          <Text style={styles.micIcon}>🎤</Text>
        </TouchableOpacity>

        {/* Clear conversation */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearConversation}
          disabled={conversation.length === 0}
        >
          <Text style={[
            styles.clearIcon,
            conversation.length === 0 && styles.clearIconDisabled
          ]}>
            🗑️
          </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#00F5FF',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#00F5FF',
    marginTop: 2,
  },
  exportButton: {
    padding: 8,
  },
  exportText: {
    fontSize: 20,
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
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 255, 0.3)',
  },
  bubbleThem: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
  translationArrow: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
    paddingHorizontal: 30,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  toggleButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(0, 245, 255, 0.15)',
  },
  toggleIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  toggleLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 245, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#00F5FF',
  },
  micButtonActive: {
    backgroundColor: 'rgba(255, 0, 128, 0.2)',
    borderColor: '#FF0080',
  },
  micIcon: {
    fontSize: 32,
  },
  clearButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  clearIcon: {
    fontSize: 20,
    marginBottom: 4,
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