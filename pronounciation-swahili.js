export const applySwahiliPronunciation = (text) => {
  const pronunciationMap = {
    // === GREETINGS ===
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
    
    // === THANK YOU ===
    'Asante': '<phoneme alphabet="ipa" ph="a.san.te">Asante</phoneme>',
    'Asante sana': '<phoneme alphabet="ipa" ph="a.san.te sa.na">Asante sana</phoneme>',
    'Ahsante': '<phoneme alphabet="ipa" ph="ah.san.te">Ahsante</phoneme>',
    'Tafadhali': '<phoneme alphabet="ipa" ph="ta.fa.ða.li">Tafadhali</phoneme>',
    'Karibu': '<phoneme alphabet="ipa" ph="ka.ɾi.bu">Karibu</phoneme>',
    'Pole': '<phoneme alphabet="ipa" ph="pɔ.lɛ">Pole</phoneme>',
    
    // === YES/NO ===
    'Ndiyo': '<phoneme alphabet="ipa" ph="n̩.di.jɔ">Ndiyo</phoneme>',
    'Ndio': '<phoneme alphabet="ipa" ph="n̩.di.ɔ">Ndio</phoneme>',
    'Hapana': '<phoneme alphabet="ipa" ph="ha.pa.na">Hapana</phoneme>',
    'Sawa': '<phoneme alphabet="ipa" ph="sa.wa">Sawa</phoneme>',
    'La': '<phoneme alphabet="ipa" ph="la">La</phoneme>',
    'Naam': '<phoneme alphabet="ipa" ph="naːm">Naam</phoneme>',
    
    // === HOW ARE YOU ===
    'Hujambo': '<phoneme alphabet="ipa" ph="hu.d͡ʒam.bɔ">Hujambo</phoneme>',
    'Sijambo': '<phoneme alphabet="ipa" ph="si.d͡ʒam.bɔ">Sijambo</phoneme>',
    'Hamjambo': '<phoneme alphabet="ipa" ph="ham.d͡ʒam.bɔ">Hamjambo</phoneme>',
    'Hatujambo': '<phoneme alphabet="ipa" ph="ha.tu.d͡ʒam.bɔ">Hatujambo</phoneme>',
    'Nzuri': '<phoneme alphabet="ipa" ph="n̩.zu.ɾi">Nzuri</phoneme>',
    'Vizuri': '<phoneme alphabet="ipa" ph="vi.zu.ɾi">Vizuri</phoneme>',
    
    // === GOODBYE ===
    'Kwaheri': '<phoneme alphabet="ipa" ph="kwa.he.ɾi">Kwaheri</phoneme>',
    'Kwa heri': '<phoneme alphabet="ipa" ph="kwa he.ɾi">Kwa heri</phoneme>',
    'Tutaonana': '<phoneme alphabet="ipa" ph="tu.ta.ɔ.na.na">Tutaonana</phoneme>',
    'Baadaye': '<phoneme alphabet="ipa" ph="baː.da.jɛ">Baadaye</phoneme>',
    'Safari njema': '<phoneme alphabet="ipa" ph="sa.fa.ɾi n̩.d͡ʒɛ.ma">Safari njema</phoneme>',
    
    // === EMERGENCY ===
    'Nahitaji msaada': '<phoneme alphabet="ipa" ph="na.hi.ta.d͡ʒi m̩.sa.da">Nahitaji msaada</phoneme>',
    'Nisaidie': '<phoneme alphabet="ipa" ph="ni.sa.i.di.ɛ">Nisaidie</phoneme>',
    'Msaada': '<phoneme alphabet="ipa" ph="m̩.sa.da">Msaada</phoneme>',
    'Saidia': '<phoneme alphabet="ipa" ph="sa.i.di.a">Saidia</phoneme>',
    'Nimepotea': '<phoneme alphabet="ipa" ph="ni.mɛ.pɔ.tɛ.a">Nimepotea</phoneme>',
    'Ita polisi': '<phoneme alphabet="ipa" ph="i.ta pɔ.li.si">Ita polisi</phoneme>',
    
    // === RESTAURANT ===
    'Nataka chakula': '<phoneme alphabet="ipa" ph="na.ta.ka t͡ʃa.ku.la">Nataka chakula</phoneme>',
    'Mna nini': '<phoneme alphabet="ipa" ph="m̩.na ni.ni">Mna nini</phoneme>',
    'Ni tamu': '<phoneme alphabet="ipa" ph="ni ta.mu">Ni tamu</phoneme>',
    'Leta bili': '<phoneme alphabet="ipa" ph="lɛ.ta bi.li">Leta bili</phoneme>',
    'Samaki': '<phoneme alphabet="ipa" ph="sa.ma.ki">Samaki</phoneme>',
    'Nyama': '<phoneme alphabet="ipa" ph="ɲa.ma">Nyama</phoneme>',
    'Maji': '<phoneme alphabet="ipa" ph="ma.d͡ʒi">Maji</phoneme>',
    'Chakula': '<phoneme alphabet="ipa" ph="t͡ʃa.ku.la">Chakula</phoneme>',
    'Nina njaa': '<phoneme alphabet="ipa" ph="ni.na n̩.d͡ʒaː">Nina njaa</phoneme>',
    'Nina kiu': '<phoneme alphabet="ipa" ph="ni.na ki.u">Nina kiu</phoneme>',
    
    // === HOTEL ===
    'Nataka chumba': '<phoneme alphabet="ipa" ph="na.ta.ka t͡ʃum.ba">Nataka chumba</phoneme>',
    'Hakuna maji': '<phoneme alphabet="ipa" ph="ha.ku.na ma.d͡ʒi">Hakuna maji</phoneme>',
    'Niamshe saa': '<phoneme alphabet="ipa" ph="ni.am.ʃɛ saː">Niamshe saa</phoneme>',
    
    // === TRANSPORT ===
    'Nipeleke': '<phoneme alphabet="ipa" ph="ni.pɛ.lɛ.kɛ">Nipeleke</phoneme>',
    'Uwanja wa ndege': '<phoneme alphabet="ipa" ph="u.wan.d͡ʒa wa n̩.dɛ.ɡɛ">Uwanja wa ndege</phoneme>',
    'Simama hapa': '<phoneme alphabet="ipa" ph="si.ma.ma ha.pa">Simama hapa</phoneme>',
    'Haraka': '<phoneme alphabet="ipa" ph="ha.ɾa.ka">Haraka</phoneme>',
    
    // === MEDICAL ===
    'Naumwa': '<phoneme alphabet="ipa" ph="na.um.wa">Naumwa</phoneme>',
    'Daktari': '<phoneme alphabet="ipa" ph="dak.ta.ɾi">Daktari</phoneme>',
    'Kichwa kinauma': '<phoneme alphabet="ipa" ph="ki.t͡ʃwa ki.na.u.ma">Kichwa kinauma</phoneme>',
    'Dawa': '<phoneme alphabet="ipa" ph="da.wa">Dawa</phoneme>',
    
    // === SHOPPING ===
    'Bei kubwa sana': '<phoneme alphabet="ipa" ph="be.i kub.wa sa.na">Bei kubwa sana</phoneme>',
    'Punguza bei': '<phoneme alphabet="ipa" ph="pun.gu.za be.i">Punguza bei</phoneme>',
    'Kubwa sana': '<phoneme alphabet="ipa" ph="kub.wa sa.na">Kubwa sana</phoneme>',
    'Ndogo sana': '<phoneme alphabet="ipa" ph="n̩.dɔ.ɡɔ sa.na">Ndogo sana</phoneme>',
    'Bei gani': '<phoneme alphabet="ipa" ph="be.i ga.ni">Bei gani</phoneme>',
    
    // === QUESTIONS ===
    'Wapi': '<phoneme alphabet="ipa" ph="wa.pi">Wapi</phoneme>',
    'Iko wapi': '<phoneme alphabet="ipa" ph="i.kɔ wa.pi">Iko wapi</phoneme>',
    'Choo kiko wapi': '<phoneme alphabet="ipa" ph="t͡ʃɔː ki.kɔ wa.pi">Choo kiko wapi</phoneme>',
    'Nini': '<phoneme alphabet="ipa" ph="ni.ni">Nini</phoneme>',
    'Lini': '<phoneme alphabet="ipa" ph="li.ni">Lini</phoneme>',
    'Kwa nini': '<phoneme alphabet="ipa" ph="kwa ni.ni">Kwa nini</phoneme>',
    'Nani': '<phoneme alphabet="ipa" ph="na.ni">Nani</phoneme>',
    'Vipi': '<phoneme alphabet="ipa" ph="vi.pi">Vipi</phoneme>',
    
    // === DIRECTIONS ===
    'Geuka kulia': '<phoneme alphabet="ipa" ph="ɡɛ.u.ka ku.li.a">Geuka kulia</phoneme>',
    'Geuka kushoto': '<phoneme alphabet="ipa" ph="ɡɛ.u.ka ku.ʃɔ.tɔ">Geuka kushoto</phoneme>',
    'Moja kwa moja': '<phoneme alphabet="ipa" ph="mɔ.d͡ʒa kwa mɔ.d͡ʒa">Moja kwa moja</phoneme>',
    'Karibu': '<phoneme alphabet="ipa" ph="ka.ɾi.bu">Karibu</phoneme>',
    'Mbali': '<phoneme alphabet="ipa" ph="m̩.ba.li">Mbali</phoneme>',
    'Kulia': '<phoneme alphabet="ipa" ph="ku.li.a">Kulia</phoneme>',
    'Kushoto': '<phoneme alphabet="ipa" ph="ku.ʃɔ.tɔ">Kushoto</phoneme>',
    'Mbele': '<phoneme alphabet="ipa" ph="m̩.bɛ.lɛ">Mbele</phoneme>',
    'Nyuma': '<phoneme alphabet="ipa" ph="ɲu.ma">Nyuma</phoneme>',
    
    // === COMMON WORDS ===
    'Jina': '<phoneme alphabet="ipa" ph="d͡ʒi.na">Jina</phoneme>',
    'Jina langu ni': '<phoneme alphabet="ipa" ph="d͡ʒi.na la.ŋu ni">Jina langu ni</phoneme>',
    'Pesa': '<phoneme alphabet="ipa" ph="pɛ.sa">Pesa</phoneme>',
    'Nyumba': '<phoneme alphabet="ipa" ph="ɲum.ba">Nyumba</phoneme>',
    'Soko': '<phoneme alphabet="ipa" ph="sɔ.kɔ">Soko</phoneme>',
    
    // === NUMBERS ===
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
    
    // === USEFUL ===
    'Naelewa': '<phoneme alphabet="ipa" ph="na.ɛ.lɛ.wa">Naelewa</phoneme>',
    'Sielewi': '<phoneme alphabet="ipa" ph="si.ɛ.lɛ.wi">Sielewi</phoneme>',
    'Nataka': '<phoneme alphabet="ipa" ph="na.ta.ka">Nataka</phoneme>',
    'Napenda': '<phoneme alphabet="ipa" ph="na.pɛn.da">Napenda</phoneme>',
  };
  
  let result = text;
  for (const [word, pronunciation] of Object.entries(pronunciationMap)) {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, pronunciation);
  }
  
  result = `<prosody rate="0.9">${result}</prosody>`;
  return result;
};

export default applySwahiliPronunciation;