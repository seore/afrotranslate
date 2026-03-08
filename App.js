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
import { useAudioPlayer } from 'expo-audio';
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import { EventEmitter } from 'expo-modules-core';
import { API_KEY } from '@env';
import AdvancedConversationMode from './AdvancedConversationMode.js';

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
  'sw': {
    'Hello': 'Habari',
    'Good morning': 'Habari ya asubuhi',
    'Good evening': 'Habari ya jioni',
    'Thank you': 'Asante',
    'Please': 'Tafadhali',
    'Yes': 'Ndiyo',
    'No': 'Hapana',
    'How are you?': 'Habari yako?',
    'Goodbye': 'Kwaheri',
    'I need help': 'Nahitaji msaada',
    'Where is the bathroom?': 'Choo kiko wapi?',
    'How much?': 'Bei gani?',
    'Water': 'Maji',
    'Food': 'Chakula',
    'Help': 'Msaada',
  },
  'yo': {
    'Hello': 'Bawo',
    'Good morning': 'E kaaro',
    'Good evening': 'E kaasan',
    'Thank you': 'E se',
    'Please': 'Jọwọ',
    'Yes': 'Bẹẹni',
    'No': 'Rara',
    'How are you?': 'Bawo ni?',
    'Goodbye': 'O dabo',
    'I need help': 'Mo nilo iranlọwọ',
    'Where is the bathroom?': 'Nibo ni baluwe wa?',
    'How much?': 'Elo ni?',
    'Water': 'Omi',
    'Food': 'Ounjẹ',
    'Help': 'Iranlọwọ',
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

const applyYorubaTones = (text) => {
  const pronunciationMap = {
    // Greetings & Time of Day
    'Bawo': '<phoneme alphabet="ipa" ph="baː.wɔ">Bawo</phoneme>',
    'E kaaro': '<phoneme alphabet="ipa" ph="ɛ kaː.ɾɔ">E kaaro</phoneme>',
    'E kaasan': '<phoneme alphabet="ipa" ph="ɛ kaː.san">E kaasan</phoneme>',
    'E kale': '<phoneme alphabet="ipa" ph="ɛ ka.lɛ">E kale</phoneme>',
    'E ku irole': '<phoneme alphabet="ipa" ph="ɛ ku i.ɾɔ.lɛ">E ku irole</phoneme>',
    'E ku ọsan': '<phoneme alphabet="ipa" ph="ɛ ku ɔ.san">E ku ọsan</phoneme>',
    'Pele': '<phoneme alphabet="ipa" ph="pɛ.lɛ">Pele</phoneme>',
    
    // Thank you / Please
    'E se': '<phoneme alphabet="ipa" ph="ɛ ʃɛ">E se</phoneme>',
    'E se pupo': '<phoneme alphabet="ipa" ph="ɛ ʃɛ pú.pɔ̀">E se pupo</phoneme>',
    'E se gan': '<phoneme alphabet="ipa" ph="ɛ ʃɛ gan">E se gan</phoneme>',
    'O se': '<phoneme alphabet="ipa" ph="ɔ ʃɛ">O se</phoneme>',
    'Jọwọ': '<phoneme alphabet="ipa" ph="dʒɔ.wɔ">Jọwọ</phoneme>',
    'Ejo': '<phoneme alphabet="ipa" ph="ɛ.dʒɔ">Ejo</phoneme>',
    'Ejo ma': '<phoneme alphabet="ipa" ph="ɛ.dʒɔ ma">Ejo ma</phoneme>',
    
    // Yes/No
    'Bẹẹni': '<phoneme alphabet="ipa" ph="bɛː.ni">Bẹẹni</phoneme>',
    'Beeni': '<phoneme alphabet="ipa" ph="bɛː.ni">Beeni</phoneme>',
    'Rara': '<phoneme alphabet="ipa" ph="ɾa.ɾa">Rara</phoneme>',
    'Ko si': '<phoneme alphabet="ipa" ph="kɔ ʃi">Ko si</phoneme>',
    'Bẹẹ': '<phoneme alphabet="ipa" ph="bɛː">Bẹẹ</phoneme>',
    
    // How are you / I am fine
    'Bawo ni': '<phoneme alphabet="ipa" ph="baː.wɔ ni">Bawo ni</phoneme>',
    'Se daadaa ni': '<phoneme alphabet="ipa" ph="ʃɛ daː.daː ni">Se daadaa ni</phoneme>',
    'Mo wa daadaa': '<phoneme alphabet="ipa" ph="mɔ wa daː.daː">Mo wa daadaa</phoneme>',
    'Daadaa': '<phoneme alphabet="ipa" ph="daː.daː">Daadaa</phoneme>',
    'Mo wa dupe': '<phoneme alphabet="ipa" ph="mɔ wa du.pɛ">Mo wa dupe</phoneme>',
    'Alafia': '<phoneme alphabet="ipa" ph="a.la.fi.a">Alafia</phoneme>',
    
    // Goodbye
    'O dabo': '<phoneme alphabet="ipa" ph="ɔ da.bɔ">O dabo</phoneme>',
    'O da': '<phoneme alphabet="ipa" ph="ɔ da">O da</phoneme>',
    'Ma a ri e': '<phoneme alphabet="ipa" ph="maː ɾi ɛ">Ma a ri e</phoneme>',
    'O digba': '<phoneme alphabet="ipa" ph="ɔ di.gba">O digba</phoneme>',
    
    // Help / Emergency
    'Mo nilo iranlọwọ': '<phoneme alphabet="ipa" ph="mɔ ní.lɔ i.ɾan.lɔ.wɔ">Mo nilo iranlọwọ</phoneme>',
    'E gba mi': '<phoneme alphabet="ipa" ph="ɛ gba mi">E gba mi</phoneme>',
    'Iranlọwọ': '<phoneme alphabet="ipa" ph="i.ɾan.lɔ.wɔ">Iranlọwọ</phoneme>',
    'Ran mi lọwọ': '<phoneme alphabet="ipa" ph="ɾan mi lɔ.wɔ">Ran mi lọwọ</phoneme>',
    'Egba mi o': '<phoneme alphabet="ipa" ph="ɛ.gba mi ɔ">Egba mi o</phoneme>',
    
    // Questions
    'Nibo ni': '<phoneme alphabet="ipa" ph="ní.bɔ ni">Nibo ni</phoneme>',
    'Nibo ni baluwe wa': '<phoneme alphabet="ipa" ph="ní.bɔ ni ba.lu.wɛ wa">Nibo ni baluwe wa</phoneme>',
    'Elo ni': '<phoneme alphabet="ipa" ph="ɛ.lɔ ni">Elo ni</phoneme>',
    'Kini': '<phoneme alphabet="ipa" ph="kí.ni">Kini</phoneme>',
    'Kilode': '<phoneme alphabet="ipa" ph="kí.lɔ.dɛ">Kilode</phoneme>',
    'Nigbawo': '<phoneme alphabet="ipa" ph="ní.gba.wɔ">Nigbawo</phoneme>',
    'Tani': '<phoneme alphabet="ipa" ph="tá.ni">Tani</phoneme>',
    'Bawo ni o se': '<phoneme alphabet="ipa" ph="baː.wɔ ni ɔ ʃɛ">Bawo ni o se</phoneme>',
    
    // Food / Water / Basic Needs
    'Omi': '<phoneme alphabet="ipa" ph="ɔ.mi">Omi</phoneme>',
    'Ounjẹ': '<phoneme alphabet="ipa" ph="ɔ.un.dʒɛ">Ounjẹ</phoneme>',
    'Mo wa ounjẹ': '<phoneme alphabet="ipa" ph="mɔ wa ɔ.un.dʒɛ">Mo wa ounjẹ</phoneme>',
    'Ebi n pa mi': '<phoneme alphabet="ipa" ph="ɛ.bi n̩ pa mi">Ebi n pa mi</phoneme>',
    'Mo feran': '<phoneme alphabet="ipa" ph="mɔ fɛ.ɾan">Mo feran</phoneme>',
    'Mo fẹ': '<phoneme alphabet="ipa" ph="mɔ fɛ">Mo fẹ</phoneme>',
    'Nkan mimu': '<phoneme alphabet="ipa" ph="n̩.kan mi.mu">Nkan mimu</phoneme>',
    
    // Common words
    'Oruko': '<phoneme alphabet="ipa" ph="ɔ.ɾu.kɔ">Oruko</phoneme>',
    'Orukọ mi ni': '<phoneme alphabet="ipa" ph="ɔ.ɾu.kɔ mi ni">Orukọ mi ni</phoneme>',
    'Owo': '<phoneme alphabet="ipa" ph="ɔ.wɔ">Owo</phoneme>',
    'Ile': '<phoneme alphabet="ipa" ph="i.lɛ">Ile</phoneme>',
    'Oja': '<phoneme alphabet="ipa" ph="ɔ.dʒa">Oja</phoneme>',
    'Aye': '<phoneme alphabet="ipa" ph="a.jɛ">Aye</phoneme>',
    'Ọjọ': '<phoneme alphabet="ipa" ph="ɔ.dʒɔ">Ọjọ</phoneme>',
    
    // Direction / Location
    'Apa ọtun': '<phoneme alphabet="ipa" ph="a.pa ɔ.tun">Apa ọtun</phoneme>',
    'Apa osi': '<phoneme alphabet="ipa" ph="a.pa ɔ.si">Apa osi</phoneme>',
    'Iwaju': '<phoneme alphabet="ipa" ph="i.wa.dʒu">Iwaju</phoneme>',
    'Ehin': '<phoneme alphabet="ipa" ph="ɛ.hin">Ehin</phoneme>',
    'Ninu': '<phoneme alphabet="ipa" ph="ní.nu">Ninu</phoneme>',
    'Lode': '<phoneme alphabet="ipa" ph="lɔ.dɛ">Lode</phoneme>',
    
    // Numbers
    'Ọkan': '<phoneme alphabet="ipa" ph="ɔ.kan">Ọkan</phoneme>',
    'Meji': '<phoneme alphabet="ipa" ph="mɛ.dʒi">Meji</phoneme>',
    'Meta': '<phoneme alphabet="ipa" ph="mɛ.ta">Meta</phoneme>',
    'Merin': '<phoneme alphabet="ipa" ph="mɛ.ɾin">Merin</phoneme>',
    'Marun': '<phoneme alphabet="ipa" ph="ma.ɾun">Marun</phoneme>',
    'Mefa': '<phoneme alphabet="ipa" ph="mɛ.fa">Mefa</phoneme>',
    'Meje': '<phoneme alphabet="ipa" ph="mɛ.dʒɛ">Meje</phoneme>',
    'Mejo': '<phoneme alphabet="ipa" ph="mɛ.dʒɔ">Mejo</phoneme>',
    'Mesan': '<phoneme alphabet="ipa" ph="mɛ.san">Mesan</phoneme>',
    'Mẹwa': '<phoneme alphabet="ipa" ph="mɛ.wa">Mẹwa</phoneme>',
  };
  
  let result = text;
  for (const [word, pronunciation] of Object.entries(pronunciationMap)) {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, pronunciation);
  }
  
  result = `<emphasis level="moderate">${result}</emphasis>`;
  return result;
};

