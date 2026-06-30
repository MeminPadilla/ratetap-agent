# Graphics — generador de gráficos Built to Serve

Genera los gráficos de LinkedIn en estilo **pizarrón a mano** (marcador), el
estilo de la marca. Formato 4:5 (1080×1350) — el de mejor rendimiento en
LinkedIn. Salida con el wordmark BUILT TO SERVE y la firma de Guillermo.

## Cómo regenerar

```bash
cd built-to-serve/tools/graphics
python3 embed_fonts.py     # arma fonts/fonts.css (fuentes embebidas, sin internet)
python3 gen.py             # genera post1.html, post2.html, post3.html
node render.mjs            # rasteriza a post1.png, post2.png, post3.png
```

Requisitos: Python 3, Node con `playwright` + Chromium. Si `playwright` no
resuelve, usa `NODE_PATH=/opt/node22/lib/node_modules node render.mjs`.

Los PNG finales viven en `built-to-serve/library/assets/`.

## Estilo (paleta y tipografías)

- Fondo pizarrón cálido `#f7f5ef`, marco aluminio.
- Tinta navy `#20304f`, acento rojo `#c0392b`, subrayado azul `#2f6fb0`.
- Títulos: *Permanent Marker*. Cuerpo: *Kalam*. Frases: *Caveat*.
  (Google Fonts, licencia OFL — incluidas en `fonts/`.)

## Editar contenido

Cada post es una variable (`post1`, `post2`, `post3`) en `gen.py`. Cambia el
texto ahí y vuelve a correr los tres comandos. Para cambiar de marca (colores,
firma, wordmark) edita el bloque `:root` y el footer en `HEAD`/`FOOT`.

> Los `.html` y `.png` de trabajo se regeneran; no se versionan (ver
> `.gitignore`). El entregable versionado son los PNG en `library/assets/`.
