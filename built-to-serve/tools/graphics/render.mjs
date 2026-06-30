// Renderiza todos los *.html de esta carpeta a PNG (1080x1350, 2x).
// Uso:  python3 embed_fonts.py && python3 gen.py && node render.mjs
import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

// Resuelve playwright local o global (este entorno lo trae global).
const require = createRequire(import.meta.url);
let pwPath;
try { pwPath = require.resolve('playwright'); }
catch { pwPath = '/opt/node22/lib/node_modules/playwright/index.js'; }
const pw = await import(pathToFileURL(pwPath).href);
const chromium = pw.chromium ?? pw.default?.chromium;

const BASE = path.dirname(fileURLToPath(import.meta.url));
const files = fs.readdirSync(BASE).filter(f => f.endsWith('.html')).sort();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
for (const f of files) {
  const n = f.replace(/\.html$/, '');
  await page.goto('file://' + path.join(BASE, f));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('body[data-drawn="1"]', { timeout: 5000 });
  await page.waitForTimeout(150);
  const el = await page.$('.board');
  await el.screenshot({ path: path.join(BASE, n + '.png') });
  console.log('rendered', n);
}
await browser.close();
