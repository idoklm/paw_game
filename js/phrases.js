// Every spoken line in the game. The id is also the audio file name:
// audio/custom/<id>.mp3 (your own recording) or audio/tts/<id>.mp3 (generated voice).
// text: with niqqud, shown in subtitles, and read by natural voices (with audio/pronunciation.txt).
// say: a spelling for a speech engine that misreads `text` (Microsoft voices and the device voice).
// tts: a spelling for the natural voices, where the niqqud gives the wrong vowel (see curriculum.js).
// voice: 'captain' or 'puppy'. speaker: whose voice settings to use (audio/voices.json).
// All instructions use plural forms (לַחֲצוּ, בּוֹאוּ), so they fit every child.

import { LETTERS } from './curriculum.js';

export const PHRASES = {};
const add = (id, text, voice = 'captain', speaker = voice, say = text, tts = text) => { PHRASES[id] = { id, text, voice, speaker, say, tts }; };

// ---------- general ----------
add('hello', 'שָׁלוֹם! אֲנִי קַפְּטֵן אוֹרִי.');
add('who', 'מִי מְשַׂחֵק עַכְשָׁו?');
add('choose', 'בַּחֲרוּ כְּלַבְלַב לַצֶּוֶת!');
add('chooseOk', 'רוֹצִים אוֹתוֹ? לַחֲצוּ עַל הַכַּפְתּוֹר הַיָּרֹק.');
add('welcomeTeam', 'בְּרוּכִים הַבָּאִים לַצֶּוֶת!');
add('map', 'לְאָן נוֹסְעִים? לַחֲצוּ עַל הַתַּחֲנָה שֶׁקּוֹפֶצֶת.');
add('locked', 'עוֹד לֹא. קֹדֶם הַתַּחֲנָה שֶׁקּוֹפֶצֶת.');
add('allDone', 'הִצַּלְתֶּם אֶת כֹּל הָאוֹתִיּוֹת בַּמִּפְרָץ! אַתֶּם צֶוֶת מַדְהִים!');
add('badges', 'אֵלֶּה הַתָּגִים שֶׁאֲסַפְתֶּם. לַחֲצוּ עַל תָּג כְּדֵי לִשְׁמֹעַ.');
add('badgesEmpty', 'עוֹד אֵין תָּגִים. כֹּל אוֹת שֶׁנַּצִּיל תִּהְיֶה תָּג!');
add('go', 'יוֹצְאִים לַמְּשִׂימָה!');
add('newLetters', 'הִנֵּה הָאוֹתִיּוֹת הַחֲדָשׁוֹת!');
add('nextGame', 'יֹפִי! עַכְשָׁו מִשְׂחָק אַחֵר!');
add('look', 'הִסְתַּכְּלוּ, הָאוֹת קוֹפֶצֶת!');
add('done', 'הַמְּשִׂימָה הֻשְׁלְמָה! כֹּל הַכָּבוֹד, צֶוֶת!');
add('backToMap', 'לַחֲצוּ עַל הַמַּפָּה, וְנִסַּע לַתַּחֲנָה הַבָּאָה.');
add('finalNote', 'אוֹת סוֹפִית בָּאָה רַק בְּסוֹף הַמִּלָּה.');
add('voiceTest', 'שָׁלוֹם! כָּךְ נִשְׁמָע הַקּוֹל שֶׁל הַמִּשְׂחָק.');

// ---------- mini-games ----------
add('memory.intro', 'הִפְכוּ קְלָפִים, וּמִצְאוּ שְׁתֵּי אוֹתִיּוֹת זֵהוֹת!');
add('memory.again', 'אוֹתִיּוֹת שׁוֹנוֹת. נַסּוּ עוֹד!');
add('sort.intro', 'גִּרְרוּ כֹּל אוֹת לַשֶּׁלֶט עִם אוֹתָהּ אוֹת!');
add('sort.try', 'לֹא לְשָׁם. נַסּוּ אֶת הַשֶּׁלֶט הַשֵּׁנִי!');

const PRAISE = ['כֹּל הַכָּבוֹד!', 'מְצֻיָּן!', 'יוֹפִי!', 'נָכוֹן מְאוֹד!', 'אַלּוּפִים!', 'אֵיזֶה יֹפִי!'];
PRAISE.forEach((t, i) => add(`praise.${i + 1}`, t));
export const PRAISE_IDS = PRAISE.map((_, i) => `praise.${i + 1}`);

// ---------- mission stories ----------
add('story.bridge', 'אוֹי! הָאוֹתִיּוֹת נָפְלוּ מִן הַגֶּשֶׁר לַמַּיִם. בּוֹאוּ נַצִּיל אוֹתָן!');
add('story.harbor', 'בַּנָּמָל, אַרְגְּזֵי הָאוֹתִיּוֹת הִתְפַּזְּרוּ. בּוֹאוּ נְסַדֵּר אוֹתָם!');
add('story.beach', 'הַגַּלִּים מָחֲקוּ אֶת הָאוֹתִיּוֹת בַּחוֹל. בּוֹאוּ נִמְצָא אוֹתָן!');
add('story.forest', 'הָאוֹתִיּוֹת נִתְקְעוּ עַל הָעֵצִים. בּוֹאוּ נוֹרִיד אוֹתָן!');
add('story.farm', 'בַּחַוָּה, הָאוֹתִיּוֹת הִתְחַבְּאוּ בֵּין הַבֵּיצִים. בּוֹאוּ נִמְצָא אוֹתָן!');
add('story.hill', 'הָרוּחַ הֵעִיפָה אֶת הָאוֹתִיּוֹת עִם הַבָּלוֹנִים. בּוֹאוּ נִתְפֹּס אוֹתָן!');
add('story.reef', 'הַדָּגִים שָׂחוּ עִם הָאוֹתִיּוֹת. בּוֹאוּ נַחְזִיר אוֹתָן!');
add('story.island', 'בָּאִי יֵשׁ אוֹתִיּוֹת מְיֻחָדוֹת: אוֹתִיּוֹת סוֹפִיּוֹת. בּוֹאוּ נַכִּיר אוֹתָן!');

// ---------- per letter ----------
for (const l of LETTERS) {
  const final = Boolean(l.base);
  const the = final ? '' : 'הָאוֹת ';
  // Each line is made twice: from the name for subtitles and natural voices, and from the
  // `say` spelling for engines that misread the name.
  const line = (id, make) => add(id, make(l.name), 'captain', 'captain', make(l.say || l.name), make(l.tts || l.name));
  line(`short.${l.id}`, (n) => `${n}!`);
  line(`name.${l.id}`, (n) => `הָאוֹת ${n}!`);
  line(`intro.${l.id}`, (n) => `זוֹ ${the}${n}. לַחֲצוּ עָלֶיהָ!`);
  line(`find.${l.id}`, (n) => `אֵיפֹה ${the}${n}?`);
  line(`here.${l.id}`, (n) => `${final ? '' : 'הָאוֹת '}${n} כָּאן. לַחֲצוּ עָלֶיהָ.`);
  line(`catch.${l.id}`, (n) => `לַחֲצוּ עַל כֹּל הָאוֹתִיּוֹת ${n}!`);
  line(`paint.${l.id}`, (n) => `צַבְּעוּ אֶת ${the}${n} בָּאֶצְבַּע!`);
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
