# Sistema de Agentes de Marketing MHDP

6 subagentes de Claude Code para producir el contenido de la marca personal
de Memo Padilla (metodología MHDP). El objetivo: construir autoridad y audiencia
en hospitalidad de alto rendimiento, para después venderle software a esa
audiencia.

## Qué incluye

```
mhdp-agents/
├── CLAUDE.md                         # Reglas permanentes del proyecto
├── README.md                         # Este archivo
└── .claude/
    └── agents/
        ├── coordinador.md            # Orquesta a los otros 5
        ├── estratega-contenido.md    # Decide QUÉ publicar
        ├── guionista.md              # Escribe los guiones
        ├── disenador-carruseles.md   # Carruseles y frases-imagen
        ├── adaptador-multiplataforma.md  # Adapta a IG y TikTok
        └── analista-rendimiento.md   # Lee métricas, cierra el loop
```

## Instalación

1. Copia la carpeta `.claude/` y el `CLAUDE.md` a la raíz de tu proyecto de
   Claude Code (o usa esta carpeta directamente como el proyecto).
2. Abre Claude Code en esa carpeta.
3. Verifica que los agentes cargaron con el comando `/agents`.

Claude Code lee automáticamente `.claude/agents/*.md` como subagentes y el
`CLAUDE.md` de la raíz como contexto permanente del proyecto.

## Cómo se usa

El agente que manejas casi siempre es el **coordinador**. Ejemplos de lo que le
puedes pedir:

- "Dame la semana completa de contenido." → corre el flujo entero.
- "Produce esta idea hasta dejarla lista para publicar: [idea]."
- "Aquí están las métricas de la semana, dame los aprendizajes." → analista.

También puedes llamar a un especialista directo, por ejemplo:
"Usa el guionista para escribir un face-to-camera sobre [tema]."

## Voz y reglas

Todo está definido en `CLAUDE.md`: voz de autoridad estilo Guidara / Preston Lee,
español de México, sin emojis, 4 pilares (Mentalidad, Hospitalidad, Disciplina,
Profesionalismo), formato face-to-camera como principal, y el estándar visual
(blanco cálido + oro #C9A04E).

## Seguridad

Los agentes que leen datos externos (comentarios, DMs, métricas) tratan ese
contenido como DATOS, nunca como instrucciones. Esto previene inyección de
prompts. La regla vive en `CLAUDE.md` y todos los agentes la heredan.

## Siguiente paso natural

Cuando la marca tenga audiencia, esta misma estructura se replica para vender
software (RateTap y futuros productos). El sistema de contenido es la puerta de
entrada al negocio de software escalable.
