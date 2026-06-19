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
  const { roll, agregarZona, eliminarZona, toggleMesa, liberarZona, zonaDeMesa, nuevoDia, publicar } = useStore();
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

      {/* Publicar: hasta que el capitán publica, el mesero no puede escoger */}
      <div className={`publicar-bar ${roll.publicado ? 'on' : ''}`}>
        <div className="pb-txt">
          {roll.publicado
            ? <><b>Publicado ✓</b> — los meseros ya pueden escoger su zona.</>
            : <><b>Sin publicar</b> — arma las zonas y publícalas para que los meseros escojan.</>}
        </div>
        {roll.publicado
          ? <button className="btn btn-ghost" onClick={() => publicar(false)}>Despublicar</button>
          : <button className="btn btn-primary" onClick={() => publicar(true)} disabled={roll.zonas.length === 0}>Publicar zonas</button>}
      </div>

      <PrintHeader />

      <div className="acciones">
        <button className="btn btn-ghost" onClick={onNuevoDia}>Nuevo día</button>
        <button className="btn btn-primary" onClick={() => window.print()}>Descargar PDF</button>
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
    if (!roll.publicado) { alert('El capitán todavía no publica las zonas. Espera un momento ⏳'); return; }
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

      {!roll.publicado ? (
        <div className="vacio">⏳ El capitán todavía no publica las zonas del día.<br />En cuanto publique, aquí podrás escoger la tuya.</div>
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

      <Auxiliares />
    </>
  );
}

// ════════════════════════════════════════════════════════════
// AUXILIARES DE PISO — nombre + zonas que cubre cada uno
// Editable por el capitán; solo-lectura para el mesero y el PDF.
// ════════════════════════════════════════════════════════════
function Auxiliares(props: { modoCapitan?: boolean }) {
  const { roll, setAuxNombre, toggleAuxZona } = useStore();
  const { modoCapitan } = props;

  // resumen "Z2 · Z3" ordenado por número de zona
  const resumenZonas = (ids: string[]) =>
    ids
      .map((id) => roll.zonas.findIndex((z) => z.id === id) + 1)
      .filter((n) => n > 0)
      .sort((a, b) => a - b)
      .map((n) => `Z${n}`)
      .join(' · ');

  return (
    <section className="area">
      <div className="area-title"><span className="dot" /> Auxiliares de piso</div>
      <div className="aux-list">
        {AUXILIARES.map((a) => {
          const info = roll.aux[a.id] ?? { nombre: '', zonas: [] };
          return (
            <div key={a.id} className="auxrow">
              <div className="auxrow-rol">{a.nombre}</div>

              {modoCapitan && (
                <div className="auxrow-edit no-print">
                  <input
                    className="auxrow-input"
                    placeholder="Nombre del auxiliar"
                    value={info.nombre}
                    onChange={(e) => setAuxNombre(a.id, e.target.value)}
                  />
                  <div className="auxrow-zonas">
                    {roll.zonas.length === 0 ? (
                      <span className="auxrow-hint">Crea zonas primero</span>
                    ) : (
                      roll.zonas.map((z, i) => (
                        <button
                          key={z.id}
                          className={`zchip ${info.zonas.includes(z.id) ? 'on' : ''}`}
                          style={{ ['--c' as string]: z.color }}
                          onClick={() => toggleAuxZona(a.id, z.id)}
                        >
                          Z{i + 1}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Solo-lectura (mesero siempre; capitán solo en el PDF) */}
              <div className={`auxrow-ro ${modoCapitan ? 'print-only' : ''}`}>
                {info.nombre ? (
                  <span className="auxrow-name"><span className="avatar mini">{iniciales(info.nombre)}</span>{info.nombre}</span>
                ) : (
                  <span className="auxrow-name vacio-inline">Sin asignar</span>
                )}
                <span className="auxrow-zlist">{info.zonas.length ? resumenZonas(info.zonas) : '—'}</span>
              </div>
            </div>
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
