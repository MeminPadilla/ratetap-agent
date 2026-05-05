import { StyleSheet, Text, View } from 'react-native';
import { accountById } from '../../constants/accounts';
import { colors, fontSize, formatMoney, radius, spacing } from '../../constants/theme';
import { SpendSlice } from '../../utils/analytics';

interface Props {
  slices: SpendSlice[];
  title?: string;
  caption?: string;
}

export const AccountSpendBar = ({
  slices,
  title = 'Spending by account',
  caption = 'This month',
}: Props) => {
  const total = slices.reduce((s, x) => s + x.amount, 0);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.caption}>{caption}</Text>
        </View>
        <Text style={styles.total}>{formatMoney(total)}</Text>
      </View>

      {slices.length === 0 ? (
        <Text style={styles.empty}>No expenses recorded yet.</Text>
      ) : (
        <>
          <View style={styles.barTrack}>
            {slices.map((s, i) => {
              const acc = accountById(s.accountId);
              return (
                <View
                  key={s.accountId}
                  style={[
                    styles.barSegment,
                    {
                      flex: s.pct,
                      backgroundColor: acc.color,
                      marginLeft: i === 0 ? 0 : 1,
                    },
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.legend}>
            {slices.map((s) => {
              const acc = accountById(s.accountId);
              return (
                <View key={s.accountId} style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: acc.color }]} />
                  <Text style={styles.legendName}>{acc.label}</Text>
                  <Text style={styles.legendVal}>
                    {Math.round(s.pct * 100)}% · {formatMoney(s.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  caption: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
    marginTop: 2,
  },
  total: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  barTrack: {
    flexDirection: 'row',
    height: 12,
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  barSegment: {
    height: '100%',
  },
  legend: {
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  legendName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
  legendVal: {
    color: colors.textDim,
    fontSize: fontSize.sm,
  },
  empty: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
