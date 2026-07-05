import { Account, AccountId } from '../types';

// Cuentas reales del usuario. `openingBalance` es el saldo/usado inicial
// "semilla": el punto de partida sobre el que se acumulan las transacciones.
// Es editable en cualquier momento desde el modal "Editar saldos".
export const ACCOUNTS: Account[] = [
  // --- Cuentas de débito (dinero disponible) ---
  { id: 'cash',    label: 'Efectivo',      kind: 'debit',  color: '#22C55E', emoji: '💵', openingBalance: 22000 },
  { id: 'mp',      label: 'Mercado Pago',  kind: 'debit',  color: '#00B1EA', emoji: '💳', openingBalance: 33932 },
  { id: 'revolut', label: 'Revolut',       kind: 'debit',  color: '#111827', emoji: '🌐', openingBalance: 5162 },
  { id: 'bbva',    label: 'BBVA',          kind: 'debit',  color: '#1B4DA0', emoji: '🏦', openingBalance: 0 },
  { id: 'spin',    label: 'Spin by OXXO',  kind: 'debit',  color: '#E4022D', emoji: '🔴', openingBalance: 200 },

  // --- Tarjetas de crédito (openingBalance = usado inicial) ---
  { id: 'tc_mp',   label: 'TC Mercado Pago', kind: 'credit', color: '#009EE3', emoji: '💠', limit: 15800, openingBalance: 14046.83 },
  { id: 'tc_vexi', label: 'TC Vexi/Amex',    kind: 'credit', color: '#6D28D9', emoji: '🟣', limit: 1500,  openingBalance: 379.28 },
  { id: 'tc_didi', label: 'TC DiDi Card',    kind: 'credit', color: '#FF7A00', emoji: '🟠', limit: 1000,  openingBalance: 843.53 },
];

export const accountById = (id: AccountId): Account =>
  ACCOUNTS.find((a) => a.id === id) ?? ACCOUNTS[0];
