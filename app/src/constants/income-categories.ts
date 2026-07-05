// Categorías de ingreso — lista editable, NO union type hardcodeado.
// El código core referencia IncomeCategory.id (string), de modo que el
// usuario puede editar/agregar categorías en el futuro sin tocar los tipos.

export interface IncomeCategory {
  id: string;
  label: string;
}

export const INCOME_CATEGORIES: IncomeCategory[] = [
  { id: 'nomina', label: 'Nómina Estancia' },
  { id: 'comision', label: 'Comisión Estancia' },
  { id: 'ratetap_stripe', label: 'RateTap (Stripe)' },
  { id: 'ratetap_directo', label: 'RateTap (directo)' },
  { id: 'otro', label: 'Otro' },
];

export const incomeCategoryById = (id: string): IncomeCategory | undefined =>
  INCOME_CATEGORIES.find((c) => c.id === id);
