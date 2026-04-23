# agent/tools.py — Herramientas del agente Tap
# Generado por AgentKit para RateTap

"""
Herramientas específicas de RateTap para el agente Tap.
Cubre tres casos de uso: FAQ, calificación de leads y soporte post-venta.
"""

import os
import yaml
import logging
from datetime import datetime

logger = logging.getLogger("agentkit")


def cargar_info_negocio() -> dict:
    """Carga la información del negocio desde business.yaml."""
    try:
        with open("config/business.yaml", "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        logger.error("config/business.yaml no encontrado")
        return {}


def obtener_horario() -> dict:
    """Retorna el horario de atención y si RateTap está disponible ahora."""
    info = cargar_info_negocio()
    hora_actual = datetime.now().hour
    # Horario: 9am a 10pm hora México (UTC-6)
    esta_en_horario = 9 <= hora_actual < 22
    return {
        "horario": info.get("negocio", {}).get("horario", "Lunes a domingo de 9am a 10pm hora de México"),
        "esta_abierto": esta_en_horario,
    }


def buscar_en_knowledge(consulta: str) -> str:
    """
    Busca información relevante en los archivos de /knowledge.
    Retorna el contenido más relevante encontrado.
    """
    resultados = []
    knowledge_dir = "knowledge"

    if not os.path.exists(knowledge_dir):
        return "No hay archivos de conocimiento disponibles."

    for archivo in os.listdir(knowledge_dir):
        ruta = os.path.join(knowledge_dir, archivo)
        if archivo.startswith(".") or not os.path.isfile(ruta):
            continue
        try:
            with open(ruta, "r", encoding="utf-8") as f:
                contenido = f.read()
                if consulta.lower() in contenido.lower():
                    resultados.append(f"[{archivo}]: {contenido[:800]}")
        except (UnicodeDecodeError, IOError):
            continue

    if resultados:
        return "\n---\n".join(resultados)
    return "No encontré información específica sobre eso en mis archivos."


def obtener_info_precio() -> dict:
    """Retorna los datos de precio y trial de RateTap."""
    return {
        "precio_mensual": "$700 MXN",
        "trial_dias": 15,
        "contrato": False,
        "cancelacion": "en cualquier momento, sin penalización",
        "registro_url": "app.ratetapmx.com/contacto",
    }


def obtener_caso_exito() -> dict:
    """Retorna el caso de éxito de La Estancia Argentina para cerrar ventas."""
    return {
        "cliente": "La Estancia Argentina León",
        "resultado_estrellas": "De 4.5 a 4.7 estrellas en Google en 90 días",
        "resenas_enviadas": 1099,
        "resenas_negativas_interceptadas": 146,
        "periodo": "90 días",
    }


def registrar_interes_lead(telefono: str, nombre_negocio: str, giro: str) -> str:
    """
    Registra el interés de un lead para seguimiento posterior.
    Retorna un mensaje de confirmación.
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    logger.info(f"[LEAD] {timestamp} | {telefono} | {nombre_negocio} | {giro}")
    return f"Lead registrado: {nombre_negocio} ({giro}) — {timestamp}"


def escalar_a_soporte(telefono: str, descripcion_problema: str) -> str:
    """
    Escala un problema técnico al equipo humano de RateTap.
    Retorna confirmación de escalamiento.
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    logger.info(f"[SOPORTE] {timestamp} | {telefono} | {descripcion_problema}")
    return "Escalado al equipo técnico de RateTap"
