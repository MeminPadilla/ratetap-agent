# Estilo visual — "Whiteboard" (ESTILO FINAL, oficial)

> **Este documento reemplaza** la sección "Estándar de marca visual"
> (blanco+oro / serif) del `CLAUDE.md` de MHDP. El estilo final de todos los
> artes es el **pizarrón a mano (whiteboard)** que se construyó en Built to
> Serve. Cualquier arte nuevo (carruseles, frases-imagen, portadas) se produce
> con este sistema.
>
> **Cómo se ve:** un pizarrón blanco con marco de aluminio y bandeja con
> marcadores; texto en letra manuscrita de marcador; cajas, flechas y
> subrayados **dibujados a mano con "temblor"** (no rectángulos perfectos);
> tinta navy, acento rojo, subrayado azul. Firma **BUILT TO SERVE / by
> Guillermo Padilla** abajo.

---

## 0. La forma más rápida (reutilizar el toolkit)

El motor ya existe y es reproducible:
`built-to-serve/tools/graphics/` (en el repo `ratetap-agent`).

```
tools/graphics/
├── embed_fonts.py     # embebe las fuentes en fonts/fonts.css (sin internet)
├── gen.py             # genera los .html de cada arte
├── render.mjs         # rasteriza cada .html a .png (Playwright + Chromium)
└── fonts/             # Kalam, Caveat, Permanent Marker (.woff2, licencia OFL)
```

**Para producir artes nuevos:** copia esa carpeta, agrega tu contenido como una
función/variable en `gen.py` (ver §5), y corre el pipeline (§6). Si no tienes
acceso a esa carpeta, este documento la reconstruye completa desde cero.

---

## 1. Tokens de diseño (no negociable)

| Token | Valor | Uso |
|-------|-------|-----|
| `--ink` | `#1d2b3c` | Tinta principal (navy casi negro) |
| `--red` | `#cf3a2c` | Acento / el nodo "resultado" / clímax |
| `--blue` | `#1f6fb2` | Subrayado a mano |
| gris texto | `#41506a` | Texto secundario dentro de cajas |
| gris etiqueta | `#9aa2ad` | Etiquetas de catálogo, kickers |
| superficie | `#ffffff → #eef2f6` | Fondo del pizarrón (gradiente) |
| marco | `#e2e5e9 → #aeb4bc` | Aluminio |

**Fuentes** (Google Fonts, OFL, embebidas en base64):
- **Permanent Marker** → clase `.t` (títulos/nodos, marcador grueso).
- **Kalam** (400/700) → clase `.hand` (cuerpo manuscrito legible).
- **Caveat** → clase `.cav` (frases, kickers, firma).

**Dimensiones:**
- Post cuadrado/vertical: **1080 × 1350** (4:5, el que mejor rinde). `deviceScaleFactor: 2`.
- Portada/banner LinkedIn: **1584 × 396** (variante sin marco; ver §7).

**Reglas de color:** el nodo/caja del **resultado** o el elemento clímax va en
rojo (`data-c="red"`). Contrastes (mito vs verdad) usan rojo vs azul. El resto,
tinta navy.

---

## 2. Anatomía de un board

Cada arte es un `.board` (marco aluminio) → `.surface` (pizarrón blanco) que
contiene: un `<svg id="ink">` (capa de trazos a mano), un `.content` (el texto),
la `.brand` (firma), la `.tray` (bandeja) y 3 `.mk` (marcadores negro/azul/rojo).

El texto se maqueta con HTML normal; **los trazos a mano (cajas, flechas,
subrayados) se dibujan por JS** midiendo los elementos reales después de cargar
las fuentes, y pintándolos con "temblor" sobre el SVG.

Clases que disparan trazo a mano:
- `ink-box` → dibuja una caja a mano alrededor del elemento. `data-c` = color.
- `ink-u` → subrayado a mano debajo del elemento. `data-c` (default azul).
- `ink-arrow` → flecha vertical a mano dentro de ese hueco.
- `lnode` + `data-i` → nodo de un ciclo (flechas curvas entre ellos).

---

## 3. El motor de trazo a mano (JS — pégalo tal cual)