// HAUSA - 65+ words
const applyHausaPronunciation = (text) => {
  const pronunciationMap = {
    // Greetings & Time of Day
    'Sannu': '<phoneme alphabet="ipa" ph="sän.nú">Sannu</phoneme>',
    'Ina kwana': '<phoneme alphabet="ipa" ph="i.na kwa.na">Ina kwana</phoneme>',
    'Ina yamma': '<phoneme alphabet="ipa" ph="i.na jam.ma">Ina yamma</phoneme>',
    'Barka da yamma': '<phoneme alphabet="ipa" ph="bar.ka da jam.ma">Barka da yamma</phoneme>',
    'Barka da safe': '<phoneme alphabet="ipa" ph="bar.ka da sa.fɛ">Barka da safe</phoneme>',
    'Ina wuni': '<phoneme alphabet="ipa" ph="i.na wu.ni">Ina wuni</phoneme>',
    'Sanu da zuwa': '<phoneme alphabet="ipa" ph="sa.nu da zu.wa">Sanu da zuwa</phoneme>',
    'Maraba': '<phoneme alphabet="ipa" ph="ma.ra.ba">Maraba</phoneme>',
    
    // Thank you / Please
    'Na gode': '<phoneme alphabet="ipa" ph="na gɔ.dɛ">Na gode</phoneme>',
    'Na gode sosai': '<phoneme alphabet="ipa" ph="na gɔ.dɛ sɔ.saɪ">Na gode sosai</phoneme>',
    'Godiya': '<phoneme alphabet="ipa" ph="gɔ.di.ja">Godiya</phoneme>',
    'Don Allah': '<phoneme alphabet="ipa" ph="dɔn al.lah">Don Allah</phoneme>',
    'Allah ya ba da rahama': '<phoneme alphabet="ipa" ph="al.lah ja ba da ɾa.ha.ma">Allah ya ba da rahama</phoneme>',
    'Ku yi hakuri': '<phoneme alphabet="ipa" ph="ku ji ha.ku.ɾi">Ku yi hakuri</phoneme>',
    
    // Yes/No
    'Eh': '<phoneme alphabet="ipa" ph="ɛh">Eh</phoneme>',
    "A'a": '<phoneme alphabet="ipa" ph="aʔa">A\'a</phoneme>',
    'I': '<phoneme alphabet="ipa" ph="iː">I</phoneme>',
    'Ba haka ba': '<phoneme alphabet="ipa" ph="ba ha.ka ba">Ba haka ba</phoneme>',
    'Tabbas': '<phoneme alphabet="ipa" ph="tab.bas">Tabbas</phoneme>',
    'To': '<phoneme alphabet="ipa" ph="tɔ">To</phoneme>',
    
    // How are you / I am fine
    'Yaya dai': '<phoneme alphabet="ipa" ph="ja.ja daɪ">Yaya dai</phoneme>',
    'Yaya kake': '<phoneme alphabet="ipa" ph="ja.ja ka.kɛ">Yaya kake</phoneme>',
    'Yaya kike': '<phoneme alphabet="ipa" ph="ja.ja ki.kɛ">Yaya kike</phoneme>',
    'Lafiya lau': '<phoneme alphabet="ipa" ph="la.fi.ja laʊ">Lafiya lau</phoneme>',
    'Lafiya': '<phoneme alphabet="ipa" ph="la.fi.ja">Lafiya</phoneme>',
    'Alhamdulillah': '<phoneme alphabet="ipa" ph="al.ham.du.lil.lah">Alhamdulillah</phoneme>',
    'Kalau dai': '<phoneme alphabet="ipa" ph="ka.laʊ daɪ">Kalau dai</phoneme>',
    
    // Goodbye
    'Sai an jima': '<phoneme alphabet="ipa" ph="saɪ an dʒi.ma">Sai an jima</phoneme>',
    'Sai gobe': '<phoneme alphabet="ipa" ph="saɪ gɔ.bɛ">Sai gobe</phoneme>',
    'Sai wata rana': '<phoneme alphabet="ipa" ph="saɪ wa.ta ɾa.na">Sai wata rana</phoneme>',
    'Allah ya kiyaye': '<phoneme alphabet="ipa" ph="al.lah ja ki.ja.jɛ">Allah ya kiyaye</phoneme>',
    'Sai anjima': '<phoneme alphabet="ipa" ph="saɪ an.dʒi.ma">Sai anjima</phoneme>',
    
    // Help / Emergency
    'Ina buƙatar taimako': '<phoneme alphabet="ipa" ph="i.na bu.ka.tar taɪ.ma.kɔ">Ina buƙatar taimako</phoneme>',
    'Taimako': '<phoneme alphabet="ipa" ph="taɪ.ma.kɔ">Taimako</phoneme>',
    'Ku taimake ni': '<phoneme alphabet="ipa" ph="ku taɪ.ma.kɛ ni">Ku taimake ni</phoneme>',
    'Ku taimaki ni': '<phoneme alphabet="ipa" ph="ku taɪ.ma.ki ni">Ku taimaki ni</phoneme>',
    'Taimaka': '<phoneme alphabet="ipa" ph="taɪ.ma.ka">Taimaka</phoneme>',
    
    // Questions
    'Ina': '<phoneme alphabet="ipa" ph="i.na">Ina</phoneme>',
    'Ina toilet': '<phoneme alphabet="ipa" ph="i.na tɔɪ.lɛt">Ina toilet</phoneme>',
    'Ina wanka': '<phoneme alphabet="ipa" ph="i.na wan.ka">Ina wanka</phoneme>',
    'Nawa ne': '<phoneme alphabet="ipa" ph="na.wa nɛ">Nawa ne</phoneme>',
    'Me ne': '<phoneme alphabet="ipa" ph="mɛ nɛ">Me ne</phoneme>',
    'Yaushe': '<phoneme alphabet="ipa" ph="jaʊ.ʃɛ">Yaushe</phoneme>',
    'Don me': '<phoneme alphabet="ipa" ph="dɔn mɛ">Don me</phoneme>',
    'Wa ne': '<phoneme alphabet="ipa" ph="wa nɛ">Wa ne</phoneme>',
    'Yaya': '<phoneme alphabet="ipa" ph="ja.ja">Yaya</phoneme>',
    
    // Food / Water / Basic Needs
    'Ruwa': '<phoneme alphabet="ipa" ph="ɾu.wa">Ruwa</phoneme>',
    'Abinci': '<phoneme alphabet="ipa" ph="a.bin.t͡ʃi">Abinci</phoneme>',
    'Ina jin yunwa': '<phoneme alphabet="ipa" ph="i.na dʒin jun.wa">Ina jin yunwa</phoneme>',
    'Ina jin ƙishirwa': '<phoneme alphabet="ipa" ph="i.na dʒin ki.ʃiɾ.wa">Ina jin ƙishirwa</phoneme>',
    'Ina son': '<phoneme alphabet="ipa" ph="i.na sɔn">Ina son</phoneme>',
    'Ina so': '<phoneme alphabet="ipa" ph="i.na sɔ">Ina so</phoneme>',
    'Abin sha': '<phoneme alphabet="ipa" ph="a.bin ʃa">Abin sha</phoneme>',
    
    // Common words
    'Suna': '<phoneme alphabet="ipa" ph="su.na">Suna</phoneme>',
    'Sunana': '<phoneme alphabet="ipa" ph="su.na.na">Sunana</phoneme>',
    'Kuɗi': '<phoneme alphabet="ipa" ph="ku.ɗi">Kuɗi</phoneme>',
    'Gida': '<phoneme alphabet="ipa" ph="gi.da">Gida</phoneme>',
    'Kasuwa': '<phoneme alphabet="ipa" ph="ka.su.wa">Kasuwa</phoneme>',
    'Duniya': '<phoneme alphabet="ipa" ph="du.ni.ja">Duniya</phoneme>',
    'Rana': '<phoneme alphabet="ipa" ph="ɾa.na">Rana</phoneme>',
    
    // Direction / Location
    'Dama': '<phoneme alphabet="ipa" ph="da.ma">Dama</phoneme>',
    'Hagu': '<phoneme alphabet="ipa" ph="ha.gu">Hagu</phoneme>',
    'Gaba': '<phoneme alphabet="ipa" ph="ga.ba">Gaba</phoneme>',
    'Baya': '<phoneme alphabet="ipa" ph="ba.ja">Baya</phoneme>',
    'Ciki': '<phoneme alphabet="ipa" ph="t͡ʃi.ki">Ciki</phoneme>',
    'Waje': '<phoneme alphabet="ipa" ph="wa.dʒɛ">Waje</phoneme>',
    
    // Numbers
    'Daya': '<phoneme alphabet="ipa" ph="da.ja">Daya</phoneme>',
    'Biyu': '<phoneme alphabet="ipa" ph="bi.ju">Biyu</phoneme>',
    'Uku': '<phoneme alphabet="ipa" ph="u.ku">Uku</phoneme>',
    'Huɗu': '<phoneme alphabet="ipa" ph="hu.ɗu">Huɗu</phoneme>',
    'Biyar': '<phoneme alphabet="ipa" ph="bi.jar">Biyar</phoneme>',
    'Shida': '<phoneme alphabet="ipa" ph="ʃi.da">Shida</phoneme>',
    'Bakwai': '<phoneme alphabet="ipa" ph="bak.waɪ">Bakwai</phoneme>',
    'Takwas': '<phoneme alphabet="ipa" ph="tak.was">Takwas</phoneme>',
    'Tara': '<phoneme alphabet="ipa" ph="ta.ɾa">Tara</phoneme>',
    'Goma': '<phoneme alphabet="ipa" ph="gɔ.ma">Goma</phoneme>',
  };
  
  let result = text;
  for (const [word, pronunciation] of Object.entries(pronunciationMap)) {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, pronunciation);
  }
  
  return result;
};

