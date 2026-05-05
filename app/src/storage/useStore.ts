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
import { AccountId, Lead, Transaction } from '../types';

const STORAGE_KEY = '@ratetap/v1';
const LAST_ACCOUNT_KEY = '@ratetap/lastAccount';

interface StoreState {
  transactions: Transaction[];
  leads: Lead[];
}

interface Balances {
  mp: number;
  bbva: number;
  spin: number;
  credit: number;
  total: number;
}

interface StoreApi extends StoreState {
  ready: boolean;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  addLead: (l: Omit<Lead, 'id' | 'createdAt'>) => void;
  balances: Balances;
  balanceFor: (accountId: AccountId) => number;
  totalBalance: () => number;
  lastAccountId: AccountId | null;
  setLastAccountId: (id: AccountId) => void;
}

const initial: StoreState = { transactions: [], leads: [] };

const newId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const StoreContext = createContext<StoreApi | null>(null);

export const useStore = (): StoreApi => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<StoreState>(initial);
  const [ready, setReady] = useState(false);
  const [lastAccountId, setLastAccountIdState] = useState<AccountId | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [raw, lastAcc] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(LAST_ACCOUNT_KEY),
        ]);
        if (raw) {
          const parsed = JSON.parse(raw) as StoreState;
          setState({
            transactions: parsed.transactions ?? [],
            leads: parsed.leads ?? [],
          });
        }
        if (lastAcc) setLastAccountIdState(lastAcc as AccountId);
      } catch {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
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

  const balances = useMemo<Balances>(() => {
    const acc: Balances = { mp: 0, bbva: 0, spin: 0, credit: 0, total: 0 };
    for (const t of state.transactions) {
      const delta = t.type === 'income' ? t.amount : -t.amount;
      acc[t.accountId] += delta;
      acc.total += delta;
    }
    return acc;
  }, [state.transactions]);

  const balanceFor = useCallback(
    (accountId: AccountId): number => balances[accountId],
    [balances],
  );

  const totalBalance = useCallback((): number => balances.total, [balances]);

  const setLastAccountId = useCallback((id: AccountId) => {
    setLastAccountIdState(id);
    AsyncStorage.setItem(LAST_ACCOUNT_KEY, id).catch(() => {});
  }, []);

  const api: StoreApi = {
    transactions: state.transactions,
    leads: state.leads,
    ready,
    addTransaction,
    addLead,
    balances,
    balanceFor,
    totalBalance,
    lastAccountId,
    setLastAccountId,
  };

  return createElement(StoreContext.Provider, { value: api }, children);
};