```js
// DRAW — motor "rough" propio. Dibuja cajas/flechas/subrayados/ciclos con
// temblor de marcador sobre un overlay SVG, midiendo los elementos reales.
function j(n){return (Math.random()*2-1)*n}
function ns(){return document.createElementNS('http://www.w3.org/2000/svg','path')}
function add(svg,d,color,w){var p=ns();p.setAttribute('d',d);p.setAttribute('fill','none');
  p.setAttribute('stroke',color);p.setAttribute('stroke-width',w);p.setAttribute('stroke-linecap','round');
  p.setAttribute('stroke-linejoin','round');svg.appendChild(p);}
function rect(svg,x,y,w,h,color,sw){
  for(var k=0;k<2;k++){var d='M '+(x+j(2.5))+' '+(y+j(2.5))+' L '+(x+w+j(2.5))+' '+(y+j(2.5))+
    ' L '+(x+w+j(2.5))+' '+(y+h+j(2.5))+' L '+(x+j(2.5))+' '+(y+h+j(2.5))+
    ' L '+(x-2+j(2.5))+' '+(y+j(2.5));add(svg,d,color,sw);}
}
function uline(svg,x,y,w,color,sw){
  for(var k=0;k<2;k++){var mx=x+w/2; var d='M '+(x+j(2))+' '+(y+j(2))+
    ' Q '+(mx+j(3))+' '+(y+3+j(3))+' '+(x+w+j(2))+' '+(y+j(2));add(svg,d,color,sw);}
}
function arrow(svg,cx,y1,y2,color,sw){
  var d='M '+(cx+j(2))+' '+(y1+j(2))+' L '+(cx+j(2.5))+' '+(y2+j(2));add(svg,d,color,sw);
  add(svg,'M '+(cx-9)+' '+(y2-12)+' L '+cx+' '+y2+' L '+(cx+9)+' '+(y2-12),color,sw);
}
var COL={ink:'#1d2b3c',red:'#cf3a2c',blue:'#1f6fb2'};
function loopArrows(svg,sb){
  var ns=document.querySelectorAll('.lnode'); if(!ns.length) return;
  var arr=[].slice.call(ns).sort(function(a,b){return (a.dataset.i|0)-(b.dataset.i|0)});
  var pts=arr.map(function(e){var r=e.getBoundingClientRect();
    return {x:r.left+r.width/2-sb.left, y:r.top+r.height/2-sb.top};});
  var cx=0,cy=0; pts.forEach(function(p){cx+=p.x;cy+=p.y;}); cx/=pts.length; cy/=pts.length;
  var R=0; pts.forEach(function(p){R+=Math.hypot(p.x-cx,p.y-cy);}); R/=pts.length;
  var n=pts.length, gap=0.62, rr=R*1.06;
  for(var i=0;i<n;i++){
    var a=pts[i], b=pts[(i+1)%n];
    var aa=Math.atan2(a.y-cy,a.x-cx), ab=Math.atan2(b.y-cy,b.x-cx);
    while(ab<=aa) ab+=2*Math.PI;
    var a1=aa+gap, a2=ab-gap, d='', K=18;
    for(var k=0;k<=K;k++){var t=a1+(a2-a1)*k/K;
      d+=(k?'L ':'M ')+(cx+rr*Math.cos(t)+j(1.4))+' '+(cy+rr*Math.sin(t)+j(1.4))+' ';}
    add(svg,d,COL.ink,3.2);
    var ex=cx+rr*Math.cos(a2), ey=cy+rr*Math.sin(a2), h=a2+Math.PI/2, L=20;
    add(svg,'M '+ex+' '+ey+' L '+(ex+L*Math.cos(h+Math.PI+0.45))+' '+(ey+L*Math.sin(h+Math.PI+0.45)),COL.ink,3.2);
    add(svg,'M '+ex+' '+ey+' L '+(ex+L*Math.cos(h+Math.PI-0.45))+' '+(ey+L*Math.sin(h+Math.PI-0.45)),COL.ink,3.2);
  }
}
function draw(){
  var surf=document.querySelector('.surface');
  var svg=document.querySelector('#ink');
  var sb=surf.getBoundingClientRect();
  svg.setAttribute('width',surf.clientWidth);svg.setAttribute('height',surf.clientHeight);
  document.querySelectorAll('.ink-box').forEach(function(e){var r=e.getBoundingClientRect();
    rect(svg,r.left-sb.left-16,r.top-sb.top-12,r.width+32,r.height+24,COL[e.dataset.c||'ink'],3.4);});
  document.querySelectorAll('.ink-u').forEach(function(e){var r=e.getBoundingClientRect();
    uline(svg,r.left-sb.left-6,r.bottom-sb.top+8,r.width+12,COL[e.dataset.c||'blue'],5);});
  document.querySelectorAll('.ink-arrow').forEach(function(e){var r=e.getBoundingClientRect();
    arrow(svg,r.left-sb.left+r.width/2,r.top-sb.top+6,r.bottom-sb.top-6,COL[e.dataset.c||'ink'],3.2);});
  loopArrows(svg,sb);
  document.body.setAttribute('data-drawn','1');
}
if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){setTimeout(draw,60)});}
else{window.addEventListener('load',draw);}
```

