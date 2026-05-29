/* ============================================================
   RateTap · Herramienta de Ventas — CONTENIDO
   Edita aquí los textos. Precio alineado al sitio: $700 MXN/mes.
   ============================================================ */

const CONTACTO_URL = "https://app.ratetapmx.com/contacto";

/* -------------------- MODO PRESENTAR (lo que ve el gerente) -------------------- */
const PITCH = [

  /* 1 — HOOK */
  {
    label: "Gancho",
    html: `
      <div class="p-kicker">La pregunta clave</div>
      <h1 class="p-h1">¿Quién sale <span class="gold">primero</span> cuando buscan dónde cenar en León?</h1>
      <p class="p-lead">7 de cada 10 clientes no pasan del top 3 de Google. Si no estás ahí arriba, para ellos <strong>no existes</strong>.</p>
      <div class="p-spacer"></div>
    `,
    cue: `Pásale el celular: <strong>"Busca en Google: mejor restaurante de cortes en León."</strong> Deja que lo haga él. No hables.`
  },

  /* 2 — SEARCH PROOF */
  {
    label: "La realidad",
    html: `
      <div class="p-kicker">Lo que ve tu cliente</div>
      <div class="gshot">
        <img src="assets/estancia-google.jpeg" alt="Búsqueda real en Google: mejor restaurante de cortes en León" loading="eager">
      </div>
      <p class="gcaption">Búsqueda <strong>real</strong> en León. El cliente que iba a venir contigo <strong>se fue con el de arriba</strong>. Todos los días.</p>
    `,
    cue: `Mientras ve su pantalla: <strong>"Mira quién sale primero. Ese cliente era tuyo."</strong> PAUSA. Deja que lo procese.`
  },

  /* 3 — PROOF / CASE */
  {
    label: "La prueba",
    html: `
      <div class="p-kicker">Caso real · León</div>
      <h2 class="p-h2">La Estancia pasó de <span class="gold">5º a 1º</span> en 5 meses.</h2>
      <div class="pstats">
        <div class="pstat"><div class="v">4.5→4.7</div><div class="l">Rating de Google<br>+0.2 estrellas</div></div>
        <div class="pstat"><div class="v">1,099</div><div class="l">Reseñas nuevas<br>enviadas a Google</div></div>
        <div class="pstat"><div class="v">146</div><div class="l">Reseñas negativas<br>interceptadas en privado</div></div>
        <div class="pstat"><div class="v">126</div><div class="l">Inscritos al Club VIP<br>en solo 8 días</div></div>
      </div>
      <p class="gcaption">No es magia. Es <strong>RateTap</strong>. Y pasó en 5 meses, no en 2 años.</p>
    `,
    cue: `Saca el iPad. Muéstrale el perfil <strong>real</strong> de La Estancia en Google EN VIVO. La prueba vende sola.`
  },

  /* 4 — HOW IT WORKS */
  {
    label: "Cómo funciona",
    html: `
      <div class="p-kicker">Sencillo</div>
      <h2 class="p-h2">Una <span class="gold">tarjeta</span>. Cuatro pasos.</h2>
      <div class="psteps">
        <div class="pstep"><div class="n">1</div><div class="t">Cada mesero recibe una <strong>tarjeta NFC</strong> con su nombre.</div></div>
        <div class="pstep"><div class="n">2</div><div class="t">Entrenamos a tu personal en <strong>cómo y cuándo</strong> pedir la reseña.</div></div>
        <div class="pstep"><div class="n">3</div><div class="t">El cliente acerca su celular y deja la reseña en <strong>15 segundos</strong>.</div></div>
        <div class="pstep"><div class="n">4</div><div class="t">¿Está molesto? El sistema lo detecta y lo manda a un form <strong>privado a tu WhatsApp</strong>. Nunca llega a Google.</div></div>
      </div>
    `,
    cue: `DEMO EN VIVO: que el gerente toque la tarjeta NFC con su <strong>propio</strong> celular. Que lo sienta en la mano.`
  },

  /* 5 — STACK */
  {
    label: "El stack",
    html: `
      <div class="p-kicker">No es solo reseñas</div>
      <h2 class="p-h2">Toda tu reputación, <span class="gold">en una plataforma.</span></h2>
      <div class="pstack">
        <div class="pstack-item"><span class="ic">⭐</span><div><div class="h">Reseñas</div><div class="d">Más reseñas positivas, menos negativas públicas.</div></div></div>
        <div class="pstack-item"><span class="ic">💬</span><div><div class="h">Plataforma de eventos</div><div class="d">Chatbot de WhatsApp que califica leads con 5 preguntas.</div></div></div>
        <div class="pstack-item"><span class="ic">📥</span><div><div class="h">Captura de leads</div><div class="d">Tu hostess deja de perder mensajes en WhatsApp.</div></div></div>
        <div class="pstack-item"><span class="ic">👑</span><div><div class="h">Club VIP</div><div class="d">La Estancia sumó 126 clientes frecuentes en 8 días.</div></div></div>
      </div>
    `,
    cue: `Lee al gerente: ¿qué le duele más? Reseñas, eventos vacíos, o clientes que no regresan. Aprieta ahí.`
  },

  /* 6 — OFFER */
  {
    label: "La oferta",
    html: `
      <div class="p-kicker">La oferta</div>
      <div class="offer-price"><span class="amt">$700</span><span class="per">MXN / mes</span></div>
      <div class="offer-trial">✦ 15 días gratis · empiezas hoy</div>
      <div class="offer-list">
        <div class="offer-li"><span class="ck">✓</span><span>No te cobramos <strong>nada hoy</strong>. El primer cargo es hasta el día 15.</span></div>
        <div class="offer-li"><span class="ck">✓</span><span>Tu <strong>QR digital queda activo hoy mismo</strong> — empiezas a juntar reseñas ya.</span></div>
        <div class="offer-li"><span class="ck">✓</span><span>Tus <strong>tarjetas NFC físicas</strong> llegan cuando confirmas el día 15.</span></div>
        <div class="offer-li"><span class="ck">✓</span><span><strong>Sin contrato.</strong> Cancelas con un clic, cuando quieras.</span></div>
        <div class="offer-li"><span class="ck">✓</span><span>Entrenamiento a tu equipo y soporte <strong>incluidos</strong>.</span></div>
      </div>
    `,
    cue: `Repite: <strong>CERO riesgo.</strong> "No te cobro hoy. Si no te jala, cancelas antes del día 15 y no pagas un peso."`
  },

  /* 7 — CLOSE */
  {
    label: "Cierre",
    html: `
      <div class="close-card">
        <h2 class="close-h">Actívalo <span class="gold">ahora mismo.</span></h2>
        <p class="close-sub">Escanea el código o toca el botón. En 5 minutos quedas activado en esta misma mesa.</p>
        <div class="qr-box"><img id="qr-img" alt="QR para suscribirse"></div>
        <div class="qr-cap">Escanea con tu cámara</div>
        <a class="cta-btn" id="cta-link" href="${CONTACTO_URL}" target="_blank" rel="noopener">Iniciar mi prueba de 15 días →</a>
        <p class="close-reassure"><strong>No te cobramos hoy.</strong> Cancela cuando quieras antes del día 15 desde tu panel.</p>
      </div>
    `,
    cue: `SÁCALO AHORA. Llenen el formulario juntos. <strong>"Déjame pensarlo" mata el 80% de los cierres.</strong>`
  }
];

