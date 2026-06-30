import os
BASE = os.path.dirname(os.path.abspath(__file__))
# gen.py vive en built-to-serve/tools/graphics cuando se copia al repo;
# en scratch las fuentes están en ./fonts también.
FONTS = open(os.path.join(BASE, "fonts", "fonts.css")).read()

# Motor de trazos a mano (rough) propio, en el navegador. Dibuja cajas,
# subrayados y flechas con "temblor" de marcador sobre un overlay SVG,
# midiendo los elementos reales tras cargar las fuentes.
DRAW = r"""
function j(n){return (Math.random()*2-1)*n}
function ns(){return document.createElementNS('http://www.w3.org/2000/svg','path')}
function add(svg,d,color,w){var p=ns();p.setAttribute('d',d);p.setAttribute('fill','none');
  p.setAttribute('stroke',color);p.setAttribute('stroke-width',w);p.setAttribute('stroke-linecap','round');
  p.setAttribute('stroke-linejoin','round');svg.appendChild(p);}
function rect(svg,x,y,w,h,color,sw){
  for(var k=0;k<2;k++){var d='M '+(x+j(2.5))+' '+(y+j(2.5))+' L '+(x+w+j(2.5))+' '+(y+j(2.5))+
    ' L '+(x+w+j(2.5))+' '+(y+h+j(2.5))+' L '+(x+j(2.5))+' '+(y+h+j(2.5))+
    ' L '+(x-2+j(2.5))+' '+(y+j(2.5));add(svg,d,color,sw);}
}
function uline(svg,x,y,w,color,sw){
  for(var k=0;k<2;k++){var mx=x+w/2; var d='M '+(x+j(2))+' '+(y+j(2))+
    ' Q '+(mx+j(3))+' '+(y+3+j(3))+' '+(x+w+j(2))+' '+(y+j(2));add(svg,d,color,sw);}
}
function arrow(svg,cx,y1,y2,color,sw){
  var d='M '+(cx+j(2))+' '+(y1+j(2))+' L '+(cx+j(2.5))+' '+(y2+j(2));add(svg,d,color,sw);
  add(svg,'M '+(cx-9)+' '+(y2-12)+' L '+cx+' '+y2+' L '+(cx+9)+' '+(y2-12),color,sw);
}
var COL={ink:'#1d2b3c',red:'#cf3a2c',blue:'#1f6fb2'};
function loopArrows(svg,sb){
  var ns=document.querySelectorAll('.lnode'); if(!ns.length) return;
  var arr=[].slice.call(ns).sort(function(a,b){return (a.dataset.i|0)-(b.dataset.i|0)});
  var pts=arr.map(function(e){var r=e.getBoundingClientRect();
    return {x:r.left+r.width/2-sb.left, y:r.top+r.height/2-sb.top, rw:r.width/2+22, rh:r.height/2+18};});
  var cx=0,cy=0; pts.forEach(function(p){cx+=p.x;cy+=p.y;}); cx/=pts.length; cy/=pts.length;
  var R=0; pts.forEach(function(p){R+=Math.hypot(p.x-cx,p.y-cy);}); R/=pts.length;
  var n=pts.length, gap=0.62, rr=R*1.06;
  for(var i=0;i<n;i++){
    var a=pts[i], b=pts[(i+1)%n];
    var aa=Math.atan2(a.y-cy,a.x-cx), ab=Math.atan2(b.y-cy,b.x-cx);
    while(ab<=aa) ab+=2*Math.PI;
    var a1=aa+gap, a2=ab-gap, d='', K=18;
    for(var k=0;k<=K;k++){var t=a1+(a2-a1)*k/K;
      d+=(k?'L ':'M ')+(cx+rr*Math.cos(t)+j(1.4))+' '+(cy+rr*Math.sin(t)+j(1.4))+' ';}
    add(svg,d,COL.ink,3.2);
    var ex=cx+rr*Math.cos(a2), ey=cy+rr*Math.sin(a2), h=a2+Math.PI/2, L=20;
    add(svg,'M '+ex+' '+ey+' L '+(ex+L*Math.cos(h+Math.PI+0.45))+' '+(ey+L*Math.sin(h+Math.PI+0.45)),COL.ink,3.2);
    add(svg,'M '+ex+' '+ey+' L '+(ex+L*Math.cos(h+Math.PI-0.45))+' '+(ey+L*Math.sin(h+Math.PI-0.45)),COL.ink,3.2);
  }
}
function draw(){
  var surf=document.querySelector('.surface');
  var svg=document.querySelector('#ink');
  var sb=surf.getBoundingClientRect();
  svg.setAttribute('width',surf.clientWidth);svg.setAttribute('height',surf.clientHeight);
  document.querySelectorAll('.ink-box').forEach(function(e){var r=e.getBoundingClientRect();
    rect(svg,r.left-sb.left-16,r.top-sb.top-12,r.width+32,r.height+24,COL[e.dataset.c||'ink'],3.4);});
  document.querySelectorAll('.ink-u').forEach(function(e){var r=e.getBoundingClientRect();
    uline(svg,r.left-sb.left-6,r.bottom-sb.top+8,r.width+12,COL[e.dataset.c||'blue'],5);});
  document.querySelectorAll('.ink-arrow').forEach(function(e){var r=e.getBoundingClientRect();
    arrow(svg,r.left-sb.left+r.width/2,r.top-sb.top+6,r.bottom-sb.top-6,COL[e.dataset.c||'ink'],3.2);});
  loopArrows(svg,sb);
  document.body.setAttribute('data-drawn','1');
}
if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){setTimeout(draw,60)});}
else{window.addEventListener('load',draw);}
"""

