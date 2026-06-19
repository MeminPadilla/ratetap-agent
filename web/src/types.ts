// Tipos del Roll de Estaciones

// Asignación de un mesero a una zona o rol auxiliar
export interface Asignacion {
  mesero: string; // nombre del mesero
  asignadoEn: number; // timestamp de cuándo escogió
}

// Estado del roll de un día
export interface RollDelDia {
  fecha: string; // formato YYYY-MM-DD
  // mapa: id de zona/auxiliar -> asignación (o ausente si está libre)
  asignaciones: Record<string, Asignacion>;
  creadoEn: number;
}

// Modo de uso de la app (mientras no hay cuentas/nube)
export type Modo = 'mesero' | 'capitan';
