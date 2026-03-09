export const applyIgboTones = (text) => {
  const pronunciationMap = {
    // === GREETINGS ===
    'Ndewo': '<phoneme alphabet="ipa" ph="n̩.dé.wò">Ndewo</phoneme>',
    'Ụtụtụ ọma': '<phoneme alphabet="ipa" ph="ʊ̀.tʊ̀.tʊ̀ ɔ̀.má">Ụtụtụ ọma</phoneme>',
    'Ehihie ọma': '<phoneme alphabet="ipa" ph="è.hì.hìɛ̀ ɔ̀.má">Ehihie ọma</phoneme>',
    'Mgbede ọma': '<phoneme alphabet="ipa" ph="m̩.ɡbé.dè ɔ̀.má">Mgbede ọma</phoneme>',
    'Abalị ọma': '<phoneme alphabet="ipa" ph="à.bà.lì ɔ̀.má">Abalị ọma</phoneme>',
    'Nnọọ': '<phoneme alphabet="ipa" ph="n̩.nɔ̀ː">Nnọọ</phoneme>',
    
    // === THANK YOU ===
    'Daalụ': '<phoneme alphabet="ipa" ph="dàː.lʊ́">Daalụ</phoneme>',
    'Daalụ rinne': '<phoneme alphabet="ipa" ph="dàː.lʊ́ ɾìn.nè">Daalụ rinne</phoneme>',
    'I meela': '<phoneme alphabet="ipa" ph="ì mèː.là">I meela</phoneme>',
    'Imela': '<phoneme alphabet="ipa" ph="ì.mè.là">Imela</phoneme>',
    'Biko': '<phoneme alphabet="ipa" ph="bí.kò">Biko</phoneme>',
    'Nna biko': '<phoneme alphabet="ipa" ph="n̩.nà bí.kò">Nna biko</phoneme>',
    'Biko nwanne': '<phoneme alphabet="ipa" ph="bí.kò n̩.wàn.nè">Biko nwanne</phoneme>',
    
    // === YES/NO ===
    'Ee': '<phoneme alphabet="ipa" ph="èː">Ee</phoneme>',
    'Mba': '<phoneme alphabet="ipa" ph="m̩.bà">Mba</phoneme>',
    'Ọ dị mma': '<phoneme alphabet="ipa" ph="ɔ̀ dì m̩.mà">Ọ dị mma</phoneme>',
    'Ọ dịghị': '<phoneme alphabet="ipa" ph="ɔ̀ dì.ɣì">Ọ dịghị</phoneme>',
    'Eziokwu': '<phoneme alphabet="ipa" ph="è.zì.ò.kwù">Eziokwu</phoneme>',
    
    // === HOW ARE YOU ===
    'Kedu': '<phoneme alphabet="ipa" ph="kè.dù">Kedu</phoneme>',
    'Kedu ka ị mere': '<phoneme alphabet="ipa" ph="kè.dù kà ì mè.ɾè">Kedu ka ị mere</phoneme>',
    'Kedu ka ị dị': '<phoneme alphabet="ipa" ph="kè.dù kà ì dì">Kedu ka ị dị</phoneme>',
    'A dị m mma': '<phoneme alphabet="ipa" ph="à dì m̩ m̩.mà">A dị m mma</phoneme>',
    'Ka ọ dị': '<phoneme alphabet="ipa" ph="kà ɔ̀ dì">Ka ọ dị</phoneme>',
    
    // === GOODBYE ===
    'Ka ọmesịa': '<phoneme alphabet="ipa" ph="kà ɔ̀.mè.sì.à">Ka ọmesịa</phoneme>',
    'Ka chi fo': '<phoneme alphabet="ipa" ph="kà t͡ʃì fò">Ka chi fo</phoneme>',
    'Nọdụ nke ọma': '<phoneme alphabet="ipa" ph="nɔ̀.dʊ̀ n̩.kè ɔ̀.má">Nọdụ nke ọma</phoneme>',
    'Jee nke ọma': '<phoneme alphabet="ipa" ph="dʒèː n̩.kè ɔ̀.má">Jee nke ọma</phoneme>',
    
    // === EMERGENCY ===
    'Achọrọ m enyemaka': '<phoneme alphabet="ipa" ph="à.t͡ʃɔ́.ɾɔ́ m̩ è.ɲè.má.kà">Achọrọ m enyemaka</phoneme>',
    'Nyere m aka': '<phoneme alphabet="ipa" ph="ɲè.ɾè m̩ à.kà">Nyere m aka</phoneme>',
    'Enyemaka': '<phoneme alphabet="ipa" ph="è.ɲè.má.kà">Enyemaka</phoneme>',
    'Biko nyere m aka': '<phoneme alphabet="ipa" ph="bí.kò ɲè.ɾè m̩ à.kà">Biko nyere m aka</phoneme>',
    'Efuru m ụzọ': '<phoneme alphabet="ipa" ph="è.fù.ɾù m̩ ʊ̀.zɔ̀">Efuru m ụzọ</phoneme>',
    'Kpọọ ndị uwe ojii': '<phoneme alphabet="ipa" ph="kpɔ̀ː n̩.dì ù.wè ò.d͡ʒìː">Kpọọ ndị uwe ojii</phoneme>',
    
    // === RESTAURANT ===
    'Achọrọ m nri': '<phoneme alphabet="ipa" ph="à.t͡ʃɔ́.ɾɔ́ m̩ n̩.ɾì">Achọrọ m nri</phoneme>',
    'Gịnị ka ị nwere': '<phoneme alphabet="ipa" ph="ɡì.nì kà ì n̩.wè.ɾè">Gịnị ka ị nwere</phoneme>',
    'Ọ tọrọ ụtọ': '<phoneme alphabet="ipa" ph="ɔ̀ tɔ́.ɾɔ́ ʊ̀.tɔ̀">Ọ tọrọ ụtọ</phoneme>',
    'Nye m bill': '<phoneme alphabet="ipa" ph="ɲè m̩ bil">Nye m bill</phoneme>',
    'Azụ': '<phoneme alphabet="ipa" ph="à.zʊ̀">Azụ</phoneme>',
    'Anụ': '<phoneme alphabet="ipa" ph="à.nʊ̀">Anụ</phoneme>',
    'Mmiri': '<phoneme alphabet="ipa" ph="m̩.mí.ɾì">Mmiri</phoneme>',
    'Nri': '<phoneme alphabet="ipa" ph="n̩.ɾì">Nri</phoneme>',
    'Agụụ na-agụ m': '<phoneme alphabet="ipa" ph="à.ɡʊ̀.ʊ̀ nà à.ɡʊ̀ m̩">Agụụ na-agụ m</phoneme>',
    
    // === HOTEL ===
    'Achọrọ m ọnụ ụlọ': '<phoneme alphabet="ipa" ph="à.t͡ʃɔ́.ɾɔ́ m̩ ɔ̀.nʊ̀ ʊ̀.lɔ̀">Achọrọ m ọnụ ụlọ</phoneme>',
    'Enweghị mmiri': '<phoneme alphabet="ipa" ph="è.n̩.wè.ɣì m̩.mí.ɾì">Enweghị mmiri</phoneme>',
    'Kpọtee m': '<phoneme alphabet="ipa" ph="kpɔ́.tèː m̩">Kpọtee m</phoneme>',
    
    // === TRANSPORT ===
    'Buru m gaa': '<phoneme alphabet="ipa" ph="bù.ɾù m̩ ɡàː">Buru m gaa</phoneme>',
    'Ọdụ ụgbọ elu': '<phoneme alphabet="ipa" ph="ɔ̀.dʊ̀ ʊ̀.ɡbɔ̀ è.lù">Ọdụ ụgbọ elu</phoneme>',
    'Kwụsị ebe a': '<phoneme alphabet="ipa" ph="kwʊ̀.sì è.bè à">Kwụsị ebe a</phoneme>',
    'Ngwa ngwa': '<phoneme alphabet="ipa" ph="ŋwa ŋwa">Ngwa ngwa</phoneme>',
    
    // === MEDICAL ===
    'Ahụ adịghị m mma': '<phoneme alphabet="ipa" ph="à.hʊ̀ à.dì.ɣì m̩ m̩.mà">Ahụ adịghị m mma</phoneme>',
    'Dọkịta': '<phoneme alphabet="ipa" ph="dɔ̀.kì.tà">Dọkịta</phoneme>',
    'Isi m na-ama jijiji': '<phoneme alphabet="ipa" ph="ì.sì m̩ nà à.mà d͡ʒì.d͡ʒì.d͡ʒì">Isi m na-ama jijiji</phoneme>',
    'Ọgwụ': '<phoneme alphabet="ipa" ph="ɔ̀.ɡwʊ̀">Ọgwụ</phoneme>',
    
    // === SHOPPING ===
    'Ọ dị oke ọnụ': '<phoneme alphabet="ipa" ph="ɔ̀ dì ò.kè ɔ̀.nʊ̀">Ọ dị oke ọnụ</phoneme>',
    'Belata ọnụ ahịa': '<phoneme alphabet="ipa" ph="bè.là.tà ɔ̀.nʊ̀ à.hì.à">Belata ọnụ ahịa</phoneme>',
    'O buru ibu': '<phoneme alphabet="ipa" ph="ɔ bù.ɾù ì.bù">O buru ibu</phoneme>',
    'O pere mpe': '<phoneme alphabet="ipa" ph="ɔ pè.ɾè m̩.pè">O pere mpe</phoneme>',
    'Ego ole': '<phoneme alphabet="ipa" ph="è.ɡò ò.lè">Ego ole</phoneme>',
    
    // === QUESTIONS ===
    'Olee': '<phoneme alphabet="ipa" ph="ò.lèː">Olee</phoneme>',
    'Olee ebe': '<phoneme alphabet="ipa" ph="ò.lèː è.bè">Olee ebe</phoneme>',
    'Gịnị': '<phoneme alphabet="ipa" ph="ɡì.nì">Gịnị</phoneme>',
    'Mgbe': '<phoneme alphabet="ipa" ph="m̩.ɡbè">Mgbe</phoneme>',
    'Gịnị mere': '<phoneme alphabet="ipa" ph="ɡì.nì mè.ɾè">Gịnị mere</phoneme>',
    'Ònye': '<phoneme alphabet="ipa" ph="ɔ̀.ɲè">Ònye</phoneme>',
    
    // === DIRECTIONS ===
    'Tụgharịa aka nri': '<phoneme alphabet="ipa" ph="tʊ̀.ɡà.ɾì.à à.kà n̩.ɾì">Tụgharịa aka nri</phoneme>',
    'Tụgharịa aka ekpe': '<phoneme alphabet="ipa" ph="tʊ̀.ɡà.ɾì.à à.kà è.kpè">Tụgharịa aka ekpe</phoneme>',
    'Kwụ ọtọ': '<phoneme alphabet="ipa" ph="kwʊ̀ ɔ̀.tɔ̀">Kwụ ọtọ</phoneme>',
    'Ọ dị nso': '<phoneme alphabet="ipa" ph="ɔ̀ dì n̩.sɔ̀">Ọ dị nso</phoneme>',
    'Ọ dị anya': '<phoneme alphabet="ipa" ph="ɔ̀ dì à.ɲà">Ọ dị anya</phoneme>',
    'Aka nri': '<phoneme alphabet="ipa" ph="à.kà n̩.ɾì">Aka nri</phoneme>',
    'Aka ekpe': '<phoneme alphabet="ipa" ph="à.kà è.kpè">Aka ekpe</phoneme>',
    'Ihu': '<phoneme alphabet="ipa" ph="ì.hù">Ihu</phoneme>',
    'Azụ': '<phoneme alphabet="ipa" ph="à.zʊ̀">Azụ</phoneme>',
    
    // === COMMON WORDS ===
    'Aha': '<phoneme alphabet="ipa" ph="à.hà">Aha</phoneme>',
    'Aha m bụ': '<phoneme alphabet="ipa" ph="à.hà m̩ bʊ̀">Aha m bụ</phoneme>',
    'Ego': '<phoneme alphabet="ipa" ph="è.ɡò">Ego</phoneme>',
    'Ụlọ': '<phoneme alphabet="ipa" ph="ʊ̀.lɔ̀">Ụlọ</phoneme>',
    'Ahịa': '<phoneme alphabet="ipa" ph="à.hì.à">Ahịa</phoneme>',
    
    // === NUMBERS ===
    'Otu': '<phoneme alphabet="ipa" ph="ò.tù">Otu</phoneme>',
    'Abụọ': '<phoneme alphabet="ipa" ph="à.bʊ̀.ɔ̀">Abụọ</phoneme>',
    'Atọ': '<phoneme alphabet="ipa" ph="à.tɔ̀">Atọ</phoneme>',
    'Anọ': '<phoneme alphabet="ipa" ph="à.nɔ̀">Anọ</phoneme>',
    'Ise': '<phoneme alphabet="ipa" ph="ì.sè">Ise</phoneme>',
    
    // === USEFUL ===
    'Aghọtara m': '<phoneme alphabet="ipa" ph="à.ɣɔ̀.tà.ɾà m̩">Aghọtara m</phoneme>',
    'Aghọtaghị m': '<phoneme alphabet="ipa" ph="à.ɣɔ̀.tà.ɣì m̩">Aghọtaghị m</phoneme>',
    'Achọrọ m': '<phoneme alphabet="ipa" ph="à.t͡ʃɔ́.ɾɔ́ m̩">Achọrọ m</phoneme>',
    'Ana m achọ': '<phoneme alphabet="ipa" ph="à.nà m̩ à.t͡ʃɔ́">Ana m achọ</phoneme>',
  };
  
  let result = text;
  for (const [word, pronunciation] of Object.entries(pronunciationMap)) {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, pronunciation);
  }
  
  result = `<prosody pitch="+5%">${result}</prosody>`;
  return result;
};

export default applyIgboTones;