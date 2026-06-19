// Tipos del Roll de Estaciones

// Una zona del día: un grupo de mesas que el capitán arma a su conveniencia.
export interface Zona {
  id: string;
  color: string;
  mesas: number[]; // números de mesa que la forman
  mesero?: string; // quién la tomó (si está vacío, está libre)
  tomadaEn?: number; // timestamp de cuándo la tomaron
}

// Asignación de un rol auxiliar
export interface Asignacion {
  mesero: string;
  asignadoEn: number;
}

// Estado del roll de un día
export interface RollDelDia {
  fecha: string; // YYYY-MM-DD
  zonas: Zona[];
  aux: Record<string, Asignacion>; // id de rol auxiliar -> asignación
  creadoEn: number;
}

export type Modo = 'capitan' | 'mesero';
