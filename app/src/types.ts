export type AccountId =
  | 'cash'
  | 'mp'
  | 'revolut'
  | 'bbva'
  | 'spin'
  | 'tc_mp'
  | 'tc_vexi'
  | 'tc_didi';

export type AccountKind = 'debit' | 'credit';

export interface Account {
  id: AccountId;
  label: string;
  kind: AccountKind;
  color: string;
  emoji: string;
  limit?: number; // solo para kind: 'credit'
  openingBalance: number; // saldo/usado inicial, editable por el usuario
}

export type TxType =
  | 'income'
  | 'expense'
  | 'transfer' // entre mis propias cuentas débito (ej. cash -> mp)
  | 'cc_payment' // abono a una TC (débito -> crédito, baja el usado)
  | 'cc_purchase' // compra con TC (sube el usado, no toca débito)
  | 'loan_out' // prestar dinero (baja débito, crea/aumenta Loan)
  | 'loan_repayment'; // cobrar préstamo (sube débito, baja Loan.amountOutstanding)

export type LeadStatus = 'new' | 'qualified' | 'won' | 'lost';

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  accountId: AccountId;
  toAccountId?: AccountId; // requerido para transfer y cc_payment
  incomeCategoryId?: string; // referencia a IncomeCategory.id, solo si type === 'income'
  category?: string; // freeform, para expense (ya existía)
  note?: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  debtor: string;
  amountOriginal: number;
  amountOutstanding: number;
  dateGiven: string;
  dateEstimatedRepayment?: string;
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
