// El Gato — dinámica de ventas del día
// Tablero 3x3: el mesero marca lo que ya vendió (con foto del ticket).
// El primero que completa una línea hace "gato" y se lleva el premio.

import { useEffect, useState } from 'react';
import { GATO_CELDAS, GATO_INFO, LINEAS_GATO } from './config/gato';

const NOMBRE_KEY = 'mesero_nombre_v2';

interface ProgresoCelda {
  hechas: number;        // cuántas lleva
  foto?: string;         // foto del ticket (dataURL)
}

function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function cargar(key: string): ProgresoCelda[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as ProgresoCelda[];
  } catch { /* noop */ }
  return GATO_CELDAS.map(() => ({ hechas: 0 }));
}

export default function GatoScreen() {
  const [nombre, setNombre] = useState<string>(() => localStorage.getItem(NOMBRE_KEY) || '');
  const storeKey = `gato_${hoyISO()}_${(nombre || 'anon').trim().toLowerCase()}`;
  const [prog, setProg] = useState<ProgresoCelda[]>(() => cargar(storeKey));

  // Recargar progreso cuando cambia el mesero
  useEffect(() => { setProg(cargar(storeKey)); }, [storeKey]);
  useEffect(() => { localStorage.setItem(storeKey, JSON.stringify(prog)); }, [storeKey, prog]);

  const completas = prog.map((p, i) => p.hechas >= GATO_CELDAS[i].meta);
  const lineaGanada = LINEAS_GATO.find((l) => l.every((i) => completas[i]));
  const totalCompletas = completas.filter(Boolean).length;

  const sumar = (i: number, delta: number) =>
    setProg((prev) => prev.map((p, j) => (j === i ? { ...p, hechas: Math.max(0, Math.min(GATO_CELDAS[i].meta, p.hechas + delta)) } : p)));

  const ponerFoto = (i: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => setProg((prev) => prev.map((p, j) => (j === i ? { ...p, foto: reader.result as string, hechas: Math.max(p.hechas, 1) } : p)));
    reader.readAsDataURL(file);
  };

  return (
    <>
      <header className="header">
        <div className="header-row">
          <div>
            <p className="eyebrow">La Estancia · El reto del día</p>
            <h1 className="brand">El Gato 🎯</h1>
          </div>
        </div>
      </header>

      {/* Nombre */}
      <div className="mesero-bar">
        <label htmlFor="gnombre">Tu nombre</label>
        <div className="input-row">
          <input id="gnombre" placeholder="Ej: Carlos" value={nombre}
            onChange={(e) => { setNombre(e.target.value); localStorage.setItem(NOMBRE_KEY, e.target.value); }} />
        </div>
        <p className="hint">Marca lo que vayas vendiendo. Sube la <strong>foto del ticket</strong> como prueba. ¡Haz una línea y ganas!</p>
      </div>

      {/* Datos del día */}
      <div className="gato-info">
        <div className="gi"><span className="gi-l">Presupuesto del día</span><span className="gi-v">{GATO_INFO.presupuestoDia}</span></div>
        <div className="gi"><span className="gi-l">Meta por mesero</span><span className="gi-v">{GATO_INFO.metaPorMesero}</span></div>
        <div className="gi"><span className="gi-l">Push del mes</span><span className="gi-v">{GATO_INFO.pushDelMes}</span></div>
        <div className="gi"><span className="gi-l">911</span><span className="gi-v">{GATO_INFO.nueveOnce}</span></div>
      </div>

      <div className="frase">“{GATO_INFO.frase}”</div>

      {lineaGanada ? (
        <div className="gato-win">🎉 ¡GATO! Completaste una línea. ¡Avísale al capitán!</div>
      ) : (
        <div className="gato-prog">Llevas <b>{totalCompletas}/9</b> · te faltan {3 - Math.max(...LINEAS_GATO.map((l) => l.filter((i) => completas[i]).length))} para una línea</div>
      )}

      {/* Tablero */}
      <div className="gato-grid">
        {GATO_CELDAS.map((c, i) => {
          const p = prog[i];
          const done = completas[i];
          const enLinea = lineaGanada?.includes(i);
          return (
            <div key={i} className={`celda ${done ? 'done' : ''} ${enLinea ? 'linea' : ''}`}>
              {p.foto && <img className="celda-foto" src={p.foto} alt="ticket" />}
              <div className="celda-top">
                <span className="celda-cont">{p.hechas}/{c.meta}</span>
                {done && <span className="celda-check">✓</span>}
              </div>
              <div className="celda-txt">{c.texto}</div>
              <div className="celda-acc">
                <button className="cbtn" onClick={() => sumar(i, -1)}>−</button>
                <button className="cbtn mas" onClick={() => sumar(i, +1)}>+</button>
                <label className="cbtn foto">
                  📷
                  <input type="file" accept="image/*" capture="environment" hidden
                    onChange={(e) => e.target.files?.[0] && ponerFoto(i, e.target.files[0])} />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="premio">🏆 Premio del día: <b>{GATO_INFO.premio}</b></div>
    </>
  );
}