/* -------------------- MODO VENDEDOR (solo para Emiliano) -------------------- */

const ACTS = [
  { num:"01", title:"Abrir con el dolor", time:"45 seg",
    quote:`"Qué tal, gerente, gracias por los 5 minutos. Te voy directo: ¿sabes cuánto cliente nuevo estás perdiendo por no salir arriba en Google? Saca tu celular y busca <em>mejor restaurante de cortes en León</em>. ¿Quién te sale primero?"
      <span class="speaker">— La Estancia Argentina.</span>
      "Porque tienen <strong>1,099 reseñas y 4.7 estrellas</strong>. La gente no pasa del top 3. Si no estás ahí, el cliente que iba contigo se fue con el de arriba."`,
    tip:`<strong>PAUSA.</strong> Deja que lo procese. Este es el momento que vende.`, ti:"⏸" },

  { num:"02", title:"La prueba", time:"1 min",
    quote:`"La Estancia hace 5 meses estaba en <strong>quinto lugar</strong>. Hoy es la primera. ¿Qué hicieron? RateTap. Pasaron de 4.5 a 4.7, mandaron 1,099 reseñas a Google y — lo más cabrón — interceptaron <strong>146 reseñas negativas en privado</strong> antes de que las publicaran. El cliente molesto le escribe al gerente directo, en vez de quemarte en Google."`,
    tip:`Saca el iPad. Muestra el perfil de La Estancia en Google <strong>EN VIVO.</strong>`, ti:"📱" },

  { num:"03", title:"Cómo funciona", time:"1 min",
    quote:`"Es bien sencillo, cuatro pasos: tarjeta NFC para cada mesero, entrenamos a tu personal, el cliente acerca el celular y deja la reseña en 15 segundos, y si está molesto el sistema lo manda a un form privado que llega a tu WhatsApp."`,
    tip:`<strong>DEMO EN VIVO:</strong> que el gerente toque la tarjeta NFC con su propio celular.`, ti:"💳" },

  { num:"04", title:"El stack completo", time:"45 seg",
    quote:`"Y RateTap ya no es solo reseñas. Hoy incluye plataforma de eventos con chatbot de WhatsApp que califica leads, captura de leads para que tu hostess no pierda mensajes, y Club VIP — La Estancia lleva 126 inscritos en 8 días."`,
    tip:`Adáptalo: ¿qué le duele más al gerente? Aprieta en ese módulo.`, ti:"🎯" },

  { num:"05", title:"La oferta y el cierre", time:"45 seg",
    quote:`"Precio: <strong>$700 al mes</strong>. Pero arrancas con <strong>15 días gratis</strong>. No te cobro nada hoy. Tu QR queda activo hoy mismo, y tus tarjetas físicas llegan cuando confirmes el día 15. Si no te jala, cancelas con un clic, sin preguntas.<br><br>¿Le entramos? Si me dices que sí ahorita, en 5 minutos quedas activado. Solo necesito tu correo y una tarjeta para registrar el trial."`,
    tip:`<strong>SACA EL CELULAR. ABRE EL FORM. REGÍSTRALO EN LA MESA.</strong> El "déjame pensarlo" mata el cierre.`, ti:"📲" }
];

