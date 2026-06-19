// Configuración del restaurante — La Estancia Argentina
// El plano son MESAS individuales acomodadas como en la realidad.
// El capitán las agrupa en zonas cada día; el mesero escoge zona.
//
// Las coordenadas (x, y) son porcentajes sobre el "lienzo" del plano
// (0–100). Salieron del layout real de La Estancia. Si cambian las
// mesas de lugar, solo se ajustan aquí.

export type AreaId = 'abanico' | 'salon' | 'terraza_baja' | 'terraza_alta';
export type FormaMesa = 'cuadro' | 'circulo';

export interface Mesa {
  num: number; // número de mesa (lo que ve el personal)
  area: AreaId;
  x: number; // % horizontal (centro)
  y: number; // % vertical (centro)
  forma?: FormaMesa;
}

export interface AreaLabel {
  id: AreaId;
  nombre: string;
  x: number; // % centro del texto
  y: number;
  rotar?: boolean; // texto vertical (como en el plano)
}

// Etiquetas de área (texto tenue de fondo, como el plano en papel)
export const AREAS: AreaLabel[] = [
  { id: 'abanico', nombre: 'Abanico', x: 31, y: 13, rotar: true },
  { id: 'salon', nombre: 'Salón', x: 52, y: 72, rotar: true },
  { id: 'terraza_baja', nombre: 'Terraza Baja', x: 80, y: 28, rotar: true },
  { id: 'terraza_alta', nombre: 'Terraza Alta', x: 80, y: 80, rotar: true },
];

// Mesas y su posición en el plano
export const MESAS: Mesa[] = [
  // ── Abanico ──
  { num: 35, area: 'abanico', x: 21, y: 5 },
  { num: 34, area: 'abanico', x: 31, y: 5 },
  { num: 33, area: 'abanico', x: 43, y: 5 },
  { num: 30, area: 'abanico', x: 18, y: 19 },
  { num: 32, area: 'abanico', x: 43, y: 20 },
  { num: 31, area: 'abanico', x: 28, y: 28 },

  // ── Salón ──
  { num: 18, area: 'salon', x: 8, y: 46 },
  { num: 17, area: 'salon', x: 28, y: 47 },
  { num: 7, area: 'salon', x: 46, y: 47 },
  { num: 19, area: 'salon', x: 9, y: 59 },
  { num: 16, area: 'salon', x: 24, y: 58 },
  { num: 10, area: 'salon', x: 34, y: 58 },
  { num: 6, area: 'salon', x: 46, y: 58 },
  { num: 20, area: 'salon', x: 9, y: 71 },
  { num: 15, area: 'salon', x: 23, y: 71 },
  { num: 11, area: 'salon', x: 35, y: 71 },
  { num: 5, area: 'salon', x: 46, y: 70 },
  { num: 21, area: 'salon', x: 9, y: 83 },
  { num: 14, area: 'salon', x: 23, y: 83 },
  { num: 12, area: 'salon', x: 35, y: 82 },
  { num: 4, area: 'salon', x: 46, y: 82 },
  { num: 1, area: 'salon', x: 9, y: 93 },
  { num: 2, area: 'salon', x: 28, y: 93 },
  { num: 3, area: 'salon', x: 44, y: 94, forma: 'circulo' },

  // ── Terraza Baja ──
  { num: 43, area: 'terraza_baja', x: 71, y: 4 },
  { num: 44, area: 'terraza_baja', x: 88, y: 4, forma: 'circulo' },
  { num: 42, area: 'terraza_baja', x: 71, y: 13 },
  { num: 45, area: 'terraza_baja', x: 88, y: 12 },
  { num: 46, area: 'terraza_baja', x: 88, y: 20, forma: 'circulo' },
  { num: 47, area: 'terraza_baja', x: 88, y: 27 },
  { num: 41, area: 'terraza_baja', x: 71, y: 37 },
  { num: 48, area: 'terraza_baja', x: 88, y: 35 },
  { num: 49, area: 'terraza_baja', x: 88, y: 42 },
  { num: 40, area: 'terraza_baja', x: 71, y: 47, forma: 'circulo' },
  { num: 50, area: 'terraza_baja', x: 88, y: 51 },

  // ── Terraza Alta ──
  { num: 62, area: 'terraza_alta', x: 69, y: 66 },
  { num: 63, area: 'terraza_alta', x: 88, y: 64 },
  { num: 64, area: 'terraza_alta', x: 88, y: 72 },
  { num: 61, area: 'terraza_alta', x: 69, y: 77 },
  { num: 65, area: 'terraza_alta', x: 88, y: 79 },
  { num: 66, area: 'terraza_alta', x: 88, y: 87 },
  { num: 60, area: 'terraza_alta', x: 69, y: 87 },
  { num: 67, area: 'terraza_alta', x: 88, y: 95 },
];

// Roles auxiliares (la sección AUXILIARES del formato)
export const AUXILIARES: { id: string; nombre: string }[] = [
  { id: 'aux_terraza', nombre: 'Terraza' },
  { id: 'aux_salon', nombre: 'Salón' },
  { id: 'aux_runners', nombre: 'Runners' },
  { id: 'aux_pluma', nombre: 'Pluma' },
];

// Paleta de colores para las zonas del día (distintos y legibles en oscuro)
export const COLORES_ZONA = [
  '#c0473b', // vino
  '#d2a861', // dorado
  '#4bb3a7', // teal
  '#5aa97a', // verde
  '#9b7bd1', // violeta
  '#5b8fd6', // azul
  '#e0894a', // naranja
  '#d36a93', // rosa
  '#56b6c2', // cyan
  '#9bbf5a', // lima
];

export const NEGOCIO = {
  nombre: 'La Estancia',
  marca: 'Argentina',
};