---

## 4. El board (CSS + HTML — pégalo tal cual)

`__FONTS__` se reemplaza por el contenido de `fonts/fonts.css` (§6).
`__DRAW__` se reemplaza por el JS del §3. El contenido del arte va entre
`HEAD` y `FOOT`.

```css
:root{ --ink:#1d2b3c; --red:#cf3a2c; --blue:#1f6fb2; }
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px}
body{background:#6b7280;display:flex;align-items:center;justify-content:center;
  font-family:'Hand',system-ui,sans-serif;color:var(--ink)}
.board{position:relative;width:1024px;height:1294px;border-radius:18px;
  background:linear-gradient(145deg,#e2e5e9,#c3c8cf 55%,#aeb4bc);
  padding:20px 20px 68px; box-shadow:0 22px 46px rgba(0,0,0,.30), inset 0 1px 0 #f2f4f6;}
.surface{position:relative;height:100%;background:linear-gradient(160deg,#ffffff,#eef2f6);
  border-radius:6px;overflow:hidden;
  box-shadow:inset 0 2px 8px rgba(20,30,45,.12), inset 0 0 0 1px #e6eaef; padding:62px 58px 96px;}
.surface:before{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(118deg, rgba(255,255,255,.75) 0%, rgba(255,255,255,0) 34%);}
#ink{position:absolute;inset:0;z-index:1;pointer-events:none}
.content{position:relative;z-index:2;height:100%;display:flex;flex-direction:column}
.tray{position:absolute;left:30px;right:30px;bottom:16px;height:30px;border-radius:6px 6px 12px 12px;
  background:linear-gradient(#aab0b9,#7c828c);
  box-shadow:0 5px 8px rgba(0,0,0,.30), inset 0 2px 3px rgba(0,0,0,.25), inset 0 1px 0 #cdd2d8;}
.mk{position:absolute;bottom:25px;height:16px;width:170px;border-radius:8px;z-index:3;
  background:linear-gradient(#f6f7f9,#dce0e5);box-shadow:0 3px 5px rgba(0,0,0,.32)}
.mk:after{content:"";position:absolute;right:0;top:0;height:16px;width:46px;border-radius:0 8px 8px 0}
.mk.k{left:120px}.mk.k:after{background:#2b2b2b}
.mk.b{left:300px}.mk.b:after{background:var(--blue)}
.mk.r{left:480px}.mk.r:after{background:var(--red)}
.t{font-family:'Marker';font-weight:400;color:var(--ink);line-height:1.04}
.hand{font-family:'Hand'} .cav{font-family:'Caveat'}
.brand{position:absolute;left:0;right:0;bottom:44px;z-index:2;text-align:center}
.brand .bw{font-family:'Hand';font-weight:700;font-size:34px;letter-spacing:3px;color:var(--ink)}
.brand .bw b{color:var(--red)} .brand .by{font-family:'Caveat';font-size:31px;color:#8a93a0;margin-top:-2px}
```

