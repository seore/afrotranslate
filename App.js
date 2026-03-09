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
import TrackPlayer from 'react-native-track-player';
import { useAudioPlayer } from 'expo-audio';
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import { EventEmitter } from 'expo-modules-core';
import { API_KEY } from '@env';

import AdvancedConversationMode from './AdvancedConversationMode.js';
import { applyHausaPronunciation } from './pronounciation-hausa.js';
import { applyIgboTones } from './pronounciation-igbo.js';
import { applySwahiliPronunciation } from './pronounciation-swahili.js';
import { applyYorubaTones } from './pronounciation-yoruba.js';
import { applyZuluPronunciation } from './pronounciation-zulu.js';

const { width, height } = Dimensions.get('window');

const AFRICAN_LANGUAGES = [
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: '🇰🇪', popular: true, color: '#ff7b00' },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá', flag: '🇳🇬', popular: true, color: '#058924' },
  { code: 'ha', name: 'Hausa', native: 'Hausa', flag: '🇳🇬', popular: true, color: '#0ac82a' },
  { code: 'ig', name: 'Igbo', native: 'Igbo', flag: '🇳🇬', popular: true, color: '#1eff00' },
  { code: 'zu', name: 'Zulu', native: 'isiZulu', flag: '🇿🇦', popular: true, color: '#ed4e14' },
  { code: 'xh', name: 'Xhosa', native: 'isiXhosa', flag: '🇿🇦', popular: false, color: '#ec7907' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦', popular: false, color: '#FF3366' },
  { code: 'am', name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹', popular: true, color: '#ffdd00' },
  { code: 'so', name: 'Somali', native: 'Soomaali', flag: '🇸🇴', popular: false, color: '#4D9FFF' },
  { code: 'rw', name: 'Kinyarwanda', native: 'Kinyarwanda', flag: '🇷🇼', popular: false, color: '#f6ff00' },
  { code: 'en', name: 'English', native: 'English', flag: '🌍', popular: true, color: '#1E90FF' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', popular: true, color: '#ffffff' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', popular: true, color: '#73ff00' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', popular: true, color: '#ec0404' },
];

const OFFLINE_PACKS = {
  // === SWAHILI - 110+ phrases ===
  'sw': {
    // Greetings
    'Hello': 'Habari',
    'Good morning': 'Habari za asubuhi',
    'Good afternoon': 'Habari za mchana',
    'Good evening': 'Habari za jioni',
    'How are you?': 'Hujambo?',
    'I am fine': 'Sijambo',
    'Welcome': 'Karibu',
    'Goodbye': 'Kwaheri',
    'See you later': 'Tutaonana',
    
    // Thank you / Please
    'Thank you': 'Asante',
    'Thank you very much': 'Asante sana',
    'Please': 'Tafadhali',
    'Sorry': 'Pole',
    'Excuse me': 'Samahani',
    
    // Yes/No
    'Yes': 'Ndiyo',
    'No': 'Hapana',
    'Okay': 'Sawa',
    
    // Emergency / Help
    'Help': 'Msaada',
    'I need help': 'Nahitaji msaada',
    'Help me': 'Nisaidie',
    'Emergency': 'Dharura',
    'I am lost': 'Nimepotea',
    'Call the police': 'Ita polisi',
    
    // Restaurant / Food
    'Water': 'Maji',
    'Food': 'Chakula',
    'I want food': 'Nataka chakula',
    'What do you have?': 'Mna nini?',
    'Delicious': 'Ni tamu',
    'The bill please': 'Leta bili',
    'Fish': 'Samaki',
    'Meat': 'Nyama',
    'I am hungry': 'Nina njaa',
    'I am thirsty': 'Nina kiu',
    
    // Hotel
    'I want a room': 'Nataka chumba',
    'No water': 'Hakuna maji',
    'Wake me at': 'Niamshe saa',
    
    // Transport
    'Take me to': 'Nipeleke',
    'Airport': 'Uwanja wa ndege',
    'Stop here': 'Simama hapa',
    'Fast': 'Haraka',
    
    // Medical
    'I am sick': 'Naumwa',
    'Doctor': 'Daktari',
    'My head hurts': 'Kichwa kinauma',
    'Medicine': 'Dawa',
    
    // Shopping
    'How much?': 'Bei gani?',
    'Too expensive': 'Bei kubwa sana',
    'Reduce the price': 'Punguza bei',
    'Too big': 'Kubwa sana',
    'Too small': 'Ndogo sana',
    
    // Questions
    'Where?': 'Wapi?',
    'Where is the bathroom?': 'Choo kiko wapi?',
    'What?': 'Nini?',
    'When?': 'Lini?',
    'Why?': 'Kwa nini?',
    'Who?': 'Nani?',
    'How?': 'Vipi?',
    
    // Directions
    'Turn right': 'Geuka kulia',
    'Turn left': 'Geuka kushoto',
    'Straight': 'Moja kwa moja',
    'Near': 'Karibu',
    'Far': 'Mbali',
    'Right': 'Kulia',
    'Left': 'Kushoto',
    'Front': 'Mbele',
    'Back': 'Nyuma',
    
    // Common
    'My name is': 'Jina langu ni',
    'Money': 'Pesa',
    'House': 'Nyumba',
    'Market': 'Soko',
    
    // Numbers
    'One': 'Moja',
    'Two': 'Mbili',
    'Three': 'Tatu',
    'Four': 'Nne',
    'Five': 'Tano',
    'Six': 'Sita',
    'Seven': 'Saba',
    'Eight': 'Nane',
    'Nine': 'Tisa',
    'Ten': 'Kumi',
    
    // Useful
    'I understand': 'Naelewa',
    'I do not understand': 'Sielewi',
    'I want': 'Nataka',
    'I like': 'Napenda',
  },

  // === YORUBA - 100+ phrases ===
  'yo': {
    // Greetings
    'Hello': 'Bawo',
    'Good morning': 'E kaaro',
    'Good afternoon': 'E kaasan',
    'Good evening': 'E kale',
    'Good night': 'E ku ale',
    'How are you?': 'Bawo ni?',
    'I am fine': 'Mo wa daadaa',
    'Welcome': 'E kaabo',
    'Goodbye': 'O dabo',
    
    // Thank you / Please
    'Thank you': 'E se',
    'Thank you very much': 'E se pupo',
    'Please': 'Jọwọ',
    'Sorry': 'Pele',
    
    // Yes/No
    'Yes': 'Bẹẹni',
    'No': 'Rara',
    'Okay': 'O dara',
    
    // Emergency / Help
    'Help': 'Iranlọwọ',
    'I need help': 'Mo nilo iranlọwọ',
    'Help me': 'E gba mi',
    'I am lost': 'Mo ti ṣọnu',
    'Call the police': 'Pe ọlọpa',
    'I am sick': 'Mo ṣaisan',
    
    // Restaurant / Food
    'Water': 'Omi',
    'Food': 'Ounjẹ',
    'I want food': 'Mo fẹ ounjẹ',
    'What do you have?': 'Kini o ni?',
    'How much?': 'Elo ni?',
    'Delicious': 'O dun',
    'Very delicious': 'O dun pupo',
    'The bill': 'Fun mi ni bill',
    'Fish': 'Ẹja',
    'Meat': 'Ẹran',
    'Rice': 'Iresi',
    'Soup': 'Ọbẹ',
    'I am hungry': 'Ebi n pa mi',
    
    // Hotel
    'I want a room': 'Mo fẹ yara',
    'No water': 'Omi ko si',
    'No light': 'Ina ko si',
    'Wake me at': 'Ji mi ni',
    
    // Transport
    'Take me to': 'Mu mi lọ si',
    'Airport': 'Papa ọkọ ofurufu',
    'Stop here': 'Duro nibi',
    'Fast': 'Yara',
    'Slowly': 'Lọra',
    'Car': 'Ọkọ ayọkẹlẹ',
    'Bus': 'Bọsi',
    
    // Medical
    'Doctor': 'Dokita',
    'My head hurts': 'Ori mi n ro',
    'Medicine': 'Oogun',
    'I have fever': 'Mo ni iba',
    
    // Shopping
    'Too expensive': 'O po ju',
    'Reduce the price': 'Din owo',
    'Too big': 'Tobi ju',
    'Too small': 'Kere ju',
    
    // Questions
    'Where?': 'Nibo?',
    'Where is the bathroom?': 'Nibo ni baluwe wa?',
    'What?': 'Kini?',
    'Why?': 'Kilode?',
    'When?': 'Nigbawo?',
    'Who?': 'Tani?',
    'How?': 'Bawo?',
    
    // Directions
    'Right': 'Apa ọtun',
    'Left': 'Apa osi',
    'Front': 'Iwaju',
    'Back': 'Ehin',
    'Go right': 'Lọ si ọtun',
    'Go left': 'Lọ si osi',
    'Straight ahead': 'Tẹsiwaju',
    'Near': 'Sunmọ',
    'Far': 'Jinna',
    
    // Common
    'My name is': 'Orukọ mi ni',
    'Money': 'Owo',
    'House': 'Ile',
    'Market': 'Oja',
    
    // Numbers
    'One': 'Ọkan',
    'Two': 'Meji',
    'Three': 'Meta',
    'Four': 'Merin',
    'Five': 'Marun',
    'Six': 'Mefa',
    'Seven': 'Meje',
    'Eight': 'Mejo',
    'Nine': 'Mesan',
    'Ten': 'Mẹwa',
    
    // Useful
    'I understand': 'Mo gbo',
    'I do not understand': 'Mo ko gbo',
    'I want': 'Mo fẹ',
    'I like': 'Mo feran',
  },

  // === HAUSA - 100+ phrases ===
  'ha': {
    // Greetings
    'Hello': 'Sannu',
    'Good morning': 'Barka da safe',
    'Good afternoon': 'Ina wuni',
    'Good evening': 'Barka da yamma',
    'How are you?': 'Yaya dai?',
    'I am fine': 'Lafiya lau',
    'Thank God': 'Alhamdulillah',
    'Welcome': 'Maraba',
    'Goodbye': 'Sai an jima',
    'See you tomorrow': 'Sai gobe',
    
    // Thank you / Please
    'Thank you': 'Na gode',
    'Thank you very much': 'Na gode sosai',
    'Please': 'Don Allah',
    'Sorry': 'Ku yi hakuri',
    
    // Yes/No
    'Yes': 'Eh',
    'No': "A'a",
    'Okay': 'To',
    
    // Emergency / Help
    'Help': 'Taimako',
    'I need help': 'Ina buƙatar taimako',
    'Help me': 'Ku taimake ni',
    'I am lost': 'Na ɓace',
    'Call the police': "Kira 'yan sanda",
    
    // Restaurant / Food
    'Water': 'Ruwa',
    'Food': 'Abinci',
    'I want food': 'Ina son abinci',
    'What do you have?': 'Me kuke da shi?',
    'Delicious': 'Ya yi daɗi',
    'The bill': 'Lissafi',
    'Fish': 'Kifi',
    'Meat': 'Nama',
    'I am hungry': 'Ina jin yunwa',
    'I am thirsty': 'Ina jin ƙishirwa',
    
    // Hotel
    'I want a room': 'Ina son ɗaki',
    'No water': 'Babu ruwa',
    'Wake up call': 'Fadakarwa',
    
    // Transport
    'Take me': 'Kai ni',
    'Airport': 'Filin jirgin sama',
    'Stop here': 'Tsaya nan',
    'Fast': 'Da sauri',
    
    // Medical
    'I am not well': 'Ba ni lafiya',
    'Doctor': 'Likita',
    'My head hurts': 'Kai na ciwo',
    'Medicine': 'Magani',
    
    // Shopping
    'How much?': 'Nawa ne?',
    'Too expensive': 'Ya yi tsada',
    'Reduce the price': 'Rage farashi',
    'Too big': 'Ya yi girma',
    'Too small': 'Ya yi ƙanƙanta',
    
    // Questions
    'Where?': 'Ina?',
    'Where is the bathroom?': 'Ina toilet?',
    'What?': 'Me ne?',
    'When?': 'Yaushe?',
    'Why?': 'Don me?',
    'Who?': 'Wa ne?',
    'How?': 'Yaya?',
    
    // Directions
    'Turn right': 'Juya dama',
    'Turn left': 'Juya hagu',
    'Straight': 'Kai tsaye',
    'Near': 'Kusa',
    'Far': 'Nesa',
    'Right': 'Dama',
    'Left': 'Hagu',
    'Front': 'Gaba',
    'Back': 'Baya',
    
    // Common
    'My name is': 'Sunana',
    'Money': 'Kuɗi',
    'House': 'Gida',
    'Market': 'Kasuwa',
    
    // Numbers
    'One': 'Daya',
    'Two': 'Biyu',
    'Three': 'Uku',
    'Four': 'Huɗu',
    'Five': 'Biyar',
    'Six': 'Shida',
    'Seven': 'Bakwai',
    'Eight': 'Takwas',
    'Nine': 'Tara',
    'Ten': 'Goma',
    
    // Useful
    'I understand': 'Na gane',
    'I do not understand': 'Ban gane ba',
    'I want': 'Ina so',
  },

  // === ZULU - 100+ phrases ===
  'zu': {
    // Greetings
    'Hello': 'Sawubona',
    'Good morning': 'Sawubona ekuseni',
    'Good afternoon': 'Sawubona emini',
    'Good evening': 'Sawubona ntambama',
    'How are you?': 'Unjani?',
    'I am fine': 'Ngiyaphila',
    'Welcome': 'Siyakwamukela',
    'Goodbye': 'Sala kahle',
    'Safe journey': 'Hamba kahle',
    
    // Thank you / Please
    'Thank you': 'Ngiyabonga',
    'Thank you very much': 'Ngiyabonga kakhulu',
    'Please': 'Ngiyacela',
    'Sorry': 'Uxolo',
    
    // Yes/No
    'Yes': 'Yebo',
    'No': 'Cha',
    'Okay': 'Kulungile',
    
    // Emergency / Help
    'Help': 'Usizo',
    'I need help': 'Ngidinga usizo',
    'Help me': 'Ngisize',
    'I am lost': 'Ngilahlekile',
    'Call the police': 'Shayela amaphoyisa',
    
    // Restaurant / Food
    'Water': 'Amanzi',
    'Food': 'Ukudla',
    'I want food': 'Ngifuna ukudla',
    'What do you have?': 'Ninani?',
    'Delicious': 'Kumnandi',
    'The bill': 'Ngipha i-bill',
    'Fish': 'Inhlanzi',
    'Meat': 'Inyama',
    'I am hungry': 'Ngilambile',
    'I am thirsty': 'Ngomile',
    
    // Hotel
    'I want a room': 'Ngifuna igumbi',
    'No water': 'Akunamanzi',
    'Wake me at': 'Ngivuse ngo',
    
    // Transport
    'Take me': 'Ngiyisa',
    'Airport': 'Isikhumulo sezindiza',
    'Stop here': 'Misa lapha',
    'Fast': 'Shesha',
    
    // Medical
    'I am sick': 'Ngiyagula',
    'Doctor': 'Udokotela',
    'My head hurts': 'Ikhanda liyahlaba',
    'Medicine': 'Umuthi',
    
    // Shopping
    'How much?': 'Malini?',
    'Too expensive': 'Kubiza kakhulu',
    'Reduce the price': 'Yehlisa intengo',
    'Too big': 'Kukhulu kakhulu',
    'Too small': 'Kuncane kakhulu',
    
    // Questions
    'Where?': 'Kuphi?',
    'Where is the bathroom?': 'Ikuphi indlu yangasese?',
    'What?': 'Yini?',
    'When?': 'Nini?',
    'Why?': 'Kungani?',
    'Who?': 'Ubani?',
    'How?': 'Kanjani?',
    
    // Directions
    'Turn right': 'Jika kwesokudla',
    'Turn left': 'Jika kwesokunxele',
    'Straight': 'Qonda',
    'Near': 'Eduze',
    'Far': 'Kude',
    'Front': 'Phambili',
    'Back': 'Emuva',
    
    // Common
    'My name is': 'Igama lami',
    'Money': 'Imali',
    'House': 'Indlu',
    'Shop': 'Isitolo',
    
    // Numbers
    'One': 'Kunye',
    'Two': 'Kubili',
    'Three': 'Kuthathu',
    'Four': 'Kune',
    'Five': 'Kuhlanu',
    'Six': 'Isithupha',
    'Seven': 'Isikhombisa',
    'Eight': 'Isishiyagalombili',
    'Nine': 'Isishiyagalolunye',
    'Ten': 'Ishumi',
    
    // Useful
    'I understand': 'Ngiyaqonda',
    'I do not understand': 'Angiqondi',
    'I want': 'Ngifuna',
    'I like': 'Ngithanda',
  },

  // === IGBO - 100+ phrases ===
  'ig': {
    // Greetings
    'Hello': 'Ndewo',
    'Good morning': 'Ụtụtụ ọma',
    'Good afternoon': 'Ehihie ọma',
    'Good evening': 'Mgbede ọma',
    'Good night': 'Abalị ọma',
    'How are you?': 'Kedu ka ị mere?',
    'I am fine': 'A dị m mma',
    'Welcome': 'Nnọọ',
    'Goodbye': 'Ka ọmesịa',
    
    // Thank you / Please
    'Thank you': 'Daalụ',
    'Thank you very much': 'Daalụ rinne',
    'Please': 'Biko',
    
    // Yes/No
    'Yes': 'Ee',
    'No': 'Mba',
    'Okay': 'Ọ dị mma',
    
    // Emergency / Help
    'Help': 'Enyemaka',
    'I need help': 'Achọrọ m enyemaka',
    'Help me': 'Nyere m aka',
    'Please help me': 'Biko nyere m aka',
    'I am lost': 'Efuru m ụzọ',
    'Call the police': 'Kpọọ ndị uwe ojii',
    
    // Restaurant / Food
    'Water': 'Mmiri',
    'Food': 'Nri',
    'I want food': 'Achọrọ m nri',
    'What do you have?': 'Gịnị ka ị nwere?',
    'Delicious': 'Ọ tọrọ ụtọ',
    'The bill': 'Nye m bill',
    'Fish': 'Azụ',
    'Meat': 'Anụ',
    'I am hungry': 'Agụụ na-agụ m',
    
    // Hotel
    'I want a room': 'Achọrọ m ọnụ ụlọ',
    'No water': 'Enweghị mmiri',
    'Wake me': 'Kpọtee m',
    
    // Transport
    'Take me to': 'Buru m gaa',
    'Airport': 'Ọdụ ụgbọ elu',
    'Stop here': 'Kwụsị ebe a',
    'Fast': 'Ngwa ngwa',
    
    // Medical
    'I am not well': 'Ahụ adịghị m mma',
    'Doctor': 'Dọkịta',
    'My head hurts': 'Isi m na-ama jijiji',
    'Medicine': 'Ọgwụ',
    
    // Shopping
    'How much?': 'Ego ole?',
    'Too expensive': 'Ọ dị oke ọnụ',
    'Reduce the price': 'Belata ọnụ ahịa',
    'Too big': 'O buru ibu',
    'Too small': 'O pere mpe',
    
    // Questions
    'Where?': 'Olee?',
    'Where is the bathroom?': 'Olee ebe ụlọ mposi dị?',
    'What?': 'Gịnị?',
    'When?': 'Mgbe?',
    'Why?': 'Gịnị mere?',
    'Who?': 'Ònye?',
    
    // Directions
    'Turn right': 'Tụgharịa aka nri',
    'Turn left': 'Tụgharịa aka ekpe',
    'Straight': 'Kwụ ọtọ',
    'Near': 'Ọ dị nso',
    'Far': 'Ọ dị anya',
    'Right': 'Aka nri',
    'Left': 'Aka ekpe',
    'Front': 'Ihu',
    'Back': 'Azụ',
    
    // Common
    'My name is': 'Aha m bụ',
    'Money': 'Ego',
    'House': 'Ụlọ',
    'Market': 'Ahịa',
    
    // Numbers
    'One': 'Otu',
    'Two': 'Abụọ',
    'Three': 'Atọ',
    'Four': 'Anọ',
    'Five': 'Ise',
    'Six': 'Isii',
    'Seven': 'Asaa',
    'Eight': 'Asatọ',
    'Nine': 'Itoolu',
    'Ten': 'Iri',
    
    // Useful
    'I understand': 'Aghọtara m',
    'I do not understand': 'Aghọtaghị m',
    'I want': 'Achọrọ m',
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
    'yo': 5,  
    'ig': 5,   
    'ha': 0,   
    'sw': -2,  
    'zu': 0,   
  };
  return pitchMap[langCode] || 0;
};

const getRateForLanguage = (langCode) => {
  const rateMap = {
    'yo': 0.8,   
    'ig': 0.8,   
    'ha': 0.85,  
    'sw': 0.9,   
    'zu': 0.85,  
  };
  return rateMap[langCode] || 0.85;
};

export default function App() {
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
  const [downloadedPacks, setDownloadedPacks] = useState(['sw', 'yo', 'ha', 'zu', 'ig']); // Pre-loaded packs
  const [hasInteracted, setHasInteracted] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [missingVoice, setMissingVoice] = useState(false);
  //const [availableVoices, setAvailableVoices] = useState([]);
  const [showConversation, setShowConversationMode] = useState(false);
  const [autoDetectMode, setAutoDetectMode] = useState(false);
  
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));

  const audioPlayer = useAudioPlayer();

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

  // Separate effect for speech recognition listeners that updates when languages change
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
            // Call translate with current state
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

      // Try offline translation first if offline or pack is downloaded
      if (!isOnline || downloadedPacks.includes(targetLang)) {
        const offlinePack = OFFLINE_PACKS[targetLang];
        if (offlinePack && offlinePack[text]) {
          const translated = offlinePack[text];
          setTranslatedText(translated);
          
          // Add to conversation history if in conversation mode
          if (conversationMode) {
            setConversationHistory(prev => [...prev, {
              source: text,
              translated,
              sourceLang: fromLang,
              targetLang,
              timestamp: new Date(),
            }]);
          }
          
          // Auto-play translation
          setTimeout(() => {
            speakWithAfricanVoice(translated, targetLang);
          }, 500);
          
          setIsTranslating(false);
          return;
        }
      }

      // Fall back to online translation
      if (!isOnline) {
        Alert.alert('Offline', 'No internet connection and phrase not in offline pack.');
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
      
      // Add to conversation history if in conversation mode
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
      
      // Auto-play translation
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

  /*
  const toggleConversationMode = () => {
    setConversationMode(!conversationMode);
    hapticFeedback('medium');
    if (!conversationMode) {
      setConversationHistory([]);
    }
  };*/

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
    
    console.log(`Speaking with SSML pronounciation in ${languageCode}`);

    // Call Google Cloud TTS API with ssml
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
            languageCode: languageCode, ...(voiceName && {name: voiceName}),
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

        // Load and play with expo-audio
        audioPlayer.replace({ uri: fileUri });
        audioPlayer.play();

        console.log('Playing Google TTS with SSML pronunciation!');

        // Cleanup after playback
        setTimeout(() => {
          FileSystem.deleteAsync(fileUri, { idempotent: true });
        }, 10000);
      } catch (audioError) {
        console.error('Audio playback error:', audioError);
        console.log('Falling back to expo-speech...');
        fallbackToExpoSpeech(text, langCode);
      }
    }
  } catch (error) {
    console.error('Google TTS error:', error);
    fallbackToExpoSpeech(text, langCode);
  }
};

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
    
    // Get available voices
    const voices = await Speech.getAvailableVoicesAsync();
    
    // Voice preferences - prioritize African accents
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
    
    console.log('Expo-speech playback started');
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
            {/* Auto-Detect Option */}
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
            
            {/* Conversation Mode Toggle */}
            <TouchableOpacity 
              style={styles.conversationToggle}
              onPress={() => {
                hapticFeedback();
                setShowConversationMode(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name='chatbubble-ellipses' size={24} color={"#ffffff"}/>
              <Text style={styles.conversationToggleText}>
                Conversation Mode
              </Text>
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

          {/* Conversation History */}
          {conversationMode && conversationHistory.length > 0 && (
            <View style={styles.conversationHistory}>
              <Text style={styles.conversationHistoryTitle}>Recent Exchanges</Text>
              <ScrollView
                style={styles.conversationScroll}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={ false }
              >
              {conversationHistory.slice(-5).reverse().map((item, index) => (
                <View key={index} style={styles.conversationItem}>
                  <View style={styles.conversationBubbleYou}>
                    <Text style={styles.conversationLabel}>You</Text>
                    <Text style={styles.conversationSource}>{item.source}</Text>
                  </View>
                  <View style={styles.conversationBubbleThem}>
                    <Text style={styles.conversationLabel}>Translation</Text>
                    <Text style={styles.conversationTranslated}>{item.translated}</Text>
                  </View>
                </View>
              ))}
              </ScrollView>
            </View>
          )}

          {/* Instructions - only shown before */}
          {!hasInteracted && (
            <View style={styles.instructions}>
            <Text style={styles.instructionText}>1. Choose target language above</Text>
            <Text style={styles.instructionText}>2. Tap circle and speak</Text>
            <Text style={styles.instructionText}>3. Listen to instant translation</Text>
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

        {missingVoice && (
          <View style={styles.voiceHintBar}>
            <Text style={styles.voiceHintText}>Download {getLanguageInfo(targetLang)?.name} voice in Settings for better accent</Text>
            <TouchableOpacity onPress={() => setMissingVoice(false)} style={styles.voiceHintClose}>
              <Ionicons name='close' size={22} color={"#fff"}/>
            </TouchableOpacity>
          </View>
        )}
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
    marginTop: 25,
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
  swapText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '900',
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
  conversationToggleActive: {
    backgroundColor: 'rgba(0,245,255,0.15)',
    borderColor: '#00F5FF',
  },
  conversationToggleIcon: {
    fontSize: 20,
  },
  conversationToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  conversationToggleTextActive: {
    color: '#00F5FF',
  },
  conversationScroll: {
    flex: 1,
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
    //paddingRight: 10,
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
    //alignSelf: 'flex-start',
    //position: 'absolute',
    //top: 10,
    //right: 10,
    backgroundColor: '#22c55e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    //zIndex: 10,
    //marginTop: 8,
    //marginBottom: 8,
  },
  offlinePackText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
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
  voiceHintBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,245,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00F5FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceHintText: {
    flex: 1,
    color: '#00F5FF',
    fontSize: 12,
    fontWeight: '600',
  },
  voiceHintClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceHintCloseText: {
    color: '#00F5FF',
    fontSize: 14,
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
  conversationHistory: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 16,
    maxHeight: height * 0.35,
  },
  conversationHistoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00F5FF',
    marginBottom: 10,
    textAlign: 'center',
  },
  conversationItem: {
    marginBottom: 12,
    //gap: 8,
  },
  conversationBubbleYou: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 16,
    marginBottom: 6,
    maxWidth: '80%',
  },
  conversationBubbleThem: {
    alignSelf: 'flex-end',
    backgroundColor: '#222222',
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
    marginBottom: 12,
    position: 'relative',
  },
  conversationLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#888',
    marginBottom: 4,
    //textTransform: 'uppercase',
  },
  conversationSource: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 20,
  },
  conversationTranslated: {
    fontSize: 14,
    color: '#00F5FF',
    fontWeight: '600',
    lineHeight: 20,
    paddingRight: 36,
  },
  playAgainBtn: {
    //position: 'absolute',
    //bottom: 10,
    //right: 10,
    flexDirection: 'row',
    backgroundColor: '#00F5FF',
    padding: 6,
    borderRadius: 20,
    alignItems: 'center',
    //justifyContent: 'center',
    shadowColor: '#00F5FF',
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    //elevation: 5,
  },
});