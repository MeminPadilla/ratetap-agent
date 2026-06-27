# agent/main.py — Servidor FastAPI + Webhook de WhatsApp
# Generado por AgentKit para RateTap

"""
Servidor principal del agente Tap.
Funciona con cualquier proveedor (Whapi, Meta, Twilio) gracias a la capa de providers.
"""

import os
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import PlainTextResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

from agent.brain import generar_respuesta
from agent.briefing import generar_briefing
from agent.memory import inicializar_db, guardar_mensaje, obtener_historial
from agent.providers import obtener_proveedor

load_dotenv()

# Configuración de logging según entorno
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
log_level = logging.DEBUG if ENVIRONMENT == "development" else logging.INFO
logging.basicConfig(level=log_level)
logger = logging.getLogger("agentkit")

# Proveedor de WhatsApp (se configura en .env con WHATSAPP_PROVIDER)
proveedor = obtener_proveedor()
PORT = int(os.getenv("PORT", 8000))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicializa la base de datos al arrancar el servidor."""
    await inicializar_db()
    logger.info("Base de datos inicializada")
    logger.info(f"Servidor AgentKit corriendo en puerto {PORT}")
    logger.info(f"Proveedor de WhatsApp: {proveedor.__class__.__name__}")
    yield


app = FastAPI(
    title="AgentKit — Tap (RateTap)",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/")
async def health_check():
    """Endpoint de salud para Railway/monitoreo."""
    return {"status": "ok", "service": "agentkit", "agente": "Tap", "negocio": "RateTap"}


# ── Sistema de Capacitación La Estancia ──────────────────────────
# Carpeta con la app web de capacitación (HTML + assets)
CAPACITACION_DIR = Path(__file__).resolve().parent.parent / "training-system"


class BriefingRequest(BaseModel):
    """Datos del formulario del Generador de Briefings."""
    tema: str
    turno: str = "Día normal entre semana"
    tono: str = "Inspirador y firme"
    contexto: str = ""


@app.post("/briefing")
async def briefing_handler(payload: BriefingRequest):
    """
    Genera un briefing para el equipo de meseros usando Claude.
    La ANTHROPIC_API_KEY vive en el servidor — nunca se expone al navegador.
    """
    try:
        texto = await generar_briefing(
            tema=payload.tema,
            turno=payload.turno,
            tono=payload.tono,
            contexto=payload.contexto,
        )
        return {"briefing": texto}
    except ValueError as e:
        # Falta el tema u otra validación de entrada
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generando briefing: {e}")
        raise HTTPException(
            status_code=502,
            detail="No se pudo generar el briefing. Intenta de nuevo en unos minutos.",
        )


@app.get("/capacitacion")
async def capacitacion_index():
    """Sirve la app web del Sistema de Capacitación de La Estancia."""
    index = CAPACITACION_DIR / "index.html"
    if not index.exists():
        raise HTTPException(status_code=404, detail="Sistema de capacitación no encontrado")
    return FileResponse(index)


# Servir cualquier asset estático adicional de la carpeta de capacitación
if CAPACITACION_DIR.exists():
    app.mount(
        "/capacitacion-assets",
        StaticFiles(directory=CAPACITACION_DIR),
        name="capacitacion-assets",
    )


@app.get("/webhook")
async def webhook_verificacion(request: Request):
    """Verificación GET del webhook (requerido por Meta Cloud API, no-op para otros)."""
    resultado = await proveedor.validar_webhook(request)
    if resultado is not None:
        return PlainTextResponse(str(resultado))
    return {"status": "ok"}


@app.post("/webhook")
async def webhook_handler(request: Request):
    """
    Recibe mensajes de WhatsApp via Twilio.
    Procesa el mensaje, genera respuesta con Claude y la envía de vuelta.
    """
    try:
        logger.debug(f"Webhook recibido — Content-Type: {request.headers.get('content-type', 'no definido')}")

        # Parsear webhook — Twilio normaliza el formato a MensajeEntrante
        mensajes = await proveedor.parsear_webhook(request)

        for msg in mensajes:
            # Ignorar mensajes propios o vacíos
            if msg.es_propio or not msg.texto:
                continue

            logger.info(f"[1/4] Mensaje recibido de {msg.telefono}: {msg.texto}")

            historial = await obtener_historial(msg.telefono)
            logger.info(f"[2/4] Historial obtenido ({len(historial)} mensajes)")

            respuesta = await generar_respuesta(msg.texto, historial, telefono=msg.telefono)
            logger.info(f"[3/4] Respuesta generada: {respuesta[:80]}")

            await guardar_mensaje(msg.telefono, "user", msg.texto)
            await guardar_mensaje(msg.telefono, "assistant", respuesta)
            logger.info(f"[4/4] Llamando enviar_mensaje a {msg.telefono}")

            resultado = await proveedor.enviar_mensaje(msg.telefono, respuesta)
            logger.info(f"[4/4] enviar_mensaje resultado: {resultado}")

        return {"status": "ok"}

    except Exception as e:
        logger.error(f"Error en webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))
