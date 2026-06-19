// Configuración de "El Gato" — dinámica de ventas del día.
// El capitán puede cambiar estos datos cada día (en el futuro, desde la app).

export interface CeldaGato {
  texto: string; // qué hay que vender
  meta: number;  // cuántas hay que lograr
}

// Tablero 3x3 (de izquierda a derecha, de arriba a abajo)
export const GATO_CELDAS: CeldaGato[] = [
  { texto: 'Reseñas c/foto Google', meta: 2 },
  { texto: 'Ensaladas (excepto Evita)', meta: 3 },
  { texto: 'Akaushi', meta: 2 },
  { texto: 'Tomahawk', meta: 1 },
  { texto: 'Botellas de vino', meta: 2 },
  { texto: 'Reseñas c/foto Google', meta: 2 },
  { texto: 'Entradas (excepto Carmen)', meta: 3 },
  { texto: 'Reservas c/foto Google', meta: 2 },
  { texto: 'Club VIP', meta: 4 },
];

// Datos del día (encabezado del formato)
export const GATO_INFO = {
  presupuestoDia: '$75,000',
  metaPorMesero: '$11,000',
  efectividad: 'Jamón ibérico y venta de vino',
  nueveOnce: 'Akaushi y Huesos', // "911"
  pushDelMes: 'Club VIP · Reseñas',
  frase:
    'Esta semana no se vende vino por suerte: se vende con colmillo. El que domina la mesa, domina la propina. Tiburón que no empuja, no come.',
  premio: '$250 + 1 Anochecer + 1 Noche de Vino',
};

// Las 8 líneas que hacen "gato" (filas, columnas y diagonales)
export const LINEAS_GATO: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
  [0, 4, 8], [2, 4, 6],            // diagonales
];
