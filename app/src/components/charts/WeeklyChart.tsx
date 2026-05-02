import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, formatMoney, radius, spacing } from '../../constants/theme';
import { DayBucket } from '../../utils/analytics';

interface Props {
  buckets: DayBucket[]; // 7 entries, oldest first
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CHART_HEIGHT = 96;
const BAR_WIDTH = 8;

export const WeeklyChart = ({ buckets }: Props) => {
  const max = Math.max(
    1,
    ...buckets.flatMap((b) => [b.income, b.expense]),
  );
  const todayMs = buckets[buckets.length - 1]?.date.getTime();

  const totalIncome = buckets.reduce((s, b) => s + b.income, 0);
  const totalExpense = buckets.reduce((s, b) => s + b.expense, 0);
  const net = totalIncome - totalExpense;
  const isEmpty = totalIncome === 0 && totalExpense === 0;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Last 7 days</Text>
        <Text
          style={[
            styles.net,
            { color: net >= 0 ? colors.income : colors.expense },
          ]}
        >
          {net >= 0 ? '+' : ''}
          {formatMoney(net)}
        </Text>
      </View>

      <View style={styles.chart}>
        {buckets.map((b) => {
          const isToday = b.date.getTime() === todayMs;
          const incomeH = (b.income / max) * CHART_HEIGHT;
          const expenseH = (b.expense / max) * CHART_HEIGHT;
          return (
            <View key={b.date.toISOString()} style={styles.col}>
              <View style={styles.bars}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(2, incomeH),
                      backgroundColor:
                        b.income > 0 ? colors.income : colors.border,
                      opacity: b.income > 0 ? 1 : 0.4,
                    },
                  ]}
                />
                <View style={{ width: 3 }} />
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(2, expenseH),
                      backgroundColor:
                        b.expense > 0 ? colors.expense : colors.border,
                      opacity: b.expense > 0 ? 1 : 0.4,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  isToday && { color: colors.text, fontWeight: '700' },
                ]}
              >
                {DAY_LETTERS[b.date.getDay()]}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
          <Text style={styles.legendText}>
            Income {formatMoney(totalIncome)}
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
          <Text style={styles.legendText}>
            Expense {formatMoney(totalExpense)}
          </Text>
        </View>
      </View>

      {isEmpty ? (
        <Text style={styles.emptyHint}>
          No activity in the last 7 days.
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  net: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: CHART_HEIGHT + 24,
  },
  col: {
    alignItems: 'center',
    flex: 1,
  },
  bars: {
    height: CHART_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bar: {
    width: BAR_WIDTH,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  dayLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.xs + 2,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  legendText: {
    color: colors.textDim,
    fontSize: fontSize.xs,
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
