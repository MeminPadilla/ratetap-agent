// Store del Roll de Estaciones
// Por ahora guarda todo en el navegador (localStorage). Cuando conectemos la
// nube, este es el único archivo que cambia para sincronizar entre celulares.

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { RollDelDia, Zona } from './types';
import { COLORES_ZONA } from './config/restaurant';

const STORAGE_KEY = 'roll_estaciones_v3';

export function hoyISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function rollVacio(fecha: string): RollDelDia {
  return { fecha, zonas: [], aux: {}, publicado: false, creadoEn: Date.now() };
}

function cargar(): RollDelDia {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RollDelDia;
      if (parsed.fecha === hoyISO()) return parsed;
    }
  } catch {
    // ignoramos errores de parseo
  }
  return rollVacio(hoyISO());
}

let _id = 0;
function nuevoId(): string {
  _id += 1;
  return `z${Date.now().toString(36)}${_id}`;
}

interface StoreValue {
  roll: RollDelDia;
  // ── Capitán: armar zonas ──
  agregarZona: () => string;
  eliminarZona: (zonaId: string) => void;
  toggleMesa: (zonaId: string, mesa: number) => void;
  liberarZona: (zonaId: string) => void; // quita al mesero, conserva las mesas
  publicar: (v: boolean) => void;
  // ── Capitán: auxiliares ──
  setAuxNombre: (rolId: string, nombre: string) => void;
  toggleAuxZona: (rolId: string, zonaId: string) => void;
  // ── Mesero: tomar zona ──
  tomarZona: (zonaId: string, mesero: string) => boolean; // false si ya estaba tomada por otro
  // ── General ──
  nuevoDia: () => void;
  // Consultas
  zonaDeMesa: (mesa: number) => Zona | undefined;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [roll, setRoll] = useState<RollDelDia>(() => cargar());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roll));
  }, [roll]);

  const value = useMemo<StoreValue>(() => {
    const zonaDeMesa = (mesa: number) => roll.zonas.find((z) => z.mesas.includes(mesa));

    // Quita a un mesero de cualquier zona que tuviera (un mesero = una zona)
    const limpiarMesero = (r: RollDelDia, mesero: string): RollDelDia => {
      const nombre = mesero.trim().toLowerCase();
      const zonas = r.zonas.map((z) =>
        z.mesero?.trim().toLowerCase() === nombre ? { ...z, mesero: undefined, tomadaEn: undefined } : z,
      );
      return { ...r, zonas };
    };

    return {
      roll,
      zonaDeMesa,

      agregarZona: () => {
        const id = nuevoId();
        setRoll((prev) => {
          const usados = new Set(prev.zonas.map((z) => z.color));
          const color = COLORES_ZONA.find((c) => !usados.has(c)) || COLORES_ZONA[prev.zonas.length % COLORES_ZONA.length];
          return { ...prev, zonas: [...prev.zonas, { id, color, mesas: [] }] };
        });
        return id;
      },

      eliminarZona: (zonaId) =>
        setRoll((prev) => {
          // también la quitamos de los auxiliares que la tuvieran asignada
          const aux: RollDelDia['aux'] = {};
          for (const [k, a] of Object.entries(prev.aux)) {
            aux[k] = { ...a, zonas: a.zonas.filter((z) => z !== zonaId) };
          }
          return { ...prev, zonas: prev.zonas.filter((z) => z.id !== zonaId), aux };
        }),

      toggleMesa: (zonaId, mesa) =>
        setRoll((prev) => {
          const zonas = prev.zonas.map((z) => {
            if (z.id === zonaId) {
              const tiene = z.mesas.includes(mesa);
              return { ...z, mesas: tiene ? z.mesas.filter((m) => m !== mesa) : [...z.mesas, mesa] };
            }
            return { ...z, mesas: z.mesas.filter((m) => m !== mesa) };
          });
          return { ...prev, zonas };
        }),

      liberarZona: (zonaId) =>
        setRoll((prev) => ({
          ...prev,
          zonas: prev.zonas.map((z) => (z.id === zonaId ? { ...z, mesero: undefined, tomadaEn: undefined } : z)),
        })),

      publicar: (v) => setRoll((prev) => ({ ...prev, publicado: v })),

      setAuxNombre: (rolId, nombre) =>
        setRoll((prev) => {
          const actual = prev.aux[rolId] ?? { nombre: '', zonas: [] };
          return { ...prev, aux: { ...prev.aux, [rolId]: { ...actual, nombre } } };
        }),

      toggleAuxZona: (rolId, zonaId) =>
        setRoll((prev) => {
          const actual = prev.aux[rolId] ?? { nombre: '', zonas: [] };
          const tiene = actual.zonas.includes(zonaId);
          const zonas = tiene ? actual.zonas.filter((z) => z !== zonaId) : [...actual.zonas, zonaId];
          return { ...prev, aux: { ...prev.aux, [rolId]: { ...actual, zonas } } };
        }),

      tomarZona: (zonaId, mesero) => {
        const nombre = mesero.trim();
        if (!nombre) return false;
        if (!roll.publicado) return false; // no se puede hasta que el capitán publique
        const zona = roll.zonas.find((z) => z.id === zonaId);
        if (zona?.mesero && zona.mesero.trim().toLowerCase() !== nombre.toLowerCase()) return false;
        setRoll((prev) => {
          let next = limpiarMesero(prev, nombre);
          next = {
            ...next,
            zonas: next.zonas.map((z) => (z.id === zonaId ? { ...z, mesero: nombre, tomadaEn: Date.now() } : z)),
          };
          return next;
        });
        return true;
      },

      nuevoDia: () => setRoll(rollVacio(hoyISO())),
    };
  }, [roll]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}
