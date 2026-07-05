import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
  createElement,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccountId, Lead, Loan, Transaction } from '../types';
import { ACCOUNTS } from '../constants/accounts';
import { CURRENT_SCHEMA_VERSION } from './schemas';
import { migrate } from './migrations';
import { seedLoans, seedOpeningBalances } from './seed';

const STORAGE_KEY = '@ratetap/v1';
const LAST_ACCOUNT_KEY = '@ratetap/lastAccount';
const BACKUP_KEY_PREFIX = '@ratetap/backup/';

interface StoreState {
  transactions: Transaction[];
  leads: Lead[];
  loans: Loan[];
  // Saldo/usado inicial editable por cuenta. Es la base sobre la que se
  // acumulan las transacciones para obtener el saldo actual.
  openingBalances: Record<AccountId, number>;
}

/** Resumen financiero derivado (patrimonio, deuda, por cobrar, etc.). */
interface Finances {
  liquido: number; // suma de saldos de cuentas débito
  deudaUsada: number; // suma de "usado" de tarjetas de crédito
  porCobrar: number; // suma de loans[].amountOutstanding
  patrimonioNeto: number; // liquido - deudaUsada
  patrimonioTotal: number; // patrimonioNeto + porCobrar
  utilizacionPorCuenta: Record<string, number>; // usado/limit, solo crédito
}

interface StoreApi extends StoreState {
  ready: boolean;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  addLead: (l: Omit<Lead, 'id' | 'createdAt'>) => void;
  addLoan: (l: Omit<Loan, 'id' | 'createdAt'>) => void;
  // Registra un abono: baja el pendiente del préstamo Y acredita el dinero
  // en una cuenta débito (transacción loan_repayment), dejando el patrimonio
  // total constante — el dinero pasa de "por cobrar" a "líquido".
  addLoanRepayment: (loanId: string, amount: number, accountId: AccountId) => void;
  setOpeningBalance: (accountId: AccountId, value: number) => void;
  // Saldo actual por cuenta (openingBalance + transacciones que la afectan).
  balances: Record<AccountId, number>;
  balanceFor: (accountId: AccountId) => number;
  totalBalance: () => number;
  finances: Finances;
  lastAccountId: AccountId | null;
  setLastAccountId: (id: AccountId) => void;
}

const initial: StoreState = {
  transactions: [],
  leads: [],
  loans: seedLoans(),
  openingBalances: seedOpeningBalances(),
};

const newId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const StoreContext = createContext<StoreApi | null>(null);

export const useStore = (): StoreApi => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
};

/**
 * Efecto de una transacción sobre los saldos de las cuentas.
 * Para cuentas débito el saldo es "dinero disponible"; para cuentas de
 * crédito el saldo es el "usado" (sube con compras, baja con abonos).
 */
const deltasFor = (t: Transaction): { id: AccountId; delta: number }[] => {
  switch (t.type) {
    case 'income':
      return [{ id: t.accountId, delta: t.amount }];
    case 'expense':
      return [{ id: t.accountId, delta: -t.amount }];
    case 'transfer':
      // Sale de una cuenta débito y entra a otra.
      return t.toAccountId
        ? [
            { id: t.accountId, delta: -t.amount },
            { id: t.toAccountId, delta: t.amount },
          ]
        : [{ id: t.accountId, delta: -t.amount }];
    case 'cc_payment':
      // Débito paga (baja) y la TC destino reduce su usado.
      return t.toAccountId
        ? [
            { id: t.accountId, delta: -t.amount },
            { id: t.toAccountId, delta: -t.amount },
          ]
        : [{ id: t.accountId, delta: -t.amount }];
    case 'cc_purchase':
      // Compra con TC: sube el usado, no toca débito.
      return [{ id: t.accountId, delta: t.amount }];
    case 'loan_out':
      // Prestar dinero: baja el débito (el Loan se maneja aparte).
      return [{ id: t.accountId, delta: -t.amount }];
    case 'loan_repayment':
      // Cobrar préstamo: sube el débito (el Loan se maneja aparte).
      return [{ id: t.accountId, delta: t.amount }];
    default:
      return [];
  }
};

/**
 * Calcula el saldo actual de cada cuenta = openingBalance + suma de las
 * transacciones que la afectan.
 */
const computeBalances = (
  openingBalances: Record<AccountId, number>,
  transactions: Transaction[],
): Record<AccountId, number> => {
  const bal = {} as Record<AccountId, number>;
  for (const a of ACCOUNTS) bal[a.id] = openingBalances[a.id] ?? 0;
  for (const t of transactions) {
    for (const { id, delta } of deltasFor(t)) {
      bal[id] = (bal[id] ?? 0) + delta;
    }
  }
  return bal;
};

/**
 * Backs up a raw blob under @ratetap/backup/{timestamp} so we can
 * recover it manually later. Best-effort: silently swallows errors
 * because if storage itself is broken there's nothing to do.
 */
const backupRawBlob = async (raw: string): Promise<void> => {
  const key = `${BACKUP_KEY_PREFIX}${new Date().toISOString()}`;
  try {
    await AsyncStorage.setItem(key, raw);
    if (__DEV__) console.warn(`[useStore] corrupted state backed up to ${key}`);
  } catch {
    // ignore
  }
};

/**
 * Loads + migrates + validates the persisted state. On any failure,
 * backs up the raw blob and returns the empty initial state.
 */
