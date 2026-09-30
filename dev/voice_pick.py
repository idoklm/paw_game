"""Dev tool: sample lines in natural voices (no pitch or speed tricks), for a person to choose.

Writes dev/voice-pick/<variant>/<line>.mp3 and dev/voice-pick/index.json. Listen at dev/voice-pick.html.
OpenAI variants get acting instructions plus the rules in audio/pronunciation.txt.
Needs OPENAI_API_KEY and edge-tts. Run: python dev/voice_pick.py
"""
import asyncio
import json
import os
import subprocess
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'dev' / 'voice-pick'
KEY = os.environ['OPENAI_API_KEY']
RULES = (ROOT / 'audio' / 'pronunciation.txt').read_text(encoding='utf-8')

CAPTAIN = ('You are the voice of Captain Ori, a cheerful 9-year-old boy, the hero of a Hebrew preschool cartoon series. '
           'Perform like a professional voice actor: warm, bright, youthful and playful, natural and human, never robotic. '
           'Speak native Israeli Hebrew, clearly and a little slowly, for children aged 3 to 6. Read exactly the given text.\n\n' + RULES)
PUPPY = ('You are a cute puppy character in a Hebrew preschool cartoon series. Perform like a professional voice actor: '
         'very young, excited, bouncy and happy, natural and human. Native Israeli Hebrew. Read exactly the given text.\n\n' + RULES)

CAPTAIN_LINES = ['hello', 'story.bridge', 'name.bet', 'name.lamed', 'find.tsadi', 'intro.alef', 'praise.1']
PUPPY_LINES = ['pup.pilpel', 'ready.anani']

VARIANTS = {
    'c-marin': ('captain', 'openai', 'marin'), 'c-cedar': ('captain', 'openai', 'cedar'),
    'c-coral': ('captain', 'openai', 'coral'), 'c-sage': ('captain', 'openai', 'sage'),
    'c-shimmer': ('captain', 'openai', 'shimmer'), 'c-ballad': ('captain', 'openai', 'ballad'),
    'c-hila': ('captain', 'edge', 'he-IL-HilaNeural'), 'c-avri': ('captain', 'edge', 'he-IL-AvriNeural'),
    'p-marin': ('puppy', 'openai', 'marin'), 'p-coral': ('puppy', 'openai', 'coral'),
    'p-shimmer': ('puppy', 'openai', 'shimmer'), 'p-sage': ('puppy', 'openai', 'sage'),
    'p-hila': ('puppy', 'edge', 'he-IL-HilaNeural'),
}
LABELS = {'openai': 'OpenAI', 'edge': 'Microsoft'}


def phrases():
    out = subprocess.run(['node', '-e', "import('./js/phrases.js').then(m => console.log(JSON.stringify(m.PHRASES)))"],
                         cwd=ROOT, capture_output=True, text=True, encoding='utf-8', check=True).stdout
    return json.loads(out)


def openai_tts(text, voice, instructions, path):
    body = json.dumps({'model': 'gpt-4o-mini-tts', 'voice': voice, 'input': text, 'instructions': instructions,
                       'response_format': 'mp3'}).encode()
    req = urllib.request.Request('https://api.openai.com/v1/audio/speech', data=body, method='POST',
                                 headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'})
    path.write_bytes(urllib.request.urlopen(req, timeout=180).read())


async def main():
    ph = phrases()
    loop = asyncio.get_running_loop()
    pool = ThreadPoolExecutor(6)
    sem = asyncio.Semaphore(6)
    index = {'variants': [], 'lines': {}}
    chars = 0

    async def one(kind, provider, voice, line_id, path):
        nonlocal chars
        async with sem:
            p = ph[line_id]
            if provider == 'edge':
                await edge_tts.Communicate(p['say'], voice, rate='-5%' if kind == 'captain' else '+5%').save(str(path))
            else:
                chars += len(p['text'])
                await loop.run_in_executor(pool, openai_tts, p['text'], voice, CAPTAIN if kind == 'captain' else PUPPY, path)

    jobs = []
    for name, (kind, provider, voice) in VARIANTS.items():
        lines = CAPTAIN_LINES if kind == 'captain' else PUPPY_LINES
        (OUT / name).mkdir(parents=True, exist_ok=True)
        index['variants'].append({'name': name, 'kind': kind, 'label': f'{LABELS[provider]} {voice.replace("he-IL-", "").replace("Neural", "")}'})
        for l in lines:
            index['lines'][l] = ph[l]['text']
            path = OUT / name / f'{l}.mp3'
            if not path.exists():
                jobs.append(one(kind, provider, voice, l, path))
    await asyncio.gather(*jobs)
    index['captain_lines'], index['puppy_lines'] = CAPTAIN_LINES, PUPPY_LINES
    (OUT / 'index.json').write_text(json.dumps(index, ensure_ascii=False, indent=1), encoding='utf-8')
    # rough cost: gpt-4o-mini-tts is about $0.015 per minute of audio; ~14 Hebrew characters per second
    minutes = chars / 14 / 60
    print(f'made {len(jobs)} files; OpenAI text {chars} chars, about {minutes:.1f} min of audio, about ${minutes * 0.015 + chars * 0.6e-6:.3f}')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(main())
