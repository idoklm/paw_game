"""Dev tool: find child-like voices without a human listener. Two steps:

  python dev/voice_lab.py render   make slow base files + dev/voice-lab/plan.json
  (browser step: dev/pitch.html speeds each file up by its factor, with pitch not preserved,
   measures the pitch, and saves dev/voice-lab/processed/<candidate>__<line>.wav)
  python dev/voice_lab.py judge    ask an audio model about each processed file, and transcribe it

Why a speed factor: a child's voice is higher in pitch AND in timbre (formants). Playing a slowed
voice faster without pitch correction raises both, and brings the speed back to normal.
Needs OPENAI_API_KEY and edge-tts.
"""
import asyncio
import base64
import json
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import edge_tts

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'tools'))
from tts import similarity  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'dev' / 'voice-lab'
KEY = os.environ['OPENAI_API_KEY']

BOY = ('Voice: a real 9-year-old Israeli boy. A child\'s voice, not an adult: bright and full of energy, '
       'like the dubbed voice of a kid hero in an animated TV show for young children. '
       'Speak Hebrew with a native Israeli accent. Speak slowly and clearly. '
       'Read exactly the given text, do not add or skip words. The niqqud shows the correct pronunciation.')
PUP = ('Voice: a real 6-year-old Israeli child playing a cute cartoon puppy. A small child\'s voice, not an adult: '
       'bouncy, excited and happy, like a dubbed animated TV show for young children. '
       'Speak Hebrew with a native Israeli accent. Speak slowly. Read exactly the given text, do not add or skip words. '
       'The niqqud shows the correct pronunciation.')

TEST = {'captain': ['hello', 'story.bridge', 'find.mem', 'intro.alef', 'done'], 'puppy': []}

def hila(pitch, playback, pace):
    """Hila, slowed so that after `playback` speed-up the final pace is `pace` (1 = normal)."""
    return {'provider': 'edge', 'voice': 'he-IL-HilaNeural', 'pitch': f'{pitch:+d}Hz', 'rate': f'{round((pace / playback - 1) * 100):+d}%'}

# name: (role, settings, playback factor, lines)
CANDIDATES = {
    'r3-pilpel': ('puppy', hila(20, 1.28, 1.0), 1.28, ['pup.pilpel', 'ready.pilpel', 'hello']),
    'r3-anani': ('puppy', hila(30, 1.30, 0.97), 1.30, ['pup.anani', 'ready.anani', 'hello']),
    'r3-bloki': ('puppy', hila(5, 1.27, 0.95), 1.27, ['pup.bloki', 'ready.bloki', 'hello']),
    'r3-lulu': ('puppy', hila(40, 1.30, 0.98), 1.30, ['pup.lulu', 'ready.lulu', 'hello']),
}

# Asked about the voice only. With the text in the prompt, the model guessed from the words
# ("I am Captain Ori" -> a man) instead of listening.
JUDGE = ('Listen only to the VOICE in this audio clip (ignore the meaning of the words). '
         'Answer with JSON only: {"age": estimated speaker age in years, "gender": "male" or "female", '
         '"child": true if the speaker sounds younger than 13, "pitch": "low" or "medium" or "high", '
         '"natural": 1-10 (10 = a real person, 1 = robotic, distorted or chipmunk-like), "energy": 1-10}')


def post(url, body, ctype='application/json'):
    req = urllib.request.Request(url, data=body, method='POST', headers={'Authorization': f'Bearer {KEY}', 'Content-Type': ctype})
    return urllib.request.urlopen(req, timeout=180).read()


def openai_speech(text, cfg, path):
    body = json.dumps({'model': 'gpt-4o-mini-tts', 'voice': cfg['voice'], 'input': text,
                       'instructions': cfg['instructions'], 'response_format': 'mp3'}).encode()
    path.write_bytes(post('https://api.openai.com/v1/audio/speech', body))


def judge(path, model='gpt-audio-1.5'):
    body = json.dumps({'model': model, 'modalities': ['text'], 'messages': [{'role': 'user', 'content': [
        {'type': 'text', 'text': JUDGE},
        {'type': 'input_audio', 'input_audio': {'data': base64.b64encode(path.read_bytes()).decode(), 'format': 'wav'}}]}]}).encode()
    out = json.loads(post('https://api.openai.com/v1/chat/completions', body))['choices'][0]['message']['content']
    out = out.strip().removeprefix('```json').removeprefix('```').removesuffix('```').strip()
    return json.loads(out)