```html
<!-- HEAD -->
<!doctype html><html><head><meta charset="utf-8"><style>
__FONTS__
/* …los tokens/CSS de arriba… */
</style></head><body><div class="board"><div class="surface">
<svg id="ink"></svg>
<div class="content">

<!-- …CONTENIDO DEL ARTE… -->

<!-- FOOT -->
</div>
<div class="brand">
  <div class="bw">BUILT TO <b>SERVE</b></div>
  <div class="by">by Guillermo Padilla</div>
</div>
</div>
<div class="tray"></div>
<div class="mk k"></div><div class="mk b"></div><div class="mk r"></div>
</div>
<script>__DRAW__</script>
</body></html>
```

> Nota: `'Marker'`, `'Hand'`, `'Caveat'` son los `font-family` que define
> `fonts.css`. La firma puede cambiar a `@meminpadilla` si el arte es para IG.

---

## 5. Catálogo de plantillas (patrones de contenido)

Cada plantilla es un bloque HTML que va dentro de `.content`. El `.content` es
flex-column de altura completa: usa `margin-top:auto` para empujar el cierre al
fondo, o `flex:1` en el bloque central para centrarlo.

**A. Flujo causa→efecto (3 nodos)** — el patrón estrella:
```html
<div style="text-align:center;margin-top:6px">
  <div class="cav" style="font-size:40px;letter-spacing:7px;color:#9aa2ad">PRINCIPLE 001</div>
</div>
<div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center">
  <div class="ink-box t" style="font-size:50px;padding:18px 64px">NODO 1</div>
  <div class="ink-arrow" style="width:130px;height:76px"></div>
  <div class="ink-box t" style="font-size:50px;padding:18px 64px">NODO 2</div>
  <div class="ink-arrow" data-c="red" style="width:130px;height:76px"></div>
  <div class="ink-box t" data-c="red" style="font-size:50px;padding:18px 64px">RESULTADO</div>
</div>
<div style="text-align:center;padding-bottom:106px">
  <div class="cav" style="font-size:46px;color:var(--ink)">La frase de cierre, citable.</div>
</div>
```

**B. Frase héroe (axioma/declaración)** — catálogo arriba + frase gigante:
```html
<div style="text-align:center;margin-top:8px">
  <div class="cav" style="font-size:42px;letter-spacing:8px;color:#9aa2ad">AXIOM 001</div></div>
<div style="flex:1;display:flex;align-items:center;justify-content:center">
  <div class="t" style="font-size:82px;line-height:1.12;text-align:center">
    La frase <span class="ink-u" data-c="red">clave</span>.</div></div>
<div style="padding-bottom:108px"></div>
```

**C. Definición (palabra + significado):**
```html
<div style="text-align:center;margin-top:8px">
  <div class="cav" style="font-size:38px;letter-spacing:6px;color:#9aa2ad">DEFINITION · D-001</div></div>
<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
  <div class="t" style="font-size:78px"><span class="ink-u" data-c="red">Palabra</span></div>
  <div class="hand" style="font-size:44px;text-align:center;margin-top:56px;max-width:780px;line-height:1.4">
    No es X.<br><b>Es Y.</b></div></div>
<div style="padding-bottom:106px"></div>
```

**D. Rejilla 2×2 (los 4 pilares / listas):** grid `1fr 1fr` de `.ink-box`, cada
uno con `.t` (número + nombre) y `.hand` (una línea). Resalta el 4º con `data-c="red"`.

**E. Ciclo (loop):** 3–4 `.lnode.ink-box.t` posicionados en círculo con
`position:absolute; transform:translate(-50%,-50%)` y `data-i="0..n"`; el JS
`loopArrows` dibuja las flechas curvas. Etiqueta central en `.cav`.

**F. Checklist (proceso):** una `.ink-box` grande que contiene filas; cada fila
= un `.ink-box` chico vacío (la casilla) + texto `.hand`. Última casilla `data-c="red"`.

**G. Contraste (mito ≠ verdad):** dos `.ink-box` (rojo y azul) con un `&ne;`
grande en medio.

> Para ver todas implementadas, lee `built-to-serve/tools/graphics/gen.py`
> (funciones `principle`, `axiom`, `definition`, `pilar`, `fw_leadership_loop`,
> `fw_daily_briefing`, `graph_map`, `thread`).

---

## 6. Pipeline de build (comandos)

Requisitos: Python 3 con Pillow, Node con `playwright` + Chromium.

