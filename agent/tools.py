"""
Herramientas (tools) que Claude puede llamar durante la conversación.

Cada tool tiene 2 partes:
  1. La definición JSON-Schema (TOOLS_FOR_CLAUDE) que se pasa a la API
  2. La implementación Python (TOOL_IMPLEMENTATIONS) que se ejecuta cuando Claude la invoca
"""

import os
import logging
import yaml
import httpx
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

# ============================================================
# Config
# ============================================================

NOTION_API_KEY = os.environ.get("NOTION_API_KEY")
NOTION_DATABASE_ID = os.environ.get("NOTION_DATABASE_ID")
GUILLERMO_WHATSAPP = os.environ.get("GUILLERMO_WHATSAPP", "+5213311479086")

TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER")  # Sandbox: +14155238886


# ============================================================
# Tool implementations
# ============================================================

async def crear_lead_en_notion(
    negocio: str,
    contacto: str,
    telefono: str,
    ciudad: str | None = None,
    notas: str | None = None,
) -> dict:
    """
    Crea una página nueva en el CRM de Notion con los datos del lead.
    Retorna {success: bool, lead_url: str, lead_id: str, error: str|None}.
    """
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        logger.error("Notion credentials missing")
        return {"success": False, "error": "Notion no configurado"}

    # Validar ciudad contra opciones del CRM
    ciudades_validas = ["León", "CDMX", "Guadalajara", "Monterrey", "Puebla", "Querétaro", "Otra"]
    ciudad_normalizada = None
    if ciudad:
        for c in ciudades_validas:
            if c.lower() in ciudad.lower() or ciudad.lower() in c.lower():
                ciudad_normalizada = c
                break
        if not ciudad_normalizada:
            ciudad_normalizada = "Otra"
            if notas:
                notas = f"Ciudad mencionada: {ciudad}. {notas}"
            else:
                notas = f"Ciudad mencionada: {ciudad}"

    properties = {
        "Negocio": {"title": [{"text": {"content": negocio}}]},
        "Contacto": {"rich_text": [{"text": {"content": contacto}}]},
        "Teléfono": {"phone_number": telefono},
        "Etapa": {"select": {"name": "🆕 Lead Nuevo"}},
        "Fuente": {"select": {"name": "WhatsApp Bot"}},
        "Tipo de Negocio": {"select": {"name": "Restaurante"}},
    }

    if ciudad_normalizada:
        properties["Ciudades"] = {"select": {"name": ciudad_normalizada}}
    if notas:
        properties["Notas"] = {"rich_text": [{"text": {"content": notas[:2000]}}]}

    payload = {
        "parent": {"database_id": NOTION_DATABASE_ID},
        "properties": properties,
    }

    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                "https://api.notion.com/v1/pages",
                headers=headers,
                json=payload,
            )
            r.raise_for_status()
            data = r.json()
            lead_id = data.get("id", "")
            lead_url = data.get("url", "")
            logger.info(f"Lead creado en Notion: {negocio} ({contacto}) — {lead_url}")
            return {
                "success": True,
                "lead_id": lead_id,
                "lead_url": lead_url,
                "error": None,
            }
    except httpx.HTTPStatusError as e:
        logger.error(f"Notion API error {e.response.status_code}: {e.response.text}")
        return {"success": False, "error": f"Notion API {e.response.status_code}"}
    except Exception as e:
        logger.exception("Error creando lead en Notion")
        return {"success": False, "error": str(e)}


async def notificar_a_guillermo(
    negocio: str,
    contacto: str,
    telefono: str,
    resumen: str,
    lead_url: str | None = None,
) -> dict:
    """
    Envía un WhatsApp a Guillermo con el resumen del lead nuevo.
    Usa la API REST de Twilio directamente para reusar la misma cuenta del bot.
    Retorna {success: bool, error: str|None}.
    """
    if not (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER):
        logger.error("Twilio credentials missing")
        return {"success": False, "error": "Twilio no configurado"}

    mensaje = (
        f"🎯 *Nuevo Lead RateTap*\n\n"
        f"*Negocio:* {negocio}\n"
        f"*Contacto:* {contacto}\n"
        f"*Teléfono:* {telefono}\n\n"
        f"*Resumen:* {resumen}\n"
    )
    if lead_url:
        mensaje += f"\n📋 Ver en Notion:\n{lead_url}\n"
    mensaje += f"\n_Capturado: {datetime.now().strftime('%d %b %H:%M')}_"

    url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
    data = {
        "From": f"whatsapp:{TWILIO_PHONE_NUMBER}",
        "To": f"whatsapp:{GUILLERMO_WHATSAPP}",
        "Body": mensaje,
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                url,
                data=data,
                auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
            )
            if r.status_code != 201:
                logger.error(f"Twilio error {r.status_code}: {r.text}")
                return {"success": False, "error": f"Twilio {r.status_code}"}
            logger.info(f"Notificación enviada a Guillermo: {negocio} ({contacto})")
            return {"success": True, "error": None}
    except Exception as e:
        logger.exception("Error notificando a Guillermo")
        return {"success": False, "error": str(e)}


