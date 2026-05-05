import { ACCOUNTS, accountById } from '../constants/accounts';
import { formatMoney } from '../constants/theme';
import { AccountId, Lead, LeadStatus, Transaction } from '../types';

const DAY_MS = 86_400_000;

const startOfDay = (d: Date): Date => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
};

const startOfMonth = (d: Date): Date => {
  const c = new Date(d);
  c.setDate(1);
  c.setHours(0, 0, 0, 0);
  return c;
};

export interface DayBucket {
  date: Date;
  income: number;
  expense: number;
}

export const weeklyBuckets = (transactions: Transaction[]): DayBucket[] => {
  const today = startOfDay(new Date());
  const buckets: DayBucket[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({ date: d, income: 0, expense: 0 });
  }
  for (const tx of transactions) {
    const txDay = startOfDay(new Date(tx.createdAt)).getTime();
    const idx = buckets.findIndex((b) => b.date.getTime() === txDay);
    if (idx === -1) continue;
    if (tx.type === 'income') buckets[idx].income += tx.amount;
    else buckets[idx].expense += tx.amount;
  }
  return buckets;
};

export interface SpendSlice {
  accountId: AccountId;
  amount: number;
  pct: number; // 0..1
}

export const spendByAccount = (
  transactions: Transaction[],
  windowDays?: number,
): SpendSlice[] => {
  const cutoff = windowDays ? Date.now() - windowDays * DAY_MS : 0;
  const totals = new Map<AccountId, number>();
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    if (cutoff && new Date(tx.createdAt).getTime() < cutoff) continue;
    totals.set(tx.accountId, (totals.get(tx.accountId) ?? 0) + tx.amount);
  }
  const total = [...totals.values()].reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  return ACCOUNTS.filter((a) => (totals.get(a.id) ?? 0) > 0).map((a) => ({
    accountId: a.id,
    amount: totals.get(a.id) ?? 0,
    pct: (totals.get(a.id) ?? 0) / total,
  }));
};

export const monthSpendByAccount = (transactions: Transaction[]): SpendSlice[] => {
  const cutoff = startOfMonth(new Date()).getTime();
  const totals = new Map<AccountId, number>();
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    if (new Date(tx.createdAt).getTime() < cutoff) continue;
    totals.set(tx.accountId, (totals.get(tx.accountId) ?? 0) + tx.amount);
  }
  const total = [...totals.values()].reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  return ACCOUNTS.filter((a) => (totals.get(a.id) ?? 0) > 0).map((a) => ({
    accountId: a.id,
    amount: totals.get(a.id) ?? 0,
    pct: (totals.get(a.id) ?? 0) / total,
  }));
};

export const leadCountsByStatus = (leads: Lead[]): Record<LeadStatus, number> => {
  const counts: Record<LeadStatus, number> = { new: 0, qualified: 0, won: 0, lost: 0 };
  for (const l of leads) counts[l.status] += 1;
  return counts;
};

export interface BalanceSplit {
  personal: number;
  business: number;
  byKind: { kind: 'Personal' | 'Business' | 'Ads' | 'Credit'; amount: number }[];
}

export const balanceSplit = (
  balanceFor: (id: AccountId) => number,
): BalanceSplit => {
  let personal = 0;
  let business = 0;
  const byKindMap = new Map<BalanceSplit['byKind'][number]['kind'], number>();
  for (const acc of ACCOUNTS) {
    const bal = balanceFor(acc.id);
    byKindMap.set(acc.kind, (byKindMap.get(acc.kind) ?? 0) + bal);
    if (acc.kind === 'Personal') personal += bal;
    else business += bal; // Business + Ads + Credit treated as business-side
  }
  return {
    personal,
    business,
    byKind: [...byKindMap.entries()].map(([kind, amount]) => ({ kind, amount })),
  };
};

export interface WeekSummary {
  income: number;
  expense: number;
  net: number;
  prevNet: number;
  pctChange: number | null; // null when prevNet is 0
}