// IGBO - 60+ words with tones
const applyIgboTones = (text) => {
  const pronunciationMap = {
    // Greetings & Time of Day
    'Ndewo': '<phoneme alphabet="ipa" ph="n̩.dé.wò">Ndewo</phoneme>',
    'Ụtụtụ ọma': '<phoneme alphabet="ipa" ph="ʊ̀.tʊ̀.tʊ̀ ɔ̀.má">Ụtụtụ ọma</phoneme>',
    'Ehihie ọma': '<phoneme alphabet="ipa" ph="è.hì.hìɛ̀ ɔ̀.má">Ehihie ọma</phoneme>',
    'Mgbede ọma': '<phoneme alphabet="ipa" ph="m̩.ɡbé.dè ɔ̀.má">Mgbede ọma</phoneme>',
    'Abalị ọma': '<phoneme alphabet="ipa" ph="à.bà.lì ɔ̀.má">Abalị ọma</phoneme>',
    'Ọ dị mma': '<phoneme alphabet="ipa" ph="ɔ̀ dì m̩.mà">Ọ dị mma</phoneme>',
    'Nnọọ': '<phoneme alphabet="ipa" ph="n̩.nɔ̀ː">Nnọọ</phoneme>',
    
    // Thank you / Please
    'Daalụ': '<phoneme alphabet="ipa" ph="dàː.lʊ́">Daalụ</phoneme>',
    'Daalụ rinne': '<phoneme alphabet="ipa" ph="dàː.lʊ́ ɾìn.nè">Daalụ rinne</phoneme>',
    'I meela': '<phoneme alphabet="ipa" ph="ì mèː.là">I meela</phoneme>',
    'Imela': '<phoneme alphabet="ipa" ph="ì.mè.là">Imela</phoneme>',
    'Biko': '<phoneme alphabet="ipa" ph="bí.kò">Biko</phoneme>',
    'Nna biko': '<phoneme alphabet="ipa" ph="n̩.nà bí.kò">Nna biko</phoneme>',
    'Biko nwanne': '<phoneme alphabet="ipa" ph="bí.kò n̩.wàn.nè">Biko nwanne</phoneme>',
    
    // Yes/No
    'Ee': '<phoneme alphabet="ipa" ph="èː">Ee</phoneme>',
    'Mba': '<phoneme alphabet="ipa" ph="m̩.bà">Mba</phoneme>',
    'Ọ dị mma': '<phoneme alphabet="ipa" ph="ɔ̀ dì m̩.mà">Ọ dị mma</phoneme>',
    'Ọ dịghị': '<phoneme alphabet="ipa" ph="ɔ̀ dì.ɣì">Ọ dịghị</phoneme>',
    'Eziokwu': '<phoneme alphabet="ipa" ph="è.zì.ò.kwù">Eziokwu</phoneme>',
    
    // How are you / I am fine
    'Kedu': '<phoneme alphabet="ipa" ph="kè.dù">Kedu</phoneme>',
    'Kedu ka ị mere': '<phoneme alphabet="ipa" ph="kè.dù kà ì mè.ɾè">Kedu ka ị mere</phoneme>',
    'Kedu ka ị dị': '<phoneme alphabet="ipa" ph="kè.dù kà ì dì">Kedu ka ị dị</phoneme>',
    'A dị m mma': '<phoneme alphabet="ipa" ph="à dì m̩ m̩.mà">A dị m mma</phoneme>',
    'Ka ọ dị': '<phoneme alphabet="ipa" ph="kà ɔ̀ dì">Ka ọ dị</phoneme>',
    'Ọ dị mma': '<phoneme alphabet="ipa" ph="ɔ̀ dì m̩.mà">Ọ dị mma</phoneme>',
    
    // Goodbye
    'Ka ọ dị': '<phoneme alphabet="ipa" ph="kà ɔ̀ dì">Ka ọ dị</phoneme>',
    'Ka ọmesịa': '<phoneme alphabet="ipa" ph="kà ɔ̀.mè.sì.à">Ka ọmesịa</phoneme>',
    'Ka chi fo': '<phoneme alphabet="ipa" ph="kà t͡ʃì fò">Ka chi fo</phoneme>',
    'Nọdụ nke ọma': '<phoneme alphabet="ipa" ph="nɔ̀.dʊ̀ n̩.kè ɔ̀.má">Nọdụ nke ọma</phoneme>',
    'Jee nke ọma': '<phoneme alphabet="ipa" ph="dʒèː n̩.kè ɔ̀.má">Jee nke ọma</phoneme>',
    
    // Help / Emergency
    'Achọrọ m enyemaka': '<phoneme alphabet="ipa" ph="à.t͡ʃɔ́.ɾɔ́ m̩ è.ɲè.má.kà">Achọrọ m enyemaka</phoneme>',
    'Nyere m aka': '<phoneme alphabet="ipa" ph="ɲè.ɾè m̩ à.kà">Nyere m aka</phoneme>',
    'Enyemaka': '<phoneme alphabet="ipa" ph="è.ɲè.má.kà">Enyemaka</phoneme>',
    'Nyere m aka': '<phoneme alphabet="ipa" ph="ɲè.ɾè m̩ à.kà">Nyere m aka</phoneme>',
    'Biko nyere m aka': '<phoneme alphabet="ipa" ph="bí.kò ɲè.ɾè m̩ à.kà">Biko nyere m aka</phoneme>',
    
    // Questions
    'Olee': '<phoneme alphabet="ipa" ph="ò.lèː">Olee</phoneme>',
    'Olee ebe': '<phoneme alphabet="ipa" ph="ò.lèː è.bè">Olee ebe</phoneme>',
    'Olee ebe ụlọ mposi dị': '<phoneme alphabet="ipa" ph="ò.lèː è.bè ʊ̀.lɔ̀ m̩.pò.sì dì">Olee ebe ụlọ mposi dị</phoneme>',
    'Ego ole': '<phoneme alphabet="ipa" ph="è.ɡò ò.lè">Ego ole</phoneme>',
    'Gịnị': '<phoneme alphabet="ipa" ph="ɡì.nì">Gịnị</phoneme>',
    'Mgbe': '<phoneme alphabet="ipa" ph="m̩.ɡbè">Mgbe</phoneme>',
    'Gịnị mere': '<phoneme alphabet="ipa" ph="ɡì.nì mè.ɾè">Gịnị mere</phoneme>',
    'Ònye': '<phoneme alphabet="ipa" ph="ɔ̀.ɲè">Ònye</phoneme>',
    'Kedu ihe': '<phoneme alphabet="ipa" ph="kè.dù ì.hè">Kedu ihe</phoneme>',
    
    // Food / Water / Basic Needs
    'Mmiri': '<phoneme alphabet="ipa" ph="m̩.mí.ɾì">Mmiri</phoneme>',
    'Nri': '<phoneme alphabet="ipa" ph="n̩.ɾì">Nri</phoneme>',
    'Agụụ na-agụ m': '<phoneme alphabet="ipa" ph="à.ɡʊ̀.ʊ̀ nà à.ɡʊ̀ m̩">Agụụ na-agụ m</phoneme>',
    'Achọrọ m': '<phoneme alphabet="ipa" ph="à.t͡ʃɔ́.ɾɔ́ m̩">Achọrọ m</phoneme>',
    'Ana m achọ': '<phoneme alphabet="ipa" ph="à.nà m̩ à.t͡ʃɔ́">Ana m achọ</phoneme>',
    'Ihe ọṅụṅụ': '<phoneme alphabet="ipa" ph="ì.hè ɔ̀.ŋʊ̀.ŋʊ̀">Ihe ọṅụṅụ</phoneme>',
    
    // Common words
    'Aha': '<phoneme alphabet="ipa" ph="à.hà">Aha</phoneme>',
    'Aha m bụ': '<phoneme alphabet="ipa" ph="à.hà m̩ bʊ̀">Aha m bụ</phoneme>',
    'Ego': '<phoneme alphabet="ipa" ph="è.ɡò">Ego</phoneme>',
    'Ụlọ': '<phoneme alphabet="ipa" ph="ʊ̀.lɔ̀">Ụlọ</phoneme>',
    'Ahịa': '<phoneme alphabet="ipa" ph="à.hì.à">Ahịa</phoneme>',
    'Ụwa': '<phoneme alphabet="ipa" ph="ʊ̀.wà">Ụwa</phoneme>',
    'Ụbọchị': '<phoneme alphabet="ipa" ph="ʊ̀.bɔ̀.t͡ʃì">Ụbọchị</phoneme>',
    
    // Direction / Location
    'Aka nri': '<phoneme alphabet="ipa" ph="à.kà n̩.ɾì">Aka nri</phoneme>',
    'Aka ekpe': '<phoneme alphabet="ipa" ph="à.kà è.kpè">Aka ekpe</phoneme>',
    'Ihu': '<phoneme alphabet="ipa" ph="ì.hù">Ihu</phoneme>',
    'Azụ': '<phoneme alphabet="ipa" ph="à.zʊ̀">Azụ</phoneme>',
    'Ime': '<phoneme alphabet="ipa" ph="ì.mè">Ime</phoneme>',
    'Èzí': '<phoneme alphabet="ipa" ph="è.zí">Èzí</phoneme>',
    
    // Numbers
    'Otu': '<phoneme alphabet="ipa" ph="ò.tù">Otu</phoneme>',
    'Abụọ': '<phoneme alphabet="ipa" ph="à.bʊ̀.ɔ̀">Abụọ</phoneme>',
    'Atọ': '<phoneme alphabet="ipa" ph="à.tɔ̀">Atọ</phoneme>',
    'Anọ': '<phoneme alphabet="ipa" ph="à.nɔ̀">Anọ</phoneme>',
    'Ise': '<phoneme alphabet="ipa" ph="ì.sè">Ise</phoneme>',
    'Isii': '<phoneme alphabet="ipa" ph="ì.sìː">Isii</phoneme>',
    'Asaa': '<phoneme alphabet="ipa" ph="à.sàː">Asaa</phoneme>',
    'Asatọ': '<phoneme alphabet="ipa" ph="à.sà.tɔ̀">Asatọ</phoneme>',
    'Itoolu': '<phoneme alphabet="ipa" ph="ì.tòː.lù">Itoolu</phoneme>',
    'Iri': '<phoneme alphabet="ipa" ph="ì.ɾì">Iri</phoneme>',
  };
  
  let result = text;
  for (const [word, pronunciation] of Object.entries(pronunciationMap)) {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, pronunciation);
  }
  
  result = `<prosody pitch="+5%">${result}</prosody>`;
  return result;
};

