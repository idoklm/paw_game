"""Cut the generated sheets into single sprites, and shrink all art for the web.

  python tools/sprites.py

Sheets (transparent PNG) in assets/img are split by finding the separate shapes in the alpha channel,
ordered in reading order (top row first, left to right). Output: WebP files in assets/sprites and assets/bg.
"""
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / 'assets' / 'img'
SPR = ROOT / 'assets' / 'sprites'
BG = ROOT / 'assets' / 'bg'

SHEETS = {
    'pups-sheet': ['pup-pilpel', 'pup-dubi', 'pup-anani', 'pup-bloki', 'pup-gali', 'pup-lulu'],
    'pups-cheer': ['cheer-pilpel', 'cheer-dubi', 'cheer-anani', 'cheer-bloki', 'cheer-gali', 'cheer-lulu'],
    'vehicles': ['veh-pilpel', 'veh-dubi', 'veh-anani', 'veh-bloki', 'veh-gali', 'veh-lulu'],
    'items': ['item-bubble', 'item-crate', 'item-shell', 'item-apple', 'item-egg', 'item-balloon', 'item-fish', 'item-star', 'item-badge'],
}
SINGLE = {'captain': 'captain'}
BACKGROUNDS = ['bg-title', 'bg-map', 'bg-bridge', 'bg-harbor', 'bg-beach', 'bg-forest', 'bg-farm', 'bg-hill', 'bg-reef', 'bg-island']


def components(alpha, min_pixels):
    """Bounding boxes of the separate shapes in a mask (4-connected, on a 4x smaller grid for speed)."""
    small = alpha.resize((alpha.width // 4, alpha.height // 4))
    w, h = small.size
    px = small.load()
    seen = bytearray(w * h)
    boxes = []
    for y in range(h):
        for x in range(w):
            if seen[y * w + x] or px[x, y] < 40:
                continue
            stack = [(x, y)]
            seen[y * w + x] = 1
            x0 = x1 = x
            y0 = y1 = y
            n = 0
            while stack:
                cx, cy = stack.pop()
                n += 1
                x0, x1, y0, y1 = min(x0, cx), max(x1, cx), min(y0, cy), max(y1, cy)
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and px[nx, ny] >= 40:
                        seen[ny * w + nx] = 1
                        stack.append((nx, ny))
            if n * 16 >= min_pixels:
                boxes.append([x0 * 4, y0 * 4, (x1 + 1) * 4, (y1 + 1) * 4, n])
    return boxes


def merge_close(boxes, gap=24):
    """Join shapes that are very close (a separate tail, a string, a shadow) into one box."""
    changed = True
    while changed:
        changed = False
        for i in range(len(boxes)):
            for j in range(i + 1, len(boxes)):
                a, b = boxes[i], boxes[j]
                if a[0] - gap < b[2] and b[0] - gap < a[2] and a[1] - gap < b[3] and b[1] - gap < a[3]:
                    boxes[i] = [min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3]), a[4] + b[4]]
                    boxes.pop(j)
                    changed = True
                    break
            if changed:
                break
    return boxes


def grid_cells(alpha, rows, cols):
    """Cut lines at the emptiest column/row near each expected grid line (the sheets are grids)."""
    w, h = alpha.size
    px = alpha.load()
    col = [sum(px[x, y] for y in range(0, h, 4)) for x in range(w)]
    row = [sum(px[x, y] for x in range(0, w, 4)) for y in range(h)]

    def cuts(sums, n, size):
        out = [0]
        for k in range(1, n):
            c = size * k // n
            r = size // (n * 4)
            out.append(min(range(c - r, c + r), key=lambda i: sum(sums[max(0, i - 3):i + 4])))
        return out + [size]

    xs, ys = cuts(col, cols, w), cuts(row, rows, h)
    return [(xs[c], ys[r], xs[c + 1], ys[r + 1]) for r in range(rows) for c in range(cols)]


def reading_order(boxes, rows):
    boxes = sorted(boxes, key=lambda b: (b[1] + b[3]) / 2)
    per_row = len(boxes) // rows
    ordered = []
    for r in range(rows):
        row = boxes[r * per_row:(r + 1) * per_row]
        ordered += sorted(row, key=lambda b: (b[0] + b[2]) / 2)
    return ordered


def save_sprite(im, name, max_side=720):
    im = im.copy()
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    im.save(SPR / f'{name}.webp', 'WEBP', quality=88, method=6)
    return im.size


def main():
    SPR.mkdir(parents=True, exist_ok=True)
    BG.mkdir(parents=True, exist_ok=True)
    report = {}
    for sheet, names in SHEETS.items():
        im = Image.open(IMG / f'{sheet}.png').convert('RGBA')
        alpha = im.getchannel('A')
        rows, cols = (3, 3) if len(names) == 9 else (2, 3)
        for name, cell in zip(names, grid_cells(alpha, rows, cols)):
            part = im.crop(cell)
            # keep the largest shape in the cell (drops stray pixels of a neighbor), plus shapes close to it
            boxes = merge_close(components(part.getchannel('A'), min_pixels=400), gap=40)
            x0, y0, x1, y1, _ = max(boxes, key=lambda b: b[4])
            pad = 8
            crop = part.crop((max(0, x0 - pad), max(0, y0 - pad), min(part.width, x1 + pad), min(part.height, y1 + pad)))
            report[name] = save_sprite(crop, name)
    for src, name in SINGLE.items():
        im = Image.open(IMG / f'{src}.png').convert('RGBA')
        report[name] = save_sprite(im.crop(im.getchannel('A').getbbox()), name, max_side=900)
    for name in BACKGROUNDS:
        im = Image.open(IMG / f'{name}.png').convert('RGB')
        im.save(BG / f'{name}.webp', 'WEBP', quality=82, method=6)
        report[name] = im.size
    (ROOT / 'assets' / 'sprites.json').write_text(json.dumps(report, indent=1), encoding='utf-8')
    for k, v in report.items():
        print(k, v)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
