// El Gato — dinámica de ventas del día
// Capitán: escribe qué se vende en cada cuadrante (producto + cantidad) y los datos del día.
// Mesero: marca lo que ya vendió (con foto del ticket). El primero en hacer línea gana.

import { useEffect, useState } from 'react';
import { GATO_CELDAS, GATO_INFO, LINEAS_GATO } from './config/gato';
import type { CeldaGato } from './config/gato';

const NOMBRE_KEY = 'mesero_nombre_v2';

interface GatoInfo {
  presupuestoDia: string;
  metaPorMesero: string;
  pushDelMes: string;
  nueveOnce: string;
  frase: string;
  premio: string;
}
interface GatoDef { celdas: CeldaGato[]; info: GatoInfo }
interface ProgresoCelda { hechas: number; foto?: string }

function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function cargarDef(): GatoDef {
  try {
    const raw = localStorage.getItem(`gatoDef_${hoyISO()}`);
    if (raw) return JSON.parse(raw) as GatoDef;
  } catch { /* noop */ }
  return { celdas: GATO_CELDAS.map((c) => ({ ...c })), info: { ...GATO_INFO } };
}

function cargarProg(key: string): ProgresoCelda[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as ProgresoCelda[];
  } catch { /* noop */ }
  return Array.from({ length: 9 }, () => ({ hechas: 0 }));
}

export default function GatoScreen() {
  const [modo, setModo] = useState<'capitan' | 'mesero'>('mesero');
  const [def, setDef] = useState<GatoDef>(() => cargarDef());

  useEffect(() => { localStorage.setItem(`gatoDef_${hoyISO()}`, JSON.stringify(def)); }, [def]);

  return (
    <>
      <header className="header">
        <div className="header-row">
          <div>
            <p className="eyebrow">La Estancia · El reto del día</p>
            <h1 className="brand">El Gato 🎯</h1>
          </div>
          <div className="modo-toggle">
            <button className={modo === 'capitan' ? 'active' : ''} onClick={() => setModo('capitan')}>Capitán</button>
            <button className={modo === 'mesero' ? 'active' : ''} onClick={() => setModo('mesero')}>Mesero</button>
          </div>
        </div>
      </header>

      {modo === 'capitan' ? <EditorGato def={def} setDef={setDef} /> : <JuegoGato def={def} />}
    </>
  );
}