// SWAHILI - 70+ words
const applySwahiliPronunciation = (text) => {
  const pronunciationMap = {
    // Greetings & Time of Day
    'Habari': '<phoneme alphabet="ipa" ph="ha.ba.ɾi">Habari</phoneme>',
    'Habari yako': '<phoneme alphabet="ipa" ph="ha.ba.ɾi ja.kɔ">Habari yako</phoneme>',
    'Habari za asubuhi': '<phoneme alphabet="ipa" ph="ha.ba.ɾi za a.su.bu.hi">Habari za asubuhi</phoneme>',
    'Habari za mchana': '<phoneme alphabet="ipa" ph="ha.ba.ɾi za m̩.t͡ʃa.na">Habari za mchana</phoneme>',
    'Habari za jioni': '<phoneme alphabet="ipa" ph="ha.ba.ɾi za d͡ʒi.ɔ.ni">Habari za jioni</phoneme>',
    'Shikamoo': '<phoneme alphabet="ipa" ph="ʃi.ka.mɔː">Shikamoo</phoneme>',
    'Marahaba': '<phoneme alphabet="ipa" ph="ma.ɾa.ha.ba">Marahaba</phoneme>',
    'Mambo': '<phoneme alphabet="ipa" ph="mam.bɔ">Mambo</phoneme>',
    'Poa': '<phoneme alphabet="ipa" ph="pɔ.a">Poa</phoneme>',
    'Salama': '<phoneme alphabet="ipa" ph="sa.la.ma">Salama</phoneme>',
    
    // Thank you / Please
    'Asante': '<phoneme alphabet="ipa" ph="a.san.te">Asante</phoneme>',
    'Asante sana': '<phoneme alphabet="ipa" ph="a.san.te sa.na">Asante sana</phoneme>',
    'Ahsante': '<phoneme alphabet="ipa" ph="ah.san.te">Ahsante</phoneme>',
    'Tafadhali': '<phoneme alphabet="ipa" ph="ta.fa.ða.li">Tafadhali</phoneme>',
    'Karibu': '<phoneme alphabet="ipa" ph="ka.ɾi.bu">Karibu</phoneme>',
    'Pole': '<phoneme alphabet="ipa" ph="pɔ.lɛ">Pole</phoneme>',
    
    // Yes/No
    'Ndiyo': '<phoneme alphabet="ipa" ph="n̩.di.jɔ">Ndiyo</phoneme>',
    'Ndio': '<phoneme alphabet="ipa" ph="n̩.di.ɔ">Ndio</phoneme>',
    'Hapana': '<phoneme alphabet="ipa" ph="ha.pa.na">Hapana</phoneme>',
    'Sawa': '<phoneme alphabet="ipa" ph="sa.wa">Sawa</phoneme>',
    'La': '<phoneme alphabet="ipa" ph="la">La</phoneme>',
    'Naam': '<phoneme alphabet="ipa" ph="naːm">Naam</phoneme>',
    
    // How are you / I am fine
    'Hujambo': '<phoneme alphabet="ipa" ph="hu.d͡ʒam.bɔ">Hujambo</phoneme>',
    'Sijambo': '<phoneme alphabet="ipa" ph="si.d͡ʒam.bɔ">Sijambo</phoneme>',
    'Hamjambo': '<phoneme alphabet="ipa" ph="ham.d͡ʒam.bɔ">Hamjambo</phoneme>',
    'Hatujambo': '<phoneme alphabet="ipa" ph="ha.tu.d͡ʒam.bɔ">Hatujambo</phoneme>',
    'Nzuri': '<phoneme alphabet="ipa" ph="n̩.zu.ɾi">Nzuri</phoneme>',
    'Vizuri': '<phoneme alphabet="ipa" ph="vi.zu.ɾi">Vizuri</phoneme>',
    'Salama': '<phoneme alphabet="ipa" ph="sa.la.ma">Salama</phoneme>',
    
    // Goodbye
    'Kwaheri': '<phoneme alphabet="ipa" ph="kwa.he.ɾi">Kwaheri</phoneme>',
    'Kwa heri': '<phoneme alphabet="ipa" ph="kwa he.ɾi">Kwa heri</phoneme>',
    'Kwaheri ya kuonana': '<phoneme alphabet="ipa" ph="kwa.he.ɾi ja ku.ɔ.na.na">Kwaheri ya kuonana</phoneme>',
    'Tutaonana': '<phoneme alphabet="ipa" ph="tu.ta.ɔ.na.na">Tutaonana</phoneme>',
    'Baadaye': '<phoneme alphabet="ipa" ph="baː.da.jɛ">Baadaye</phoneme>',
    'Safari njema': '<phoneme alphabet="ipa" ph="sa.fa.ɾi n̩.d͡ʒɛ.ma">Safari njema</phoneme>',
    
    // Help / Emergency
    'Nahitaji msaada': '<phoneme alphabet="ipa" ph="na.hi.ta.d͡ʒi m̩.sa.da">Nahitaji msaada</phoneme>',
    'Nisaidie': '<phoneme alphabet="ipa" ph="ni.sa.i.di.ɛ">Nisaidie</phoneme>',
    'Msaada': '<phoneme alphabet="ipa" ph="m̩.sa.da">Msaada</phoneme>',
    'Saidia': '<phoneme alphabet="ipa" ph="sa.i.di.a">Saidia</phoneme>',
    'Tafadhali nisaidie': '<phoneme alphabet="ipa" ph="ta.fa.ða.li ni.sa.i.di.ɛ">Tafadhali nisaidie</phoneme>',
    
    // Questions
    'Wapi': '<phoneme alphabet="ipa" ph="wa.pi">Wapi</phoneme>',
    'Iko wapi': '<phoneme alphabet="ipa" ph="i.kɔ wa.pi">Iko wapi</phoneme>',
    'Choo kiko wapi': '<phoneme alphabet="ipa" ph="t͡ʃɔː ki.kɔ wa.pi">Choo kiko wapi</phoneme>',
    'Bei gani': '<phoneme alphabet="ipa" ph="be.i ga.ni">Bei gani</phoneme>',
    'Nini': '<phoneme alphabet="ipa" ph="ni.ni">Nini</phoneme>',
    'Lini': '<phoneme alphabet="ipa" ph="li.ni">Lini</phoneme>',
    'Kwa nini': '<phoneme alphabet="ipa" ph="kwa ni.ni">Kwa nini</phoneme>',
    'Nani': '<phoneme alphabet="ipa" ph="na.ni">Nani</phoneme>',
    'Vipi': '<phoneme alphabet="ipa" ph="vi.pi">Vipi</phoneme>',
    
    // Food / Water / Basic Needs
    'Maji': '<phoneme alphabet="ipa" ph="ma.d͡ʒi">Maji</phoneme>',
    'Chakula': '<phoneme alphabet="ipa" ph="t͡ʃa.ku.la">Chakula</phoneme>',
    'Nina njaa': '<phoneme alphabet="ipa" ph="ni.na n̩.d͡ʒaː">Nina njaa</phoneme>',
    'Nina kiu': '<phoneme alphabet="ipa" ph="ni.na ki.u">Nina kiu</phoneme>',
    'Nataka': '<phoneme alphabet="ipa" ph="na.ta.ka">Nataka</phoneme>',
    'Napenda': '<phoneme alphabet="ipa" ph="na.pɛn.da">Napenda</phoneme>',
    'Kinywaji': '<phoneme alphabet="ipa" ph="ki.ɲwa.d͡ʒi">Kinywaji</phoneme>',
    
    // Common words
    'Jina': '<phoneme alphabet="ipa" ph="d͡ʒi.na">Jina</phoneme>',
    'Jina langu ni': '<phoneme alphabet="ipa" ph="d͡ʒi.na la.ŋu ni">Jina langu ni</phoneme>',
    'Pesa': '<phoneme alphabet="ipa" ph="pɛ.sa">Pesa</phoneme>',
    'Nyumba': '<phoneme alphabet="ipa" ph="ɲum.ba">Nyumba</phoneme>',
    'Soko': '<phoneme alphabet="ipa" ph="sɔ.kɔ">Soko</phoneme>',
    'Dunia': '<phoneme alphabet="ipa" ph="du.ni.a">Dunia</phoneme>',
    'Siku': '<phoneme alphabet="ipa" ph="si.ku">Siku</phoneme>',
    
    // Direction / Location
    'Kulia': '<phoneme alphabet="ipa" ph="ku.li.a">Kulia</phoneme>',
    'Kushoto': '<phoneme alphabet="ipa" ph="ku.ʃɔ.tɔ">Kushoto</phoneme>',
    'Mbele': '<phoneme alphabet="ipa" ph="m̩.bɛ.lɛ">Mbele</phoneme>',
    'Nyuma': '<phoneme alphabet="ipa" ph="ɲu.ma">Nyuma</phoneme>',
    'Ndani': '<phoneme alphabet="ipa" ph="n̩.da.ni">Ndani</phoneme>',
    'Nje': '<phoneme alphabet="ipa" ph="n̩.d͡ʒɛ">Nje</phoneme>',
    
    // Numbers
    'Moja': '<phoneme alphabet="ipa" ph="mɔ.d͡ʒa">Moja</phoneme>',
    'Mbili': '<phoneme alphabet="ipa" ph="m̩.bi.li">Mbili</phoneme>',
    'Tatu': '<phoneme alphabet="ipa" ph="ta.tu">Tatu</phoneme>',
    'Nne': '<phoneme alphabet="ipa" ph="n̩.nɛ">Nne</phoneme>',
    'Tano': '<phoneme alphabet="ipa" ph="ta.nɔ">Tano</phoneme>',
    'Sita': '<phoneme alphabet="ipa" ph="si.ta">Sita</phoneme>',
    'Saba': '<phoneme alphabet="ipa" ph="sa.ba">Saba</phoneme>',
    'Nane': '<phoneme alphabet="ipa" ph="na.nɛ">Nane</phoneme>',
    'Tisa': '<phoneme alphabet="ipa" ph="ti.sa">Tisa</phoneme>',
    'Kumi': '<phoneme alphabet="ipa" ph="ku.mi">Kumi</phoneme>',
  };
  
  let result = text;
  for (const [word, pronunciation] of Object.entries(pronunciationMap)) {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, pronunciation);
  }
  
  result = `<prosody rate="0.9">${result}</prosody>`;
  return result;
};