HEAD = """<!doctype html><html><head><meta charset="utf-8"><style>
__FONTS__
:root{ --ink:#1d2b3c; --red:#cf3a2c; --blue:#1f6fb2; }
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px}
body{background:#6b7280;display:flex;align-items:center;justify-content:center;
  font-family:'Hand',system-ui,sans-serif;color:var(--ink)}
/* Marco de aluminio */
.board{position:relative;width:1024px;height:1294px;border-radius:18px;
  background:linear-gradient(145deg,#e2e5e9,#c3c8cf 55%,#aeb4bc);
  padding:20px 20px 68px;
  box-shadow:0 22px 46px rgba(0,0,0,.30), inset 0 1px 0 #f2f4f6;}
/* Superficie del pizarrón */
.surface{position:relative;height:100%;background:linear-gradient(160deg,#ffffff,#eef2f6);
  border-radius:6px;overflow:hidden;
  box-shadow:inset 0 2px 8px rgba(20,30,45,.12), inset 0 0 0 1px #e6eaef;
  padding:62px 58px 96px;}
.surface:before{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(118deg, rgba(255,255,255,.75) 0%, rgba(255,255,255,0) 34%);}
#ink{position:absolute;inset:0;z-index:1;pointer-events:none}
.content{position:relative;z-index:2;height:100%;display:flex;flex-direction:column}
/* Bandeja de marcadores (sobre el marco inferior) */
.tray{position:absolute;left:30px;right:30px;bottom:16px;height:30px;border-radius:6px 6px 12px 12px;
  background:linear-gradient(#aab0b9,#7c828c);
  box-shadow:0 5px 8px rgba(0,0,0,.30), inset 0 2px 3px rgba(0,0,0,.25), inset 0 1px 0 #cdd2d8;}
.mk{position:absolute;bottom:25px;height:16px;width:170px;border-radius:8px;z-index:3;
  background:linear-gradient(#f6f7f9,#dce0e5);box-shadow:0 3px 5px rgba(0,0,0,.32)}
.mk:after{content:"";position:absolute;right:0;top:0;height:16px;width:46px;border-radius:0 8px 8px 0}
.mk.k{left:120px}.mk.k:after{background:#2b2b2b}
.mk.b{left:300px}.mk.b:after{background:var(--blue)}
.mk.r{left:480px}.mk.r:after{background:var(--red)}
/* Tipografía a mano */
.t{font-family:'Hand';font-weight:700;color:var(--ink);line-height:1.04}
.hand{font-family:'Hand'}
.cav{font-family:'Caveat'}
/* Lockup de marca: la filosofía es protagonista; el fundador, en pequeño */
.brand{position:absolute;left:0;right:0;bottom:44px;z-index:2;text-align:center}
.brand .bw{font-family:'Hand';font-weight:700;font-size:34px;letter-spacing:3px;color:var(--ink)}
.brand .bw b{color:var(--red);font-weight:700}
.brand .by{font-family:'Caveat';font-size:31px;color:#8a93a0;margin-top:-2px}
</style></head><body><div class="board"><div class="surface">
<svg id="ink"></svg>
<div class="content">
""".replace("__FONTS__", FONTS)

