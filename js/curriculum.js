// Version 1 curriculum: letter recognition.
// Each station teaches 3-5 new letters. The order puts first letters of "אמא" and "אבא" first,
// and keeps letters that look alike (ד/ר, ו/ז/ן, ב/כ, ה/ח/ת, ס/ם) in different stations.

// id: ASCII key for audio files. name: letter name with niqqud (shown in subtitles).
// say: spelling for the Microsoft and device voices when they misread `name` (they read חֵית as "cheta").
// tts: spelling for the natural (OpenAI) voices. With a tsere they say "beit", "reish"; in kindergarten
// the letter names are said without that "i": bet, khet, tet, resh.
export const LETTERS = [
  { ch: 'א', id: 'alef', name: 'אָלֶף' },
  { ch: 'ב', id: 'bet', name: 'בֵּית', tts: 'בֶּת' },
  { ch: 'ג', id: 'gimel', name: 'גִּימֶל' },
  { ch: 'ד', id: 'dalet', name: 'דָּלֶת' },
  { ch: 'ה', id: 'he', name: 'הֵא' },
  { ch: 'ו', id: 'vav', name: 'וָו' },
  { ch: 'ז', id: 'zayin', name: 'זַיִן' },
  { ch: 'ח', id: 'het', name: 'חֵית', say: 'חֵת', tts: 'חֶת' },
  { ch: 'ט', id: 'tet', name: 'טֵית', tts: 'טֶת' },
  { ch: 'י', id: 'yud', name: 'יוּד' },
  { ch: 'כ', id: 'kaf', name: 'כַּף' },
  { ch: 'ל', id: 'lamed', name: 'לָמֶד' },
  { ch: 'מ', id: 'mem', name: 'מֵם' },
  { ch: 'נ', id: 'nun', name: 'נוּן' },
  { ch: 'ס', id: 'samekh', name: 'סָמֶךְ' },
  { ch: 'ע', id: 'ayin', name: 'עַיִן' },
  { ch: 'פ', id: 'pe', name: 'פֵּא' },
  { ch: 'צ', id: 'tsadi', name: 'צָדִי', say: 'צַדִּי' },
  { ch: 'ק', id: 'kuf', name: 'קוּף', say: 'קוּוף' },
  { ch: 'ר', id: 'resh', name: 'רֵישׁ', tts: 'רֶשׁ' },
  { ch: 'ש', id: 'shin', name: 'שִׁין' },
  { ch: 'ת', id: 'tav', name: 'תָּו' },
  { ch: 'ך', id: 'kaf-final', name: 'כַּף סוֹפִית', base: 'כ' },
  { ch: 'ם', id: 'mem-final', name: 'מֵם סוֹפִית', base: 'מ' },
  { ch: 'ן', id: 'nun-final', name: 'נוּן סוֹפִית', base: 'נ' },
  { ch: 'ף', id: 'pe-final', name: 'פֵּא סוֹפִית', base: 'פ' },
  { ch: 'ץ', id: 'tsadi-final', name: 'צָדִי סוֹפִית', say: 'צַדִּי סוֹפִית', base: 'צ' },
];

export const LETTER = Object.fromEntries(LETTERS.map((l) => [l.ch, l]));

// Pairs that young children confuse. For ages 3-4 these are not used together
// as a target and a distractor until the child knows both letters.
const CONFUSABLE_GROUPS = ['דר', 'וזן', 'בכ', 'החת', 'סם', 'עצ', 'גנ', 'טמ', 'כך', 'פף', 'צץ', 'נן', 'מם', 'יו'];
export function confusable(a, b) {
  return a !== b && CONFUSABLE_GROUPS.some((g) => g.includes(a) && g.includes(b));
}

// theme: background and item type for the mission. games: the two mini-games on the first visit
// (a replay picks two other games, so a station is not the same every time).
export const STATIONS = [
  { n: 1, letters: ['א', 'מ', 'ב'], theme: 'bridge', games: ['find', 'catch'] },
  { n: 2, letters: ['ל', 'ש', 'ת'], theme: 'harbor', games: ['sort', 'memory'] },
  { n: 3, letters: ['ד', 'ו', 'ס'], theme: 'beach', games: ['paint', 'catch'] },
  { n: 4, letters: ['י', 'נ', 'פ'], theme: 'forest', games: ['catch', 'memory'] },
  { n: 5, letters: ['ר', 'ג', 'ע'], theme: 'farm', games: ['memory', 'sort'] },
  { n: 6, letters: ['ה', 'ק', 'ט'], theme: 'hill', games: ['paint', 'catch'] },
  { n: 7, letters: ['כ', 'צ', 'ז', 'ח'], theme: 'reef', games: ['sort', 'find'] },
  { n: 8, letters: ['ך', 'ם', 'ן', 'ף', 'ץ'], theme: 'island', games: ['memory', 'paint'] },
];

export const GAMES = ['find', 'catch', 'memory', 'sort', 'paint'];

export const STATION = Object.fromEntries(STATIONS.map((s) => [s.n, s]));

// All letters taught before station n.
export function lettersBefore(n) {
  return STATIONS.filter((s) => s.n < n).flatMap((s) => s.letters);
}

// Short missions: each mini-game has `goals` goals (a goal = one progress dot).
export const PACE = {
  '3-4': { goals: 3, choices: 3, pairs: 2, catchItems: 5, catchSpeed: 32, paintCover: 0.55, brush: 46 },
  '5-6': { goals: 4, choices: 3, pairs: 3, catchItems: 7, catchSpeed: 46, paintCover: 0.7, brush: 38 },
};
