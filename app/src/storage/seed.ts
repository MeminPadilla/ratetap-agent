// Datos semilla del store. Compartidos por useStore (estado inicial en una
// instalación nueva) y por las migraciones (defaults cuando faltan campos).

import { ACCOUNTS } from '../constants/accounts';
import { AccountId, Loan } from '../types';

const newId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Saldos/usados iniciales por cuenta, tomados de la config de ACCOUNTS.
 * Devuelve siempre un registro con TODAS las cuentas presentes.
 */
export const seedOpeningBalances = (): Record<AccountId, number> => {
  const out = {} as Record<AccountId, number>;
  for (const a of ACCOUNTS) out[a.id] = a.openingBalance;
  return out;
};

/**
 * Préstamos iniciales. Actualmente: los $150,000 prestados a los primos,
 * aún sin cobrar y sin fecha de pago definida.
 */
export const seedLoans = (): Loan[] => {
  const now = new Date().toISOString();
  return [
    {
      id: newId(),
      debtor: 'Primos',
      amountOriginal: 150000,
      amountOutstanding: 150000,
      dateGiven: now,
      createdAt: now,
    },
  ];
};