FOOT = """
</div>
<div class="brand">
  <div class="bw">BUILT TO <b>SERVE</b></div>
  <div class="by">by Guillermo Padilla</div>
</div>
</div>
<div class="tray"></div>
<div class="mk k"></div><div class="mk b"></div><div class="mk r"></div>
</div>
<script>__DRAW__</script>
</body></html>""".replace("__DRAW__", DRAW)

# ---------- POST 1 : Filosofía ----------
post1 = """
<div style="text-align:center">
  <div class="t" style="font-size:58px;color:#9aa2ad">No construimos<br>restaurantes.</div>
  <div class="t" style="font-size:74px;margin-top:20px">Construimos
     <span class="ink-u" data-c="red" style="display:inline-block">personas.</span></div>
</div>

<div style="margin-top:58px;display:flex;flex-direction:column;align-items:center;gap:0">
  <div class="ink-box t" style="font-size:46px;padding:14px 60px">PERSONAS</div>
  <div class="ink-arrow" style="width:140px;height:74px"></div>
  <div class="ink-box t" style="font-size:46px;padding:14px 60px">CULTURA</div>
  <div class="ink-arrow" style="width:140px;height:74px"></div>
  <div class="ink-box t" data-c="red" style="font-size:40px;padding:16px 48px;text-align:center;line-height:1.12">
     NEGOCIOS<br>EXTRAORDINARIOS</div>
</div>

<div style="margin-top:auto;padding-bottom:54px;text-align:center">
  <div class="cav" style="font-size:50px;color:var(--ink)">
     Los números siguen a las personas.<br>
     <b>Nunca al revés.</b></div>
</div>
"""

# ---------- POST 2 : Cuatro Pilares ----------
def pilar(num, nombre, linea, c="ink"):
    return f"""
    <div class="ink-box" data-c="{c}" style="padding:22px 26px">
      <div style="display:flex;align-items:baseline;gap:12px">
        <span class="t" style="font-size:42px;color:var(--{c})">{num}.</span>
        <span class="t" style="font-size:38px">{nombre}</span>
      </div>
      <div class="hand" style="font-size:32px;color:#41506a;margin-top:6px">{linea}</div>
    </div>"""

post2 = f"""
<div style="text-align:center">
  <div class="t" style="font-size:76px"><span class="ink-u">Los 4 Pilares</span></div>
  <div class="cav" style="font-size:42px;color:#41506a;margin-top:30px">
     El talento se sobrevalora. La constancia gana.</div>
</div>

<div style="margin-top:56px;display:grid;grid-template-columns:1fr 1fr;gap:42px 50px">
  {pilar("1","HOSPITALIDAD","Servir antes de esperar.")}
  {pilar("2","MENTALIDAD","La actitud se elige.")}
  {pilar("3","PROFESIONALISMO","Algo más grande que tú.")}
  {pilar("4","DISCIPLINA","Aunque la motivación se vaya.","red")}
</div>

<div style="margin-top:auto;padding-bottom:54px;text-align:center">
  <div class="cav" style="font-size:52px">No son talentos. <b>Son decisiones.</b></div>
</div>
"""

