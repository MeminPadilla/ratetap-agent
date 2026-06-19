// Configuración del restaurante — La Estancia Argentina
// Aquí defines las zonas del layout y los roles auxiliares.
// Si cambian las zonas, solo edita este archivo.

export type AreaId = 'terraza_baja' | 'terraza_alta' | 'abanico' | 'salon';

export interface Area {
  id: AreaId;
  nombre: string;
}

export interface ZonaConfig {
  id: string; // identificador único (ej: "z1")
  numero: string; // número/etiqueta que ve el mesero (ej: "1")
  area: AreaId;
  mesas?: string[]; // mesas que abarca la zona (informativo)
}

// Áreas del restaurante (tal cual el plano en papel)
export const AREAS: Area[] = [
  { id: 'terraza_baja', nombre: 'Terraza Baja' },
  { id: 'terraza_alta', nombre: 'Terraza Alta' },
  { id: 'abanico', nombre: 'Abanico' },
  { id: 'salon', nombre: 'Salón' },
];

// Zonas/estaciones numeradas (los números grandes del plano)
export const ZONAS: ZonaConfig[] = [
  { id: 'z1', numero: '1', area: 'terraza_baja', mesas: ['44', '45', '46', '47', '43'] },
  { id: 'z2', numero: '2', area: 'terraza_baja', mesas: ['48', '49', '50', '40'] },
  { id: 'zta', numero: 'TA', area: 'terraza_alta', mesas: ['60', '61', '62'] },
  { id: 'z3', numero: '3', area: 'abanico', mesas: ['33', '34', '35'] },
  { id: 'z4', numero: '4', area: 'abanico', mesas: ['11', '30'] },
  { id: 'z5', numero: '5', area: 'salon', mesas: ['18'] },
  { id: 'z6', numero: '6', area: 'salon', mesas: ['19'] },
  { id: 'z7', numero: '7', area: 'salon', mesas: ['20', '21'] },
  { id: 'z8', numero: '8', area: 'salon', mesas: [] },
];

// Roles auxiliares (la columna de la derecha en el papel)
export const AUXILIARES: { id: string; nombre: string }[] = [
  { id: 'aux_terraza', nombre: 'Terraza' },
  { id: 'aux_salon', nombre: 'Salón' },
  { id: 'aux_runners', nombre: 'Runners' },
  { id: 'aux_pluma', nombre: 'Pluma' },
];

// Datos del negocio
export const NEGOCIO = {
  nombre: 'La Estancia',
  marca: 'Argentina',
};