```bash
# 1) Embeber fuentes (una vez). Si no tienes fonts/*.woff2, bájalas de Google
#    Fonts: Kalam(400,700), Caveat(400), Permanent Marker; guárdalas como
#    kalam400/kalam700/caveat400/marker.woff2 en fonts/.
python3 embed_fonts.py            # -> fonts/fonts.css (base64, sin internet)

# 2) Generar los .html de cada arte
python3 gen.py                    # -> post*.html, principle-*.html, etc.

# 3) Rasterizar a PNG (1080x1350 @2x). render.mjs espera body[data-drawn="1"]
node render.mjs                   # -> *.png

# 4) Comprimir para subir (line-art -> paleta 128, ~100 KB, líneas nítidas)
python3 - <<'PY'
from PIL import Image; import glob,os
for f in glob.glob("*.png"):
    im=Image.open(f).convert("RGB")
    im.convert("P",palette=Image.ADAPTIVE,colors=128).save("out_"+os.path.basename(f),optimize=True)
PY
```

`embed_fonts.py` (regenera `fonts/fonts.css`):
```python
import base64, os
F=os.path.join(os.path.dirname(os.path.abspath(__file__)),"fonts")
b=lambda n: base64.b64encode(open(os.path.join(F,n),"rb").read()).decode()
css=f"""
@font-face{{font-family:'Marker';src:url(data:font/woff2;base64,{b('marker.woff2')}) format('woff2');font-weight:400;font-display:block;}}
@font-face{{font-family:'Hand';src:url(data:font/woff2;base64,{b('kalam400.woff2')}) format('woff2');font-weight:400;font-display:block;}}
@font-face{{font-family:'Hand';src:url(data:font/woff2;base64,{b('kalam700.woff2')}) format('woff2');font-weight:700;font-display:block;}}
@font-face{{font-family:'Caveat';src:url(data:font/woff2;base64,{b('caveat400.woff2')}) format('woff2');font-weight:400;font-display:block;}}
"""
open(os.path.join(F,"fonts.css"),"w").write(css)
```

`render.mjs` (rasteriza cualquier `*.html` de la carpeta):
```js
import { chromium } from 'playwright';   // o ruta global si no resuelve
import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const BASE = path.dirname(fileURLToPath(import.meta.url));
const files = fs.readdirSync(BASE).filter(f=>f.endsWith('.html')).sort();
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1080,height:1350}, deviceScaleFactor:2 });
for (const f of files){ const n=f.replace(/\.html$/,'');
  await p.goto('file://'+path.join(BASE,f));
  await p.evaluate(()=>document.fonts.ready);
  await p.waitForSelector('body[data-drawn="1"]',{timeout:5000});
  await p.waitForTimeout(150);
  const el=await p.$('.board'); await el.screenshot({path:path.join(BASE,n+'.png')});
}
await b.close();
```

---

## 7. Variante banner (portada, sin marco)

Para portadas horizontales (1584×396), no uses `.board`; usa fondo whiteboard
plano y deja libre la esquina inferior-izquierda (ahí va la foto de perfil).
Wordmark en `'Marker'` (SERVE en rojo), tagline en `'Hand'`, kicker en `'Caveat'`.

---

## 8. Regla de idioma (heredada del canon)

- **Solo los títulos/etiquetas en inglés:** nombres (The Four Pillars…),
  catálogo (PRINCIPLE 001, AXIOM 001, D-001…) y el wordmark BUILT TO SERVE.
- **Todo lo que se lee, en español:** nodos, prosa, preguntas, resúmenes,
  definiciones.
- El caption del post siempre en español.

---

## 9. Checklist antes de entregar un arte

- [ ] ¿Marco aluminio + superficie blanca + bandeja con 3 marcadores?
- [ ] ¿Cajas/flechas/subrayados dibujados a mano (con temblor), no perfectos?
- [ ] ¿Tinta navy, resultado/clímax en rojo?
- [ ] ¿Firma BUILT TO SERVE / by Guillermo Padilla (o @meminpadilla en IG)?
- [ ] ¿Títulos en inglés, todo lo demás en español?
- [ ] ¿1080×1350, exportado y comprimido (~100 KB, líneas nítidas)?
- [ ] ¿`body[data-drawn="1"]` presente (los trazos se pintaron) antes del screenshot?
</content>