# ---------- POST 3 : Hospitalidad (contraste) ----------
post3 = """
<div style="text-align:center">
  <div class="t" style="font-size:66px"><span class="ink-u">¿Quién va primero?</span></div>
</div>

<div style="margin-top:58px;display:flex;align-items:center;justify-content:center;gap:44px">
  <div class="ink-box" data-c="red" style="width:330px;height:210px;
       display:flex;flex-direction:column;align-items:center;justify-content:center">
    <div class="t" style="font-size:34px;color:var(--red)">EL MITO</div>
    <div class="hand" style="font-size:34px;font-weight:700;margin-top:12px;text-align:center;line-height:1.2">El cliente<br>primero</div>
  </div>
  <div class="t" style="font-size:72px;color:#41506a">&ne;</div>
  <div class="ink-box" data-c="blue" style="width:330px;height:210px;
       display:flex;flex-direction:column;align-items:center;justify-content:center">
    <div class="t" style="font-size:34px;color:var(--blue)">LA VERDAD</div>
    <div class="hand" style="font-size:34px;font-weight:700;margin-top:12px;text-align:center;line-height:1.2">El equipo<br>primero</div>
  </div>
</div>

<div class="ink-box" style="margin-top:62px;padding:28px 30px;text-align:center">
  <div class="hand" style="font-size:38px;line-height:1.4">
    Como tratas a tu equipo a las <b>4pm</b><br>
    es como trata al cliente a las <b>9pm</b>.</div>
</div>

<div style="margin-top:auto;padding-bottom:54px;text-align:center">
  <div class="cav" style="font-size:54px">La hospitalidad <b>empieza dentro.</b></div>
</div>
"""

# ---------- CANON : Principios (el whiteboard ES la representación del Principio) ----------
def principle(num, n1, n2, n3, summary):
    """Principio canónico: número de catálogo + flujo causa→efecto + resumen en una frase."""
    return f"""
<div style="text-align:center;margin-top:6px">
  <div class="cav" style="font-size:40px;letter-spacing:7px;color:#9aa2ad">PRINCIPLE {num}</div>
</div>

<div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:0">
  <div class="ink-box t" style="font-size:50px;padding:18px 64px">{n1}</div>
  <div class="ink-arrow" style="width:130px;height:76px"></div>
  <div class="ink-box t" style="font-size:50px;padding:18px 64px">{n2}</div>
  <div class="ink-arrow" data-c="red" style="width:130px;height:76px"></div>
  <div class="ink-box t" data-c="red" style="font-size:50px;padding:18px 64px">{n3}</div>
</div>

<div style="text-align:center;padding-bottom:106px">
  <div class="cav" style="font-size:46px;color:var(--ink)">{summary}</div>
</div>
"""

PRINCIPLES = [
    ("principle-001.html", principle("001",
        "PEOPLE", "CULTURE", "BUSINESS",
        "Las personas construyen cultura. La cultura construye el negocio.")),
    ("principle-002.html", principle("002",
        "DISCIPLINE", "CONSISTENCY", "EXCELLENCE",
        "La excelencia es un hábito, no un golpe de suerte.")),
    ("principle-003.html", principle("003",
        "HOSPITALITY", "EXPERIENCE", "LOYALTY",
        "La lealtad se gana en los detalles.")),
    ("principle-004.html", principle("004",
        "SERVE", "TRUST", "LEADERSHIP",
        "Primero sirves. El liderazgo se gana.")),
]

# ---------- FRAMEWORKS (herramientas) ----------
# Framework 001 — The Four Pillars (contenido en español; nombre canónico en inglés)
def _pilar(num, nombre, linea, c="ink"):
    return f"""
    <div class="ink-box" data-c="{c}" style="padding:22px 26px">
      <div style="display:flex;align-items:baseline;gap:12px">
        <span class="t" style="font-size:40px;color:var(--{c})">{num}.</span>
        <span class="t" style="font-size:36px">{nombre}</span>
      </div>
      <div class="hand" style="font-size:31px;color:#41506a;margin-top:6px">{linea}</div>
    </div>"""

fw_four_pillars = f"""
<div style="text-align:center;margin-top:6px">
  <div class="cav" style="font-size:40px;letter-spacing:7px;color:#9aa2ad">FRAMEWORK 001</div>
  <div class="t" style="font-size:56px;margin-top:6px">The Four Pillars</div>
</div>

<div style="flex:1;display:flex;flex-direction:column;justify-content:center">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:38px 46px">
    {_pilar("1","HOSPITALIDAD","Servir antes de esperar.")}
    {_pilar("2","MENTALIDAD","La actitud se elige.")}
    {_pilar("3","PROFESIONALISMO","Algo más grande que tú.")}
    {_pilar("4","DISCIPLINA","Aunque la motivación se vaya.","red")}
  </div>
</div>

<div style="text-align:center;padding-bottom:104px">
  <div class="cav" style="font-size:46px;color:var(--ink)">No son talentos. <b>Son decisiones.</b></div>
</div>
"""

