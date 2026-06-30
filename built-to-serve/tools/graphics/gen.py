import os
BASE = os.path.dirname(os.path.abspath(__file__))
FONTS = open(os.path.join(BASE, "fonts", "fonts.css")).read()

HEAD = """<!doctype html><html><head><meta charset="utf-8"><style>
__FONTS__
:root{
  --ink:#20304f; --ink2:#33425e; --red:#c0392b; --blue:#2f6fb0;
  --paper:#f7f5ef; --frame:#dfe2e7;
}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px}
body{
  background:var(--frame);
  display:flex;align-items:center;justify-content:center;
  font-family:'Hand',system-ui,sans-serif;color:var(--ink);
}
.board{
  position:relative;width:1024px;height:1294px;border-radius:10px;
  background:
    radial-gradient(120% 120% at 50% 0%, #ffffff 0%, var(--paper) 55%, #f0ede4 100%);
  box-shadow: inset 0 0 0 10px #ffffff, inset 0 0 0 13px #cfd3da,
              0 18px 40px rgba(0,0,0,.18);
  padding:78px 74px 70px;
  overflow:hidden;
}
.board:before{ /* faint whiteboard sheen */
  content:"";position:absolute;inset:0;
  background:linear-gradient(115deg, rgba(255,255,255,.5) 0%, rgba(255,255,255,0) 30%);
  pointer-events:none;
}
.title{font-family:'Marker';color:var(--ink);line-height:1.02;letter-spacing:.5px}
.hand{font-family:'Hand'}
.cav{font-family:'Caveat'}
.u{position:relative;display:inline-block}
.u:after{content:"";position:absolute;left:-6px;right:-6px;bottom:-8px;height:12px;
  background:var(--blue);border-radius:9px;transform:rotate(-1.2deg);opacity:.9;z-index:-1}
.u.red:after{background:var(--red)}
.box{border:4px solid var(--ink);border-radius:20px 14px 22px 13px;
  background:rgba(255,255,255,.55);box-shadow:3px 4px 0 rgba(32,48,79,.13)}
.sig{position:absolute;right:80px;bottom:54px;font-family:'Caveat';
  font-size:40px;color:var(--ink2);transform:rotate(-2deg)}
.mark{position:absolute;left:80px;bottom:58px;font-family:'Marker';
  font-size:26px;letter-spacing:3px;color:#8b93a3}
.mark b{color:var(--red)}
</style></head><body><div class="board">
""".replace("__FONTS__", FONTS)

FOOT = """
<div class="mark">BUILT TO <b>SERVE</b></div>
<div class="sig">— Guillermo Padilla</div>
</div></body></html>"""

# ---------- POST 1 : Filosofía ----------
post1 = """
<div style="height:100%;display:flex;flex-direction:column">
  <div style="text-align:center">
    <div class="title" style="font-size:60px;color:#8b93a3;line-height:1.05">NO CONSTRUIMOS<br>RESTAURANTES.</div>
    <div class="title" style="font-size:78px;margin-top:22px;line-height:1.05">
       CONSTRUIMOS<br><span class="u">PERSONAS</span>.</div>
  </div>

  <div style="margin-top:64px;display:flex;flex-direction:column;align-items:center;gap:6px">
    <div class="box" style="width:520px;text-align:center;padding:16px 0;font-weight:700;font-size:46px">PERSONAS</div>
    <div class="cav" style="font-size:40px;color:var(--ink2)">construyen ↓</div>
    <div class="box" style="width:520px;text-align:center;padding:16px 0;font-weight:700;font-size:46px">CULTURA</div>
    <div class="cav" style="font-size:40px;color:var(--ink2)">construye ↓</div>
    <div class="box" style="width:640px;text-align:center;padding:18px 0;font-weight:700;font-size:42px;line-height:1.12;border-color:var(--red)">
       NEGOCIOS<br>EXTRAORDINARIOS</div>
  </div>

  <div style="margin-top:auto;padding-bottom:96px;text-align:center">
    <div class="cav" style="font-size:50px;color:var(--ink)">
       Los números siguen a las personas.<br>
       <span class="u red" style="font-weight:700">Nunca al revés.</span></div>
  </div>
</div>
"""

# ---------- POST 2 : Cuatro Pilares ----------
def pilar(num, nombre, linea, color="var(--ink)"):
    return f"""
    <div class="box" style="padding:26px 28px;border-color:{color}">
      <div style="display:flex;align-items:baseline;gap:14px">
        <span class="title" style="font-size:46px;color:{color}">{num}</span>
        <span class="title" style="font-size:40px">{nombre}</span>
      </div>
      <div class="hand" style="font-size:34px;color:var(--ink2);margin-top:8px">{linea}</div>
    </div>"""

post2 = f"""
<div style="text-align:center">
  <div class="title" style="font-size:96px"><span class="u">LOS 4 PILARES</span></div>
  <div class="cav" style="font-size:42px;color:var(--ink2);margin-top:30px">
     El talento se sobrevalora. La constancia gana.</div>
</div>

<div style="margin-top:50px;display:grid;grid-template-columns:1fr 1fr;gap:30px">
  {pilar("1","HOSPITALIDAD","Servir antes de esperar.")}
  {pilar("2","MENTALIDAD","La actitud se elige.")}
  {pilar("3","PROFESIONALISMO","Algo más grande que tú.")}
  {pilar("4","DISCIPLINA","Aunque la motivación se vaya.","var(--red)")}
</div>

<div style="position:absolute;left:74px;right:74px;bottom:150px;text-align:center">
  <div class="cav" style="font-size:52px">
     No son talentos.
     <span class="u red" style="font-weight:700">Son decisiones.</span></div>
</div>
"""

# ---------- POST 3 : Hospitalidad (contraste NO/SÍ) ----------
post3 = """
<div style="text-align:center">
  <div class="title" style="font-size:80px"><span class="u">¿QUIÉN VA PRIMERO?</span></div>
</div>

<div style="margin-top:56px;display:flex;align-items:center;justify-content:center;gap:30px">
  <div class="box" style="width:380px;height:230px;border-color:var(--red);
       display:flex;flex-direction:column;align-items:center;justify-content:center">
    <div class="title" style="font-size:40px;color:var(--red)">EL MITO</div>
    <div class="hand" style="font-size:38px;font-weight:700;margin-top:14px;text-align:center">El cliente<br>primero</div>
  </div>
  <div class="title" style="font-size:80px;color:var(--ink2)">&ne;</div>
  <div class="box" style="width:380px;height:230px;border-color:var(--blue);
       display:flex;flex-direction:column;align-items:center;justify-content:center">
    <div class="title" style="font-size:40px;color:var(--blue)">LA VERDAD</div>
    <div class="hand" style="font-size:38px;font-weight:700;margin-top:14px;text-align:center">El equipo<br>primero</div>
  </div>
</div>

<div class="box" style="margin-top:50px;padding:30px 34px;text-align:center">
  <div class="hand" style="font-size:40px;line-height:1.35">
    Como tratas a tu equipo a las <b>4pm</b><br>
    es como trata al cliente a las <b>9pm</b>.</div>
</div>

<div style="position:absolute;left:74px;right:74px;bottom:140px;text-align:center">
  <div class="cav" style="font-size:54px">
    La hospitalidad
    <span class="u" style="font-weight:700">empieza dentro</span>.</div>
</div>
"""

for name, body in [("post1.html", post1), ("post2.html", post2), ("post3.html", post3)]:
    open(os.path.join(BASE, name), "w").write(HEAD + body + FOOT)
    print("wrote", name)
