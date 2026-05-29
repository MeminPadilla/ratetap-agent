/* ============================================================
   RateTap · Herramienta de Ventas — APP
   ============================================================ */
(function(){
  "use strict";
  const $  = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
  const LS = window.localStorage;

  /* ---------------- MODE SWITCH ---------------- */
  let mode = "pitch";
  function setMode(m){
    mode = m;
    $$(".screen").forEach(s=>s.classList.toggle("active", s.dataset.mode===m));
    $$(".tab").forEach(t=>t.classList.toggle("active", t.dataset.mode===m));
    $("#mode-pill-label").textContent = m==="pitch" ? "Presentando" : "Modo vendedor";
    LS.setItem("rt_mode", m);
  }

  /* ================= MODO PRESENTAR ================= */
  let pi = 0;
  const stage = $("#pitch-stage");

  function buildPitch(){
    stage.innerHTML = PITCH.map((c,i)=>`<div class="p-card" data-i="${i}">${c.html}</div>`).join("");
    $("#pdots").innerHTML = PITCH.map((_,i)=>`<span class="pdot" data-i="${i}"></span>`).join("");
    $$("#pdots .pdot").forEach(d=>d.addEventListener("click",()=>goPitch(+d.dataset.i)));
    goPitch(0, true);
  }

  function goPitch(i, instant){
    pi = Math.max(0, Math.min(PITCH.length-1, i));
    $$(".p-card", stage).forEach(c=>c.classList.toggle("active", +c.dataset.i===pi));
    $$("#pdots .pdot").forEach((d,idx)=>d.classList.toggle("on", idx===pi));
    // cue
    const cue = PITCH[pi].cue;
    const cueEl = $("#cue");
    if(cue){ cueEl.classList.remove("hidden"); $("#cue-text").innerHTML = cue; }
    else { cueEl.classList.add("hidden"); }
    // nav buttons
    $("#p-prev").disabled = pi===0;
    const isLast = pi===PITCH.length-1;
    $("#p-next").innerHTML = isLast ? "Reiniciar ↻" : "Siguiente →";
    // scroll active card to top
    const active = $(".p-card.active", stage);
    if(active) active.scrollTop = 0;
    if(isLast) ensureQR();
  }

  function nextPitch(){ if(pi===PITCH.length-1){ goPitch(0); } else { goPitch(pi+1); } }
  function prevPitch(){ goPitch(pi-1); }

  /* QR for close card */
  function ensureQR(){
    const img = $("#qr-img");
    if(!img || img.dataset.loaded) return;
    const url = encodeURIComponent(CONTACTO_URL);
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=${url}`;
    img.dataset.loaded = "1";
    img.onerror = ()=>{ const box=img.closest(".qr-box"); if(box) box.style.display="none"; const cap=$(".qr-cap"); if(cap) cap.style.display="none"; };
  }

  /* swipe on pitch stage */
  let tsx=0, tsy=0;
  stage.addEventListener("touchstart", e=>{ tsx=e.touches[0].clientX; tsy=e.touches[0].clientY; }, {passive:true});
  stage.addEventListener("touchend", e=>{
    const dx=e.changedTouches[0].clientX-tsx, dy=e.changedTouches[0].clientY-tsy;
    if(Math.abs(dx)>60 && Math.abs(dx)>Math.abs(dy)*1.4){ dx<0 ? (pi<PITCH.length-1 && goPitch(pi+1)) : prevPitch(); }
  }, {passive:true});

  /* ================= MODO VENDEDOR ================= */
  function buildCoach(){
    const tabs = [
      {id:"guion", label:"Guion"},
      {id:"objeciones", label:"Objeciones"},
      {id:"numeros", label:"Números"},
      {id:"dinero", label:"Tu dinero"},
      {id:"checklist", label:"Checklist"}
    ];
    $("#coach-tabs").innerHTML = tabs.map((t,i)=>`<button class="ctab${i===0?' active':''}" data-sec="${t.id}">${t.label}</button>`).join("");
    $$("#coach-tabs .ctab").forEach(b=>b.addEventListener("click",()=>setCoachSec(b.dataset.sec)));

    // GUION
    $("#sec-guion").innerHTML = `
      <div class="csec-head"><div class="csec-kicker">El pitch · 5 minutos</div>
      <div class="csec-title">El <span class="gold">guion.</span></div>
      <div class="csec-sub">Memorízalo, practícalo, hazlo tuyo. Cuando lo digas, debe sonar como tú — no como un script.</div></div>
      ${ACTS.map(a=>`
        <div class="act">
          <div class="act-meta"><div class="act-num">${a.num}</div><div class="act-title">${a.title}</div><div class="act-time">${a.time}</div></div>
          <div class="act-quote">${a.quote}</div>
          <div class="act-tip"><span class="ti">${a.ti}</span><span>${a.tip}</span></div>
        </div>`).join("")}`;

    // OBJECIONES
    $("#sec-objeciones").innerHTML = `
      <div class="csec-head"><div class="csec-kicker">Arsenal</div>
      <div class="csec-title">Manejo de <span class="gold">objeciones.</span></div>
      <div class="csec-sub">Toca para ver la respuesta. Practícalas hasta que salgan automáticas.</div></div>
      <input class="obj-search" id="obj-search" placeholder="Buscar objeción…" />
      <div id="obj-list">
      ${OBJECTIONS.map((o,i)=>`
        <div class="obj" data-q="${(o.q+' '+o.a).replace(/<[^>]+>/g,'').toLowerCase().replace(/"/g,'')}">
          <div class="obj-q"><span class="qn">${String(i+1).padStart(2,'0')}</span><span class="qt">${o.q}</span><span class="chev">▶</span></div>
          <div class="obj-a"><div class="obj-a-inner">${o.a}</div></div>
        </div>`).join("")}
      </div>`;
    $$("#sec-objeciones .obj").forEach(o=>{
      o.querySelector(".obj-q").addEventListener("click",()=>o.classList.toggle("open"));
    });
    $("#obj-search").addEventListener("input", e=>{
      const q = e.target.value.toLowerCase().trim();
      $$("#obj-list .obj").forEach(o=>{ o.style.display = o.dataset.q.includes(q) ? "" : "none"; });
    });

    // NUMEROS
    $("#sec-numeros").innerHTML = `
      <div class="csec-head"><div class="csec-kicker">De bolsillo</div>
      <div class="csec-title">Los <span class="gold">números.</span></div>
      <div class="csec-sub">Si dudas en un número, perdiste la venta. Tenlos en la cabeza.</div></div>
      <div class="cheat">
        ${CHEAT.map(c=>`<div class="cheat-row"><div class="cheat-k">${c.k}</div><div class="cheat-v">${c.v}</div></div>`).join("")}
      </div>`;

    // DINERO
    $("#sec-dinero").innerHTML = `
      <div class="csec-head"><div class="csec-kicker">Tu dinero</div>
      <div class="csec-title">Cómo <span class="gold">ganas.</span></div>
      <div class="csec-sub">Tu pago premia cerrar Y cuidar al cliente. Mientras más activos tengas, más recurrente entra cada mes.</div></div>
      ${COMP.map(c=>`
        <div class="comp-card"><div class="comp-amt">${c.amt}</div>
        <div class="comp-info"><div class="cl">${c.label}</div><div class="cd">${c.desc}</div></div></div>`).join("")}

      <div class="calc">
        <div class="calc-title">Calculadora · ¿cuánto ganas?</div>
        <div class="calc-label">Clientes que cierras este mes <b id="calc-n">5</b></div>
        <input type="range" min="1" max="30" value="5" class="calc-slider" id="calc-slider" />
        <div class="calc-out">
          <div class="calc-out-cell"><div class="v" id="calc-now">$1,000</div><div class="l">Entran ahora<br>($200 × cierre)</div></div>
          <div class="calc-out-cell"><div class="v" id="calc-res">$250</div><div class="l">Residual / mes<br>($50 × activo)</div></div>
        </div>
        <div class="calc-note" id="calc-note">A 12 meses, esos clientes te pagan <strong>$3,000</strong> en residual.</div>
      </div>

      <div class="final-note">
        <div class="fl">Recuerda</div>
        <div class="ft">Cada cliente que pierdes por no cerrar bien, lo pierdes <strong>para siempre</strong>. Cada cliente que cierras y cuidas, te paga <strong>durante un año</strong>.</div>
        <div class="fq">Esto no es comisión. Es construir tu propia cartera.</div>
      </div>`;

    const slider = $("#calc-slider");
    const fmt = n => "$"+n.toLocaleString("en-US");
    function calc(){
      const n = +slider.value;
      $("#calc-n").textContent = n;
      $("#calc-now").textContent = fmt(n*200);
      $("#calc-res").textContent = fmt(n*50);
      $("#calc-note").innerHTML = `A 12 meses, esos clientes te pagan <strong>${fmt(n*50*12)}</strong> en residual.`;
    }
    slider.addEventListener("input", calc); calc();

    // CHECKLIST
    renderChecklist();
  }

  function renderChecklist(){
    let saved = {};
    try{ saved = JSON.parse(LS.getItem("rt_checklist")||"{}"); }catch(e){}
    const done = Object.values(saved).filter(Boolean).length;
    $("#sec-checklist").innerHTML = `
      <div class="csec-head"><div class="csec-kicker">Antes de cada visita</div>
      <div class="csec-title"><span class="gold">Checklist.</span></div></div>
      <div class="check-progress"><b id="ck-done">${done}</b> de ${CHECKLIST.length} listos</div>
      ${CHECKLIST.map((c,i)=>`
        <div class="check-item${saved[i]?' done':''}" data-i="${i}">
          <div class="check-box">${saved[i]?'✓':''}</div><div class="check-text">${c}</div>
        </div>`).join("")}`;
    $$("#sec-checklist .check-item").forEach(it=>{
      it.addEventListener("click",()=>{
        const i = it.dataset.i;
        let s={}; try{ s=JSON.parse(LS.getItem("rt_checklist")||"{}"); }catch(e){}
        s[i] = !s[i];
        LS.setItem("rt_checklist", JSON.stringify(s));
        it.classList.toggle("done", s[i]);
        it.querySelector(".check-box").textContent = s[i] ? "✓" : "";
        $("#ck-done").textContent = Object.values(s).filter(Boolean).length;
      });
    });
  }

  let coachSec = "guion";
  function setCoachSec(id){
    coachSec = id;
    $$("#coach-tabs .ctab").forEach(t=>t.classList.toggle("active", t.dataset.sec===id));
    $$(".csection").forEach(s=>s.classList.toggle("active", s.id==="sec-"+id));
    $(".screen[data-mode='coach']").scrollTop = 0;
  }

  /* ---------------- KEYBOARD ---------------- */
  document.addEventListener("keydown", e=>{
    if(mode!=="pitch") return;
    if(e.key==="ArrowRight"){ if(pi<PITCH.length-1) goPitch(pi+1); }
    if(e.key==="ArrowLeft") prevPitch();
  });

  /* ---------------- INIT ---------------- */
  function init(){
    buildPitch();
    buildCoach();
    $("#p-prev").addEventListener("click", prevPitch);
    $("#p-next").addEventListener("click", nextPitch);
    $("#cue").addEventListener("click", function(){ this.classList.toggle("collapsed"); });
    $$(".tab[data-mode]").forEach(t=>t.addEventListener("click",()=>setMode(t.dataset.mode)));
    $("#tab-cta").addEventListener("click",()=>{ setMode("pitch"); goPitch(PITCH.length-1); });
    setCoachSec("guion");
    setMode(LS.getItem("rt_mode")==="coach" ? "coach" : "pitch");
  }
  if(document.readyState!=="loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();
