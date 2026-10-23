export const applyYorubaTones = (text) => {
  const pronunciationMap = {
    // === GREETINGS & TIME OF DAY ===
    'Bawo': '<phoneme alphabet="ipa" ph="baː.wɔ">Bawo</phoneme>',
    'E kaaro': '<phoneme alphabet="ipa" ph="ɛ kaː.ɾɔ">E kaaro</phoneme>',
    'E kaasan': '<phoneme alphabet="ipa" ph="ɛ kaː.san">E kaasan</phoneme>',
    'E kale': '<phoneme alphabet="ipa" ph="ɛ ka.lɛ">E kale</phoneme>',
    'E ku irole': '<phoneme alphabet="ipa" ph="ɛ ku i.ɾɔ.lɛ">E ku irole</phoneme>',
    'E ku ọsan': '<phoneme alphabet="ipa" ph="ɛ ku ɔ.san">E ku ọsan</phoneme>',
    'Pele': '<phoneme alphabet="ipa" ph="pɛ.lɛ">Pele</phoneme>',
    'E ku isẹ': '<phoneme alphabet="ipa" ph="ɛ ku i.ʃɛ">E ku isẹ</phoneme>',
    
    // === THANK YOU / PLEASE ===
    'E se': '<phoneme alphabet="ipa" ph="ɛ ʃɛ">E se</phoneme>',
    'E se pupo': '<phoneme alphabet="ipa" ph="ɛ ʃɛ pú.pɔ̀">E se pupo</phoneme>',
    'E se gan': '<phoneme alphabet="ipa" ph="ɛ ʃɛ gan">E se gan</phoneme>',
    'O se': '<phoneme alphabet="ipa" ph="ɔ ʃɛ">O se</phoneme>',
    'Jọwọ': '<phoneme alphabet="ipa" ph="dʒɔ.wɔ">Jọwọ</phoneme>',
    'Ejo': '<phoneme alphabet="ipa" ph="ɛ.dʒɔ">Ejo</phoneme>',
    'Ejo ma': '<phoneme alphabet="ipa" ph="ɛ.dʒɔ ma">Ejo ma</phoneme>',
    
    // === YES/NO ===
    'Bẹẹni': '<phoneme alphabet="ipa" ph="bɛː.ni">Bẹẹni</phoneme>',
    'Beeni': '<phoneme alphabet="ipa" ph="bɛː.ni">Beeni</phoneme>',
    'Rara': '<phoneme alphabet="ipa" ph="ɾa.ɾa">Rara</phoneme>',
    'Ko si': '<phoneme alphabet="ipa" ph="kɔ ʃi">Ko si</phoneme>',
    'Bẹẹ': '<phoneme alphabet="ipa" ph="bɛː">Bẹẹ</phoneme>',
    
    // === HOW ARE YOU / I AM FINE ===
    'Bawo ni': '<phoneme alphabet="ipa" ph="baː.wɔ ni">Bawo ni</phoneme>',
    'Se daadaa ni': '<phoneme alphabet="ipa" ph="ʃɛ daː.daː ni">Se daadaa ni</phoneme>',
    'Mo wa daadaa': '<phoneme alphabet="ipa" ph="mɔ wa daː.daː">Mo wa daadaa</phoneme>',
    'Daadaa': '<phoneme alphabet="ipa" ph="daː.daː">Daadaa</phoneme>',
    'Mo wa dupe': '<phoneme alphabet="ipa" ph="mɔ wa du.pɛ">Mo wa dupe</phoneme>',
    'Alafia': '<phoneme alphabet="ipa" ph="a.la.fi.a">Alafia</phoneme>',
    
    // === GOODBYE ===
    'O dabo': '<phoneme alphabet="ipa" ph="ɔ da.bɔ">O dabo</phoneme>',
    'O da': '<phoneme alphabet="ipa" ph="ɔ da">O da</phoneme>',
    'Ma a ri e': '<phoneme alphabet="ipa" ph="maː ɾi ɛ">Ma a ri e</phoneme>',
    'O digba': '<phoneme alphabet="ipa" ph="ɔ di.gba">O digba</phoneme>',
    'E ku ale': '<phoneme alphabet="ipa" ph="ɛ ku a.lɛ">E ku ale</phoneme>',
    
    // === HELP / EMERGENCY ===
    'Mo nilo iranlọwọ': '<phoneme alphabet="ipa" ph="mɔ ní.lɔ i.ɾan.lɔ.wɔ">Mo nilo iranlọwọ</phoneme>',
    'E gba mi': '<phoneme alphabet="ipa" ph="ɛ gba mi">E gba mi</phoneme>',
    'Iranlọwọ': '<phoneme alphabet="ipa" ph="i.ɾan.lɔ.wɔ">Iranlọwọ</phoneme>',
    'Ran mi lọwọ': '<phoneme alphabet="ipa" ph="ɾan mi lɔ.wɔ">Ran mi lọwọ</phoneme>',
    'Egba mi o': '<phoneme alphabet="ipa" ph="ɛ.gba mi ɔ">Egba mi o</phoneme>',
    'Mo ti ṣọnu': '<phoneme alphabet="ipa" ph="mɔ ti ʃɔ.nu">Mo ti ṣọnu</phoneme>',
    'Pe ọlọpa': '<phoneme alphabet="ipa" ph="pɛ ɔ.lɔ.pa">Pe ọlọpa</phoneme>',
    'Mo ṣaisan': '<phoneme alphabet="ipa" ph="mɔ ʃaɪ.san">Mo ṣaisan</phoneme>',
    
    // === RESTAURANT / FOOD ===
    'Mo fẹ ounjẹ': '<phoneme alphabet="ipa" ph="mɔ fɛ ɔ.un.dʒɛ">Mo fẹ ounjẹ</phoneme>',
    'Kini o ni': '<phoneme alphabet="ipa" ph="kí.ni ɔ ni">Kini o ni</phoneme>',
    'Elo ni': '<phoneme alphabet="ipa" ph="ɛ.lɔ ni">Elo ni</phoneme>',
    'O po ju': '<phoneme alphabet="ipa" ph="ɔ pɔ dʒu">O po ju</phoneme>',
    'Mo fẹ omi': '<phoneme alphabet="ipa" ph="mɔ fɛ ɔ.mi">Mo fẹ omi</phoneme>',
    'Ọtí': '<phoneme alphabet="ipa" ph="ɔ.tí">Ọtí</phoneme>',
    'Mo fẹ ra': '<phoneme alphabet="ipa" ph="mɔ fɛ ɾa">Mo fẹ ra</phoneme>',
    'Ebi n pa mi': '<phoneme alphabet="ipa" ph="ɛ.bi n̩ pa mi">Ebi n pa mi</phoneme>',
    'O dun': '<phoneme alphabet="ipa" ph="ɔ dun">O dun</phoneme>',
    'O dun pupo': '<phoneme alphabet="ipa" ph="ɔ dun pú.pɔ̀">O dun pupo</phoneme>',
    'Ẹja': '<phoneme alphabet="ipa" ph="ɛ.dʒa">Ẹja</phoneme>',
    'Ẹran': '<phoneme alphabet="ipa" ph="ɛ.ɾan">Ẹran</phoneme>',
    'Iresi': '<phoneme alphabet="ipa" ph="i.ɾɛ.si">Iresi</phoneme>',
    'Ọbẹ': '<phoneme alphabet="ipa" ph="ɔ.bɛ">Ọbẹ</phoneme>',
    'Fun mi ni bill': '<phoneme alphabet="ipa" ph="fun mi ni bil">Fun mi ni bill</phoneme>',
    'Akara': '<phoneme alphabet="ipa" ph="a.ka.ɾa">Akara</phoneme>',
    'Moimoi': '<phoneme alphabet="ipa" ph="mɔɪ.mɔɪ">Moimoi</phoneme>',
    
    // === HOTEL / ACCOMMODATION ===
    'Mo fẹ yara': '<phoneme alphabet="ipa" ph="mɔ fɛ ja.ɾa">Mo fẹ yara</phoneme>',
    'Yara wo ni': '<phoneme alphabet="ipa" ph="ja.ɾa wɔ ni">Yara wo ni</phoneme>',
    'Kọkọrọ wa': '<phoneme alphabet="ipa" ph="kɔ.kɔ.ɾɔ wa">Kọkọrọ wa</phoneme>',
    'Omi ko si': '<phoneme alphabet="ipa" ph="ɔ.mi kɔ si">Omi ko si</phoneme>',
    'Ina ko si': '<phoneme alphabet="ipa" ph="i.na kɔ si">Ina ko si</phoneme>',
    'Mo fẹ lọ': '<phoneme alphabet="ipa" ph="mɔ fɛ lɔ">Mo fẹ lọ</phoneme>',
    'Ọla': '<phoneme alphabet="ipa" ph="ɔ.la">Ọla</phoneme>',
    'Ji mi ni': '<phoneme alphabet="ipa" ph="dʒi mi ni">Ji mi ni</phoneme>',
    
    // === TRANSPORTATION ===
    'Mu mi lọ si': '<phoneme alphabet="ipa" ph="mu mi lɔ si">Mu mi lọ si</phoneme>',
    'Papa ọkọ ofurufu': '<phoneme alphabet="ipa" ph="pa.pa ɔ.kɔ ɔ.fu.ɾu.fu">Papa ọkọ ofurufu</phoneme>',
    'Ibudo ọkọ oju irin': '<phoneme alphabet="ipa" ph="i.bu.dɔ ɔ.kɔ ɔ.dʒu i.ɾin">Ibudo ọkọ oju irin</phoneme>',
    'Duro nibi': '<phoneme alphabet="ipa" ph="du.ɾɔ ni.bi">Duro nibi</phoneme>',
    'Yara': '<phoneme alphabet="ipa" ph="ja.ɾa">Yara</phoneme>',
    'Lọra': '<phoneme alphabet="ipa" ph="lɔ.ɾa">Lọra</phoneme>',
    'Ọkọ ayọkẹlẹ': '<phoneme alphabet="ipa" ph="ɔ.kɔ a.jɔ.kɛ.lɛ">Ọkọ ayọkẹlẹ</phoneme>',
    'Bọsi': '<phoneme alphabet="ipa" ph="bɔ.si">Bọsi</phoneme>',
    
    // === MEDICAL ===
    'Ara mi ko dara': '<phoneme alphabet="ipa" ph="a.ɾa mi kɔ da.ɾa">Ara mi ko dara</phoneme>',
    'Ile iwe oogun': '<phoneme alphabet="ipa" ph="i.lɛ i.wɛ ɔː.ɡun">Ile iwe oogun</phoneme>',
    'Dokita': '<phoneme alphabet="ipa" ph="dɔ.ki.ta">Dokita</phoneme>',
    'Irora': '<phoneme alphabet="ipa" ph="i.ɾɔ.ɾa">Irora</phoneme>',
    'Ori mi n ro': '<phoneme alphabet="ipa" ph="ɔ.ɾi mi n̩ ɾɔ">Ori mi n ro</phoneme>',
    'Oogun': '<phoneme alphabet="ipa" ph="ɔː.ɡun">Oogun</phoneme>',
    'Mo ni iba': '<phoneme alphabet="ipa" ph="mɔ ni i.ba">Mo ni iba</phoneme>',
    
    // === SHOPPING / BARGAINING ===
    'Elo ni eyi': '<phoneme alphabet="ipa" ph="ɛ.lɔ ni ɛ.ji">Elo ni eyi</phoneme>',
    'Din owo': '<phoneme alphabet="ipa" ph="din ɔ.wɔ">Din owo</phoneme>',
    'Nwọn ti ta': '<phoneme alphabet="ipa" ph="n̩.wɔn ti ta">Nwọn ti ta</phoneme>',
    'Tani o': '<phoneme alphabet="ipa" ph="tá.ni ɔ">Tani o</phoneme>',
    'Awọ wo': '<phoneme alphabet="ipa" ph="a.wɔ wɔ">Awọ wo</phoneme>',
    'Tobi ju': '<phoneme alphabet="ipa" ph="tɔ.bi dʒu">Tobi ju</phoneme>',
    'Kere ju': '<phoneme alphabet="ipa" ph="kɛ.ɾɛ dʒu">Kere ju</phoneme>',
    
    // === QUESTIONS ===
    'Nibo ni': '<phoneme alphabet="ipa" ph="ní.bɔ ni">Nibo ni</phoneme>',
    'Nibo ni baluwe wa': '<phoneme alphabet="ipa" ph="ní.bɔ ni ba.lu.wɛ wa">Nibo ni baluwe wa</phoneme>',
    'Kini': '<phoneme alphabet="ipa" ph="kí.ni">Kini</phoneme>',
    'Kilode': '<phoneme alphabet="ipa" ph="kí.lɔ.dɛ">Kilode</phoneme>',
    'Nigbawo': '<phoneme alphabet="ipa" ph="ní.gba.wɔ">Nigbawo</phoneme>',
    'Tani': '<phoneme alphabet="ipa" ph="tá.ni">Tani</phoneme>',
    'Bawo': '<phoneme alphabet="ipa" ph="baː.wɔ">Bawo</phoneme>',
    'Ibo ni': '<phoneme alphabet="ipa" ph="i.bɔ ni">Ibo ni</phoneme>',
    
    // === COMMON WORDS ===
    'Oruko': '<phoneme alphabet="ipa" ph="ɔ.ɾu.kɔ">Oruko</phoneme>',
    'Orukọ mi ni': '<phoneme alphabet="ipa" ph="ɔ.ɾu.kɔ mi ni">Orukọ mi ni</phoneme>',
    'Owo': '<phoneme alphabet="ipa" ph="ɔ.wɔ">Owo</phoneme>',
    'Ile': '<phoneme alphabet="ipa" ph="i.lɛ">Ile</phoneme>',
    'Oja': '<phoneme alphabet="ipa" ph="ɔ.dʒa">Oja</phoneme>',
    'Ọjọ': '<phoneme alphabet="ipa" ph="ɔ.dʒɔ">Ọjọ</phoneme>',
    'Aye': '<phoneme alphabet="ipa" ph="a.jɛ">Aye</phoneme>',
    'Omi': '<phoneme alphabet="ipa" ph="ɔ.mi">Omi</phoneme>',
    'Ounjẹ': '<phoneme alphabet="ipa" ph="ɔ.un.dʒɛ">Ounjẹ</phoneme>',
    
    // === DIRECTIONS ===
    'Apa ọtun': '<phoneme alphabet="ipa" ph="a.pa ɔ.tun">Apa ọtun</phoneme>',
    'Apa osi': '<phoneme alphabet="ipa" ph="a.pa ɔ.si">Apa osi</phoneme>',
    'Iwaju': '<phoneme alphabet="ipa" ph="i.wa.dʒu">Iwaju</phoneme>',
    'Ehin': '<phoneme alphabet="ipa" ph="ɛ.hin">Ehin</phoneme>',
    'Ninu': '<phoneme alphabet="ipa" ph="ní.nu">Ninu</phoneme>',
    'Lode': '<phoneme alphabet="ipa" ph="lɔ.dɛ">Lode</phoneme>',
    'Sunmọ': '<phoneme alphabet="ipa" ph="sun.mɔ">Sunmọ</phoneme>',
    'Jinna': '<phoneme alphabet="ipa" ph="dʒin.na">Jinna</phoneme>',
    'Nibi': '<phoneme alphabet="ipa" ph="ní.bi">Nibi</phoneme>',
    'Lọ si ọtun': '<phoneme alphabet="ipa" ph="lɔ si ɔ.tun">Lọ si ọtun</phoneme>',
    'Lọ si osi': '<phoneme alphabet="ipa" ph="lɔ si ɔ.si">Lọ si osi</phoneme>',
    'Tẹsiwaju': '<phoneme alphabet="ipa" ph="tɛ.si.wa.dʒu">Tẹsiwaju</phoneme>',
    
    // === NUMBERS ===
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
    'Ogun': '<phoneme alphabet="ipa" ph="ɔ.ɡun">Ogun</phoneme>',
    'Ọgbọn': '<phoneme alphabet="ipa" ph="ɔ.ɡbɔn">Ọgbọn</phoneme>',
    'Ọgọrun': '<phoneme alphabet="ipa" ph="ɔ.ɡɔ.ɾun">Ọgọrun</phoneme>',
    
    // === USEFUL PHRASES ===
    'Mo fẹ': '<phoneme alphabet="ipa" ph="mɔ fɛ">Mo fẹ</phoneme>',
    'Mo feran': '<phoneme alphabet="ipa" ph="mɔ fɛ.ɾan">Mo feran</phoneme>',
    'Mo ko feran': '<phoneme alphabet="ipa" ph="mɔ kɔ fɛ.ɾan">Mo ko feran</phoneme>',
    'Mo gbo': '<phoneme alphabet="ipa" ph="mɔ gbɔ">Mo gbo</phoneme>',
    'Mo ko gbo': '<phoneme alphabet="ipa" ph="mɔ kɔ gbɔ">Mo ko gbo</phoneme>',
    'Mo ni': '<phoneme alphabet="ipa" ph="mɔ ni">Mo ni</phoneme>',
    'Mi ko ni': '<phoneme alphabet="ipa" ph="mi kɔ ni">Mi ko ni</phoneme>',
    'Sọ fun mi': '<phoneme alphabet="ipa" ph="sɔ fun mi">Sọ fun mi</phoneme>',
    'Mo wa lati': '<phoneme alphabet="ipa" ph="mɔ wa la.ti">Mo wa lati</phoneme>',
  };
  
  let result = text;
  for (const [word, pronunciation] of Object.entries(pronunciationMap)) {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, pronunciation);
  }
  
  result = `<emphasis level="moderate">${result}</emphasis>`;
  return result;
};

export default applyYorubaTones;