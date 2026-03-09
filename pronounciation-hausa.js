export const applyHausaPronunciation = (text) => {
  const pronunciationMap = {
    // Greetings
    'Sannu': '<phoneme alphabet="ipa" ph="sän.nú">Sannu</phoneme>',
    'Ina kwana': '<phoneme alphabet="ipa" ph="i.na kwa.na">Ina kwana</phoneme>',
    'Ina yamma': '<phoneme alphabet="ipa" ph="i.na jam.ma">Ina yamma</phoneme>',
    'Barka da yamma': '<phoneme alphabet="ipa" ph="bar.ka da jam.ma">Barka da yamma</phoneme>',
    'Barka da safe': '<phoneme alphabet="ipa" ph="bar.ka da sa.fɛ">Barka da safe</phoneme>',
    
    // Thank you
    'Na gode': '<phoneme alphabet="ipa" ph="na gɔ.dɛ">Na gode</phoneme>',
    'Na gode sosai': '<phoneme alphabet="ipa" ph="na gɔ.dɛ sɔ.saɪ">Na gode sosai</phoneme>',
    'Don Allah': '<phoneme alphabet="ipa" ph="dɔn al.lah">Don Allah</phoneme>',
    
    // Yes/No
    'Eh': '<phoneme alphabet="ipa" ph="ɛh">Eh</phoneme>',
    "A'a": '<phoneme alphabet="ipa" ph="aʔa">A\'a</phoneme>',
    
    // How are you
    'Yaya dai': '<phoneme alphabet="ipa" ph="ja.ja daɪ">Yaya dai</phoneme>',
    'Lafiya lau': '<phoneme alphabet="ipa" ph="la.fi.ja laʊ">Lafiya lau</phoneme>',
    'Alhamdulillah': '<phoneme alphabet="ipa" ph="al.ham.du.lil.lah">Alhamdulillah</phoneme>',
    
    // Goodbye
    'Sai an jima': '<phoneme alphabet="ipa" ph="saɪ an dʒi.ma">Sai an jima</phoneme>',
    'Sai gobe': '<phoneme alphabet="ipa" ph="saɪ gɔ.bɛ">Sai gobe</phoneme>',
    
    // Emergency
    'Ina buƙatar taimako': '<phoneme alphabet="ipa" ph="i.na bu.ka.tar taɪ.ma.kɔ">Ina buƙatar taimako</phoneme>',
    'Taimako': '<phoneme alphabet="ipa" ph="taɪ.ma.kɔ">Taimako</phoneme>',
    'Na ɓace': '<phoneme alphabet="ipa" ph="na ɓa.t͡ʃɛ">Na ɓace</phoneme>',
    'Kira \'yan sanda': '<phoneme alphabet="ipa" ph="ki.ɾa jan san.da">Kira \'yan sanda</phoneme>',
    
    // Restaurant
    'Ina son abinci': '<phoneme alphabet="ipa" ph="i.na sɔn a.bin.t͡ʃi">Ina son abinci</phoneme>',
    'Ruwa': '<phoneme alphabet="ipa" ph="ɾu.wa">Ruwa</phoneme>',
    'Abinci': '<phoneme alphabet="ipa" ph="a.bin.t͡ʃi">Abinci</phoneme>',
    'Ya yi daɗi': '<phoneme alphabet="ipa" ph="ja ji da.ɗi">Ya yi daɗi</phoneme>',
    'Lissafi': '<phoneme alphabet="ipa" ph="lis.sa.fi">Lissafi</phoneme>',
    'Kifi': '<phoneme alphabet="ipa" ph="ki.fi">Kifi</phoneme>',
    'Nama': '<phoneme alphabet="ipa" ph="na.ma">Nama</phoneme>',
    
    // Hotel
    'Ina son ɗaki': '<phoneme alphabet="ipa" ph="i.na sɔn ɗa.ki">Ina son ɗaki</phoneme>',
    'Babu ruwa': '<phoneme alphabet="ipa" ph="ba.bu ɾu.wa">Babu ruwa</phoneme>',
    
    // Transport
    'Kai ni': '<phoneme alphabet="ipa" ph="kaɪ ni">Kai ni</phoneme>',
    'Filin jirgin sama': '<phoneme alphabet="ipa" ph="fi.lin dʒiɾ.ɡin sa.ma">Filin jirgin sama</phoneme>',
    'Tsaya nan': '<phoneme alphabet="ipa" ph="t͡sa.ja nan">Tsaya nan</phoneme>',
    'Da sauri': '<phoneme alphabet="ipa" ph="da saʊ.ɾi">Da sauri</phoneme>',
    
    // Medical
    'Ba ni lafiya': '<phoneme alphabet="ipa" ph="ba ni la.fi.ja">Ba ni lafiya</phoneme>',
    'Likita': '<phoneme alphabet="ipa" ph="li.ki.ta">Likita</phoneme>',
    'Kai na ciwo': '<phoneme alphabet="ipa" ph="kaɪ na t͡ʃi.wɔ">Kai na ciwo</phoneme>',
    'Magani': '<phoneme alphabet="ipa" ph="ma.ga.ni">Magani</phoneme>',
    
    // Shopping
    'Ya yi tsada': '<phoneme alphabet="ipa" ph="ja ji t͡sa.da">Ya yi tsada</phoneme>',
    'Rage farashi': '<phoneme alphabet="ipa" ph="ɾa.ɡɛ fa.ɾa.ʃi">Rage farashi</phoneme>',
    'Nawa ne': '<phoneme alphabet="ipa" ph="na.wa nɛ">Nawa ne</phoneme>',
    
    // Directions
    'Ina': '<phoneme alphabet="ipa" ph="i.na">Ina</phoneme>',
    'Juya dama': '<phoneme alphabet="ipa" ph="dʒu.ja da.ma">Juya dama</phoneme>',
    'Juya hagu': '<phoneme alphabet="ipa" ph="dʒu.ja ha.gu">Juya hagu</phoneme>',
    'Kai tsaye': '<phoneme alphabet="ipa" ph="kaɪ t͡sa.jɛ">Kai tsaye</phoneme>',
    'Kusa': '<phoneme alphabet="ipa" ph="ku.sa">Kusa</phoneme>',
    'Nesa': '<phoneme alphabet="ipa" ph="nɛ.sa">Nesa</phoneme>',
    
    // Numbers
    'Daya': '<phoneme alphabet="ipa" ph="da.ja">Daya</phoneme>',
    'Biyu': '<phoneme alphabet="ipa" ph="bi.ju">Biyu</phoneme>',
    'Uku': '<phoneme alphabet="ipa" ph="u.ku">Uku</phoneme>',
    'Huɗu': '<phoneme alphabet="ipa" ph="hu.ɗu">Huɗu</phoneme>',
    'Biyar': '<phoneme alphabet="ipa" ph="bi.jar">Biyar</phoneme>',
    
    // Useful
    'Na gane': '<phoneme alphabet="ipa" ph="na ga.nɛ">Na gane</phoneme>',
    'Ban gane ba': '<phoneme alphabet="ipa" ph="ban ga.nɛ ba">Ban gane ba</phoneme>',
  };
  
  let result = text;
  for (const [word, pronunciation] of Object.entries(pronunciationMap)) {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, pronunciation);
  }
  
  return result;
};

export default applyHausaPronunciation;