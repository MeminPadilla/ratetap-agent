# The Knowledge Graph

> No es un catálogo plano. Es una red. Cada elemento del canon nace de otro y
> puede rastrearse hasta un Axioma. Eso es lo que convierte una colección de
> ideas en una **escuela de pensamiento**.

La fuente de verdad es [`graph.json`](graph.json) (nodos + aristas tipadas).
Este documento es su lectura humana.

---

## Tipos de nodo

| Tipo | Qué es | Prefijo |
|------|--------|---------|
| **Axiom** | Verdad fundacional. No se argumenta, se asume. | `AXIOM 00X` |
| **Principle** | Aplicación observable de un axioma. | `PRINCIPLE 00X` |
| **Mental Model** | Una forma de pensar. Cambia cómo ves. | `MM-00X` |
| **Framework** | Un proceso repetible. Cómo se ejecuta. | `FW-00X` |
| **Definition** | El lenguaje oficial. Redefine una palabra. | `D-00X` |
| **Field Note** | Una observación real que demuestra una idea. | `FN-00X` |
| **Whiteboard** | La representación visual de un nodo. | `WB-00X` |

> *Field Note* y *Whiteboard* son tipos definidos y listos para poblarse:
> el Field Note documenta un caso real del piso; el Whiteboard es el gráfico.

## Vocabulario de relaciones (aristas)

```
AXIOM        — inspira →            PRINCIPLE
PRINCIPLE    — explicado por →      MENTAL MODEL
MENTAL MODEL — ejecutado mediante → FRAMEWORK
FRAMEWORK    — demostrado en →      FIELD NOTE
FIELD NOTE   — convertido en →      WHITEBOARD
DEFINITION   — define →             (cualquier nodo)
```

## Un hilo real (ya existe en el canon)

```
AXIOM 002  · El liderazgo es servicio.
   ↓ inspira
PRINCIPLE 004  · Servir → Confianza → Liderazgo
   ↓ explicado por
MENTAL MODEL 002  · The Leadership Loop
   ↓ ejecutado mediante
FRAMEWORK 001  · The Daily Briefing
```

Representado en `assets/graph-thread-leadership.png`.

## Aristas actuales (resumen)

- **AXIOM 001 / 003** inspiran **PRINCIPLE 001** (Personas → Cultura → Negocio)
- **AXIOM 004** inspira **PRINCIPLE 002** (Disciplina → Constancia → Excelencia)
- **AXIOM 003** inspira **PRINCIPLE 003** (Hospitalidad → Experiencia → Lealtad)
- **AXIOM 002** inspira **PRINCIPLE 004** (Servir → Confianza → Liderazgo)
- **PRINCIPLE 002** explicado por **MM-001** (The Four Pillars)
- **PRINCIPLE 004** explicado por **MM-002** (The Leadership Loop)
- **MM-002** ejecutado mediante **FW-001** (The Daily Briefing)
- **D-001** define Hospitalidad · **D-003** Cultura · **D-004** Liderazgo · **D-002** Profesionalismo

## Cómo crece

Cada nodo nuevo se registra en `graph.json` con su tipo y al menos una arista a
un nodo existente. **Regla del Archivist:** ningún nodo entra al grafo huérfano.
Si una idea no se conecta con nada, todavía no entiendes de dónde nace — y no
entra hasta que lo entiendas.