const OBJECTIONS = [
  { q:`"Ya tenemos reseñas en Google"`, a:`Perfecto, ya tienes base. <strong>¿Cuántas tienes del último mes?</strong> Google premia recencia. Si no generas 20-30 nuevas al mes, los competidores nuevos te están alcanzando.` },
  { q:`"Está caro"`, a:`<strong>$700 al mes son $23 al día</strong> — menos que un platillo. Si esto te trae UN cliente nuevo al mes, ya se pagó solo varias veces.` },
  { q:`"¿Por qué me piden mi tarjeta si es gratis?"`, a:`Solo para <strong>activar el trial, igual que Netflix</strong>. No te cobramos nada hoy. Si cancelas antes del día 15, no pagas un peso. Es para que no tengas que volver a registrarte si te quedas.` },
  { q:`"Déjame pensarlo / lo veo con el dueño"`, a:`Va. Te propongo: <strong>actívalo en los 15 días gratis</strong>, sin compromiso. Si el dueño dice que no, lo cancelamos antes del día 15. ¿Qué pierdes?` },
  { q:`"¿Y si no me funciona?"`, a:`Por eso son <strong>15 días gratis, cero riesgo</strong>. Llevamos 12 clientes activos y ninguno ha cancelado. El producto se defiende solo.` },
  { q:`"¿Tengo que firmar contrato?"`, a:`<strong>Nada.</strong> Es mensual, cancelas cuando quieras desde tu panel. Yo gano cuando tú ganas.` },
  { q:`"No tengo tiempo de entrenar a mi equipo"`, a:`Por eso vamos nosotros. <strong>Lo entrenamos en 30 minutos.</strong> Una sesión rápida con tus meseros y queda.` },
  { q:`"¿Y si los clientes no quieren dejar reseñas?"`, a:`Depende 100% de cómo se pida — por eso entrenamos al equipo. <strong>Cuando se pide bien, la dejan 8 de cada 10 veces.</strong> La Estancia es la prueba.` },
  { q:`"Mejor lo veo en otro momento"`, a:`Te entiendo. Solo te pido tu correo. <strong>Te mando el link sin compromiso.</strong> Si en una semana no lo activaste, lo eliminamos. Cero presión.` }
];

const CHEAT = [
  { k:"Precio mensual", v:`<span class="hl">$700 MXN</span>` },
  { k:"Trial gratis", v:"15 días · cancelas cuando quieras" },
  { k:"Cargo hoy", v:`<span class="hl">$0</span> · primer cargo el día 15` },
  { k:"QR digital", v:"Activo el mismo día" },
  { k:"Tarjetas NFC", v:"Se envían al confirmar el día 15" },
  { k:"Método de pago", v:"Stripe (crédito o débito)" },
  { k:"Contrato", v:"NO · mensual sin permanencia" },
  { k:"Implementación", v:"24-48 horas" },
  { k:"Entrenamiento", v:"30 min a tu personal" },
  { k:"Caso ancla", v:"La Estancia · 5º→1º en 5 meses" },
  { k:"Reseñas generadas", v:"1,099 enviadas a Google" },
  { k:"Negativas bloqueadas", v:"146" },
  { k:"Clientes activos", v:"12 restaurantes pagando" },
  { k:"Stack incluido", v:"Reseñas + Eventos + VIP + Leads" }
];

const COMP = [
  { amt:"$200", label:"Por cada cierre", desc:"Directo a tu cuenta cuando el cliente registra su pago en Stripe. Sin tope." },
  { amt:"$50<span style='font-size:.5em'>/mes</span>", label:"Residual × 12 meses", desc:"Por cada cliente que siga activo después del primer mes. Cuida al cliente, te paga todo el año." },
  { amt:"$2,000", label:"Garantía primer mes", desc:"Si haces mínimo 30 visitas reales. Cierres o no. Es para que aprendas sin presión." }
];

const CHECKLIST = [
  "iPad o celular con la demo abierta",
  "Tarjeta NFC física para que la toquen",
  "Link / QR de registro a la mano",
  "Caso La Estancia listo en Google",
  "Tu celular para mostrar la búsqueda",
  "Esta herramienta abierta y cargada",
  "Pluma + libreta",
  "Presencia pro · sonrisa · postura"
];
