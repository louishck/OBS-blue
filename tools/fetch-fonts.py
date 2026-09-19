#!/usr/bin/env python3
"""Télécharge les polices (sous-ensemble latin) et génère overlays/css/fonts.css
   avec les fichiers encodés en data: URI → aucun accès réseau ni souci de CORS
   quand OBS charge les pages en file://.
   Usage : python3 tools/fetch-fonts.py"""
import re, subprocess, os, sys, base64

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/120.0 Safari/537.36")
OUT = "overlays/assets/fonts"
FAMS = [("Chakra Petch", "ChakraPetch", "wght@400;600;700"),
        ("Inter",        "Inter",       "wght@400;500;600;700"),
        ("JetBrains Mono","JetBrainsMono","wght@400;600;700"),
        ("Archivo",      "Archivo",     "wght@500;600;700;800;900"),
        ("Space Mono",   "SpaceMono",   "wght@400;700"),
        ("Kaushan Script","KaushanScript","wght@400")]

os.makedirs(OUT, exist_ok=True)
css = ["/* Polices auto-hébergées (sous-ensemble latin, incluant les accents",
       "   français). Fichier généré par tools/fetch-fonts.py — ne pas éditer. */"]
for fam, slug, axis in FAMS:
    url = f"https://fonts.googleapis.com/css2?family={fam.replace(' ', '+')}:{axis}&display=block"
    src_css = subprocess.run(["curl", "-sS", "-m", "30", "-A", UA, url],
                             capture_output=True, text=True).stdout
    for subset, body in re.findall(r"/\* ([a-z0-9\-]+) \*/\s*@font-face \{(.*?)\}", src_css, re.S):
        if subset != "latin":
            continue
        weight = re.search(r"font-weight: (\d+)", body).group(1)
        woff = re.search(r"url\((https://[^)]+\.woff2)\)", body).group(1)
        path = os.path.join(OUT, f"{slug}-{weight}.woff2")
        if not os.path.exists(path):
            subprocess.run(["curl", "-sS", "-m", "60", "-A", UA, woff, "-o", path], check=True)
        b64 = base64.b64encode(open(path, "rb").read()).decode()
        css.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{weight};"
                   f"font-display:block;src:url(data:font/woff2;base64,{b64}) format('woff2');}}")
        print(f"  {fam} {weight}", file=sys.stderr)
open("overlays/css/fonts.css", "w").write("\n".join(css) + "\n")
print("→ overlays/css/fonts.css", os.path.getsize("overlays/css/fonts.css") // 1024, "Ko")
