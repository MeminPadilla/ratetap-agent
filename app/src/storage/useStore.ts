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
import { CURRENT_SCHEMA_VERSION } from './schemas';
import { migrate } from './migrations';

const STORAGE_KEY = '@ratetap/v1';
const LAST_ACCOUNT_KEY = '@ratetap/lastAccount';
const BACKUP_KEY_PREFIX = '@ratetap/backup/';

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
