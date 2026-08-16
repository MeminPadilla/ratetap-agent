import os
BASE = os.path.dirname(os.path.abspath(__file__))
FONTS = open(os.path.join(BASE, "fonts", "fonts.css")).read()

HEAD = """<!doctype html><html><head><meta charset="utf-8"><style>
__FONTS__
:root{ --paper:#FAF9F6; --ink:#1A1A1A; --gold:#C9A04E; --wine:#6E202A; --mute:#8B8578; }
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px}
body{background:var(--paper);display:flex;align-items:center;justify-content:center;
  font-family:'Sans',system-ui,sans-serif;color:var(--ink)}
.card{position:relative;width:1080px;height:1350px;background:var(--paper);
  padding:96px 96px 92px;display:flex;flex-direction:column;overflow:hidden}
.card:before{content:"";position:absolute;inset:44px;border:1.5px solid rgba(201,160,78,.55);pointer-events:none}
.kick{font-family:'Sans';font-weight:600;font-size:26px;letter-spacing:8px;color:var(--gold);text-transform:uppercase}
.rule{width:70px;height:2px;background:var(--gold);margin:26px auto 0}
.h{font-family:'Playfair';font-weight:700;color:var(--ink);line-height:1.12}
.h i{font-style:italic;color:var(--gold)}
.sans{font-family:'Sans'}
.body{font-family:'Sans';font-weight:400;color:#3a362e;line-height:1.5}
.sig{position:absolute;left:0;right:0;bottom:82px;text-align:center}
.sig .n{font-family:'Sans';font-weight:600;font-size:24px;letter-spacing:6px;color:var(--ink)}
.sig .h2{font-family:'Sans';font-weight:400;font-size:22px;letter-spacing:2px;color:var(--gold);margin-top:4px}
.sig .mono{font-family:'Sans';font-weight:600;font-size:20px;letter-spacing:10px;color:var(--mute);margin-top:16px}
.flow{display:flex;flex-direction:column;align-items:center;gap:0}
.node{font-family:'Playfair';font-weight:700;font-size:60px;color:var(--ink)}
.node.res{color:var(--gold)}
.conn{width:1.5px;height:56px;background:var(--gold);margin:14px 0;position:relative}
.conn:after{content:"";position:absolute;left:-4px;bottom:0;width:9px;height:9px;
  border-right:1.5px solid var(--gold);border-bottom:1.5px solid var(--gold);transform:rotate(45deg)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:54px 60px;width:100%}
.cell{border-top:1.5px solid rgba(201,160,78,.55);padding-top:18px}
.cell .num{font-family:'Playfair';font-weight:700;font-style:italic;font-size:34px;color:var(--gold)}
.cell .nm{font-family:'Playfair';font-weight:700;font-size:38px;color:var(--ink);margin-top:2px}
.cell .ln{font-family:'Sans';font-size:27px;color:#3a362e;margin-top:8px}
</style></head><body><div class="card">
""".replace("__FONTS__", FONTS)

FOOT = """
<div class="sig">
  <div class="n">GUILLERMO PADILLA</div>
  <div class="h2">@meminpadilla</div>
  <div class="mono">M · H · D · P</div>
</div>
</div></body></html>"""

# ---- Axiom (frase héroe) ----
def axiom(num, statement):
    return f"""
<div style="text-align:center;margin-top:20px"><div class="kick">AXIOM {num}</div><div class="rule"></div></div>
<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:0 20px">
  <div class="h" style="font-size:92px;text-align:center">{statement}</div></div>
<div style="height:150px"></div>
"""

# ---- Principle (flujo editorial) ----
def principle(num, n1, n2, n3, summary):
    return f"""
<div style="text-align:center;margin-top:20px"><div class="kick">PRINCIPLE {num}</div><div class="rule"></div></div>
<div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center">
  <div class="flow">
    <div class="node">{n1}</div><div class="conn"></div>
    <div class="node">{n2}</div><div class="conn"></div>
    <div class="node res">{n3}</div>
  </div></div>
<div style="text-align:center;padding:0 40px 150px">
  <div class="body" style="font-size:40px;font-family:'Playfair';font-style:italic;color:var(--ink)">{summary}</div></div>
"""

# ---- Definition (palabra + significado) ----
def definition(num, word, deftext):
    return f"""
<div style="text-align:center;margin-top:20px"><div class="kick">DEFINITION · D-{num}</div><div class="rule"></div></div>
<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">
  <div class="h" style="font-size:82px"><i>{word}</i></div>
  <div class="body" style="font-size:44px;text-align:center;margin-top:44px;max-width:760px">{deftext}</div></div>
<div style="height:150px"></div>
"""

# ---- Mental Model: The Four Pillars (rejilla editorial) ----
def four_pillars():
    def cell(n, nm, ln):
        return f'<div class="cell"><div class="num">{n}</div><div class="nm">{nm}</div><div class="ln">{ln}</div></div>'
    return f"""
<div style="text-align:center;margin-top:20px">
  <div class="kick">MENTAL MODEL · MM-001</div>
  <div class="h" style="font-size:58px;margin-top:16px">The Four Pillars</div></div>
<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:0 10px">
  <div class="grid">
    {cell("01","Hospitalidad","Servir antes de esperar.")}
    {cell("02","Mentalidad","La actitud se elige.")}
    {cell("03","Profesionalismo","Algo más grande que tú.")}
    {cell("04","Disciplina","Aunque la motivación se vaya.")}
  </div></div>
<div style="text-align:center;padding-bottom:150px">
  <div class="body" style="font-family:'Playfair';font-style:italic;font-size:40px;color:var(--ink)">No son talentos. Son decisiones.</div></div>
"""

AXIOMS = [
    ("axiom-001.html", axiom("001", 'Las personas son la <i>estrategia</i>.')),
    ("axiom-002.html", axiom("002", 'El liderazgo es <i>servicio</i>.')),
    ("axiom-003.html", axiom("003", 'La cultura se construye <i>a diario</i>.')),
    ("axiom-004.html", axiom("004", 'La excelencia es conducta <i>disciplinada</i>.')),
]
PRINCIPLES = [
    ("principle-001.html", principle("001", "Personas", "Cultura", "Negocio",
        "Las personas construyen cultura. La cultura construye el negocio.")),
    ("principle-002.html", principle("002", "Disciplina", "Constancia", "Excelencia",
        "La excelencia es un hábito, no un golpe de suerte.")),
    ("principle-003.html", principle("003", "Hospitalidad", "Experiencia", "Lealtad",
        "La lealtad se gana en los detalles.")),
    ("principle-004.html", principle("004", "Servir", "Confianza", "Liderazgo",
        "Primero sirves. El liderazgo se gana.")),
]
DEFINITIONS = [
    ("definition-001.html", definition("001", "Hospitalidad", "No es servicio.<br>Es hacer que alguien se sienta visto.")),
    ("definition-002.html", definition("002", "Profesionalismo", "Cumplir el estándar<br>incluso cuando nadie observa.")),
    ("definition-003.html", definition("003", "Cultura", "Los comportamientos<br>que un equipo repite.")),
    ("definition-004.html", definition("004", "Liderazgo", "Servir de una manera<br>que otros quieran seguirte.")),
]

salidas = AXIOMS + PRINCIPLES + DEFINITIONS + [("mm-001-four-pillars.html", four_pillars())]
for name, body in salidas:
    open(os.path.join(BASE, name), "w").write(HEAD + body + FOOT)
    print("wrote", name)
