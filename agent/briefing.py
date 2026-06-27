# agent/briefing.py — Generador de briefings de La Estancia (lado servidor)
# Generado por AgentKit

"""
Lógica del Generador de Briefings del Sistema de Capacitación de
La Estancia Argentina León.

La llamada a Claude vive AQUÍ (en el servidor) para que la ANTHROPIC_API_KEY
nunca quede expuesta en el navegador. El HTML de capacitación llama al
endpoint POST /briefing y este módulo arma el comunicado con la estructura
de la casa.
"""

import os
import logging
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("agentkit")

# Reutilizamos un cliente asíncrono propio para el briefing
_client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

MODELO = "claude-sonnet-4-6"
MAX_TOKENS = 1600

# System prompt — el coach de liderazgo de La Estancia
SYSTEM_PROMPT = """Eres el coach de liderazgo de La Estancia Argentina León, un steakhouse premium. Tu trabajo es ayudar a un jefe de piso a redactar el briefing perfecto para su equipo de meseros, ENSEÑÁNDOLE a comunicar como líder.

ESTRUCTURA OBLIGATORIA del briefing (la cultura de la casa). Úsala SIEMPRE, con estos 6 puntos en orden:
1. EL NÚMERO Y EL CONTEXTO — reservaciones, hora pico, mesas grandes, festejos del día.
2. LA META EMOCIONAL DEL DÍA — una frase tipo "hoy no se vende comida, hoy se vende ___". La meta del equipo NUNCA es dinero; es sensorial (memoria, hospitalidad, festejar a la mesa).
3. QUIÉN HACE QUÉ, QUIÉN APOYA A QUIÉN — estaciones y pares de apoyo pre-mapeados.
4. ANTICIPACIÓN "QUÉ HACER SI..." — mínimo 4 escenarios concretos del tema del día.
5. LA REGLA DEL 1 — resuelve antes de pedir ayuda.
6. EL CIERRE QUE ENCIENDE — una frase de propósito que prenda al equipo.

FILOSOFÍA de la casa: tres pilares — Hospitalidad, Disciplina, Profesionalismo. Modelo de confianza y flujo ("fluye fluye fluye"), no supervisión punitiva. Tono directo, firme e inspirador, pero NUNCA regañón ni corporativo.

REGLAS DE ESTILO:
- Español mexicano casual de restaurante, como habla un gerente real a su equipo.
- NADA de citas de libros ni referencias académicas. Todo se lee como cultura propia de La Estancia.
- Usa **negritas** (markdown) para las frases clave que el jefe debe enfatizar.
- Encabeza cada uno de los 6 puntos con su nombre en negritas y un tiempo sugerido entre paréntesis.
- Producto real para los ejemplos: cortes (Tomahawk $2,150, Rib-Eye Akaushi $1,350, Arrachera, Filete Estancia), vinos de la casa Julia y Camperos (empujarlos hasta agotar), display de postres, reseñas RateTap.
- Que sea LEÍBLE EN VOZ ALTA en círculo. Longitud: completo pero no eterno (el jefe lo lee en ~5-8 min).
- Termina con UNA línea de coaching para el jefe (precedida de "—") sobre cómo darlo mejor: dónde hacer pausa, a quién mirar, cómo bajar el tono para que pegue."""


def _construir_mensaje_usuario(tema: str, turno: str, tono: str, contexto: str) -> str:
    """Arma el prompt de usuario con los datos del formulario."""
    partes = [
        "Arma el briefing.",
        f"TEMA QUE QUIERE TRATAR EL JEFE: {tema}",
        f"TURNO/OCASIÓN: {turno}",
        f"TONO DESEADO: {tono}",
    ]
    if contexto:
        partes.append(f"CONTEXTO DEL DÍA: {contexto}")
    partes.append(
        "\nDevuelve SOLO el briefing redactado y listo para leer, con los 6 puntos. "
        'Nada de preámbulos como "aquí está tu briefing".'
    )
    return "\n".join(partes)


async def generar_briefing(
    tema: str,
    turno: str = "Día normal entre semana",
    tono: str = "Inspirador y firme",
    contexto: str = "",
) -> str:
    """
    Genera un briefing con Claude usando la estructura de La Estancia.

    Args:
        tema:     De qué quiere hablar el jefe (obligatorio).
        turno:    Turno u ocasión del día.
        tono:     Tono deseado del comunicado.
        contexto: Contexto opcional del día.

    Returns:
        El briefing en texto (con **negritas** estilo markdown).

    Raises:
        ValueError: si no se proporciona un tema.
        Exception:  si la API de Claude falla (la maneja el endpoint).
    """
    if not tema or not tema.strip():
        raise ValueError("Escribe primero de qué quieres hablar en el briefing.")

    usuario = _construir_mensaje_usuario(
        tema.strip(), turno.strip(), tono.strip(), contexto.strip()
    )

    response = await _client.messages.create(
        model=MODELO,
        max_tokens=MAX_TOKENS,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": usuario}],
    )

    texto = "\n".join(b.text for b in response.content if b.type == "text").strip()
    logger.info(
        f"Briefing generado ({response.usage.input_tokens} in / "
        f"{response.usage.output_tokens} out)"
    )
    return texto