def transcribe_wav(path):
    import uuid
    b = uuid.uuid4().hex
    parts = [f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode() for k, v in (('model', 'gpt-4o-transcribe'), ('language', 'he'))]
    parts.append(f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="a.wav"\r\nContent-Type: audio/wav\r\n\r\n'.encode() + path.read_bytes() + b'\r\n')
    parts.append(f'--{b}--\r\n'.encode())
    return json.loads(post('https://api.openai.com/v1/audio/transcriptions', b''.join(parts), f'multipart/form-data; boundary={b}')).get('text', '')


def read_lines():
    texts = {}
    for row in (ROOT / 'audio' / 'lines.txt').read_text(encoding='utf-8').splitlines():
        if row and not row.startswith('#'):
            p = row.split('\t')
            texts[p[0]] = p[2]
    return texts


async def render():
    texts = read_lines()
    loop = asyncio.get_running_loop()
    pool = ThreadPoolExecutor(6)
    sem = asyncio.Semaphore(6)
    plan = []

    async def one(cfg, text, path):
        async with sem:
            if cfg['provider'] == 'edge':
                await edge_tts.Communicate(text, cfg['voice'], rate=cfg['rate'], pitch=cfg['pitch']).save(str(path))
            else:
                await loop.run_in_executor(pool, openai_speech, text, cfg, path)

    jobs = []
    for name, (role, cfg, factor, lines) in CANDIDATES.items():
        (OUT / 'base' / name).mkdir(parents=True, exist_ok=True)
        for line_id in lines or TEST[role]:
            path = OUT / 'base' / name / f'{line_id}.mp3'
            plan.append({'candidate': name, 'role': role, 'line': line_id, 'factor': factor, 'src': f'voice-lab/base/{name}/{line_id}.mp3'})
            if not path.exists():
                jobs.append(one(cfg, texts[line_id], path))
    await asyncio.gather(*jobs)
    (OUT / 'plan.json').write_text(json.dumps(plan, indent=1), encoding='utf-8')
    print(f'rendered {len(jobs)} base files, plan has {len(plan)} items')


def judge_all():
    texts = read_lines()
    plan = json.loads((OUT / 'plan.json').read_text(encoding='utf-8'))
    pitch = json.loads((OUT / 'processed' / 'pitch.json').read_text(encoding='utf-8'))
    results = []

    def one(item):
        wav = OUT / 'processed' / f"{item['candidate']}__{item['line']}.wav"
        r = dict(item, pitch=pitch.get(wav.name))
        try:
            r['heard'] = transcribe_wav(wav)
            r['match'] = similarity(texts[item['line']], r['heard'])
        except Exception as e:
            r['heard_error'] = str(e)[:200]
        # The audio model is not consistent, so ask three times and keep every answer.
        r['judges'] = []
        for _ in range(3):
            try:
                r['judges'].append(judge(wav))
            except Exception as e:
                r['judge_error'] = str(e)[:200]
        return r

    with ThreadPoolExecutor(6) as pool:
        results = list(pool.map(one, plan))
    (OUT / 'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding='utf-8')
    # summary per candidate
    for name, (role, _, factor, _lines) in CANDIDATES.items():
        rs = [r for r in results if r['candidate'] == name]
        js = [j for r in rs for j in r.get('judges', [])]
        f0 = [r['pitch']['median'] for r in rs if r.get('pitch')]
        avg = lambda xs: round(sum(xs) / len(xs), 1) if xs else None
        print(f"{name:16} {role:8} x{factor:<4} F0 {avg(f0)!s:>6} Hz | age {avg([j['age'] for j in js])!s:>5} "
              f"child {sum(1 for j in js if j.get('child'))}/{len(js)} | natural {avg([j['natural'] for j in js])} "
              f"energy {avg([j['energy'] for j in js])} | match {avg([r['match'] for r in rs if 'match' in r])}")


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    if sys.argv[1:] == ['render']:
        asyncio.run(render())
    elif sys.argv[1:] == ['judge']:
        judge_all()
    else:
        print(__doc__)