// ════════════════════════════════════════════════════════════
// CAPITÁN — arma el Gato del día
// ════════════════════════════════════════════════════════════
function EditorGato({ def, setDef }: { def: GatoDef; setDef: (d: GatoDef) => void }) {
  const setInfo = (campo: keyof GatoInfo, val: string) => setDef({ ...def, info: { ...def.info, [campo]: val } });
  const setCelda = (i: number, campo: keyof CeldaGato, val: string | number) =>
    setDef({ ...def, celdas: def.celdas.map((c, j) => (j === i ? { ...c, [campo]: val } : c)) });

  return (
    <>
      <p className="hint capitan-hint">Escribe lo que quieres que vendan hoy. Lo que pongas aquí es lo que verán los meseros.</p>

      <div className="gato-info">
        <label className="gi">Presupuesto del día
          <input value={def.info.presupuestoDia} onChange={(e) => setInfo('presupuestoDia', e.target.value)} placeholder="$75,000" />
        </label>
        <label className="gi">Meta por mesero
          <input value={def.info.metaPorMesero} onChange={(e) => setInfo('metaPorMesero', e.target.value)} placeholder="$11,000" />
        </label>
        <label className="gi">Push del mes
          <input value={def.info.pushDelMes} onChange={(e) => setInfo('pushDelMes', e.target.value)} placeholder="Club VIP" />
        </label>
        <label className="gi">911
          <input value={def.info.nueveOnce} onChange={(e) => setInfo('nueveOnce', e.target.value)} placeholder="Akaushi y Huesos" />
        </label>
      </div>

      <div className="frase">
        <textarea value={def.info.frase} onChange={(e) => setInfo('frase', e.target.value)} placeholder="Frase del día..." />
      </div>

      <div className="gato-grid">
        {def.celdas.map((c, i) => (
          <div key={i} className="celda edit">
            <span className="e-num">Cuadro {i + 1}</span>
            <textarea className="e-prod" value={c.texto} onChange={(e) => setCelda(i, 'texto', e.target.value)} placeholder="Producto..." />
            <div className="e-cant-row">
              Cantidad:
              <input className="e-cant" type="number" min={1} value={c.meta}
                onChange={(e) => setCelda(i, 'meta', Math.max(1, Number(e.target.value) || 1))} />
            </div>
          </div>
        ))}
      </div>

      <div className="premio">
        🏆 Premio del día:
        <input value={def.info.premio} onChange={(e) => setInfo('premio', e.target.value)} placeholder="$250 + ..." />
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// MESERO — juega el Gato
// ════════════════════════════════════════════════════════════
function JuegoGato({ def }: { def: GatoDef }) {
  const [nombre, setNombre] = useState<string>(() => localStorage.getItem(NOMBRE_KEY) || '');
  const storeKey = `gato_${hoyISO()}_${(nombre || 'anon').trim().toLowerCase()}`;
  const [prog, setProg] = useState<ProgresoCelda[]>(() => cargarProg(storeKey));

  useEffect(() => { setProg(cargarProg(storeKey)); }, [storeKey]);
  useEffect(() => { localStorage.setItem(storeKey, JSON.stringify(prog)); }, [storeKey, prog]);

  const completas = prog.map((p, i) => p.hechas >= def.celdas[i].meta);
  const lineaGanada = LINEAS_GATO.find((l) => l.every((i) => completas[i]));
  const totalCompletas = completas.filter(Boolean).length;
  const mejorLinea = Math.max(...LINEAS_GATO.map((l) => l.filter((i) => completas[i]).length));

  const sumar = (i: number, delta: number) =>
    setProg((prev) => prev.map((p, j) => (j === i ? { ...p, hechas: Math.max(0, Math.min(def.celdas[i].meta, p.hechas + delta)) } : p)));

  const ponerFoto = (i: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => setProg((prev) => prev.map((p, j) => (j === i ? { ...p, foto: reader.result as string, hechas: Math.max(p.hechas, 1) } : p)));
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="mesero-bar">
        <label htmlFor="gnombre">Tu nombre</label>
        <div className="input-row">
          <input id="gnombre" placeholder="Ej: Carlos" value={nombre}
            onChange={(e) => { setNombre(e.target.value); localStorage.setItem(NOMBRE_KEY, e.target.value); }} />
        </div>
        <p className="hint">Marca lo que vayas vendiendo y sube la <strong>foto del ticket</strong>. ¡Haz una línea y ganas!</p>
      </div>

      <div className="gato-info">
        <div className="gi"><span className="gi-l">Presupuesto del día</span><span className="gi-v">{def.info.presupuestoDia || '—'}</span></div>
        <div className="gi"><span className="gi-l">Meta por mesero</span><span className="gi-v">{def.info.metaPorMesero || '—'}</span></div>
        <div className="gi"><span className="gi-l">Push del mes</span><span className="gi-v">{def.info.pushDelMes || '—'}</span></div>
        <div className="gi"><span className="gi-l">911</span><span className="gi-v">{def.info.nueveOnce || '—'}</span></div>
      </div>

      {def.info.frase && <div className="frase">“{def.info.frase}”</div>}

      {lineaGanada ? (
        <div className="gato-win">🎉 ¡GATO! Completaste una línea. ¡Avísale al capitán!</div>
      ) : (
        <div className="gato-prog">Llevas <b>{totalCompletas}/9</b> · te faltan {3 - mejorLinea} para una línea</div>
      )}

      <div className="gato-grid">
        {def.celdas.map((c, i) => {
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

      <div className="premio">🏆 Premio del día: <b>{def.info.premio || '—'}</b></div>
    </>
  );
}
