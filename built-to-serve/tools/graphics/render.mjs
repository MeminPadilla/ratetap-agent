// Renderiza post1/2/3.html a PNG (1080x1350, 2x) con Playwright + Chromium.
// Uso:  python3 embed_fonts.py && python3 gen.py && node render.mjs
import path from 'path';
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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
for (const n of ['post1', 'post2', 'post3']) {
  await page.goto('file://' + path.join(BASE, n + '.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const el = await page.$('.board');
  await el.screenshot({ path: path.join(BASE, n + '.png') });
  console.log('rendered', n);
}
await browser.close();
