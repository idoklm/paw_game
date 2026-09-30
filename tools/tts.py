"""Make the narration files: audio/tts/<line id>.mp3 for every line in audio/lines.txt.

  python tools/tts.py            create missing or changed files (voice settings: audio/voices.json)
  python tools/tts.py --check    also transcribe each file and compare it with the text (needs OPENAI_API_KEY)
  python tools/tts.py --force    create all files again
  python tools/tts.py --only find.   only lines whose id starts with "find."

Providers: edge (Microsoft voices through the Edge read-aloud service, free: pip install edge-tts)
and openai (needs OPENAI_API_KEY). A recording in audio/custom/<id>.mp3 always wins, so that line is skipped.
The tool runs tools/build.mjs before and after, so lines.txt, the audio manifest, and the offline list stay current.
"""
import argparse
import asyncio
import difflib
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.request
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / 'audio'
TTS = AUDIO / 'tts'
KEY = os.environ.get('OPENAI_API_KEY', '')

# Minimum mp3 bytes per Hebrew letter. Below this the service probably cut the audio short.
MIN_BYTES_PER_LETTER = {'edge': 300, 'openai': 800}


def run_build():
    subprocess.run(['node', str(ROOT / 'tools' / 'build.mjs')], check=True, cwd=ROOT)


def read_lines():
    rows = []
    for row in (AUDIO / 'lines.txt').read_text(encoding='utf-8').splitlines():
        if row and not row.startswith('#'):
            parts = row.split('\t')
            rows.append({'id': parts[0], 'speaker': parts[1], 'text': parts[2]})
    return rows


def letters(text):
    """Hebrew letters only: no niqqud, no punctuation, no spaces."""
    return re.sub(r'[^א-ת]', '', text)


def similarity(a, b):
    a, b = letters(a), letters(b)
    if not a or not b:
        return 0.0
    return round(difflib.SequenceMatcher(None, a, b).ratio(), 2)


def settings_hash(line, cfg, instructions):
    raw = json.dumps([line['text'], cfg, instructions if cfg['provider'] == 'openai' else ''], ensure_ascii=False)
    return hashlib.sha1(raw.encode()).hexdigest()[:12]


# ---------- providers ----------
def edge_rate(cfg):
    """Speech rate for edge-tts, so that after the playback speed-up the final speed is cfg['pace']."""
    if 'rate' in cfg:
        return cfg['rate']
    return f"{round((cfg.get('pace', 1) / cfg.get('playback', 1) - 1) * 100):+d}%"


async def edge_speech(text, cfg, path):
    import edge_tts  # imported here so openai-only runs do not need the package
    await edge_tts.Communicate(text, cfg['voice'], rate=edge_rate(cfg), pitch=cfg.get('pitch', '+0Hz')).save(str(path))


def openai_speech(text, cfg, instructions, path):
    if not KEY:
        raise RuntimeError('OPENAI_API_KEY is not set')
    body = json.dumps({'model': cfg.get('model', 'gpt-4o-mini-tts'), 'voice': cfg['voice'], 'input': text,
                       'instructions': instructions, 'response_format': 'mp3'}).encode()
    req = urllib.request.Request('https://api.openai.com/v1/audio/speech', data=body, method='POST',
                                 headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'})
    path.write_bytes(urllib.request.urlopen(req, timeout=180).read())


def transcribe(path):
    boundary = uuid.uuid4().hex
    parts = [f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
             for k, v in (('model', 'gpt-4o-transcribe'), ('language', 'he'))]
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="a.mp3"\r\n'
                 f'Content-Type: audio/mpeg\r\n\r\n'.encode() + path.read_bytes() + b'\r\n')
    parts.append(f'--{boundary}--\r\n'.encode())
    req = urllib.request.Request('https://api.openai.com/v1/audio/transcriptions', data=b''.join(parts), method='POST',
                                 headers={'Authorization': f'Bearer {KEY}', 'Content-Type': f'multipart/form-data; boundary={boundary}'})
    return json.load(urllib.request.urlopen(req, timeout=180)).get('text', '')


# ---------- main ----------
async def make(line, cfg, instructions, pool, sem):
    path = TTS / f"{line['id']}.mp3"
    minimum = MIN_BYTES_PER_LETTER[cfg['provider']] * max(1, len(letters(line['text'])))
    for attempt in range(3):
        async with sem:
            if cfg['provider'] == 'edge':
                await edge_speech(line['text'], cfg, path)
            else:
                await asyncio.get_running_loop().run_in_executor(pool, openai_speech, line['text'], cfg, instructions, path)
        if path.stat().st_size >= minimum:
            return attempt
        print(f"  {line['id']}: audio looks cut short ({path.stat().st_size} bytes), trying again")
    return attempt


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--only', default='')
    ap.add_argument('--jobs', type=int, default=4)
    args = ap.parse_args()

    run_build()
    voices = json.loads((AUDIO / 'voices.json').read_text(encoding='utf-8'))
    TTS.mkdir(parents=True, exist_ok=True)
    index_path = TTS / 'index.json'
    index = json.loads(index_path.read_text(encoding='utf-8')) if index_path.exists() else {}
    custom = {p.stem for p in (AUDIO / 'custom').glob('*') if p.suffix in ('.mp3', '.m4a', '.ogg', '.wav')}

    todo = []
    for line in read_lines():
        if not line['id'].startswith(args.only) or line['id'] in custom:
            continue
        cfg = voices.get(line['speaker']) or voices['puppy']
        role = 'captain' if line['speaker'] == 'captain' else 'puppy'
        instructions = voices.get('openai_instructions', {}).get(role, '')
        h = settings_hash(line, cfg, instructions)
        done = (TTS / f"{line['id']}.mp3").exists() and index.get(line['id'], {}).get('hash') == h
        if args.force or not done:
            todo.append((line, cfg, instructions, h))

    print(f'creating {len(todo)} files...')
    sem = asyncio.Semaphore(args.jobs)
    with ThreadPoolExecutor(args.jobs) as pool:
        async def one(item):
            line, cfg, instructions, h = item
            await make(line, cfg, instructions, pool, sem)
            index[line['id']] = {'hash': h, 'provider': cfg['provider'], 'voice': cfg['voice'], 'speaker': line['speaker'],
                                 'playback': cfg.get('playback', 1), 'text': line['text']}
        for i in range(0, len(todo), 20):
            await asyncio.gather(*(one(x) for x in todo[i:i + 20]))
            print(f'  {min(i + 20, len(todo))}/{len(todo)}')
            index_path.write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding='utf-8')

    if args.check:
        if not KEY:
            print('--check needs OPENAI_API_KEY; skipped')
        else:
            ids = [l['id'] for l in read_lines() if l['id'].startswith(args.only) and l['id'] in index]
            print(f'checking {len(ids)} files...')

            def check(line_id):
                heard = transcribe(TTS / f'{line_id}.mp3')
                index[line_id]['heard'] = heard
                index[line_id]['match'] = similarity(index[line_id]['text'], heard)

            with ThreadPoolExecutor(args.jobs) as pool:
                list(pool.map(check, ids))
            index_path.write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding='utf-8')
            low = sorted((v['match'], k) for k, v in index.items() if 'match' in v and v['match'] < 0.7)
            print(f'{len(low)} lines to listen to (the transcript differs from the text):')
            for m, k in low:
                print(f'  {m:.2f}  {k}  heard: {index[k]["heard"]}')

    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding='utf-8')
    run_build()


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(main())
