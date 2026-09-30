#!/usr/bin/env node
// Build step for the game. Run from the project folder:
//
//   node tools/build.mjs    update the audio list, the line list, and the offline file list
//
// Voice files are made by tools/tts.py (it runs this build step itself).
// Your own recordings go in audio/custom/<line id>.mp3 and always win over generated files.
// The list of line ids and texts is written to audio/lines.txt.

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { PHRASES } from '../js/phrases.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const AUDIO_EXT = ['.mp3', '.m4a', '.ogg', '.wav'];

async function listFiles(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listFiles(p)));
    else out.push(p);
  }
  return out;
}

const rel = (p) => relative(ROOT, p).split(sep).join('/');
const idOf = (file) => file.split('/').pop().replace(/\.[^.]+$/, '');

// ---------- main ----------
const audioFiles = async (sub) => (await listFiles(join(ROOT, 'audio', sub))).map(rel).filter((f) => AUDIO_EXT.some((x) => f.endsWith(x)));

const files = {};
for (const f of await audioFiles('tts')) files[idOf(f)] = f;
for (const f of await audioFiles('custom')) files[idOf(f)] = f; // your recordings win
const unknown = Object.keys(files).filter((id) => !PHRASES[id]);
// Generated voices are made slower and played faster with the pitch not preserved, which makes them
// sound like children. tools/tts.py stores that factor per file; your own recordings play at 1.
const ttsIndexPath = join(ROOT, 'audio', 'tts', 'index.json');
const ttsIndex = existsSync(ttsIndexPath) ? JSON.parse(await readFile(ttsIndexPath, 'utf8')) : {};
const playback = {};
for (const [id, url] of Object.entries(files)) {
  const factor = url.startsWith('audio/tts/') ? Number(ttsIndex[id]?.playback) || 1 : 1;
  if (factor !== 1) playback[id] = factor;
}
await writeFile(join(ROOT, 'audio', 'manifest.json'), JSON.stringify({ files, playback }, null, 1) + '\n');

// The text column is what the speech engine reads (the `say` spelling), not always what subtitles show.
const lines = Object.values(PHRASES).map((p) => `${p.id}\t${p.speaker}\t${p.say || p.text}${files[p.id] ? `\t[${files[p.id]}]` : ''}`);
await writeFile(join(ROOT, 'audio', 'lines.txt'), '# line id <TAB> speaker <TAB> text for the speech engine <TAB> [file, if one exists]\n' + lines.join('\n') + '\n');

// Offline file list for the service worker. The version changes when any file changes.
const include = ['index.html', 'manifest.webmanifest', 'css', 'js', 'icons', 'fonts', 'audio/manifest.json', ...Object.values(files)];
const precache = [];
for (const item of include) {
  const p = join(ROOT, item);
  if (!existsSync(p)) continue;
  if ((await stat(p)).isDirectory()) precache.push(...(await listFiles(p)).map(rel));
  else precache.push(rel(p));
}
const hash = createHash('sha1');
for (const f of precache.sort()) hash.update(f).update(await readFile(join(ROOT, f)));
const version = hash.digest('hex').slice(0, 10);
await writeFile(join(ROOT, 'precache.json'), JSON.stringify({ version, files: ['./', ...precache] }, null, 1) + '\n');
const swPath = join(ROOT, 'sw.js');
const sw = await readFile(swPath, 'utf8');
await writeFile(swPath, sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`));

console.log(`audio lines: ${Object.keys(PHRASES).length}, with a file: ${Object.keys(files).length}`);
if (unknown.length) console.log(`warning: these files match no line id: ${unknown.join(', ')}`);
console.log(`offline files: ${precache.length}, version ${version}`);
