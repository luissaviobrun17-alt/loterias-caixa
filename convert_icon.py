
import sys
import os

try:
    from PIL import Image
except ImportError:
    print("Pillow not installed")
    sys.exit(1)

img_path = 'img/logo_v2.png'
ico_path = 'img/icon.ico'

if os.path.exists(img_path):
    img = Image.open(img_path)
    img.save(ico_path, format='ICO', sizes=[(256, 256)])
    print(f"Created {ico_path}")
else:
    print(f"File not found: {img_path}")
