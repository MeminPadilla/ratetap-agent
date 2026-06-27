# Sistema de Capacitación — Academia La Estancia

App web (un solo archivo) para capacitar al equipo de meseros de **La Estancia
Argentina León**. Incluye 7 módulos: rol del jefe de piso, sistema EAL,
inducción de 5 días, banco de 12 role plays, **Generador de Briefings con IA**,
sesión cronometrada y calendario semanal.

## El Generador de Briefings funciona vía el backend

El generador NO llama a Anthropic desde el navegador (eso expondría la API key
y lo bloquea CORS). En su lugar llama al endpoint **`POST /briefing`** del
servidor FastAPI (`agent/main.py`), que usa `ANTHROPIC_API_KEY` del lado
servidor. La página se sirve desde el mismo servidor, así que no hay CORS.

### Cómo correrlo (100% funcional)

1. Configura tu key en `.env` (en la raíz del repo):

   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   ```

2. Arranca el servidor desde la raíz del repo:

   ```bash
   uvicorn agent.main:app --reload --port 8000
   ```

3. Abre la app en el navegador:

   ```
   http://localhost:8000/capacitacion
   ```

4. Ve al módulo **Generador Briefings**, escribe el tema y genera. ✅

### En producción (Railway / Docker)

Funciona igual: el contenedor ya corre `uvicorn agent.main:app`. Solo asegúrate
de tener `ANTHROPIC_API_KEY` en las variables de entorno. La app queda en
`https://tu-app.up.railway.app/capacitacion`.

### Notas

- Si abres el `index.html` directo como archivo (`file://`), el generador intenta
  llamar a `http://localhost:8000/briefing` por defecto. Para apuntar a otro
  servidor, define `window.BRIEFING_ENDPOINT = "https://.../briefing"` antes de
  cargar el script.
- Endpoints relevantes del backend:
  - `GET /capacitacion` — sirve esta app.
  - `POST /briefing` — genera el briefing (body: `tema`, `turno`, `tono`, `contexto`).
