import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FAB } from '../components/FAB';
import { ListRow } from '../components/ListRow';
import { ScreenContainer } from '../components/ScreenContainer';
import { accountById } from '../constants/accounts';
import { colors, fontSize, formatMoney, radius, spacing } from '../constants/theme';
import { useStore } from '../storage/useStore';
import type { TransactionsStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<TransactionsStackParamList, 'TransactionsList'>;

const formatDay = (iso: string): string => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const TransactionsScreen = () => {
  const { transactions } = useStore();
  const nav = useNavigation<Nav>();

  // Group by day label
  const groups: { label: string; items: typeof transactions }[] = [];
  for (const tx of transactions) {
    const label = formatDay(tx.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(tx);
    else groups.push({ label, items: [tx] });
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Transactions</Text>
      {transactions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptyHint}>Tap + to add your first transaction.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {groups.map((group) => (
            <View key={group.label} style={styles.group}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              {group.items.map((tx) => {
                const acc = accountById(tx.accountId);
                const sign = tx.type === 'income' ? 1 : -1;
                const time = new Date(tx.createdAt).toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                });
                return (
                  <ListRow
                    key={tx.id}
                    leading={{ color: acc.color, emoji: acc.emoji }}
                    title={tx.category || (tx.type === 'income' ? 'Income' : 'Expense')}
                    subtitle={`${acc.label}${tx.note ? ` · ${tx.note}` : ''}`}
                    amount={formatMoney(sign * tx.amount)}
                    amountColor={tx.type === 'income' ? colors.income : colors.expense}
                    trailing={time}
                  />
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}
      <FAB onPress={() => nav.navigate('AddTransaction')} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  group: {
    marginBottom: spacing.md,
  },
  groupLabel: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  emptyHint: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
