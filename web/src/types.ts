// Tipos del Roll de Estaciones

// Una zona del día: un grupo de mesas que el capitán arma a su conveniencia.
export interface Zona {
  id: string;
  color: string;
  mesas: number[]; // números de mesa que la forman
  mesero?: string; // quién la tomó (si está vacío, está libre)
  tomadaEn?: number; // timestamp de cuándo la tomaron
}

// Auxiliar de piso: una posición con su nombre y las zonas que cubre.
export interface Auxiliar {
  nombre: string;     // nombre de quien toma la posición
  zonas: string[];    // ids de las zonas que le corresponden
}

// Estado del roll de un día
export interface RollDelDia {
  fecha: string; // YYYY-MM-DD
  zonas: Zona[];
  aux: Record<string, Auxiliar>; // id de posición (Terraza, Salón...) -> auxiliar
  publicado: boolean; // hasta que el capitán publica, el mesero no puede escoger
  creadoEn: number;
}

export type Modo = 'capitan' | 'mesero';
