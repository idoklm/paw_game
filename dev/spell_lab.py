"""Dev tool: find a spelling that the speech engine pronounces right, for letter names it misreads.

For each candidate spelling: make the file with the captain voice, then ask the audio model 3 times
what it hears (romanized). Prints how many answers match the expected sounds.
Needs OPENAI_API_KEY and edge-tts. Run: python dev/spell_lab.py
"""
import asyncio
import json
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'tools'))
sys.path.insert(0, str(Path(__file__).resolve().parent))
from tts import edge_speech  # noqa: E402
from check_letters import ask  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'dev' / 'voice-lab' / 'spell'

# expected: a regex over the romanized answer (lowercase, letters only)
CANDIDATES = {
    'pe': (r'(^|ot|a)p(e|eh|ei|ey|ay)', ['פֵּא, פֵּא!', 'הָאוֹת פֵּא!', 'פֶּה', 'פֵּא.']),
    'tav': (r'(^|ot|a)t(a|ah)(v|w|f)', ['תָּו, תָּו!', 'הָאוֹת תָּו!', 'תָּו.', 'תַּו!']),
}
# Variant settings: the captain voice, and the same voice slower (clearer consonants).
SLOW = True


def norm(s):
    s = s.lower()
    m = re.search(r'"([^"]+)"\s*}?\s*$', s)  # the model sometimes wraps the answer in JSON
    if m:
        s = m.group(1)
    return re.sub(r'[^a-z]', '', s)


async def main():
    voices = json.loads((ROOT / 'audio' / 'voices.json').read_text(encoding='utf-8'))
    cfg = voices['captain']
    OUT.mkdir(parents=True, exist_ok=True)
    items = []
    slow = dict(cfg, pace=0.75)
    for letter, (_, spellings) in CANDIDATES.items():
        for i, sp in enumerate(spellings):
            for tag, c in (('n', cfg), ('s', slow)):
                path = OUT / f'r2-{letter}-{i}-{tag}.mp3'
                if not path.exists():
                    await edge_speech(sp, c, path)
                items.append((letter, i, f'{sp} [{tag}]', path))

    def check(item):
        letter, i, sp, path = item
        answers = [ask(path) for _ in range(3)]
        ok = sum(1 for a in answers if re.match(CANDIDATES[letter][0], norm(a)))
        return letter, sp, ok, [norm(a) for a in answers]

    with ThreadPoolExecutor(4) as pool:
        results = list(pool.map(check, items))
    for letter, sp, ok, answers in results:
        print(f'{letter:6} {sp:10} {ok}/3  {answers}')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(main())
