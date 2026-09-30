// Every spoken line in the game. The id is also the audio file name:
// audio/custom/<id>.mp3 (your own recording) or audio/tts/<id>.mp3 (generated voice).
// If no file exists, the device speech engine reads `say` (or `text`). `text` is what subtitles show.
// voice: 'captain' (Captain Ori) or 'puppy' (higher, playful voice).
// speaker: whose voice file settings to use (audio/voices.json): 'captain' or a puppy id.
// All instructions use plural forms (לַחֲצוּ, בּוֹאוּ), so they fit every child.

import { LETTERS } from './curriculum.js';

export const PHRASES = {};
const add = (id, text, voice = 'captain', speaker = voice, say = text) => { PHRASES[id] = { id, text, voice, speaker, say }; };

// ---------- general ----------
add('hello', 'שָׁלוֹם! אֲנִי קַפְּטֵן אוֹרִי, מִן הַמִּגְדַּלּוֹר.');
add('hello2', 'בּוֹאוּ נִלְמַד אוֹתִיּוֹת עִם צֶוֶת הַחִלּוּץ!');
add('who', 'מִי מְשַׂחֵק עַכְשָׁו?');
add('choose', 'בַּחֲרוּ כְּלַבְלַב לַצֶּוֶת. לַחֲצוּ עַל כְּלַבְלַב כְּדֵי לְהַכִּיר אוֹתוֹ.');
add('chooseOk', 'רוֹצִים אֶת הַכְּלַבְלַב הַזֶּה? לַחֲצוּ עַל הַכַּפְתּוֹר הַיָּרֹק.');
add('welcomeTeam', 'בְּרוּכִים הַבָּאִים לַצֶּוֶת!');
add('map', 'לְאָן נוֹסְעִים? לַחֲצוּ עַל הַתַּחֲנָה שֶׁקּוֹפֶצֶת.');
add('locked', 'עוֹד לֹא. קֹדֶם הַתַּחֲנָה שֶׁקּוֹפֶצֶת.');
add('allDone', 'הִצַּלְתֶּם אֶת כֹּל הָאוֹתִיּוֹת בַּמִּפְרָץ! אַתֶּם צֶוֶת מַדְהִים!');
add('badges', 'אֵלֶּה הַתָּגִים שֶׁאֲסַפְתֶּם. לַחֲצוּ עַל תָּג כְּדֵי לִשְׁמֹעַ.');
add('badgesEmpty', 'עוֹד אֵין תָּגִים. כֹּל אוֹת שֶׁנַּצִּיל תִּהְיֶה תָּג!');
add('go', 'יוֹצְאִים לַמְּשִׂימָה!');
add('newLetters', 'הִנֵּה הָאוֹתִיּוֹת שֶׁל הַמְּשִׂימָה.');
add('look', 'הִסְתַּכְּלוּ, הָאוֹת קוֹפֶצֶת!');
add('catchIntro', 'וְעַכְשָׁו, הַהַצָּלָה הַגְּדוֹלָה!');
add('done', 'הַמְּשִׂימָה הֻשְׁלְמָה! כֹּל הַכָּבוֹד, צֶוֶת!');
add('backToMap', 'לַחֲצוּ עַל הַמַּפָּה, וְנִסַּע לַתַּחֲנָה הַבָּאָה.');
add('finalNote', 'אוֹת סוֹפִית בָּאָה רַק בְּסוֹף הַמִּלָּה.');
add('voiceTest', 'שָׁלוֹם! כָּךְ נִשְׁמָע הַקּוֹל שֶׁל הַמִּשְׂחָק.');

const PRAISE = ['כֹּל הַכָּבוֹד!', 'מְצֻיָּן!', 'יוֹפִי!', 'נָכוֹן מְאוֹד!', 'אַלּוּפִים!', 'אֵיזֶה יֹפִי!'];
PRAISE.forEach((t, i) => add(`praise.${i + 1}`, t));
export const PRAISE_IDS = PRAISE.map((_, i) => `praise.${i + 1}`);