export const thisWeekSummary = (transactions: Transaction[]): WeekSummary => {
  const now = Date.now();
  const weekAgo = now - 7 * DAY_MS;
  const twoWeeksAgo = now - 14 * DAY_MS;
  let income = 0;
  let expense = 0;
  let prevIncome = 0;
  let prevExpense = 0;
  for (const tx of transactions) {
    const t = new Date(tx.createdAt).getTime();
    if (t >= weekAgo) {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    } else if (t >= twoWeeksAgo) {
      if (tx.type === 'income') prevIncome += tx.amount;
      else prevExpense += tx.amount;
    }
  }
  const net = income - expense;
  const prevNet = prevIncome - prevExpense;
  const pctChange =
    prevNet === 0 ? null : (net - prevNet) / Math.abs(prevNet);
  return { income, expense, net, prevNet, pctChange };
};

export type InsightKind = 'info' | 'warn' | 'good';

export interface Insight {
  id: string;
  kind: InsightKind;
  icon: string;
  text: string;
}

export const generateInsights = (
  transactions: Transaction[],
  leads: Lead[],
  balanceFor: (id: AccountId) => number,
): Insight[] => {
  const week = thisWeekSummary(transactions);
  const out: Insight[] = [];

  if (transactions.length === 0 && leads.length === 0) {
    out.push({
      id: 'empty',
      kind: 'info',
      icon: '👋',
      text: 'Add your first transaction or lead to start seeing insights here.',
    });
    return out;
  }

  // Weekly net
  if (week.income === 0 && week.expense === 0) {
    out.push({
      id: 'no-activity',
      kind: 'info',
      icon: '😴',
      text: 'No transactions this week. Track today to keep streaks alive.',
    });
  } else if (week.net < 0) {
    out.push({
      id: 'over-spend',
      kind: 'warn',
      icon: '⚠️',
      text: `Spent ${formatMoney(Math.abs(week.net))} more than you earned this week.`,
    });
  } else if (week.net > 0) {
    out.push({
      id: 'positive',
      kind: 'good',
      icon: '🎉',
      text: `Net positive ${formatMoney(week.net)} this week. Keep it up.`,
    });
  }

  // Week-over-week
  if (week.pctChange != null) {
    const pct = Math.round(week.pctChange * 100);
    if (pct >= 20) {
      out.push({
        id: 'wow-up',
        kind: 'good',
        icon: '📈',
        text: `Net flow improved ${pct}% vs last week.`,
      });
    } else if (pct <= -20) {
      out.push({
        id: 'wow-down',
        kind: 'warn',
        icon: '📉',
        text: `Net flow dropped ${Math.abs(pct)}% vs last week.`,
      });
    }
  }

  // Top weekly spend account
  const weeklySpend = spendByAccount(transactions, 7);
  if (weeklySpend.length > 0) {
    const top = weeklySpend.reduce((a, b) => (a.amount > b.amount ? a : b));
    if (top.pct >= 0.5) {
      const acc = accountById(top.accountId);
      out.push({
        id: `top-spend-${top.accountId}`,
        kind: 'info',
        icon: acc.emoji,
        text: `${Math.round(top.pct * 100)}% of weekly spending went through ${acc.label}.`,
      });
    }
  }

  // Negative account balances
  for (const acc of ACCOUNTS) {
    const bal = balanceFor(acc.id);
    if (bal < 0 && acc.kind !== 'Credit') {
      out.push({
        id: `neg-${acc.id}`,
        kind: 'warn',
        icon: '🔴',
        text: `${acc.label} is negative (${formatMoney(bal)}).`,
      });
    }
  }

  // New leads this week
  const newLeadsThisWeek = leads.filter(
    (l) => new Date(l.createdAt).getTime() >= Date.now() - 7 * DAY_MS,
  ).length;
  if (newLeadsThisWeek > 0) {
    out.push({
      id: 'new-leads',
      kind: 'good',
      icon: '🚀',
      text: `${newLeadsThisWeek} new lead${newLeadsThisWeek === 1 ? '' : 's'} added this week.`,
    });
  }

  // Won MRR this week
  const wonThisWeek = leads.filter(
    (l) =>
      l.status === 'won' &&
      new Date(l.createdAt).getTime() >= Date.now() - 7 * DAY_MS,
  );
  const wonMrr = wonThisWeek.reduce((s, l) => s + (l.mrr ?? 0), 0);
  if (wonMrr > 0) {
    out.push({
      id: 'won-mrr',
      kind: 'good',
      icon: '🏆',
      text: `Closed ${formatMoney(wonMrr)}/mo in MRR this week.`,
    });
  }

  return out;
};
