"""Build the itinerary-walk photos: assets-src/walk/*.jpg -> public/walk/<name>-<width>.<avif|webp> + src/content/walk-images.json.

Run after adding or replacing a photo:  python3 scripts/walk-images.py
- Widths: a ladder up to the photo's own size; small photos also get one careful 2x upscale (Lanczos +
  light sharpening) so high-density screens don't stretch them themselves.
- AVIF (smallest) with a WebP fallback, both tuned to look identical to the original at normal viewing.
- A 24 px blurred preview (inline, about 0.5 KB) shows instantly while the real photo loads.
Files are served with a one-year cache (vercel.json), so a changed photo must get a new name.
"""
import base64, io, json, os
from PIL import Image, ImageFilter

SRC, OUT, MANIFEST = 'assets-src/walk', 'public/walk', 'src/content/walk-images.json'
LADDER = [640, 1080, 1600, 2048]
SMALL = {'course1', 'course2', 'course3'}  # thumbnails in a card

os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.endswith(('.avif', '.webp')):
        os.remove(os.path.join(OUT, f))

manifest = {}
for fn in sorted(os.listdir(SRC)):
    if not fn.endswith('.jpg'):
        continue
    name = fn[:-4]
    im = Image.open(os.path.join(SRC, fn)).convert('RGB')
    w0, h0 = im.size
    if name in SMALL:
        widths = [320]
    else:
        top = w0 if w0 >= 1500 else min(2048, round(w0 * 1.6))  # only small photos get one modest upscale
        widths = [w for w in LADDER if w < top - 120] + [top]
    for w in widths:
        if w == w0:
            t = im
        elif w < w0:
            t = im.resize((w, round(h0 * w / w0)), Image.LANCZOS)
        else:
            t = im.resize((w, round(h0 * w / w0)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.4, percent=50, threshold=2))
        t.save(f'{OUT}/{name}-{w}.avif', 'AVIF', quality=58 if w <= 1080 else 52, speed=4)
        t.save(f'{OUT}/{name}-{w}.webp', 'WEBP', quality=80, method=6)
    tiny = im.resize((24, max(1, round(24 * h0 / w0))), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1))
    buf = io.BytesIO(); tiny.save(buf, 'JPEG', quality=60)
    manifest[name] = {'w': widths, 'size': [w0, h0], 'lqip': 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()}

json.dump(manifest, open(MANIFEST, 'w'), indent=1)
tot = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
print(f'{len(manifest)} photos, {len(os.listdir(OUT))} files, {tot / 1024 / 1024:.1f} MB on disk')
