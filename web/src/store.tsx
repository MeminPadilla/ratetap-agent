// Store del Roll de Estaciones
// Por ahora guarda todo en el navegador (localStorage). Cuando conectemos
// la nube, este archivo es el único que cambia para sincronizar entre celulares.

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Asignacion, RollDelDia } from './types';

const STORAGE_KEY = 'roll_estaciones_v1';

// Fecha de hoy en formato YYYY-MM-DD (hora local)
export function hoyISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function rollVacio(fecha: string): RollDelDia {
  return { fecha, asignaciones: {}, creadoEn: Date.now() };
}

function cargar(): RollDelDia {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RollDelDia;
      // Si el roll guardado es de otro día, empezamos uno nuevo en blanco
      if (parsed.fecha === hoyISO()) return parsed;
    }
  } catch {
    // ignoramos errores de parseo
  }
  return rollVacio(hoyISO());
}

interface StoreValue {
  roll: RollDelDia;
  // El mesero escoge una zona/rol. Si ya tenía otra, se libera la anterior.
  escoger: (slotId: string, mesero: string) => void;
  // Liberar una zona/rol (capitán)
  liberar: (slotId: string) => void;
  // Empezar un roll nuevo en blanco
  nuevoDia: () => void;
  // ¿Qué slot tiene asignado este mesero? (para no duplicar)
  slotDeMesero: (mesero: string) => string | null;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [roll, setRoll] = useState<RollDelDia>(() => cargar());

  // Persistimos en localStorage en cada cambio
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roll));
  }, [roll]);

  const value = useMemo<StoreValue>(() => {
    const slotDeMesero = (mesero: string): string | null => {
      const nombre = mesero.trim().toLowerCase();
      for (const [slotId, a] of Object.entries(roll.asignaciones)) {
        if (a.mesero.trim().toLowerCase() === nombre) return slotId;
      }
      return null;
    };

    return {
      roll,
      slotDeMesero,
      escoger: (slotId, mesero) => {
        const nombre = mesero.trim();
        if (!nombre) return;
        setRoll((prev) => {
          const asignaciones = { ...prev.asignaciones };
          // Liberamos cualquier slot que tuviera antes este mesero
          for (const [id, a] of Object.entries(asignaciones)) {
            if (a.mesero.trim().toLowerCase() === nombre.toLowerCase()) {
              delete asignaciones[id];
            }
          }
          const nueva: Asignacion = { mesero: nombre, asignadoEn: Date.now() };
          asignaciones[slotId] = nueva;
          return { ...prev, asignaciones };
        });
      },
      liberar: (slotId) => {
        setRoll((prev) => {
          const asignaciones = { ...prev.asignaciones };
          delete asignaciones[slotId];
          return { ...prev, asignaciones };
        });
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
