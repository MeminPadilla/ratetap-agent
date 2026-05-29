# RateTap · Herramienta de Ventas

Herramienta de ventas de campo (tipo app móvil) para que un vendedor visite
restaurantes y los convenza de suscribirse directo con el link de Stripe.

Implementada a partir del diseño de Claude Design (handoff "PITCH VENTAS").

## Dos modos

- **🎤 Presentar** — lo que ve el gerente: 7 pantallas grandes y limpias
  (gancho → captura real de Google → caso La Estancia → cómo funciona → el
  stack → la oferta → cierre con QR + botón a `app.ratetapmx.com/contacto`).
  Cada pantalla trae una franja dorada "Tú" con la indicación privada de qué
  decir (teleprompter del vendedor).
- **🎯 Vendedor** — solo para el vendedor: guion de 5 actos, arsenal de
  objeciones con buscador, números de bolsillo, calculadora de comisiones con
  slider, y checklist que se guarda en `localStorage`.

## Archivos

- `index.html` — shell de la app (top bar, stage, tab bar)
- `styles.css` — estilos (navy + dorado, Playfair/Inter)
- `content.js` — todo el contenido editable (pitch, objeciones, números, comp, checklist)
- `app.js` — lógica de navegación, swipe, slider, checklist, QR
- `assets/estancia-google.jpeg` — captura real de Google usada en la pantalla 2

## Probar localmente

Es un sitio estático sin build. Sírvelo con cualquier servidor:

```bash
cd pitch-ventas
python3 -m http.server 8080
# abre http://localhost:8080
```

> El QR del cierre se genera en tiempo real vía `api.qrserver.com`, así que
> requiere conexión para mostrarse (si falla, se oculta y queda el botón).

## Para editar el contenido

Todo el texto vive en `content.js`. El precio está alineado al sitio en
**$700 MXN/mes** con trial de 15 días.
