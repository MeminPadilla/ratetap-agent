# agent/brain.py — Cerebro del agente Tap: conexión con Claude API
# Generado por AgentKit para RateTap

"""
Lógica de IA del agente. Lee el system prompt de prompts.yaml
y genera respuestas usando la API de Anthropic Claude.
"""

import os
import json
import yaml
import logging
from anthropic import AsyncAnthropic
from dotenv import load_dotenv
from agent.tools import TOOLS_FOR_CLAUDE, execute_tool

load_dotenv()
logger = logging.getLogger("agentkit")

# Cliente de Anthropic
client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def cargar_config_prompts() -> dict:
    """Lee toda la configuración desde config/prompts.yaml."""
    try:
        with open("config/prompts.yaml", "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except FileNotFoundError:
        logger.error("config/prompts.yaml no encontrado")
        return {}


def cargar_system_prompt() -> str:
    """Lee el system prompt desde config/prompts.yaml."""
    config = cargar_config_prompts()
    return config.get("system_prompt", "Eres Tap, asistente de RateTap. Responde en español mexicano.")


def obtener_mensaje_error() -> str:
    """Retorna el mensaje de error configurado en prompts.yaml."""
    config = cargar_config_prompts()
    return config.get("error_message", "Ahorita tengo un problema técnico, intenta de nuevo en unos minutos.")


def obtener_mensaje_fallback() -> str:
    """Retorna el mensaje de fallback configurado en prompts.yaml."""
    config = cargar_config_prompts()
    return config.get("fallback_message", "No entendí bien tu mensaje, ¿me lo puedes repetir?")


async def generar_respuesta(mensaje: str, historial: list[dict], telefono: str = "") -> str:
    """
    Genera una respuesta usando Claude API.

    Args:
        mensaje:   El mensaje nuevo del usuario
        historial: Lista de mensajes anteriores [{"role": "user/assistant", "content": "..."}]
        telefono:  Número del remitente (inyectado en el system prompt para que las tools lo usen)

    Returns:
        La respuesta de texto final generada por Claude como Tap
    """
    if not mensaje or len(mensaje.strip()) < 2:
        return obtener_mensaje_fallback()

    system_prompt = cargar_system_prompt()

    # Inyectar el teléfono en el system prompt para que Claude lo pase a las tools
    if telefono:
        system_prompt = f"[Contexto: el prospecto está escribiendo desde el número {telefono}]\n\n{system_prompt}"

    # Construir mensajes para la API
    mensajes = []
    for msg in historial:
        mensajes.append({"role": msg["role"], "content": msg["content"]})
    mensajes.append({"role": "user", "content": mensaje})

    try:
        MAX_ITER = 5
        for _ in range(MAX_ITER):
            response = await client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                system=system_prompt,
                messages=mensajes,
                tools=TOOLS_FOR_CLAUDE,
            )
            logger.info(
                f"Claude ({response.usage.input_tokens} in / {response.usage.output_tokens} out) "
                f"stop_reason={response.stop_reason}"
            )

            if response.stop_reason == "end_turn":
                text_blocks = [b for b in response.content if b.type == "text"]
                return text_blocks[0].text if text_blocks else obtener_mensaje_fallback()

            if response.stop_reason == "tool_use":
                # Ejecutar todas las tools que el modelo pidió
                tool_results = []
                for block in response.content:
                    if block.type == "tool_use":
                        logger.info(f"Tool invocada: {block.name} | args: {block.input}")
                        result = await execute_tool(block.name, block.input)
                        logger.info(f"Tool resultado: {result}")
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": json.dumps(result, ensure_ascii=False),
                        })

                # Agregar turno del asistente + resultados al historial del loop
                mensajes.append({"role": "assistant", "content": response.content})
                mensajes.append({"role": "user", "content": tool_results})
                continue

            # stop_reason inesperado — extraer texto si hay y salir
            logger.warning(f"stop_reason inesperado: {response.stop_reason}")
            text_blocks = [b for b in response.content if b.type == "text"]
            return text_blocks[0].text if text_blocks else obtener_mensaje_fallback()

        # Límite de iteraciones alcanzado — devolver el último texto disponible
        logger.warning("Límite de iteraciones tool_use alcanzado")
        text_blocks = [b for b in response.content if b.type == "text"]
        return text_blocks[0].text if text_blocks else obtener_mensaje_fallback()

    except Exception as e:
        logger.error(f"Error Claude API: {e}")
        return obtener_mensaje_error()
