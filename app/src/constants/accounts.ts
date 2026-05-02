import { AccountId } from '../types';

export interface Account {
  id: AccountId;
  label: string;
  kind: 'Personal' | 'Business' | 'Ads' | 'Credit';
  color: string;
  emoji: string;
}

export const ACCOUNTS: Account[] = [
  { id: 'mp',     label: 'Mercado Pago', kind: 'Personal', color: '#00B1EA', emoji: '💳' },
  { id: 'bbva',   label: 'BBVA',         kind: 'Business', color: '#1B4DA0', emoji: '🏦' },
  { id: 'spin',   label: 'Spin',         kind: 'Ads',      color: '#7B2CBF', emoji: '📣' },
  { id: 'credit', label: 'Credit',       kind: 'Credit',   color: '#E63946', emoji: '💰' },
];

export const accountById = (id: AccountId): Account =>
  ACCOUNTS.find((a) => a.id === id) ?? ACCOUNTS[0];
