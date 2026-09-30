"""Dev tool: check how the voice files pronounce each letter name.

An audio model writes the sounds it hears in Latin letters (twice per file). Compare with the expected name.
Needs OPENAI_API_KEY. Run: python dev/check_letters.py [line prefix, default name.]
"""
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KEY = os.environ['OPENAI_API_KEY']
Q = ('This clip is one short Hebrew word or phrase (a Hebrew letter name). Write exactly the SOUNDS you hear, '
     'romanized in simple Latin letters (for example: "dalet", "delet", "kuf", "kof"). '
     'Do not correct or guess the intended word. Answer with the romanized sounds only.')

EXPECTED = {'alef': 'alef', 'bet': 'bet', 'gimel': 'gimel', 'dalet': 'dalet', 'he': 'he', 'vav': 'vav', 'zayin': 'zayin',
            'het': 'khet', 'tet': 'tet', 'yud': 'yud', 'kaf': 'kaf', 'lamed': 'lamed', 'mem': 'mem', 'nun': 'nun',
            'samekh': 'samekh', 'ayin': 'ayin', 'pe': 'pe', 'tsadi': 'tsadi', 'kuf': 'kuf', 'resh': 'resh', 'shin': 'shin',
            'tav': 'tav', 'kaf-final': 'kaf sofit', 'mem-final': 'mem sofit', 'nun-final': 'nun sofit',
            'pe-final': 'pe sofit', 'tsadi-final': 'tsadi sofit'}


def ask(path, tries=5):
    body = json.dumps({'model': 'gpt-audio-1.5', 'modalities': ['text'], 'messages': [{'role': 'user', 'content': [
        {'type': 'text', 'text': Q},
        {'type': 'input_audio', 'input_audio': {'data': base64.b64encode(path.read_bytes()).decode(), 'format': 'mp3'}}]}]}).encode()
    for i in range(tries):
        try:
            req = urllib.request.Request('https://api.openai.com/v1/chat/completions', data=body, method='POST',
                                         headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'})
            return json.load(urllib.request.urlopen(req, timeout=120))['choices'][0]['message']['content'].strip()
        except urllib.error.HTTPError as e:
            if e.code < 500 and e.code != 429:
                raise
            time.sleep(2 ** i)
    return '(service error)'


def main():
    prefix = sys.argv[1] if len(sys.argv) > 1 else 'name.'
    ids = [i for i in EXPECTED if (ROOT / 'audio' / 'tts' / f'{prefix}{i}.mp3').exists()]

    def run(i):
        path = ROOT / 'audio' / 'tts' / f'{prefix}{i}.mp3'
        return i, [ask(path) for _ in range(2)]

    with ThreadPoolExecutor(4) as pool:
        res = dict(pool.map(run, ids))
    (ROOT / 'dev' / 'voice-lab').mkdir(parents=True, exist_ok=True)
    (ROOT / 'dev' / 'voice-lab' / f'letters-{prefix.strip(".")}.json').write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding='utf-8')
    for i in ids:
        print(f'{i:12} expected {EXPECTED[i]:12} heard {res[i]}')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
