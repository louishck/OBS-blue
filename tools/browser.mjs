/* Lancement Chromium partagé par les outils (Playwright + binaire local). */
import { chromium } from 'playwright';
import fs from 'node:fs';

const CANDIDATES = [
  process.env.CHROMIUM_PATH,
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome'
].filter(Boolean);

export async function launch() {
  const executablePath = CANDIDATES.find((p) => { try { return fs.existsSync(p); } catch { return false; } });
  return chromium.launch(executablePath ? { executablePath } : {});
}
