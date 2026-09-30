"""Make the game art with the OpenAI image API.

  python tools/images.py                 create missing images listed in art/prompts.json
  python tools/images.py --only pup-     only images whose name starts with "pup-"
  python tools/images.py --force NAME    create one image again

Each entry in art/prompts.json: name, prompt, size, transparent (true/false), and optional "refs"
(names of earlier images to use as style and character references, for consistency).
Output: assets/img/<name>.png (or .webp), and assets/img/index.json with the settings of each file.
Needs OPENAI_API_KEY.
"""
import argparse
import base64
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'img'
KEY = os.environ.get('OPENAI_API_KEY', '')


def post_json(url, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method='POST',
                                 headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(req, timeout=600))


def post_multipart(url, fields, files):
    b = uuid.uuid4().hex
    parts = []
    for k, v in fields.items():
        parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    for k, (name, data) in files:
        parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{k}"; filename="{name}"\r\nContent-Type: image/png\r\n\r\n'.encode() + data + b'\r\n')
    parts.append(f'--{b}--\r\n'.encode())
    req = urllib.request.Request(url, data=b''.join(parts), method='POST',
                                 headers={'Authorization': f'Bearer {KEY}', 'Content-Type': f'multipart/form-data; boundary={b}'})
    return json.load(urllib.request.urlopen(req, timeout=600))


# Cost ledger: every call is added to dev/openai-cost.json with its token counts and an estimate.
# Prices per 1M tokens are an assumption (gpt-image-1 list prices); the real bill may differ.
PRICE = {'text_in': 5.0, 'image_in': 10.0, 'image_out': 40.0}
LEDGER = ROOT / 'dev' / 'openai-cost.json'


def log_cost(name, model, usage):
    details = usage.get('input_tokens_details') or {}
    text_in = details.get('text_tokens', usage.get('input_tokens', 0))
    image_in = details.get('image_tokens', 0)
    out = usage.get('output_tokens', 0)
    usd = (text_in * PRICE['text_in'] + image_in * PRICE['image_in'] + out * PRICE['image_out']) / 1e6
    ledger = json.loads(LEDGER.read_text(encoding='utf-8')) if LEDGER.exists() else {'entries': []}
    ledger['entries'].append({'what': f'image {name}', 'model': model, 'usage': usage, 'usd_estimate': round(usd, 4)})
    ledger['images_total_usd_estimate'] = round(sum(e['usd_estimate'] for e in ledger['entries']), 4)
    LEDGER.write_text(json.dumps(ledger, indent=1), encoding='utf-8')
    print(f'    cost estimate {name}: ${usd:.3f} (images so far ${ledger["images_total_usd_estimate"]:.2f})')


def generate(entry, model, style):
    prompt = f"{style}\n\n{entry['prompt']}"
    params = {'model': model, 'prompt': prompt, 'size': entry.get('size', '1024x1024'),
              'quality': entry.get('quality', 'high'), 'output_format': 'png', 'n': 1}
    if entry.get('transparent'):
        params['background'] = 'transparent'
    refs = [OUT / f'{r}.png' for r in entry.get('refs', [])]
    for attempt in range(4):
        try:
            if refs:
                fields = {k: str(v) for k, v in params.items() if k != 'n'}
                files = [('image[]', (p.name, p.read_bytes())) for p in refs]
                res = post_multipart('https://api.openai.com/v1/images/edits', fields, files)
            else:
                res = post_json('https://api.openai.com/v1/images/generations', params)
            usage = res.get('usage') or {}
            log_cost(entry['name'], model, usage)
            return base64.b64decode(res['data'][0]['b64_json'])
        except urllib.error.HTTPError as e:
            body = e.read()[:400].decode(errors='replace')
            if e.code in (429, 500, 502, 503) and attempt < 3:
                time.sleep(5 * (attempt + 1))
                continue
            raise RuntimeError(f"{entry['name']}: HTTP {e.code} {body}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='')
    ap.add_argument('--force', nargs='*', default=[])
    ap.add_argument('--jobs', type=int, default=4)
    ap.add_argument('--file', default=str(ROOT / 'art' / 'prompts.json'))
    args = ap.parse_args()
    spec = json.loads(Path(args.file).read_text(encoding='utf-8'))
    model, style = spec['model'], spec['style']
    OUT.mkdir(parents=True, exist_ok=True)
    index_path = OUT / 'index.json'
    index = json.loads(index_path.read_text(encoding='utf-8')) if index_path.exists() else {}

    todo = []
    for e in spec['images']:
        if not e['name'].startswith(args.only):
            continue
        h = hashlib.sha1(json.dumps([model, style, e], sort_keys=True).encode()).hexdigest()[:12]
        exists = (OUT / f"{e['name']}.png").exists() and index.get(e['name'], {}).get('hash') == h
        if e['name'] in args.force or not exists:
            todo.append((e, h))

    # Images with refs must wait for their references, so run them in dependency order.
    done = {p.stem for p in OUT.glob('*.png')} - {e['name'] for e, _ in todo}
    print(f'creating {len(todo)} images with {model}...')
    while todo:
        ready = [(e, h) for e, h in todo if all(r in done for r in e.get('refs', []))]
        if not ready:
            raise SystemExit('missing reference images: ' + ', '.join(e['name'] for e, _ in todo))

        def one(item):
            e, h = item
            data = generate(e, model, style)
            (OUT / f"{e['name']}.png").write_bytes(data)
            return e, h

        with ThreadPoolExecutor(args.jobs) as pool:
            for e, h in pool.map(one, ready):
                index[e['name']] = {'hash': h, 'model': model, 'size': e.get('size', '1024x1024'), 'transparent': bool(e.get('transparent'))}
                done.add(e['name'])
                print(f"  {e['name']}")
        todo = [x for x in todo if x not in ready]
        index_path.write_text(json.dumps(index, indent=1), encoding='utf-8')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
