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
        pass

    async def parsear_webhook(self, request: Request) -> list[MensajeEntrante]:
        """Parsea el payload form-encoded de Twilio."""
        form = await request.form()

        # Log de todos los campos recibidos para facilitar debugging
        campos = dict(form)
        logger.info(f"Twilio webhook — campos recibidos: {campos}")

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
        logger.info(f"enviar_mensaje llamado — destino: {telefono}, largo mensaje: {len(mensaje)}")
        account_sid  = os.environ.get("TWILIO_ACCOUNT_SID")
        auth_token   = os.environ.get("TWILIO_AUTH_TOKEN")
        phone_number = os.environ.get("TWILIO_PHONE_NUMBER")

        faltantes = [k for k, v in {
            "TWILIO_ACCOUNT_SID": account_sid,
            "TWILIO_AUTH_TOKEN": auth_token,
            "TWILIO_PHONE_NUMBER": phone_number,
        }.items() if not v]

        if faltantes:
            logger.error(f"Variables de Twilio faltantes: {faltantes}")
            return False

        to = f"whatsapp:{telefono}" if not telefono.startswith("whatsapp:") else telefono

        url  = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        auth = base64.b64encode(f"{account_sid}:{auth_token}".encode()).decode()
        data = {
            "From": f"whatsapp:{phone_number}",
            "To":   to,
            "Body": mensaje,
        }

        logger.info(f"Enviando a {to} desde whatsapp:{phone_number}")

        async with httpx.AsyncClient() as client:
            r = await client.post(url, data=data, headers={"Authorization": f"Basic {auth}"})
            if r.status_code != 201:
                logger.error(f"Error Twilio {r.status_code}: {r.text}")
                return False
            logger.info(f"Mensaje enviado correctamente a {to}")
            return True