# Framework 002 — The Leadership Loop (ciclo de 3 nodos con flechas curvas)
fw_leadership_loop = """
<div style="text-align:center;margin-top:6px">
  <div class="cav" style="font-size:40px;letter-spacing:7px;color:#9aa2ad">FRAMEWORK 002</div>
  <div class="t" style="font-size:56px;margin-top:6px">The Leadership Loop</div>
</div>

<div style="flex:1;display:flex;align-items:center;justify-content:center">
  <div style="position:relative;width:680px;height:560px">
    <div class="lnode ink-box t" data-i="0" style="position:absolute;left:340px;top:70px;transform:translate(-50%,-50%);font-size:44px;padding:14px 40px">SERVIR</div>
    <div class="lnode ink-box t" data-i="1" style="position:absolute;left:520px;top:400px;transform:translate(-50%,-50%);font-size:40px;padding:14px 36px">CONFIANZA</div>
    <div class="lnode ink-box t" data-i="2" data-c="red" style="position:absolute;left:160px;top:400px;transform:translate(-50%,-50%);font-size:40px;padding:14px 34px">INFLUENCIA</div>
    <div class="cav" style="position:absolute;left:340px;top:250px;transform:translate(-50%,-50%);font-size:34px;color:#9aa2ad;text-align:center">se gana<br>cada día</div>
  </div>
</div>

<div style="text-align:center;padding-bottom:104px">
  <div class="cav" style="font-size:44px;color:var(--ink)">Sirves, ganas confianza, influyes — y vuelves a servir.</div>
</div>
"""

# Framework 003 — The Daily Briefing (tarjeta-checklist)
fw_daily_briefing = """
<div style="text-align:center;margin-top:6px">
  <div class="cav" style="font-size:40px;letter-spacing:7px;color:#9aa2ad">FRAMEWORK 003</div>
  <div class="t" style="font-size:56px;margin-top:6px">The Daily Briefing</div>
  <div class="cav" style="font-size:34px;color:#8a93a0;margin-top:2px">5 minutos antes del turno</div>
</div>

<div style="flex:1;display:flex;align-items:center;justify-content:center">
  <div class="ink-box" style="width:760px;padding:48px 52px">
    <div style="display:flex;align-items:center;gap:30px;margin:6px 0">
      <span class="ink-box" style="display:inline-block;width:26px;height:24px"></span>
      <span class="hand" style="font-size:38px">¿Cuál es la <b>victoria</b> de hoy?</span>
    </div>
    <div style="display:flex;align-items:center;gap:30px;margin:34px 0">
      <span class="ink-box" style="display:inline-block;width:26px;height:24px"></span>
      <span class="hand" style="font-size:38px">¿Qué <b>detalle</b> vamos a cuidar?</span>
    </div>
    <div style="display:flex;align-items:center;gap:30px;margin:34px 0 6px">
      <span class="ink-box" data-c="red" style="display:inline-block;width:26px;height:24px"></span>
      <span class="hand" style="font-size:38px">¿A quién <b>servimos</b> primero?</span>
    </div>
  </div>
</div>

<div style="text-align:center;padding-bottom:104px">
  <div class="cav" style="font-size:44px;color:var(--ink)">Alinea antes. Gana durante.</div>
</div>
"""

FRAMEWORKS = [
    ("framework-001.html", fw_four_pillars),
    ("framework-002.html", fw_leadership_loop),
    ("framework-003.html", fw_daily_briefing),
]

salidas = [("post1.html", post1), ("post2.html", post2), ("post3.html", post3)] + PRINCIPLES + FRAMEWORKS
for name, body in salidas:
    open(os.path.join(BASE, name), "w").write(HEAD + body + FOOT)
    print("wrote", name)
