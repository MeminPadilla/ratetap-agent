// Store del Roll de Estaciones
// Por ahora guarda todo en el navegador (localStorage). Cuando conectemos la
// nube, este es el único archivo que cambia para sincronizar entre celulares.

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Asignacion, RollDelDia, Zona } from './types';
import { COLORES_ZONA } from './config/restaurant';

const STORAGE_KEY = 'roll_estaciones_v2';

export function hoyISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function rollVacio(fecha: string): RollDelDia {
  return { fecha, zonas: [], aux: {}, creadoEn: Date.now() };
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
  // ── Mesero: tomar zona ──
  tomarZona: (zonaId: string, mesero: string) => boolean; // false si ya estaba tomada por otro
  // ── Auxiliares ──
  tomarAux: (rolId: string, mesero: string) => void;
  liberarAux: (rolId: string) => void;
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

    // Quita a un mesero de cualquier zona o rol que tuviera (un mesero = un lugar)
    const limpiarMesero = (roll: RollDelDia, mesero: string): RollDelDia => {
      const nombre = mesero.trim().toLowerCase();
      const zonas = roll.zonas.map((z) =>
        z.mesero?.trim().toLowerCase() === nombre ? { ...z, mesero: undefined, tomadaEn: undefined } : z,
      );
      const aux = { ...roll.aux };
      for (const [id, a] of Object.entries(aux)) {
        if (a.mesero.trim().toLowerCase() === nombre) delete aux[id];
      }
      return { ...roll, zonas, aux };
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
        setRoll((prev) => ({ ...prev, zonas: prev.zonas.filter((z) => z.id !== zonaId) })),

      toggleMesa: (zonaId, mesa) =>
        setRoll((prev) => {
          const zonas = prev.zonas.map((z) => {
            if (z.id === zonaId) {
              const tiene = z.mesas.includes(mesa);
              return { ...z, mesas: tiene ? z.mesas.filter((m) => m !== mesa) : [...z.mesas, mesa] };
            }
            // la mesa solo puede estar en una zona: la quitamos de las demás
            return { ...z, mesas: z.mesas.filter((m) => m !== mesa) };
          });
          return { ...prev, zonas };
        }),

      liberarZona: (zonaId) =>
        setRoll((prev) => ({
          ...prev,
          zonas: prev.zonas.map((z) =>
            z.id === zonaId ? { ...z, mesero: undefined, tomadaEn: undefined } : z,
          ),
        })),

      tomarZona: (zonaId, mesero) => {
        const nombre = mesero.trim();
        if (!nombre) return false;
        const zona = roll.zonas.find((z) => z.id === zonaId);
        // Bloqueo: si ya la tiene otro mesero, no se puede
        if (zona?.mesero && zona.mesero.trim().toLowerCase() !== nombre.toLowerCase()) return false;
        setRoll((prev) => {
          let next = limpiarMesero(prev, nombre);
          next = {
            ...next,
            zonas: next.zonas.map((z) =>
              z.id === zonaId ? { ...z, mesero: nombre, tomadaEn: Date.now() } : z,
            ),
          };
          return next;
        });
        return true;
      },

      tomarAux: (rolId, mesero) => {
        const nombre = mesero.trim();
        if (!nombre) return;
        setRoll((prev) => {
          const next = limpiarMesero(prev, nombre);
          return { ...next, aux: { ...next.aux, [rolId]: { mesero: nombre, asignadoEn: Date.now() } as Asignacion } };
        });
      },

      liberarAux: (rolId) =>
        setRoll((prev) => {
          const aux = { ...prev.aux };
          delete aux[rolId];
          return { ...prev, aux };
        }),

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
