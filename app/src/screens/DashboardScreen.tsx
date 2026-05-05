import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { ListRow } from '../components/ListRow';
import { SplitBalanceCard } from '../components/SplitBalanceCard';
import { InsightsCard } from '../components/InsightsCard';
import { WeeklyChart } from '../components/charts/WeeklyChart';
import { AccountSpendBar } from '../components/charts/AccountSpendBar';
import { LeadFunnel } from '../components/charts/LeadFunnel';
import { ACCOUNTS, accountById } from '../constants/accounts';
import { colors, fontSize, formatMoney, radius, spacing } from '../constants/theme';
import { useStore } from '../storage/useStore';
import {
  generateInsights,
  leadCountsByStatus,
  monthSpendByAccount,
  weeklyBuckets,
} from '../utils/analytics';

export const DashboardScreen = () => {
  const { transactions, leads, balanceFor, totalBalance } = useStore();
  const recent = transactions.slice(0, 5);

  const buckets = useMemo(() => weeklyBuckets(transactions), [transactions]);
  const monthSpend = useMemo(() => monthSpendByAccount(transactions), [transactions]);
  const leadCounts = useMemo(() => leadCountsByStatus(leads), [leads]);
  const insights = useMemo(
    () => generateInsights(transactions, leads, balanceFor),
    [transactions, leads, balanceFor],
  );

  const wonLeadsMrr = leads
    .filter((l) => l.status === 'won')
    .reduce((sum, l) => sum + (l.mrr ?? 0), 0);
  const openLeads = leads.filter(
    (l) => l.status === 'new' || l.status === 'qualified',
  ).length;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Hello 👋</Text>
        <Text style={styles.heading}>Net balance</Text>
        <Text
          style={[
            styles.netAmount,
            { color: totalBalance() >= 0 ? colors.income : colors.expense },
          ]}
        >
          {formatMoney(totalBalance())}
        </Text>

        <SplitBalanceCard balanceFor={balanceFor} />

        <WeeklyChart buckets={buckets} />

        <InsightsCard insights={insights} />

        <Text style={styles.section}>Accounts</Text>
        <View style={styles.grid}>
          {ACCOUNTS.map((acc) => {
            const bal = balanceFor(acc.id);
            return (
              <View
                key={acc.id}
                style={[styles.card, { borderColor: acc.color + '55' }]}
              >
                <View style={styles.cardHead}>
                  <View style={[styles.dot, { backgroundColor: acc.color }]} />
                  <Text style={styles.cardKind}>{acc.kind}</Text>
                </View>
                <Text style={styles.cardName}>{acc.label}</Text>
                <Text
                  style={[
                    styles.cardAmount,
                    { color: bal >= 0 ? colors.text : colors.expense },
                  ]}
                >
                  {formatMoney(bal)}
                </Text>
              </View>
            );
          })}
        </View>

        <AccountSpendBar slices={monthSpend} />

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Open leads</Text>
            <Text style={styles.statValue}>{openLeads}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Won MRR</Text>
            <Text style={[styles.statValue, { color: colors.income }]}>
              {formatMoney(wonLeadsMrr)}
            </Text>
          </View>
        </View>

        <LeadFunnel counts={leadCounts} />

        <Text style={styles.section}>Recent activity</Text>
        {recent.length === 0 ? (
          <Text style={styles.empty}>
            No transactions yet. Tap Transactions → + to add your first one.
          </Text>
        ) : (
          recent.map((tx) => {
            const acc = accountById(tx.accountId);
            const sign = tx.type === 'income' ? 1 : -1;
            return (
              <ListRow
                key={tx.id}
                leading={{ color: acc.color, emoji: acc.emoji }}
                title={tx.category || (tx.type === 'income' ? 'Income' : 'Expense')}
                subtitle={`${acc.label}${tx.note ? ` · ${tx.note}` : ''}`}
                amount={formatMoney(sign * tx.amount)}
                amountColor={tx.type === 'income' ? colors.income : colors.expense}
              />
            );
          })
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
  },
  greeting: {
    color: colors.textDim,
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
  heading: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.sm,
  },
  netAmount: {
    fontSize: fontSize.display,
    fontWeight: '800',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  section: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  cardKind: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cardName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  cardAmount: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  statValue: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  empty: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
