"""Make the narration files: audio/tts/<line id>.mp3 for every line in audio/lines.json.

  python tools/tts.py            create missing or changed files (voice settings: audio/voices.json)
  python tools/tts.py --check    also transcribe long lines and make them again if the words do not match
  python tools/tts.py --force    create all files again
  python tools/tts.py --only find.   only lines whose id starts with "find."

Providers: openai (natural voices; needs OPENAI_API_KEY) and edge (Microsoft voices, free: pip install edge-tts).
OpenAI lines get acting instructions (voices.json "roles" and "style") plus audio/pronunciation.txt.
A recording in audio/custom/<id>.mp3 always wins, so that line is skipped.
Every file is checked for a suspicious length (a voice sometimes adds words or stops early) and made again.
The tool runs tools/build.mjs before and after, so the line list, the audio manifest, and the offline list stay current.
Costs are estimated in dev/openai-cost.json.
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
import time
import urllib.error
import urllib.request
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / 'audio'
TTS = AUDIO / 'tts'
KEY = os.environ.get('OPENAI_API_KEY', '')
LEDGER = ROOT / 'dev' / 'openai-cost.json'


def run_build():
    subprocess.run(['node', str(ROOT / 'tools' / 'build.mjs')], check=True, cwd=ROOT)


def letters(text):
    """Hebrew letters only: no niqqud, no punctuation, no spaces."""
    return re.sub(r'[^א-ת]', '', text)


def similarity(a, b):
    a, b = letters(a), letters(b)
    if not a or not b:
        return 0.0
    return round(difflib.SequenceMatcher(None, a, b).ratio(), 2)


def log_cost(what, usd):
    ledger = json.loads(LEDGER.read_text(encoding='utf-8')) if LEDGER.exists() else {'entries': []}
    ledger['entries'].append({'what': what, 'usd_estimate': round(usd, 4)})
    ledger['total_logged_usd_estimate'] = round(sum(e.get('usd_estimate', 0) for e in ledger['entries']), 4)
    LEDGER.write_text(json.dumps(ledger, indent=1), encoding='utf-8')


def post(url, body, ctype='application/json', tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=body, method='POST', headers={'Authorization': f'Bearer {KEY}', 'Content-Type': ctype})
            return urllib.request.urlopen(req, timeout=180).read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and i < tries - 1:
                time.sleep(3 * (i + 1))
                continue
            raise RuntimeError(f'HTTP {e.code}: {e.read()[:300]}')


# ---------- providers ----------
def edge_rate(cfg):
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
    path.write_bytes(post('https://api.openai.com/v1/audio/speech', body))


def transcribe(path):
    boundary = uuid.uuid4().hex
    parts = [f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
             for k, v in (('model', 'gpt-4o-transcribe'), ('language', 'he'))]
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="a.mp3"\r\n'
                 f'Content-Type: audio/mpeg\r\n\r\n'.encode() + path.read_bytes() + b'\r\n')
    parts.append(f'--{boundary}--\r\n'.encode())
    return json.loads(post('https://api.openai.com/v1/audio/transcriptions', b''.join(parts), f'multipart/form-data; boundary={boundary}')).get('text', '')


def length_ok(path, text, provider):
    """OpenAI mp3 is about 2.3 KB per Hebrew letter plus about 9 KB of edges. Far outside that = added or lost words."""
    if provider != 'openai':
        return path.stat().st_size >= 300 * max(1, len(letters(text)))
    expected = 9000 + 2300 * len(letters(text))
    size = path.stat().st_size
    return 0.35 * expected <= size <= 3 * expected


# ---------- main ----------
async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--only', default='')
    ap.add_argument('--jobs', type=int, default=6)
    args = ap.parse_args()

    run_build()
    voices = json.loads((AUDIO / 'voices.json').read_text(encoding='utf-8'))
    rules = (AUDIO / 'pronunciation.txt').read_text(encoding='utf-8')
    lines = json.loads((AUDIO / 'lines.json').read_text(encoding='utf-8'))
    TTS.mkdir(parents=True, exist_ok=True)
    index_path = TTS / 'index.json'
    index = json.loads(index_path.read_text(encoding='utf-8')) if index_path.exists() else {}
    custom = {p.stem for p in (AUDIO / 'custom').glob('*') if p.suffix in ('.mp3', '.m4a', '.ogg', '.wav')}

    def settings(line):
        cfg = voices.get(line['speaker']) or voices['puppy']
        text = line.get('tts', line['text']) if cfg['provider'] == 'openai' else line['say']
        instructions = ''
        if cfg['provider'] == 'openai':
            instructions = voices['roles'][cfg.get('role', 'captain')]
            if cfg.get('style'):
                instructions += ' ' + cfg['style']
            instructions += '\n\n' + rules
        h = hashlib.sha1(json.dumps([text, cfg, instructions], ensure_ascii=False).encode()).hexdigest()[:12]
        return cfg, text, instructions, h

    todo = []
    for line in lines:
        if not line['id'].startswith(args.only) or line['id'] in custom:
            continue
        cfg, text, instructions, h = settings(line)
        done = (TTS / f"{line['id']}.mp3").exists() and index.get(line['id'], {}).get('hash') == h
        if args.force or not done:
            todo.append((line, cfg, text, instructions, h))

    pool = ThreadPoolExecutor(args.jobs)
    loop = asyncio.get_running_loop()
    sem = asyncio.Semaphore(args.jobs)
    stats = {'chars': 0, 'instr_chars': 0, 'retries': 0, 'transcribed_letters': 0}

    async def render(line, cfg, text, instructions):
        path = TTS / f"{line['id']}.mp3"
        for attempt in range(3):
            async with sem:
                if cfg['provider'] == 'edge':
                    await edge_speech(text, cfg, path)
                else:
                    stats['chars'] += len(text)
                    stats['instr_chars'] += len(instructions)
                    await loop.run_in_executor(pool, openai_speech, text, cfg, instructions, path)
            if length_ok(path, text, cfg['provider']):
                return
            stats['retries'] += 1
            print(f"  {line['id']}: length looks wrong ({path.stat().st_size} bytes), making it again")

    print(f'creating {len(todo)} files...')
    for i in range(0, len(todo), 24):
        batch = todo[i:i + 24]
        await asyncio.gather(*(render(l, c, t, ins) for l, c, t, ins, _ in batch))
        for line, cfg, text, instructions, h in batch:
            index[line['id']] = {'hash': h, 'provider': cfg['provider'], 'voice': cfg['voice'], 'speaker': line['speaker'],
                                 'playback': cfg.get('playback', 1), 'text': text}
        index_path.write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding='utf-8')
        print(f'  {min(i + 24, len(todo))}/{len(todo)}')

    if args.check and KEY:
        # Only lines with 3 words or more: the transcriber writes single words in other scripts.
        ids = [l['id'] for l in lines if l['id'].startswith(args.only) and l['id'] in index and len(index[l['id']]['text'].split()) >= 3
               and (args.force or 'match' not in index[l['id']] or l['id'] in {t[0]['id'] for t in todo})]
        print(f'checking {len(ids)} files...')
        by_id = {l['id']: l for l in lines}

        def check(line_id):
            heard = transcribe(TTS / f'{line_id}.mp3')
            stats['transcribed_letters'] += len(letters(heard))
            return line_id, heard, similarity(index[line_id]['text'], heard)

        for attempt in range(3):
            results = list(pool.map(check, ids))
            redo = []
            for line_id, heard, m in results:
                index[line_id]['heard'], index[line_id]['match'] = heard, m
                if m < 0.6:
                    redo.append(line_id)
            if not redo or attempt == 2:
                break
            print(f'  making {len(redo)} lines again (the words did not match): {", ".join(redo[:8])}')
            await asyncio.gather(*(render(by_id[i], *settings(by_id[i])[:3]) for i in redo))
            ids = redo
        low = sorted((v['match'], k) for k, v in index.items() if 'match' in v and v['match'] < 0.7)
        print(f'{len(low)} lines to listen to:')
        for m, k in low:
            print(f'  {m:.2f}  {k}  heard: {index[k]["heard"]}')

    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding='utf-8')
    # gpt-4o-mini-tts: text input $0.60/1M tokens (about 3 characters per token) + audio output about $0.015 per minute
    # (about 14 Hebrew characters per second). gpt-4o-transcribe: about $0.006 per minute.
    minutes = stats['chars'] / 14 / 60
    usd = minutes * 0.015 + (stats['chars'] + stats['instr_chars']) / 3 * 0.6e-6 + stats['transcribed_letters'] / 10 / 60 * 0.006
    if stats['chars'] or stats['transcribed_letters']:
        log_cost(f"tts {len(todo)} files, {stats['retries']} retries", usd)
    print(f"estimated cost of this run: ${usd:.3f}")
    run_build()


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(main())
