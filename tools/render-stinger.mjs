/* =========================================================================
   Rend les stingers (transitions OBS) en WebM VP9 avec canal alpha.
   Usage : node tools/render-stinger.mjs [da...] [--fps 60] [--dur 1100]
   Sortie : dist/stingers/stinger-<da>.webm
   ========================================================================= */
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from './browser.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'dist', 'stingers');
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf('--' + n); return i === -1 ? d : args[i + 1]; };
const FPS = parseInt(flag('fps', 60), 10);
const DUR = parseInt(flag('dur', 1100), 10);
const DAS = args.filter((a) => !a.startsWith('--') && !/^\d+$/.test(a));
const LIST = DAS.length ? DAS : ['signature', 'cobalt', 'mono'];

/* ffmpeg : binaire système, sinon celui fourni par imageio-ffmpeg */
const FFMPEG = [
  process.env.FFMPEG_PATH,
  '/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg',
  '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
].find((p) => p && fs.existsSync(p)) || 'ffmpeg';

const FRAMES = Math.round((DUR / 1000) * FPS);
fs.mkdirSync(OUT, { recursive: true });

const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
const url = pathToFileURL(path.join(ROOT, 'overlays', 'transition.html')).href;

for (const da of LIST) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `stinger-${da}-`));
  process.stdout.write(`\n▶ ${da} — ${FRAMES} images @ ${FPS} fps\n`);
  for (let i = 0; i < FRAMES; i++) {
    const p = i / (FRAMES - 1);
    await page.goto(`${url}?da=${da}&fit=0&dur=${DUR}&p=${p.toFixed(5)}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('body[data-ready="1"]');
    await page.screenshot({
      path: path.join(tmp, String(i).padStart(4, '0') + '.png'),
      omitBackground: true            // conserve la transparence
    });
    if (i % 10 === 0) process.stdout.write('.');
  }
  const out = path.join(OUT, `stinger-${da}.webm`);
  const r = spawnSync(FFMPEG, [
    '-y', '-framerate', String(FPS), '-i', path.join(tmp, '%04d.png'),
    '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p',
    '-b:v', '0', '-crf', '24', '-row-mt', '1', '-auto-alt-ref', '0',
    '-metadata:s:v:0', 'alpha_mode=1', out
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  if (r.status !== 0) { console.error(r.stderr?.toString().slice(-1500)); process.exit(1); }
  fs.rmSync(tmp, { recursive: true, force: true });
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`\n✓ ${path.relative(ROOT, out)} — ${kb} Ko — point de transition ${Math.round(DUR / 2)} ms`);
}
await browser.close();
