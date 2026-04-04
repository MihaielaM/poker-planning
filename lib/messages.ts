// Messages shown next to participants who haven't voted when >50% already have
export const SLOW_VOTER_MESSAGES = [
  '...încă se gândește la viața lui',
  'Momentan în meditație profundă',
  'Probabil a adormit cu cardul în mână',
  'Verifică Fibonacci pe Google',
  'A uitat parola la creier',
  'Se uită la calendar să vadă ce an e',
  'Conexiunea cu realitatea e instabilă',
  'Bug detectat: lipsă decizie',
  'Procesează... procesează... 2%',
  'A intrat în modul de economisire energie',
  'Consultă un ghicitor în cafea',
  'Numără pe degete de la capăt',
  'Teoretic o să voteze săptămâna viitoare',
  'Loading... vă rugăm așteptați',
  'Estimare pentru estimare: infinit',
  'A deschis un nou tab pe Stack Overflow',
  'Crede că e o întrebare retorică',
  'Calculează riscurile existențiale',
  'Momentan absent spiritual',
  'A comandat o pizza și așteaptă inspirație',
  'Revizuiește toate sprinturile din 2019',
  'Bate recordul mondial la indecis',
  'A uitat ce înseamnă Fibonacci',
  'Se pregătește să voteze... probabil',
  'Ecranul e blocat pe "în curs de gândire"',
  'Calculul e complex, vă rog aveți răbdare',
  'A bifat "mă gândesc" și a rămas acolo',
  'Semnalul de la creier a fost întrerupt',
  'Trage de timp cu profesionalism',
  'Estimarea lui e undeva în Univers',
  'A cerut prelungire de sprint',
  'Momentan în stand-up cu sine însuși',
  'Prioritate curentă: "mă gândesc"',
  'Testează limitele noastre emoționale',
  'Probabil scrie un roman despre task',
  'WiFi-ul minții e lent azi',
  'A intrat în review fără să termine votul',
  'Calculează story points la story points',
  'Undeva între 1 și infinit',
  'E în meeting cu el însuși',
  'Momentan offline existențial',
  'Se gândește serios... sau se preface',
  'A uitat că există o echipă',
  'Estimează durata estimării',
  'S-a dus după cafea și n-a mai venit',
  'Task-ul îl privește și el privește task-ul',
  'A găsit un bug în propriul proces de gândire',
  'Rulează unit tests mentale',
  'Votul lui e în production review',
  'Momentan: deep work (la vot)',
  'Se întreabă dacă există viață după sprint',
  'Analizează task-ul din toate unghiurile posibile',
  'A pornit un timer de 2 ore pentru vot',
  'Codul lui votează mai repede decât el',
  'Sincronizare cu universul: în progres',
  'Abia a citit titlul task-ului',
  'Crede că e opțional să votezi',
  'Îl așteptăm... cu drag... evident',
  'E blocat pe un edge case inexistent',
  'A deschis Jira și a uitat de ce',
  'Calculatorul lui Fibonacci nu pornește',
];

// Short messages shown on highlighted (extreme) vote cards
export const EXTREME_CARD_MESSAGES = [
  'Explică-te! 😅',
  'Bold move! 🔥',
  'Convinge-ne! 🎤',
  'Interesant... 🤔',
  'De ce? 👀',
  'Suntem curioși! 🧐',
  'Ești sigur? 😬',
  'Spune mai mult! 💬',
];

// Banner messages shown below results when there are extreme votes
export const EXTREME_BANNER_MESSAGES = [
  'Avem divergențe! Cei cu voturi extreme, deschideți dezbaterea 🔥',
  'Cineva vede task-ul altfel — și asta e perfect! Dezbatem? 🤝',
  'Discrepanță detectată! E momentul pentru o discuție caldă ☕',
  'Voturi la extreme! Haideți să auzim toate perspectivele 🗣️',
  'Nu suntem de acord — și asta e sănătos! Cine deschide? 🎯',
  'Echipa e divizată! Argumentele voastre ne interesează 💡',
  'Estimări la poli opuși! E ora dezbaterii 🏆',
  'Diferențe mari de estimare detectate. Task-ul e mai complex? 🔍',
  'Suntem pe aceeași echipă, dar pe planete diferite cu estimările 🚀',
  'Hai să auzim și perspectiva celor de la extreme! 🎙️',
];

// Deterministic "random" based on a string seed — consistent across re-renders
export function seededPick<T>(arr: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return arr[Math.abs(hash) % arr.length];
}
