/* =========================================================================
   Capture d'écran de toutes les scènes × toutes les DA → preview/shots/
   Usage : node tools/screenshot.mjs [--full] [--jpeg]
   ========================================================================= */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from './browser.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'preview', 'shots');
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const DAS = ONLY.length ? ONLY : ['signature', 'cobalt', 'mono'];
const SCENES = [
  { name: 'live',       file: 'live',  q: '&layout=fullscreen&bg=demo' },
  { name: 'live-frame', file: 'live',  q: '&layout=frame' },
  { name: 'pause',      q: '' },
  { name: 'starting',   q: '' },
  { name: 'webcam',     q: '&bg=demo' },
  { name: 'ending',     q: '' },
  { name: 'alerts',     q: '&bg=demo' },
  { name: 'chat',       q: '&bg=demo' },
  { name: 'offline',    q: '' },
  { name: 'panels',     q: '' }
];
/* Par défaut : vignettes 1280×720 en JPEG (légères, pour le panneau d'aperçu).
   --full : captures 1920×1080 en PNG.                                        */
const full = process.argv.includes('--full');
const W = full ? 1920 : 1280, H = full ? 1080 : 720;
const EXT = full ? 'png' : 'jpg';

fs.mkdirSync(OUT, { recursive: true });
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();

for (const da of DAS) {
  for (const s of SCENES) {
    const file = path.join(ROOT, 'overlays', `${s.file || s.name}.html`);
    const url = `${pathToFileURL(file).href}?da=${da}${full ? '&fit=0' : ''}${s.q}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2600);           // laisse jouer les animations d'entrée
    const out = path.join(OUT, `${da}-${s.name}.${EXT}`);
    await page.screenshot({ path: out, type: full ? 'png' : 'jpeg', quality: full ? undefined : 80 });
    console.log('✓', path.relative(ROOT, out));
  }
  // image représentative du stinger (écran couvert)
  const tf = pathToFileURL(path.join(ROOT, 'overlays', 'transition.html')).href;
  await page.goto(`${tf}?da=${da}${full ? '&fit=0' : ''}&p=0.5`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const out = path.join(OUT, `${da}-transition.${EXT}`);
  await page.screenshot({ path: out, type: full ? 'png' : 'jpeg', quality: full ? undefined : 80 });
  console.log('✓', path.relative(ROOT, out));
}
await browser.close();
