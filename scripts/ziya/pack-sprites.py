"""Packs the rendered frames into one WebP strip per animation and writes manifest.json.
   python3 pack-sprites.py <framesdir> <outdir>"""
import sys, os, json, glob
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
meta = json.load(open(f"{src}/meta.json")); fw, fh = meta["size"]
man = {"fw": fw, "fh": fh, "strips": {}}; total = 0
for name, info in meta["strips"].items():
    fs = sorted(glob.glob(f"{src}/{name}/*.png"))
    strip = Image.new("RGBA", (fw * len(fs), fh), (0, 0, 0, 0))
    for i, f in enumerate(fs): strip.paste(Image.open(f).convert("RGBA"), (i * fw, 0))
    path = f"{out}/{name}.webp"; strip.save(path, "WEBP", quality=72, alpha_quality=80, method=6)
    size = os.path.getsize(path); total += size
    man["strips"][name] = {"n": len(fs), "fps": info["fps"], "bytes": size}
    print(f"{name:14} {len(fs):3} frames {size/1024:6.1f} KB")
json.dump(man, open(f"{out}/manifest.json", "w"), separators=(",", ":"))
print("total", round(total / 1024), "KB")