// ---------- mission stories ----------
add('story.bridge', 'אוֹי, לֹא! רוּחַ חֲזָקָה הֵפִּילָה אֶת הָאוֹתִיּוֹת מִן הַגֶּשֶׁר לַמַּיִם. בּוֹאוּ נַצִּיל אוֹתָן!');
add('story.harbor', 'בַּנָּמָל נָפְלוּ אַרְגְּזֵי הָאוֹתִיּוֹת מִן הָאֳנִיָּה. בּוֹאוּ נַחְזִיר אוֹתָם!');
add('story.beach', 'הַגַּלִּים כִּסּוּ אֶת הָאוֹתִיּוֹת בַּחוֹל. בּוֹאוּ נִמְצָא אוֹתָן בֵּין הַצְּדָפִים!');
add('story.forest', 'הָאוֹתִיּוֹת נִתְקְעוּ לְמַעְלָה, עַל הָעֵצִים בַּיַּעַר. בּוֹאוּ נוֹרִיד אוֹתָן!');
add('story.farm', 'בַּחַוָּה, הָאוֹתִיּוֹת הִתְחַבְּאוּ בֵּין הַבֵּיצִים. בּוֹאוּ נִמְצָא אוֹתָן!');
add('story.hill', 'הָרוּחַ עַל הַגִּבְעָה הֵעִיפָה אֶת הָאוֹתִיּוֹת עִם הַבָּלוֹנִים. בּוֹאוּ נִתְפֹּס אוֹתָן!');
add('story.reef', 'הַדָּגִים בַּשּׁוּנִית שָׂחוּ עִם הָאוֹתִיּוֹת. בּוֹאוּ נַחְזִיר אוֹתָן!');
add('story.island', 'בָּאִי הַקָּטָן יֵשׁ אוֹתִיּוֹת מְיֻחָדוֹת: אוֹתִיּוֹת סוֹפִיּוֹת. בּוֹאוּ נַכִּיר אוֹתָן!');

// ---------- per letter ----------
for (const l of LETTERS) {
  const final = Boolean(l.base);
  const the = final ? '' : 'הָאוֹת ';
  // Each line is made twice: n = the name for subtitles, s = the spelling for the speech engine.
  const line = (id, make) => add(id, make(l.name), 'captain', 'captain', make(l.say || l.name));
  // "הָאוֹת" comes first on purpose: a letter name at the very start of a file lost its first
  // sound in tests (פֵּא was heard as "te").
  line(`name.${l.id}`, (n) => `הָאוֹת ${n}!`);
  line(`intro.${l.id}`, (n) => `זוֹ ${the}${n}.`);
  line(`touch.${l.id}`, (n) => `לַחֲצוּ עַל ${the}${n}.`);
  line(`find.${l.id}`, (n) => `אֵיפֹה ${the}${n}?`);
  line(`here.${l.id}`, (n) => `${final ? '' : 'הָאוֹת '}${n} כָּאן. לַחֲצוּ עָלֶיהָ.`);
  line(`catch.${l.id}`, (n) => `לַחֲצוּ עַל כֹּל הָאוֹתִיּוֹת ${n}!`);
  line(`badge.${l.id}`, (n) => `קִבַּלְתֶּם תָּג שֶׁל ${the}${n}!`);
}

// ---------- puppies (spoken by the puppy) ----------
add('pup.pilpel', 'הַב הַב! אֲנִי פִּלְפֵּל, הַכַּבַּאי. אֲנִי מְכַבֶּה שְׂרֵפוֹת!', 'puppy', 'pilpel');
add('pup.dubi', 'הַב הַב! אֲנִי דּוּבִּי, הַשּׁוֹטֵר. אֲנִי שׁוֹמֵר עַל כֻּלָּם!', 'puppy', 'dubi');
add('pup.anani', 'הַב הַב! אֲנִי עֲנָנִי, הַטַּיֶּסֶת. אֲנִי טָסָה בַּמַּסּוֹק!', 'puppy', 'anani');
add('pup.bloki', 'הַב הַב! אֲנִי בְּלוֹקִי, הַבַּנַּאי. אֲנִי בּוֹנֶה וּמְתַקֵּן!', 'puppy', 'bloki');
add('pup.gali', 'הַב הַב! אֲנִי גַּלִּי, הַמַּצִּילָה. אֲנִי שׁוֹמֶרֶת עַל הַיָּם!', 'puppy', 'gali');
add('pup.lulu', 'הַב הַב! אֲנִי לוּלוּ, הַוֶּטֶרִינָרִית. אֲנִי מְטַפֶּלֶת בַּחַיּוֹת!', 'puppy', 'lulu');
add('ready.pilpel', 'פִּלְפֵּל מוּכָן!', 'puppy', 'pilpel');
add('ready.dubi', 'דּוּבִּי מוּכָן!', 'puppy', 'dubi');
add('ready.anani', 'עֲנָנִי מוּכָנָה!', 'puppy', 'anani');
add('ready.bloki', 'בְּלוֹקִי מוּכָן!', 'puppy', 'bloki');
add('ready.gali', 'גַּלִּי מוּכָנָה!', 'puppy', 'gali');
add('ready.lulu', 'לוּלוּ מוּכָנָה!', 'puppy', 'lulu');

export function letterPhrase(kind, ch) {
  const l = LETTERS.find((x) => x.ch === ch);
  return `${kind}.${l.id}`;
}