const loadAndMigrate = async (): Promise<StoreState> => {
  let raw: string | null = null;
  try {
    raw = await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    return initial;
  }
  if (!raw) return initial;

  try {
    const parsed: unknown = JSON.parse(raw);
    const result = migrate(parsed);
    if (__DEV__ && (result.droppedTransactions > 0 || result.droppedLeads > 0)) {
      console.warn(
        `[useStore] migrated v${result.fromVersion} → v${CURRENT_SCHEMA_VERSION}: ` +
          `dropped ${result.droppedTransactions} transactions, ${result.droppedLeads} leads`,
      );
    }
    return {
      transactions: result.state.transactions,
      leads: result.state.leads,
      loans: result.state.loans,
      openingBalances: result.state.openingBalances as Record<AccountId, number>,
    };
  } catch (e) {
    if (__DEV__) console.warn('[useStore] state corrupt, backing up + resetting', e);
    await backupRawBlob(raw);
    return initial;
  }
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<StoreState>(initial);
  const [ready, setReady] = useState(false);
  const [lastAccountId, setLastAccountIdState] = useState<AccountId | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [loaded, lastAcc] = await Promise.all([
          loadAndMigrate(),
          AsyncStorage.getItem(LAST_ACCOUNT_KEY),
        ]);
        setState(loaded);
        if (lastAcc) setLastAccountIdState(lastAcc as AccountId);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const payload = {
      __schemaVersion: CURRENT_SCHEMA_VERSION,
      transactions: state.transactions,
      leads: state.leads,
      loans: state.loans,
      openingBalances: state.openingBalances,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [state, ready]);

  const addTransaction: StoreApi['addTransaction'] = useCallback((t) => {
    setState((prev) => ({
      ...prev,
      transactions: [
        { ...t, id: newId(), createdAt: new Date().toISOString() },
        ...prev.transactions,
      ],
    }));
  }, []);

  const addLead: StoreApi['addLead'] = useCallback((l) => {
    setState((prev) => ({
      ...prev,
      leads: [
        { ...l, id: newId(), createdAt: new Date().toISOString() },
        ...prev.leads,
      ],
    }));
  }, []);

  const addLoan: StoreApi['addLoan'] = useCallback((l) => {
    setState((prev) => ({
      ...prev,
      loans: [
        { ...l, id: newId(), createdAt: new Date().toISOString() },
        ...prev.loans,
      ],
    }));
  }, []);

  const addLoanRepayment: StoreApi['addLoanRepayment'] = useCallback(
    (loanId, amount, accountId) => {
      if (!(amount > 0)) return;
      setState((prev) => {
        const loan = prev.loans.find((l) => l.id === loanId);
        if (!loan) return prev;
        // El dinero entra a una cuenta débito: registramos la transacción
        // loan_repayment (sube el saldo) y bajamos el pendiente del préstamo.
        // Así el patrimonio total no cambia: sale de "por cobrar", entra a "líquido".
        const tx: Transaction = {
          id: newId(),
          type: 'loan_repayment',
          amount,
          accountId,
          note: `Abono préstamo · ${loan.debtor}`,
          createdAt: new Date().toISOString(),
        };
        return {
          ...prev,
          transactions: [tx, ...prev.transactions],
          loans: prev.loans.map((l) =>
            l.id === loanId
              ? { ...l, amountOutstanding: Math.max(0, l.amountOutstanding - amount) }
              : l,
          ),
        };
      });
    },
    [],
  );

  const setOpeningBalance: StoreApi['setOpeningBalance'] = useCallback(
    (accountId, value) => {
      if (!Number.isFinite(value)) return;
      setState((prev) => ({
        ...prev,
        openingBalances: { ...prev.openingBalances, [accountId]: value },
      }));
    },
    [],
  );

  const balances = useMemo<Record<AccountId, number>>(
    () => computeBalances(state.openingBalances, state.transactions),
    [state.openingBalances, state.transactions],
  );

  const finances = useMemo<Finances>(() => {
    let liquido = 0;
    let deudaUsada = 0;
    const utilizacionPorCuenta: Record<string, number> = {};
    for (const a of ACCOUNTS) {
      const bal = balances[a.id] ?? 0;
      if (a.kind === 'debit') {
        liquido += bal;
      } else {
        deudaUsada += bal;
        if (a.limit && a.limit > 0) utilizacionPorCuenta[a.id] = bal / a.limit;
      }
    }
    const porCobrar = state.loans.reduce((s, l) => s + l.amountOutstanding, 0);
    const patrimonioNeto = liquido - deudaUsada;
    return {
      liquido,
      deudaUsada,
      porCobrar,
      patrimonioNeto,
      patrimonioTotal: patrimonioNeto + porCobrar,
      utilizacionPorCuenta,
    };
  }, [balances, state.loans]);

  const balanceFor = useCallback(
    (accountId: AccountId): number => balances[accountId] ?? 0,
    [balances],
  );

  const totalBalance = useCallback(
    (): number => finances.patrimonioNeto,
    [finances],
  );

  const setLastAccountId = useCallback((id: AccountId) => {
    setLastAccountIdState(id);
    AsyncStorage.setItem(LAST_ACCOUNT_KEY, id).catch(() => {});
  }, []);

  const api: StoreApi = {
    transactions: state.transactions,
    leads: state.leads,
    loans: state.loans,
    openingBalances: state.openingBalances,
    ready,
    addTransaction,
    addLead,
    addLoan,
    addLoanRepayment,
    setOpeningBalance,
    balances,
    balanceFor,
    totalBalance,
    finances,
    lastAccountId,
    setLastAccountId,
  };

  return createElement(StoreContext.Provider, { value: api }, children);
};
