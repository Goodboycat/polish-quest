# Cuts tools/out/art-sheet-transparent.png into one PNG per item using manifest.json.
# Icons -> site/assets/icons/NAME.png, art+frames -> site/assets/art/NAME.png (all at 4x pixel scale, crisp).
import json, os
from PIL import Image
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sheet = Image.open(os.path.join(root, 'tools/out/art-sheet-transparent.png')).convert('RGBA')
man = json.load(open(os.path.join(root, 'tools/out/manifest.json')))
os.makedirs(os.path.join(root, 'site/assets/icons'), exist_ok=True); os.makedirs(os.path.join(root, 'site/assets/art'), exist_ok=True)
art = ('bg_', 'mascot', 'enemy', 'chest', 'drop_arrow', 'frame_', 'btn_', 'badge_')
n = 0
for m in man:
    im = sheet.crop((m['x'], m['y'], m['x'] + m['w'], m['y'] + m['h']))
    if im.getbbox() is None: print('EMPTY', m['name']); continue
    d = 'art' if m['name'].startswith(art) else 'icons'
    im.save(os.path.join(root, 'site/assets', d, m['name'] + '.png'), optimize=True); n += 1
print('sliced', n)
