# Estilo visual — "Dorado editorial" (MHDP · estilo final de artes)

> El estilo de TODOS los artes de la marca MHDP: **blanco cálido + oro + serif,
> editorial y profesional.** Aquí se rinde el contenido de Built to Serve
> (Axioms, Principles, Definitions, Mental Models, Frameworks) en ese look.
>
> **Cómo se ve:** fondo hueso `#FAF9F6`, marco hairline dorado, titulares en
> serif Playfair Display (palabra clave en itálica oro `#C9A04E`), mucho aire,
> y firma **GUILLERMO PADILLA / @meminpadilla / M · H · D · P**. Sin emojis, sin
> degradados baratos, sin dibujos a mano. Limpio, aesthetic, de revista.

---

## 0. La forma más rápida (reutilizar el toolkit)

Motor reproducible, ya en el repo:
`mhdp-agents/tools/render-dorado/`

```
render-dorado/
├── embed_fonts.py    # embebe Playfair + Inter en fonts/fonts.css
├── gen.py            # genera los .html (ya trae todo el canon en dorado)
├── render.mjs        # rasteriza a PNG 1080x1350 @2x (Playwright + Chromium)
└── fonts/            # Playfair Display 700/700i + Inter 400/600 (.woff2, OFL)
```

**Generar todo el canon en dorado:**
```bash
cd mhdp-agents/tools/render-dorado
python3 embed_fonts.py     # -> fonts/fonts.css (una vez)
python3 gen.py             # -> axiom-*.html, principle-*.html, definition-*.html, mm-001-*.html
node render.mjs            # -> *.png
```

**Agregar un arte nuevo:** añade contenido a `gen.py` con las funciones
`axiom()`, `principle()`, `definition()`, `four_pillars()` (o crea una plantilla
nueva siguiendo §5) y vuelve a correr los 3 comandos.

---

## 1. Tokens de diseño (no negociable)

| Token | Valor | Uso |
|-------|-------|-----|
| `--paper` | `#FAF9F6` | Fondo hueso cálido |
| `--ink` | `#1A1A1A` | Tinta principal (casi negro) |
| `--gold` | `#C9A04E` | Acento: kicker, palabra clave, resultado, reglas |
| `--wine` | `#6E202A` | Secundario ocasional |
| `--mute` | `#8B8578` | Monograma, texto tenue |
| cuerpo | `#3a362e` | Texto de apoyo |

**Fuentes** (Google Fonts, OFL, embebidas base64):
- **Playfair Display** 700 y 700 *italic* → clase `.h` / `.node` (titulares serif).
  La **itálica va en oro** para la palabra clave.
- **Inter** 400/600 → clase `.sans` / `.body` (kickers, cuerpo, firma).

**Dimensiones:** 1080 × 1350 (4:5), `deviceScaleFactor: 2`.

**Reglas de acento:** el kicker, la regla, la palabra clave y el nodo
"resultado" van en **oro**. Todo lo demás en tinta. El oro se usa con
moderación — es acento, no relleno.

---

## 2. Anatomía de una card

Un solo `.card` (fondo hueso) con un **marco hairline dorado** (`:before`,
`inset:44px`). Dentro, en flex-column: **kicker** (etiqueta de catálogo en oro)
→ **regla** (línea corta dorada) → **contenido** (titular serif) → **firma**
(bloque fijo abajo). Sin marco de aluminio ni trazos a mano — es editorial puro.

---

## 3. El board (CSS + HTML — pégalo tal cual)

`__FONTS__` = contenido de `fonts/fonts.css` (§6). El contenido del arte va
entre `HEAD` y `FOOT`.

```css
:root{ --paper:#FAF9F6; --ink:#1A1A1A; --gold:#C9A04E; --wine:#6E202A; --mute:#8B8578; }
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px}
body{background:var(--paper);display:flex;align-items:center;justify-content:center;
  font-family:'Sans',system-ui,sans-serif;color:var(--ink)}
.card{position:relative;width:1080px;height:1350px;background:var(--paper);
  padding:96px 96px 92px;display:flex;flex-direction:column;overflow:hidden}
.card:before{content:"";position:absolute;inset:44px;border:1.5px solid rgba(201,160,78,.55);pointer-events:none}
.kick{font-family:'Sans';font-weight:600;font-size:26px;letter-spacing:8px;color:var(--gold);text-transform:uppercase}
.rule{width:70px;height:2px;background:var(--gold);margin:26px auto 0}
.h{font-family:'Playfair';font-weight:700;color:var(--ink);line-height:1.12}
.h i{font-style:italic;color:var(--gold)}
.sans{font-family:'Sans'}
.body{font-family:'Sans';font-weight:400;color:#3a362e;line-height:1.5}
.sig{position:absolute;left:0;right:0;bottom:82px;text-align:center}
.sig .n{font-family:'Sans';font-weight:600;font-size:24px;letter-spacing:6px;color:var(--ink)}
.sig .h2{font-family:'Sans';font-weight:400;font-size:22px;letter-spacing:2px;color:var(--gold);margin-top:4px}
.sig .mono{font-family:'Sans';font-weight:600;font-size:20px;letter-spacing:10px;color:var(--mute);margin-top:16px}
/* flujo editorial */
.flow{display:flex;flex-direction:column;align-items:center}
.node{font-family:'Playfair';font-weight:700;font-size:60px;color:var(--ink)}
.node.res{color:var(--gold)}
.conn{width:1.5px;height:56px;background:var(--gold);margin:14px 0;position:relative}
.conn:after{content:"";position:absolute;left:-4px;bottom:0;width:9px;height:9px;
  border-right:1.5px solid var(--gold);border-bottom:1.5px solid var(--gold);transform:rotate(45deg)}
/* rejilla editorial */
.grid{display:grid;grid-template-columns:1fr 1fr;gap:54px 60px;width:100%}
.cell{border-top:1.5px solid rgba(201,160,78,.55);padding-top:18px}
.cell .num{font-family:'Playfair';font-weight:700;font-style:italic;font-size:34px;color:var(--gold)}
.cell .nm{font-family:'Playfair';font-weight:700;font-size:38px;color:var(--ink);margin-top:2px}
.cell .ln{font-family:'Sans';font-size:27px;color:#3a362e;margin-top:8px}
```

