// Roll de Estaciones — pantalla principal
// Dos modos: "Mesero" (escoge su zona) y "Capitán" (ve todo y exporta PDF).

import { useState } from 'react';
import { AREAS, AUXILIARES, NEGOCIO, ZONAS } from './config/restaurant';
import type { Modo } from './types';
import { useStore } from './store';

// Recordamos el nombre del mesero en este dispositivo
const NOMBRE_KEY = 'mesero_nombre_v1';

function fechaBonita(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${dias[fecha.getDay()]} ${d} de ${meses[fecha.getMonth()]} ${y}`;
}

export default function App() {
  const { roll } = useStore();
  const [modo, setModo] = useState<Modo>('mesero');

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <div>
            <div className="brand">
              <h1>{NEGOCIO.nombre}</h1>
              <span>{NEGOCIO.marca}</span>
            </div>
            <p className="subtitle">Roll de Estaciones · {fechaBonita(roll.fecha)}</p>
          </div>
          <div className="modo-toggle">
            <button className={modo === 'mesero' ? 'active' : ''} onClick={() => setModo('mesero')}>
              Mesero
            </button>
            <button className={modo === 'capitan' ? 'active' : ''} onClick={() => setModo('capitan')}>
              Capitán
            </button>
          </div>
        </div>
      </header>

      {modo === 'mesero' ? <VistaMesero /> : <VistaCapitan />}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// VISTA MESERO — escribe tu nombre y toca tu zona
// ──────────────────────────────────────────────────────────
function VistaMesero() {
  const { roll, escoger, slotDeMesero } = useStore();
  const [nombre, setNombre] = useState<string>(() => localStorage.getItem(NOMBRE_KEY) || '');

  const nombreGuardado = nombre.trim();
  const miSlot = nombreGuardado ? slotDeMesero(nombreGuardado) : null;

  const guardarNombre = (v: string) => {
    setNombre(v);
    localStorage.setItem(NOMBRE_KEY, v);
  };

  const onEscoger = (slotId: string) => {
    if (!nombreGuardado) {
      alert('Primero escribe tu nombre arriba 👆');
      return;
    }
    const ocupante = roll.asignaciones[slotId];
    if (ocupante && ocupante.mesero.trim().toLowerCase() !== nombreGuardado.toLowerCase()) {
      const ok = confirm(`Esa zona ya la tiene ${ocupante.mesero}. ¿Seguro que es tuya?`);
      if (!ok) return;
    }
    escoger(slotId, nombreGuardado);
  };

  return (
    <>
      <div className="mesero-bar">
        <label htmlFor="nombre">Tu nombre</label>
        <div className="input-row">
          <input
            id="nombre"
            placeholder="Ej: Carlos"
            value={nombre}
            onChange={(e) => guardarNombre(e.target.value)}
          />
        </div>
        <p className="hint">
          {miSlot
            ? <>Estás en <strong>{etiquetaSlot(miSlot)}</strong>. Toca otra para cambiarte.</>
            : <>Toca la zona o el rol donde te quieres poner.</>}
        </p>
      </div>

      <Tablero onSlotClick={onEscoger} miNombre={nombreGuardado} />
    </>
  );
}

// ──────────────────────────────────────────────────────────
// VISTA CAPITÁN — panorama completo, liberar, PDF, nuevo día
// ──────────────────────────────────────────────────────────
function VistaCapitan() {
  const { roll, liberar, nuevoDia } = useStore();

  const totalSlots = ZONAS.length + AUXILIARES.length;
  const ocupados = Object.keys(roll.asignaciones).length;

  const onNuevoDia = () => {
    if (confirm('¿Empezar un roll nuevo en blanco? Se borra el de hoy.')) nuevoDia();
  };

  return (
    <>
      <div className="resumen">
        <div className="stat">
          <div className="n">{ocupados}</div>
          <div className="l">Zonas tomadas</div>
        </div>
        <div className="stat">
          <div className="n">{totalSlots - ocupados}</div>
          <div className="l">Libres</div>
        </div>
        <div className="stat">
          <div className="n">{contarMeseros(roll.asignaciones)}</div>
          <div className="l">Meseros en piso</div>
        </div>
      </div>

      <Tablero modoCapitan onSlotClick={(id) => liberar(id)} />

      {/* Encabezado que solo aparece al imprimir/PDF */}
      <div className="print-only print-header">
        <h2>{NEGOCIO.nombre} {NEGOCIO.marca} · Roll de Estaciones</h2>
        <p>{fechaBonita(roll.fecha)}</p>
      </div>

      <div className="action-bar">
        <div className="action-bar-inner">
          <button className="btn btn-danger" onClick={onNuevoDia}>Nuevo día</button>
          <button className="btn btn-primary" onClick={() => window.print()}>Descargar PDF</button>
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────
// TABLERO — zonas por área + auxiliares
// ──────────────────────────────────────────────────────────
function Tablero(props: {
  onSlotClick: (slotId: string) => void;
  miNombre?: string;
  modoCapitan?: boolean;
}) {
  const { roll } = useStore();
  const { onSlotClick, miNombre, modoCapitan } = props;

  return (
    <>
      {AREAS.map((area) => {
        const zonasArea = ZONAS.filter((z) => z.area === area.id);
        if (zonasArea.length === 0) return null;
        return (
          <section className="area" key={area.id}>
            <div className="area-title">{area.nombre}</div>
            <div className="zonas-grid">
              {zonasArea.map((z) => {
                const a = roll.asignaciones[z.id];
                const mia = !!a && !!miNombre && a.mesero.trim().toLowerCase() === miNombre.toLowerCase();
                return (
                  <button
                    key={z.id}
                    className={`zona ${a ? 'ocupada' : ''} ${mia ? 'mia' : ''}`}
                    onClick={() => onSlotClick(z.id)}
                  >
                    {mia && <span className="tag-mia">Tú</span>}
                    {modoCapitan && a && (
                      <span
                        className="liberar"
                        onClick={(e) => { e.stopPropagation(); onSlotClick(z.id); }}
                      >×</span>
                    )}
                    <span className="num">{z.numero}</span>
                    {z.mesas && z.mesas.length > 0 && (
                      <span className="mesas">Mesas {z.mesas.join(', ')}</span>
                    )}
                    {a ? <span className="ocupante">{a.mesero}</span> : <span className="libre">Libre</span>}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="area">
        <div className="area-title">Auxiliares</div>
        <div className="aux-grid">
          {AUXILIARES.map((aux) => {
            const a = roll.asignaciones[aux.id];
            const mia = !!a && !!miNombre && a.mesero.trim().toLowerCase() === miNombre.toLowerCase();
            return (
              <button
                key={aux.id}
                className={`zona ${a ? 'ocupada' : ''} ${mia ? 'mia' : ''}`}
                onClick={() => onSlotClick(aux.id)}
              >
                {mia && <span className="tag-mia">Tú</span>}
                {modoCapitan && a && (
                  <span
                    className="liberar"
                    onClick={(e) => { e.stopPropagation(); onSlotClick(aux.id); }}
                  >×</span>
                )}
                <span className="num" style={{ width: 'auto', padding: '0 10px', fontSize: 13 }}>
                  {aux.nombre}
                </span>
                {a ? <span className="ocupante">{a.mesero}</span> : <span className="libre">Libre</span>}
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────
function etiquetaSlot(slotId: string): string {
  const z = ZONAS.find((z) => z.id === slotId);
  if (z) return `Zona ${z.numero}`;
  const aux = AUXILIARES.find((a) => a.id === slotId);
  if (aux) return aux.nombre;
  return slotId;
}

function contarMeseros(asignaciones: Record<string, { mesero: string }>): number {
  const nombres = new Set(Object.values(asignaciones).map((a) => a.mesero.trim().toLowerCase()));
  return nombres.size;
}
