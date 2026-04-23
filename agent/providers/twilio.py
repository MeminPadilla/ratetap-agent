# agent/providers/twilio.py — Adaptador para Twilio WhatsApp
# Generado por AgentKit

import os
import logging
import base64
import httpx
from fastapi import Request
from agent.providers.base import ProveedorWhatsApp, MensajeEntrante

logger = logging.getLogger("agentkit")


class ProveedorTwilio(ProveedorWhatsApp):
    """Proveedor de WhatsApp usando Twilio."""

    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.phone_number = os.getenv("TWILIO_PHONE_NUMBER")

    async def parsear_webhook(self, request: Request) -> list[MensajeEntrante]:
        """Parsea el payload form-encoded de Twilio."""
        form = await request.form()

        # Log de todos los campos recibidos para facilitar debugging
        campos = dict(form)
        logger.debug(f"Twilio webhook campos recibidos: {list(campos.keys())}")

        # Twilio envía el texto en "Body" (capital B)
        texto = form.get("Body") or form.get("body") or ""
        telefono = (form.get("From") or "").replace("whatsapp:", "")
        mensaje_id = form.get("MessageSid") or ""

        if not texto:
            logger.warning(f"Webhook recibido sin texto. Campos disponibles: {list(campos.keys())}")
            return []

        logger.debug(f"Mensaje parseado — de: {telefono}, texto: {texto[:50]}")
        return [MensajeEntrante(
            telefono=telefono,
            texto=texto,
            mensaje_id=mensaje_id,
            es_propio=False,
        )]

    async def enviar_mensaje(self, telefono: str, mensaje: str) -> bool:
        """Envía mensaje via Twilio API."""
        if not all([self.account_sid, self.auth_token, self.phone_number]):
            logger.warning("Variables de Twilio no configuradas — mensaje no enviado")
            return False

        # Asegurar que el número destino tenga el prefijo whatsapp:
        to = f"whatsapp:{telefono}" if not telefono.startswith("whatsapp:") else telefono

        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
        auth = base64.b64encode(f"{self.account_sid}:{self.auth_token}".encode()).decode()
        headers = {"Authorization": f"Basic {auth}"}
        data = {
            "From": f"whatsapp:{self.phone_number}",
            "To": to,
            "Body": mensaje,
        }

        logger.debug(f"Enviando a {to} desde whatsapp:{self.phone_number}")

        async with httpx.AsyncClient() as client:
            r = await client.post(url, data=data, headers=headers)
            if r.status_code != 201:
                logger.error(f"Error Twilio {r.status_code}: {r.text}")
                return False
            logger.info(f"Mensaje enviado correctamente a {to}")
            return True
