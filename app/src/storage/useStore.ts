import { useCallback, useEffect, useState, createContext, useContext, createElement, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccountId, Lead, Transaction } from '../types';

const STORAGE_KEY = '@ratetap/v1';
const LAST_ACCOUNT_KEY = '@ratetap/lastAccount';

interface StoreState {
  transactions: Transaction[];
  leads: Lead[];
}

interface StoreApi extends StoreState {
  ready: boolean;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  addLead: (l: Omit<Lead, 'id' | 'createdAt'>) => void;
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
        // ignore — start fresh
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback((next: StoreState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addTransaction: StoreApi['addTransaction'] = useCallback(
    (t) => {
      setState((prev) => {
        const next: StoreState = {
          ...prev,
          transactions: [
            { ...t, id: newId(), createdAt: new Date().toISOString() },
            ...prev.transactions,
          ],
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const addLead: StoreApi['addLead'] = useCallback(
    (l) => {
      setState((prev) => {
        const next: StoreState = {
          ...prev,
          leads: [
            { ...l, id: newId(), createdAt: new Date().toISOString() },
            ...prev.leads,
          ],
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const balanceFor = useCallback(
    (accountId: AccountId): number =>
      state.transactions
        .filter((t) => t.accountId === accountId)
        .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0),
    [state.transactions],
  );

  const totalBalance = useCallback(
    (): number =>
      state.transactions.reduce(
        (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
        0,
      ),
    [state.transactions],
  );

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
    balanceFor,
    totalBalance,
    lastAccountId,
    setLastAccountId,
  };

  return createElement(StoreContext.Provider, { value: api }, children);
};
