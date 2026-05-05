export type AccountId = 'mp' | 'bbva' | 'spin' | 'credit';

export type TxType = 'income' | 'expense';

export type LeadStatus = 'new' | 'qualified' | 'won' | 'lost';

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  accountId: AccountId;
  category?: string;
  note?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  contact?: string;
  status: LeadStatus;
  mrr?: number;
  note?: string;
  createdAt: string;
}
