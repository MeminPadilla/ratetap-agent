import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { FAB } from '../components/FAB';
import { ListRow } from '../components/ListRow';
import { ScreenContainer } from '../components/ScreenContainer';
import { accountById } from '../constants/accounts';
import { colors, fontSize, formatMoney, radius, spacing } from '../constants/theme';
import { useStore } from '../storage/useStore';
import type { TransactionsStackParamList } from '../navigation/types';
import type { Transaction } from '../types';

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

interface Section {
  title: string;
  data: Transaction[];
}

export const TransactionsScreen = () => {
  const { transactions } = useStore();
  const nav = useNavigation<Nav>();

  // Group by day label — memoized so virtualization doesn't redo this on scroll
  const sections = useMemo<Section[]>(() => {
    const out: Section[] = [];
    for (const tx of transactions) {
      const title = formatDay(tx.createdAt);
      const last = out[out.length - 1];
      if (last && last.title === title) last.data.push(tx);
      else out.push({ title, data: [tx] });
    }
    return out;
  }, [transactions]);

  const renderHeader = () => <Text style={styles.title}>Transactions</Text>;

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No transactions yet</Text>
      <Text style={styles.emptyHint}>Tap + to add your first transaction.</Text>
    </View>
  );

  return (
    <ScreenContainer>
      {transactions.length === 0 ? (
        <>
          {renderHeader()}
          {renderEmpty()}
        </>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <Text style={styles.groupLabel}>{section.title}</Text>
          )}
          renderItem={({ item }) => {
            const acc = accountById(item.accountId);
            const sign = item.type === 'income' ? 1 : -1;
            const time = new Date(item.createdAt).toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
            });
            return (
              <ListRow
                leading={{ color: acc.color, emoji: acc.emoji }}
                title={item.category || (item.type === 'income' ? 'Income' : 'Expense')}
                subtitle={`${acc.label}${item.note ? ` · ${item.note}` : ''}`}
                amount={formatMoney(sign * item.amount)}
                amountColor={item.type === 'income' ? colors.income : colors.expense}
                trailing={time}
              />
            );
          }}
          // Perf knobs — kick in once the list grows
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
          removeClippedSubviews
        />
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
  listContent: {
    paddingBottom: 120,
  },
  groupLabel: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
    marginTop: spacing.md,
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
