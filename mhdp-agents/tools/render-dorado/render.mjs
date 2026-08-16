import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const BASE = path.dirname(fileURLToPath(import.meta.url));
const files = fs.readdirSync(BASE).filter(f=>f.endsWith('.html')).sort();
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:2});
for(const f of files){const n=f.replace(/\.html$/,'');
  await p.goto('file://'+path.join(BASE,f));
  await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(250);
  await p.screenshot({path:path.join(BASE,n+'.png')});
  console.log('rendered',n);}
await b.close();