// ZULU - 65+ words with click consonants
const applyZuluPronunciation = (text) => {
  const pronunciationMap = {
    // Greetings & Time of Day
    'Sawubona': '<phoneme alphabet="ipa" ph="sa.wu.bo.na">Sawubona</phoneme>',
    'Sawubona ekuseni': '<phoneme alphabet="ipa" ph="sa.wu.bo.na e.ku.se.ni">Sawubona ekuseni</phoneme>',
    'Sawubona emini': '<phoneme alphabet="ipa" ph="sa.wu.bo.na e.mi.ni">Sawubona emini</phoneme>',
    'Sawubona ntambama': '<phoneme alphabet="ipa" ph="sa.wu.bo.na n̩.tam.ba.ma">Sawubona ntambama</phoneme>',
    'Sawubona ebusuku': '<phoneme alphabet="ipa" ph="sa.wu.bo.na e.bu.su.ku">Sawubona ebusuku</phoneme>',
    'Sanibonani': '<phoneme alphabet="ipa" ph="sa.ni.bo.na.ni">Sanibonani</phoneme>',
    'Yebo': '<phoneme alphabet="ipa" ph="jɛ.bo">Yebo</phoneme>',
    'Sawubona sawubona': '<phoneme alphabet="ipa" ph="sa.wu.bo.na sa.wu.bo.na">Sawubona sawubona</phoneme>',
    
    // Thank you / Please
    'Ngiyabonga': '<phoneme alphabet="ipa" ph="ŋi.ja.bo.ŋa">Ngiyabonga</phoneme>',
    'Siyabonga': '<phoneme alphabet="ipa" ph="si.ja.bo.ŋa">Siyabonga</phoneme>',
    'Ngiyabonga kakhulu': '<phoneme alphabet="ipa" ph="ŋi.ja.bo.ŋa ka.kʰu.lu">Ngiyabonga kakhulu</phoneme>',
    'Ngiyacela': '<phoneme alphabet="ipa" ph="ŋi.ja.t͡ʃɛ.la">Ngiyacela</phoneme>',
    'Sicela': '<phoneme alphabet="ipa" ph="si.t͡ʃɛ.la">Sicela</phoneme>',
    'Uxolo': '<phoneme alphabet="ipa" ph="u.ǁɔ.lɔ">Uxolo</phoneme>',
    
    // Yes/No
    'Yebo': '<phoneme alphabet="ipa" ph="jɛ.bo">Yebo</phoneme>',
    'Cha': '<phoneme alphabet="ipa" ph="t͡ʃa">Cha</phoneme>',
    'Kulungile': '<phoneme alphabet="ipa" ph="ku.lu.ŋi.lɛ">Kulungile</phoneme>',
    'Akukho': '<phoneme alphabet="ipa" ph="a.ku.kʰɔ">Akukho</phoneme>',
    'Yhoo': '<phoneme alphabet="ipa" ph="jɔː">Yhoo</phoneme>',
    
    // How are you / I am fine
    'Unjani': '<phoneme alphabet="ipa" ph="u.n̩.dʒa.ni">Unjani</phoneme>',
    'Ninjani': '<phoneme alphabet="ipa" ph="ni.n̩.dʒa.ni">Ninjani</phoneme>',
    'Ngiyaphila': '<phoneme alphabet="ipa" ph="ŋi.ja.pʰi.la">Ngiyaphila</phoneme>',
    'Siyaphila': '<phoneme alphabet="ipa" ph="si.ja.pʰi.la">Siyaphila</phoneme>',
    'Ngikhona': '<phoneme alphabet="ipa" ph="ŋi.kʰɔ.na">Ngikhona</phoneme>',
    'Kahle': '<phoneme alphabet="ipa" ph="ka.ɬɛ">Kahle</phoneme>',
    
    // Goodbye
    'Sala kahle': '<phoneme alphabet="ipa" ph="sa.la ka.ɬɛ">Sala kahle</phoneme>',
    'Hamba kahle': '<phoneme alphabet="ipa" ph="ham.ba ka.ɬɛ">Hamba kahle</phoneme>',
    'Sobonana': '<phoneme alphabet="ipa" ph="so.bo.na.na">Sobonana</phoneme>',
    'Ngizokubona': '<phoneme alphabet="ipa" ph="ŋi.zɔ.ku.bo.na">Ngizokubona</phoneme>',
    'Usale kahle': '<phoneme alphabet="ipa" ph="u.sa.lɛ ka.ɬɛ">Usale kahle</phoneme>',
    
    // Help / Emergency
    'Ngidinga usizo': '<phoneme alphabet="ipa" ph="ŋi.di.ŋa u.si.zɔ">Ngidinga usizo</phoneme>',
    'Ngisize': '<phoneme alphabet="ipa" ph="ŋi.si.zɛ">Ngisize</phoneme>',
    'Ngisiza': '<phoneme alphabet="ipa" ph="ŋi.si.za">Ngisiza</phoneme>',
    'Usizo': '<phoneme alphabet="ipa" ph="u.si.zɔ">Usizo</phoneme>',
    'Ngicela usizo': '<phoneme alphabet="ipa" ph="ŋi.t͡ʃɛ.la u.si.zɔ">Ngicela usizo</phoneme>',
    
    // Questions
    'Kuphi': '<phoneme alphabet="ipa" ph="ku.pʰi">Kuphi</phoneme>',
    'Ikuphi': '<phoneme alphabet="ipa" ph="i.ku.pʰi">Ikuphi</phoneme>',
    'Ikuphi indlu yangasese': '<phoneme alphabet="ipa" ph="i.ku.pʰi in.dɮu ja.ŋa.se.se">Ikuphi indlu yangasese</phoneme>',
    'Malini': '<phoneme alphabet="ipa" ph="ma.li.ni">Malini</phoneme>',
    'Yini': '<phoneme alphabet="ipa" ph="ji.ni">Yini</phoneme>',
    'Nini': '<phoneme alphabet="ipa" ph="ni.ni">Nini</phoneme>',
    'Kungani': '<phoneme alphabet="ipa" ph="ku.ŋa.ni">Kungani</phoneme>',
    'Ubani': '<phoneme alphabet="ipa" ph="u.ba.ni">Ubani</phoneme>',
    'Kanjani': '<phoneme alphabet="ipa" ph="kan.dʒa.ni">Kanjani</phoneme>',
    
    // Food / Water / Basic Needs
    'Amanzi': '<phoneme alphabet="ipa" ph="a.man.zi">Amanzi</phoneme>',
    'Ukudla': '<phoneme alphabet="ipa" ph="u.ku.dɮa">Ukudla</phoneme>',
    'Ngilambile': '<phoneme alphabet="ipa" ph="ŋi.lam.bi.lɛ">Ngilambile</phoneme>',
    'Ngomile': '<phoneme alphabet="ipa" ph="ŋɔ.mi.lɛ">Ngomile</phoneme>',
    'Ngifuna': '<phoneme alphabet="ipa" ph="ŋi.fu.na">Ngifuna</phoneme>',
    'Ngithanda': '<phoneme alphabet="ipa" ph="ŋi.tʰan.da">Ngithanda</phoneme>',
    'Iphuzo': '<phoneme alphabet="ipa" ph="i.pʰu.zɔ">Iphuzo</phoneme>',
    
    // Common words
    'Igama': '<phoneme alphabet="ipa" ph="i.ɡa.ma">Igama</phoneme>',
    'Igama lami': '<phoneme alphabet="ipa" ph="i.ɡa.ma la.mi">Igama lami</phoneme>',
    'Igama lakho': '<phoneme alphabet="ipa" ph="i.ɡa.ma la.kʰɔ">Igama lakho</phoneme>',
    'Imali': '<phoneme alphabet="ipa" ph="i.ma.li">Imali</phoneme>',
    'Indlu': '<phoneme alphabet="ipa" ph="in.dɮu">Indlu</phoneme>',
    'Isitolo': '<phoneme alphabet="ipa" ph="i.si.tɔ.lɔ">Isitolo</phoneme>',
    'Umhlaba': '<phoneme alphabet="ipa" ph="um.ɬa.ba">Umhlaba</phoneme>',
    'Usuku': '<phoneme alphabet="ipa" ph="u.su.ku">Usuku</phoneme>',
    
    // Direction / Location
    'Kwesokudla': '<phoneme alphabet="ipa" ph="kwɛ.sɔ.ku.dɮa">Kwesokudla</phoneme>',
    'Kwesokunxele': '<phoneme alphabet="ipa" ph="kwɛ.sɔ.ku.ǁɛ.lɛ">Kwesokunxele</phoneme>',
    'Phambili': '<phoneme alphabet="ipa" ph="pʰam.bi.li">Phambili</phoneme>',
    'Emuva': '<phoneme alphabet="ipa" ph="ɛ.mu.va">Emuva</phoneme>',
    'Ngaphakathi': '<phoneme alphabet="ipa" ph="ŋa.pʰa.ka.tʰi">Ngaphakathi</phoneme>',
    'Ngaphandle': '<phoneme alphabet="ipa" ph="ŋa.pʰan.dlɛ">Ngaphandle</phoneme>',
    
    // Numbers
    'Kunye': '<phoneme alphabet="ipa" ph="ku.ɲɛ">Kunye</phoneme>',
    'Kubili': '<phoneme alphabet="ipa" ph="ku.bi.li">Kubili</phoneme>',
    'Kuthathu': '<phoneme alphabet="ipa" ph="ku.tʰa.tʰu">Kuthathu</phoneme>',
    'Kune': '<phoneme alphabet="ipa" ph="ku.nɛ">Kune</phoneme>',
    'Kuhlanu': '<phoneme alphabet="ipa" ph="ku.ɬa.nu">Kuhlanu</phoneme>',
    'Isithupha': '<phoneme alphabet="ipa" ph="i.si.tʰu.pʰa">Isithupha</phoneme>',
    'Isikhombisa': '<phoneme alphabet="ipa" ph="i.si.kʰɔm.bi.sa">Isikhombisa</phoneme>',
    'Isishiyagalombili': '<phoneme alphabet="ipa" ph="i.si.ʃi.ja.ɡa.lɔm.bi.li">Isishiyagalombili</phoneme>',
    'Isishiyagalolunye': '<phoneme alphabet="ipa" ph="i.si.ʃi.ja.ɡa.lɔ.lu.ɲɛ">Isishiyagalolunye</phoneme>',
    'Ishumi': '<phoneme alphabet="ipa" ph="i.ʃu.mi">Ishumi</phoneme>',
  };
  
  let result = text;
  for (const [word, pronunciation] of Object.entries(pronunciationMap)) {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, pronunciation);
  }
  
  return result;
};

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
  const [availableVoices, setAvailableVoices] = useState([]);
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