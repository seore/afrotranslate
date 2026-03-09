export const applyZuluPronunciation = (text) => {
  const pronunciationMap = {
    // === GREETINGS ===
    'Sawubona': '<phoneme alphabet="ipa" ph="sa.wu.bo.na">Sawubona</phoneme>',
    'Sawubona ekuseni': '<phoneme alphabet="ipa" ph="sa.wu.bo.na e.ku.se.ni">Sawubona ekuseni</phoneme>',
    'Sawubona emini': '<phoneme alphabet="ipa" ph="sa.wu.bo.na e.mi.ni">Sawubona emini</phoneme>',
    'Sawubona ntambama': '<phoneme alphabet="ipa" ph="sa.wu.bo.na n̩.tam.ba.ma">Sawubona ntambama</phoneme>',
    'Sawubona ebusuku': '<phoneme alphabet="ipa" ph="sa.wu.bo.na e.bu.su.ku">Sawubona ebusuku</phoneme>',
    'Sanibonani': '<phoneme alphabet="ipa" ph="sa.ni.bo.na.ni">Sanibonani</phoneme>',
    'Yebo': '<phoneme alphabet="ipa" ph="jɛ.bo">Yebo</phoneme>',
    
    // === THANK YOU ===
    'Ngiyabonga': '<phoneme alphabet="ipa" ph="ŋi.ja.bo.ŋa">Ngiyabonga</phoneme>',
    'Siyabonga': '<phoneme alphabet="ipa" ph="si.ja.bo.ŋa">Siyabonga</phoneme>',
    'Ngiyabonga kakhulu': '<phoneme alphabet="ipa" ph="ŋi.ja.bo.ŋa ka.kʰu.lu">Ngiyabonga kakhulu</phoneme>',
    'Ngiyacela': '<phoneme alphabet="ipa" ph="ŋi.ja.t͡ʃɛ.la">Ngiyacela</phoneme>',
    'Sicela': '<phoneme alphabet="ipa" ph="si.t͡ʃɛ.la">Sicela</phoneme>',
    'Uxolo': '<phoneme alphabet="ipa" ph="u.ǁɔ.lɔ">Uxolo</phoneme>',
    
    // === YES/NO ===
    'Cha': '<phoneme alphabet="ipa" ph="t͡ʃa">Cha</phoneme>',
    'Kulungile': '<phoneme alphabet="ipa" ph="ku.lu.ŋi.lɛ">Kulungile</phoneme>',
    'Akukho': '<phoneme alphabet="ipa" ph="a.ku.kʰɔ">Akukho</phoneme>',
    'Yhoo': '<phoneme alphabet="ipa" ph="jɔː">Yhoo</phoneme>',
    
    // === HOW ARE YOU ===
    'Unjani': '<phoneme alphabet="ipa" ph="u.n̩.dʒa.ni">Unjani</phoneme>',
    'Ninjani': '<phoneme alphabet="ipa" ph="ni.n̩.dʒa.ni">Ninjani</phoneme>',
    'Ngiyaphila': '<phoneme alphabet="ipa" ph="ŋi.ja.pʰi.la">Ngiyaphila</phoneme>',
    'Siyaphila': '<phoneme alphabet="ipa" ph="si.ja.pʰi.la">Siyaphila</phoneme>',
    'Ngikhona': '<phoneme alphabet="ipa" ph="ŋi.kʰɔ.na">Ngikhona</phoneme>',
    'Kahle': '<phoneme alphabet="ipa" ph="ka.ɬɛ">Kahle</phoneme>',
    
    // === GOODBYE ===
    'Sala kahle': '<phoneme alphabet="ipa" ph="sa.la ka.ɬɛ">Sala kahle</phoneme>',
    'Hamba kahle': '<phoneme alphabet="ipa" ph="ham.ba ka.ɬɛ">Hamba kahle</phoneme>',
    'Sobonana': '<phoneme alphabet="ipa" ph="so.bo.na.na">Sobonana</phoneme>',
    'Ngizokubona': '<phoneme alphabet="ipa" ph="ŋi.zɔ.ku.bo.na">Ngizokubona</phoneme>',
    'Usale kahle': '<phoneme alphabet="ipa" ph="u.sa.lɛ ka.ɬɛ">Usale kahle</phoneme>',
    
    // === EMERGENCY ===
    'Ngidinga usizo': '<phoneme alphabet="ipa" ph="ŋi.di.ŋa u.si.zɔ">Ngidinga usizo</phoneme>',
    'Ngisize': '<phoneme alphabet="ipa" ph="ŋi.si.zɛ">Ngisize</phoneme>',
    'Ngisiza': '<phoneme alphabet="ipa" ph="ŋi.si.za">Ngisiza</phoneme>',
    'Usizo': '<phoneme alphabet="ipa" ph="u.si.zɔ">Usizo</phoneme>',
    'Ngicela usizo': '<phoneme alphabet="ipa" ph="ŋi.t͡ʃɛ.la u.si.zɔ">Ngicela usizo</phoneme>',
    'Ngilahlekile': '<phoneme alphabet="ipa" ph="ŋi.la.ɬɛ.ki.lɛ">Ngilahlekile</phoneme>',
    'Shayela amaphoyisa': '<phoneme alphabet="ipa" ph="ʃa.jɛ.la a.ma.pʰɔ.ji.sa">Shayela amaphoyisa</phoneme>',
    
    // === RESTAURANT ===
    'Ngifuna ukudla': '<phoneme alphabet="ipa" ph="ŋi.fu.na u.ku.dɮa">Ngifuna ukudla</phoneme>',
    'Ninani': '<phoneme alphabet="ipa" ph="ni.na.ni">Ninani</phoneme>',
    'Kumnandi': '<phoneme alphabet="ipa" ph="kum.nan.di">Kumnandi</phoneme>',
    'Ngipha i-bill': '<phoneme alphabet="ipa" ph="ŋi.pʰa i.bil">Ngipha i-bill</phoneme>',
    'Inhlanzi': '<phoneme alphabet="ipa" ph="in.ɬan.zi">Inhlanzi</phoneme>',
    'Inyama': '<phoneme alphabet="ipa" ph="i.ɲa.ma">Inyama</phoneme>',
    'Amanzi': '<phoneme alphabet="ipa" ph="a.man.zi">Amanzi</phoneme>',
    'Ukudla': '<phoneme alphabet="ipa" ph="u.ku.dɮa">Ukudla</phoneme>',
    'Ngilambile': '<phoneme alphabet="ipa" ph="ŋi.lam.bi.lɛ">Ngilambile</phoneme>',
    'Ngomile': '<phoneme alphabet="ipa" ph="ŋɔ.mi.lɛ">Ngomile</phoneme>',
    
    // === HOTEL ===
    'Ngifuna igumbi': '<phoneme alphabet="ipa" ph="ŋi.fu.na i.ɡum.bi">Ngifuna igumbi</phoneme>',
    'Akunamanzi': '<phoneme alphabet="ipa" ph="a.ku.na.man.zi">Akunamanzi</phoneme>',
    'Ngivuse ngo': '<phoneme alphabet="ipa" ph="ŋi.vu.sɛ ŋɔ">Ngivuse ngo</phoneme>',
    
    // === TRANSPORT ===
    'Ngiyisa': '<phoneme alphabet="ipa" ph="ŋi.ji.sa">Ngiyisa</phoneme>',
    'Isikhumulo sezindiza': '<phoneme alphabet="ipa" ph="i.si.kʰu.mu.lɔ sɛ.zin.di.za">Isikhumulo sezindiza</phoneme>',
    'Misa lapha': '<phoneme alphabet="ipa" ph="mi.sa la.pʰa">Misa lapha</phoneme>',
    'Shesha': '<phoneme alphabet="ipa" ph="ʃɛ.ʃa">Shesha</phoneme>',
    
    // === MEDICAL ===
    'Ngiyagula': '<phoneme alphabet="ipa" ph="ŋi.ja.ɡu.la">Ngiyagula</phoneme>',
    'Udokotela': '<phoneme alphabet="ipa" ph="u.dɔ.kɔ.tɛ.la">Udokotela</phoneme>',
    'Ikhanda liyahlaba': '<phoneme alphabet="ipa" ph="i.kʰan.da li.ja.ɬa.ba">Ikhanda liyahlaba</phoneme>',
    'Umuthi': '<phoneme alphabet="ipa" ph="u.mu.tʰi">Umuthi</phoneme>',
    
    // === SHOPPING ===
    'Kubiza kakhulu': '<phoneme alphabet="ipa" ph="ku.bi.za ka.kʰu.lu">Kubiza kakhulu</phoneme>',
    'Yehlisa intengo': '<phoneme alphabet="ipa" ph="jɛ.ɬi.sa in.tɛ.ŋɔ">Yehlisa intengo</phoneme>',
    'Kukhulu kakhulu': '<phoneme alphabet="ipa" ph="ku.kʰu.lu ka.kʰu.lu">Kukhulu kakhulu</phoneme>',
    'Kuncane kakhulu': '<phoneme alphabet="ipa" ph="kun.t͡ʃa.nɛ ka.kʰu.lu">Kuncane kakhulu</phoneme>',
    'Malini': '<phoneme alphabet="ipa" ph="ma.li.ni">Malini</phoneme>',
    
    // === QUESTIONS ===
    'Kuphi': '<phoneme alphabet="ipa" ph="ku.pʰi">Kuphi</phoneme>',
    'Ikuphi': '<phoneme alphabet="ipa" ph="i.ku.pʰi">Ikuphi</phoneme>',
    'Ikuphi indlu yangasese': '<phoneme alphabet="ipa" ph="i.ku.pʰi in.dɮu ja.ŋa.se.se">Ikuphi indlu yangasese</phoneme>',
    'Yini': '<phoneme alphabet="ipa" ph="ji.ni">Yini</phoneme>',
    'Nini': '<phoneme alphabet="ipa" ph="ni.ni">Nini</phoneme>',
    'Kungani': '<phoneme alphabet="ipa" ph="ku.ŋa.ni">Kungani</phoneme>',
    'Ubani': '<phoneme alphabet="ipa" ph="u.ba.ni">Ubani</phoneme>',
    'Kanjani': '<phoneme alphabet="ipa" ph="kan.dʒa.ni">Kanjani</phoneme>',
    
    // === DIRECTIONS ===
    'Jika kwesokudla': '<phoneme alphabet="ipa" ph="d͡ʒi.ka kwɛ.sɔ.ku.dɮa">Jika kwesokudla</phoneme>',
    'Jika kwesokunxele': '<phoneme alphabet="ipa" ph="d͡ʒi.ka kwɛ.sɔ.ku.ǁɛ.lɛ">Jika kwesokunxele</phoneme>',
    'Qonda': '<phoneme alphabet="ipa" ph="ǃɔn.da">Qonda</phoneme>',
    'Eduze': '<phoneme alphabet="ipa" ph="ɛ.du.zɛ">Eduze</phoneme>',
    'Kude': '<phoneme alphabet="ipa" ph="ku.dɛ">Kude</phoneme>',
    'Kwesokudla': '<phoneme alphabet="ipa" ph="kwɛ.sɔ.ku.dɮa">Kwesokudla</phoneme>',
    'Kwesokunxele': '<phoneme alphabet="ipa" ph="kwɛ.sɔ.ku.ǁɛ.lɛ">Kwesokunxele</phoneme>',
    'Phambili': '<phoneme alphabet="ipa" ph="pʰam.bi.li">Phambili</phoneme>',
    'Emuva': '<phoneme alphabet="ipa" ph="ɛ.mu.va">Emuva</phoneme>',
    
    // === COMMON WORDS ===
    'Igama': '<phoneme alphabet="ipa" ph="i.ɡa.ma">Igama</phoneme>',
    'Igama lami': '<phoneme alphabet="ipa" ph="i.ɡa.ma la.mi">Igama lami</phoneme>',
    'Igama lakho': '<phoneme alphabet="ipa" ph="i.ɡa.ma la.kʰɔ">Igama lakho</phoneme>',
    'Imali': '<phoneme alphabet="ipa" ph="i.ma.li">Imali</phoneme>',
    'Indlu': '<phoneme alphabet="ipa" ph="in.dɮu">Indlu</phoneme>',
    'Isitolo': '<phoneme alphabet="ipa" ph="i.si.tɔ.lɔ">Isitolo</phoneme>',
    
    // === NUMBERS ===
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
    
    // === USEFUL ===
    'Ngiyaqonda': '<phoneme alphabet="ipa" ph="ŋi.ja.ǃɔn.da">Ngiyaqonda</phoneme>',
    'Angiqondi': '<phoneme alphabet="ipa" ph="a.ŋi.ǃɔn.di">Angiqondi</phoneme>',
    'Ngifuna': '<phoneme alphabet="ipa" ph="ŋi.fu.na">Ngifuna</phoneme>',
    'Ngithanda': '<phoneme alphabet="ipa" ph="ŋi.tʰan.da">Ngithanda</phoneme>',
  };
  
  let result = text;
  for (const [word, pronunciation] of Object.entries(pronunciationMap)) {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, pronunciation);
  }
  
  return result;
};

export default applyZuluPronunciation;