# ============================================================
# Tool registry — esto es lo que brain.py va a importar
# ============================================================

TOOLS_FOR_CLAUDE = [
    {
        "name": "crear_lead_en_notion",
        "description": (
            "Guarda un lead nuevo en el CRM de Notion. "
            "USAR ÚNICAMENTE cuando ya tengas estos 3 datos confirmados de la conversación: "
            "1) nombre de la persona (contacto), "
            "2) nombre del restaurante o negocio (negocio), "
            "3) teléfono (telefono — si el prospecto está escribiendo por WhatsApp, usa el número desde el cual escribe). "
            "NO inventes datos. Si te falta uno de los 3, NO llames esta función — sigue conversando para obtenerlo."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "negocio": {
                    "type": "string",
                    "description": "Nombre del restaurante o negocio del prospecto. Ejemplo: 'La Estancia Argentina León'.",
                },
                "contacto": {
                    "type": "string",
                    "description": "Nombre completo de la persona con la que estás conversando. Ejemplo: 'Carlos Gómez'.",
                },
                "telefono": {
                    "type": "string",
                    "description": "Teléfono con formato internacional, ej. '+5214771234567'. Si llega por WhatsApp, es el número del remitente.",
                },
                "ciudad": {
                    "type": "string",
                    "description": "Ciudad del negocio, si fue mencionada. Opciones: León, CDMX, Guadalajara, Monterrey, Puebla, Querétaro, Otra.",
                },
                "notas": {
                    "type": "string",
                    "description": "Contexto extra mencionado en la conversación: número de sucursales, urgencia, problema específico, etc.",
                },
            },
            "required": ["negocio", "contacto", "telefono"],
        },
    },
    {
        "name": "notificar_a_guillermo",
        "description": (
            "Envía notificación por WhatsApp a Guillermo (dueño del negocio) avisándole de un lead nuevo o de algo urgente. "
            "USAR EN ESTOS DOS CASOS: "
            "(A) INMEDIATAMENTE después de un crear_lead_en_notion exitoso — para que Guillermo sepa que llegó lead nuevo. "
            "(B) Si el prospecto pide hablar con un humano, o hace una pregunta que NO puedes responder con seguridad."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "negocio": {"type": "string"},
                "contacto": {"type": "string"},
                "telefono": {"type": "string"},
                "resumen": {
                    "type": "string",
                    "description": "Resumen 1-2 líneas de qué pidió el prospecto y por qué deberías contactarlo pronto. Ejemplo: 'Pregunta por precio para 3 sucursales en León. Interesado.'",
                },
                "lead_url": {
                    "type": "string",
                    "description": "URL de Notion del lead recién creado, si existe. Lo retorna crear_lead_en_notion.",
                },
            },
            "required": ["negocio", "contacto", "telefono", "resumen"],
        },
    },
]


# Mapping de nombre -> función real, para que brain.py pueda dispatcher
TOOL_IMPLEMENTATIONS = {
    "crear_lead_en_notion": crear_lead_en_notion,
    "notificar_a_guillermo": notificar_a_guillermo,
}


async def execute_tool(name: str, params: dict) -> dict:
    """Dispatcher: ejecuta la tool por nombre. Retorna dict serializable."""
    impl = TOOL_IMPLEMENTATIONS.get(name)
    if not impl:
        logger.error(f"Tool desconocida: {name}")
        return {"success": False, "error": f"Tool desconocida: {name}"}
    try:
        return await impl(**params)
    except TypeError as e:
        logger.error(f"Tool {name} con argumentos inválidos: {e}")
        return {"success": False, "error": f"Argumentos inválidos: {e}"}
    except Exception as e:
        logger.exception(f"Tool {name} falló")
        return {"success": False, "error": str(e)}


# ============================================================
# Funciones legacy — mantenidas por compatibilidad
# (existían antes pero NO se conectaban al modelo)
# ============================================================

def cargar_info_negocio() -> dict:
    """Lee config/business.yaml — solo usado internamente, no es tool de Claude."""
    path = Path(__file__).parent.parent / "config" / "business.yaml"
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    return {}
