// Roll de Estaciones — La Estancia
// Plano real de mesas. El capitán agrupa mesas en zonas; el mesero escoge zona.

import { useMemo, useState } from 'react';
import { AREAS, AUXILIARES, MESAS, NEGOCIO } from './config/restaurant';
import type { Mesa } from './config/restaurant';
import type { Zona } from './types';
import type { Modo } from './types';
import { useStore } from './store';
import GatoScreen from './Gato';

type Tab = 'roll' | 'gato';

const NOMBRE_KEY = 'mesero_nombre_v2';

function fechaBonita(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const f = new Date(y, m - 1, d);
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${dias[f.getDay()]} ${d} de ${meses[f.getMonth()]} ${y}`;
}

function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/);
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase() || '?';
}

// Centro aproximado de una zona (promedio de sus mesas) para poner su etiqueta
function centroZona(zona: Zona): { x: number; y: number } | null {
  const ms = MESAS.filter((m) => zona.mesas.includes(m.num));
  if (ms.length === 0) return null;
  const x = ms.reduce((s, m) => s + m.x, 0) / ms.length;
  const y = ms.reduce((s, m) => s + m.y, 0) / ms.length;
  return { x, y };
}

export default function App() {
  const [tab, setTab] = useState<Tab>('roll');
  return (
    <div className="app">
      {tab === 'roll' ? <RollScreen /> : <GatoScreen />}
      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
}

// Barra de pestañas inferior: Roll del día / El Gato
function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <nav className="tabbar">
      <button className={tab === 'roll' ? 'active' : ''} onClick={() => setTab('roll')}>
        <span className="tb-ico">🗺️</span>
        <span>Roll del día</span>
      </button>
      <button className={tab === 'gato' ? 'active' : ''} onClick={() => setTab('gato')}>
        <span className="tb-ico">🎯</span>
        <span>El Gato</span>
      </button>
    </nav>
  );
}

function RollScreen() {
  const { roll } = useStore();
  const [modo, setModo] = useState<Modo>('capitan');

  return (
    <>
      <header className="header">
        <div className="header-row">
          <div>
            <p className="eyebrow">{NEGOCIO.nombre} · {NEGOCIO.marca}</p>
            <h1 className="brand">Roll de Estaciones</h1>
            <p className="subtitle">{fechaBonita(roll.fecha)}</p>
          </div>
          <div className="modo-toggle">
            <button className={modo === 'capitan' ? 'active' : ''} onClick={() => setModo('capitan')}>Capitán</button>
            <button className={modo === 'mesero' ? 'active' : ''} onClick={() => setModo('mesero')}>Mesero</button>
          </div>
        </div>
      </header>

      {modo === 'capitan' ? <VistaCapitan /> : <VistaMesero />}
    </>
  );
}

// ════════════════════════════════════════════════════════════
// PLANO — mesas posicionadas como en la realidad
// ════════════════════════════════════════════════════════════
function Plano(props: {
  zonaSeleccionada?: string | null;
  onMesa: (mesa: Mesa) => void;
  miMesero?: string;
}) {
  const { roll } = useStore();
  const { zonaSeleccionada, onMesa, miMesero } = props;

  const colorDeMesa = useMemo(() => {
    const map = new Map<number, Zona>();
    for (const z of roll.zonas) for (const m of z.mesas) map.set(m, z);
    return map;
  }, [roll.zonas]);

  const miNombre = miMesero?.trim().toLowerCase();

  return (
    <div className="plano-wrap">
      <div className="plano">
        {/* etiquetas de área (tenues, como el plano) */}
        {AREAS.map((a) => (
          <span
            key={a.id}
            className={`area-label ${a.rotar ? 'rot' : ''}`}
            style={{ left: `${a.x}%`, top: `${a.y}%` }}
          >
            {a.nombre}
          </span>
        ))}

        {/* mesas */}
        {MESAS.map((m) => {
          const zona = colorDeMesa.get(m.num);
          const enSeleccion = zona && zona.id === zonaSeleccionada;
          const esMia = !!zona?.mesero && zona.mesero.trim().toLowerCase() === miNombre;
          return (
            <button
              key={m.num}
              className={`mesa ${m.forma === 'circulo' ? 'circ' : ''} ${zona ? 'enzona' : ''} ${enSeleccion ? 'sel' : ''} ${esMia ? 'mia' : ''}`}
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                ...(zona ? { background: zona.color, borderColor: zona.color } : {}),
              }}
              onClick={() => onMesa(m)}
            >
              {m.num}
            </button>
          );
        })}

        {/* etiqueta de cada zona: número + mesero (esto sale tal cual en el PDF) */}
        {roll.zonas.map((z, i) => {
          const c = centroZona(z);
          if (!c) return null;
          return (
            <span key={z.id} className="zona-tag" style={{ left: `${c.x}%`, top: `${c.y}%`, background: z.color }}>
              <b>Z{i + 1}</b>
              {z.mesero ? <span className="zt-nombre">{z.mesero}</span> : <span className="zt-libre">libre</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// VISTA CAPITÁN — arma las zonas del día
// ════════════════════════════════════════════════════════════
function VistaCapitan() {
  const { roll, agregarZona, eliminarZona, toggleMesa, liberarZona, zonaDeMesa, nuevoDia } = useStore();
  const [sel, setSel] = useState<string | null>(null);

  const mesasAsignadas = roll.zonas.reduce((s, z) => s + z.mesas.length, 0);

  const onMesa = (m: Mesa) => {
    if (!sel) {
      // si no hay zona elegida, seleccionamos la de esa mesa (o avisamos)
      const z = zonaDeMesa(m.num);
      if (z) { setSel(z.id); return; }
      alert('Primero crea o elige una zona (botón "Nueva zona"), luego toca las mesas.');
      return;
    }
    toggleMesa(sel, m.num);
  };

  const onNueva = () => setSel(agregarZona());
  const onNuevoDia = () => { if (confirm('¿Empezar un roll nuevo en blanco? Se borra el de hoy.')) { nuevoDia(); setSel(null); } };

  const zonaSel = roll.zonas.find((z) => z.id === sel);

  return (
    <>
      <div className="resumen">
        <div className="stat"><div className="n">{roll.zonas.length}</div><div className="l">Zonas</div></div>
        <div className="stat acento"><div className="n">{roll.zonas.filter((z) => z.mesero).length}</div><div className="l">Tomadas</div></div>
        <div className="stat"><div className="n">{mesasAsignadas}/{MESAS.length}</div><div className="l">Mesas</div></div>
      </div>

      {/* Zonas: chips + crear */}
      <div className="zonas-bar">
        <div className="zonas-chips">
          {roll.zonas.map((z, i) => (
            <button
              key={z.id}
              className={`chip ${sel === z.id ? 'sel' : ''}`}
              style={{ ['--c' as string]: z.color }}
              onClick={() => setSel(sel === z.id ? null : z.id)}
            >
              <span className="chip-dot" />
              <span className="chip-txt">Z{i + 1}</span>
              <span className="chip-sub">{z.mesas.length}</span>
              <span className="chip-x" onClick={(e) => { e.stopPropagation(); if (confirm(`¿Borrar Zona ${i + 1}?`)) { eliminarZona(z.id); if (sel === z.id) setSel(null); } }}>×</span>
            </button>
          ))}
          <button className="chip nueva" onClick={onNueva}>+ Nueva zona</button>
        </div>
      </div>

      <p className="hint capitan-hint">
        {zonaSel
          ? <>Armando <strong>Zona {roll.zonas.indexOf(zonaSel) + 1}</strong> — toca las mesas para meterlas o sacarlas. {zonaSel.mesero && <>· La tomó <strong>{zonaSel.mesero}</strong></>}</>
          : <>Crea una zona y toca las mesas del plano para agruparlas a tu gusto.</>}
      </p>

      <Plano zonaSeleccionada={sel} onMesa={onMesa} />

      {zonaSel?.mesero && (
        <button className="btn btn-ghost soltar" onClick={() => liberarZona(zonaSel.id)}>
          Soltar la Zona {roll.zonas.indexOf(zonaSel) + 1} ({zonaSel.mesero})
        </button>
      )}

      <Auxiliares modoCapitan />

      <PrintHeader />

      <div className="acciones">
        <button className="btn btn-ghost" onClick={onNuevoDia}>Nuevo día</button>
        <button className="btn btn-gold" onClick={() => window.print()}>Descargar PDF</button>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// VISTA MESERO — escoge una zona ya armada
// ════════════════════════════════════════════════════════════
function VistaMesero() {
  const { roll, tomarZona, zonaDeMesa } = useStore();
  const [nombre, setNombre] = useState<string>(() => localStorage.getItem(NOMBRE_KEY) || '');
  const guardar = (v: string) => { setNombre(v); localStorage.setItem(NOMBRE_KEY, v); };
  const yo = nombre.trim();
  const miZona = roll.zonas.find((z) => z.mesero?.trim().toLowerCase() === yo.toLowerCase());

  const intentarTomar = (zonaId: string) => {
    if (!yo) { alert('Primero escribe tu nombre arriba 👆'); return; }
    const z = roll.zonas.find((x) => x.id === zonaId);
    if (z?.mesero && z.mesero.trim().toLowerCase() !== yo.toLowerCase()) {
      alert(`La Zona ya la tiene ${z.mesero}. Escoge otra 🙏`);
      return;
    }
    tomarZona(zonaId, yo);
  };

  const onMesa = (m: Mesa) => {
    const z = zonaDeMesa(m.num);
    if (!z) { alert('Esa mesa todavía no está en ninguna zona. Pregúntale al capitán.'); return; }
    intentarTomar(z.id);
  };

  return (
    <>
      <div className="mesero-bar">
        <label htmlFor="nombre">Tu nombre</label>
        <div className="input-row">
          <input id="nombre" placeholder="Ej: Carlos" value={nombre} onChange={(e) => guardar(e.target.value)} />
        </div>
        <p className="hint">
          {miZona
            ? <>Estás en <strong>Zona {roll.zonas.indexOf(miZona) + 1}</strong>. Toca otra libre para cambiarte.</>
            : <>Toca la <strong>zona</strong> que te convenga (o cualquier mesa de ella).</>}
        </p>
      </div>

      {roll.zonas.length === 0 ? (
        <div className="vacio">El capitán todavía no arma las zonas del día. Espera un momento ⏳</div>
      ) : (
        <div className="zonas-bar">
          <div className="zonas-chips lista">
            {roll.zonas.map((z, i) => {
              const tomadaPorOtro = !!z.mesero && z.mesero.trim().toLowerCase() !== yo.toLowerCase();
              const mia = !!z.mesero && z.mesero.trim().toLowerCase() === yo.toLowerCase();
              return (
                <button
                  key={z.id}
                  className={`chip grande ${tomadaPorOtro ? 'bloqueada' : ''} ${mia ? 'sel' : ''}`}
                  style={{ ['--c' as string]: z.color }}
                  disabled={tomadaPorOtro}
                  onClick={() => intentarTomar(z.id)}
                >
                  <span className="chip-dot" />
                  <span className="chip-txt">Zona {i + 1}</span>
                  <span className="chip-sub">{z.mesas.length} mesas</span>
                  <span className="chip-estado">{z.mesero ? (mia ? '✓ Tú' : z.mesero) : 'Libre'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Plano onMesa={onMesa} miMesero={yo} />

      <Auxiliares meseroNombre={yo} />
    </>
  );
}

// ════════════════════════════════════════════════════════════
// AUXILIARES
// ════════════════════════════════════════════════════════════
function Auxiliares(props: { modoCapitan?: boolean; meseroNombre?: string }) {
  const { roll, tomarAux, liberarAux } = useStore();
  const { modoCapitan, meseroNombre } = props;

  const onTap = (id: string) => {
    const actual = roll.aux[id];
    if (modoCapitan) {
      if (actual && confirm(`¿Soltar ${actual.mesero} de este rol?`)) liberarAux(id);
      return;
    }
    const yo = (meseroNombre || '').trim();
    if (!yo) { alert('Primero escribe tu nombre arriba 👆'); return; }
    if (actual && actual.mesero.trim().toLowerCase() !== yo.toLowerCase()) {
      alert(`Ese rol lo tiene ${actual.mesero}.`); return;
    }
    tomarAux(id, yo);
  };

  return (
    <section className="area">
      <div className="area-title"><span className="dot" /> Auxiliares</div>
      <div className="aux-grid">
        {AUXILIARES.map((a) => {
          const asig = roll.aux[a.id];
          const mia = !!asig && !!meseroNombre && asig.mesero.trim().toLowerCase() === meseroNombre.trim().toLowerCase();
          return (
            <button key={a.id} className={`aux ${asig ? 'ocupada' : ''} ${mia ? 'mia' : ''}`} onClick={() => onTap(a.id)}>
              <span className="aux-rol">{a.nombre}</span>
              {asig ? (
                <span className="aux-quien"><span className="avatar mini">{iniciales(asig.mesero)}</span>{asig.mesero}</span>
              ) : (
                <span className="aux-libre">Libre</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// Encabezado que solo aparece al imprimir / generar PDF
function PrintHeader() {
  const { roll } = useStore();
  return (
    <div className="print-only print-header">
      <h2 className="brand">{NEGOCIO.nombre} {NEGOCIO.marca}</h2>
      <p>Roll de Estaciones · {fechaBonita(roll.fecha)}</p>
    </div>
  );
}