```html
<!-- HEAD -->
<!doctype html><html><head><meta charset="utf-8"><style>
__FONTS__
/* …CSS de arriba… */
</style></head><body><div class="card">

<!-- …CONTENIDO DEL ARTE… -->

<!-- FOOT -->
<div class="sig">
  <div class="n">GUILLERMO PADILLA</div>
  <div class="h2">@meminpadilla</div>
  <div class="mono">M · H · D · P</div>
</div>
</div></body></html>
```

---

## 4. Render (`render.mjs`)

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
  await p.waitForTimeout(250);
  await p.screenshot({path:path.join(BASE,n+'.png')});
}
await b.close();
```

---

## 5. Catálogo de plantillas (bloques de contenido)

**A. Axiom / frase héroe:**
```html
<div style="text-align:center;margin-top:20px"><div class="kick">AXIOM 001</div><div class="rule"></div></div>
<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:0 20px">
  <div class="h" style="font-size:92px;text-align:center">Las personas son la <i>estrategia</i>.</div></div>
<div style="height:150px"></div>
```

**B. Principle / flujo editorial** (nodos serif + conector oro; resultado en oro):
```html
<div style="text-align:center;margin-top:20px"><div class="kick">PRINCIPLE 001</div><div class="rule"></div></div>
<div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center">
  <div class="flow">
    <div class="node">Personas</div><div class="conn"></div>
    <div class="node">Cultura</div><div class="conn"></div>
    <div class="node res">Negocio</div>
  </div></div>
<div style="text-align:center;padding:0 40px 150px">
  <div class="body" style="font-size:40px;font-family:'Playfair';font-style:italic;color:var(--ink)">
    Las personas construyen cultura. La cultura construye el negocio.</div></div>
```

**C. Definition / palabra + significado:**
```html
<div style="text-align:center;margin-top:20px"><div class="kick">DEFINITION · D-001</div><div class="rule"></div></div>
<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
  <div class="h" style="font-size:82px"><i>Hospitalidad</i></div>
  <div class="body" style="font-size:44px;text-align:center;margin-top:44px;max-width:760px">
    No es servicio.<br>Es hacer que alguien se sienta visto.</div></div>
<div style="height:150px"></div>
```

**D. Rejilla editorial (4 pilares / listas):** `.grid` 2×2 de `.cell`, cada
celda con `.num` (oro itálico) + `.nm` (serif) + `.ln` (sans). Cierre en itálica serif.
(Implementado en `gen.py` como `four_pillars()`.)

> Todas las plantillas están implementadas en
> `mhdp-agents/tools/render-dorado/gen.py`.

---

## 6. Pipeline (comandos)

```bash
python3 embed_fonts.py     # fonts/fonts.css (Playfair + Inter, base64)
python3 gen.py             # *.html
node render.mjs            # *.png
# Comprimir para subir (requiere Pillow):
python3 -c "from PIL import Image; import glob,os; [Image.open(f).convert('RGB').convert('P',palette=Image.ADAPTIVE,colors=200).save('out_'+f,optimize=True) for f in glob.glob('*.png')]"
```

Fuentes: si no tienes `fonts/*.woff2`, bájalas de Google Fonts
(Playfair Display 700 + 700 italic, Inter 400 + 600), guárdalas como
`playfair700.woff2`, `playfair700i.woff2`, `inter400.woff2`, `inter600.woff2`.

---

## 7. Regla de idioma

- **Títulos/etiquetas en inglés:** catálogo (AXIOM 001, PRINCIPLE 001, D-001,
  MM-001) y nombres de Mental Model/Framework (The Four Pillars…).
- **Todo lo que se lee, en español:** frases, nodos, prosa, definiciones.
- Caption del post: siempre español.

---

## 8. Checklist antes de entregar

- [ ] ¿Fondo hueso `#FAF9F6` + marco hairline dorado?
- [ ] ¿Titular en serif Playfair, palabra clave en itálica oro?
- [ ] ¿Oro usado solo como acento (kicker/regla/clave/resultado)?
- [ ] ¿Firma GUILLERMO PADILLA / @meminpadilla / M · H · D · P?
- [ ] ¿Sin emojis, sin dibujos a mano, sin degradados?
- [ ] ¿Títulos en inglés, todo lo demás en español?
- [ ] ¿1080×1350, exportado y comprimido?

---

## Nota

Este es el estilo de la **máquina de contenido MHDP** (IG @meminpadilla /
TikTok @m1606x). El estilo pizarrón/whiteboard es SOLO de Built to Serve en
LinkedIn. No los mezcles: cada plataforma, su estilo; misma filosofía y voz.
