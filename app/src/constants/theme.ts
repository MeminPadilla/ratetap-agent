export const colors = {
  bg: '#0E1116',
  surface: '#171B22',
  surfaceAlt: '#1F242D',
  border: '#262C36',
  text: '#F2F4F7',
  textDim: '#9098A4',
  textMuted: '#5E6672',
  primary: '#5B8DEF',
  income: '#34D399',
  expense: '#F87171',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 32,
  display: 48,
};

export const formatMoney = (value: number): string => {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  const fixed = abs.toFixed(2);
  const [whole, decimal] = fixed.split('.');
  const withSeparators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}$${withSeparators}.${decimal}`;
};
