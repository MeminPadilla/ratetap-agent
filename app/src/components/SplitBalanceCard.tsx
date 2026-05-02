import { StyleSheet, Text, View } from 'react-native';
import { ACCOUNTS } from '../constants/accounts';
import { colors, fontSize, formatMoney, radius, spacing } from '../constants/theme';
import { AccountId } from '../types';

interface Props {
  balanceFor: (id: AccountId) => number;
}

export const SplitBalanceCard = ({ balanceFor }: Props) => {
  const personalAccs = ACCOUNTS.filter((a) => a.kind === 'Personal');
  const businessAccs = ACCOUNTS.filter((a) => a.kind !== 'Personal');

  const personalTotal = personalAccs.reduce((s, a) => s + balanceFor(a.id), 0);
  const businessTotal = businessAccs.reduce((s, a) => s + balanceFor(a.id), 0);

  return (
    <View style={styles.row}>
      <View style={[styles.col, styles.personal]}>
        <Text style={styles.kind}>Personal</Text>
        <Text
          style={[
            styles.amount,
            { color: personalTotal >= 0 ? colors.text : colors.expense },
          ]}
        >
          {formatMoney(personalTotal)}
        </Text>
        {personalAccs.map((a) => (
          <View key={a.id} style={styles.subRow}>
            <View style={[styles.dot, { backgroundColor: a.color }]} />
            <Text style={styles.subLabel}>{a.label}</Text>
            <Text
              style={[
                styles.subAmount,
                { color: balanceFor(a.id) < 0 ? colors.expense : colors.textDim },
              ]}
            >
              {formatMoney(balanceFor(a.id))}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.col, styles.business]}>
        <Text style={styles.kind}>Business</Text>
        <Text
          style={[
            styles.amount,
            { color: businessTotal >= 0 ? colors.text : colors.expense },
          ]}
        >
          {formatMoney(businessTotal)}
        </Text>
        {businessAccs.map((a) => (
          <View key={a.id} style={styles.subRow}>
            <View style={[styles.dot, { backgroundColor: a.color }]} />
            <Text style={styles.subLabel}>{a.label}</Text>
            <Text
              style={[
                styles.subAmount,
                { color: balanceFor(a.id) < 0 ? colors.expense : colors.textDim },
              ]}
            >
              {formatMoney(balanceFor(a.id))}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  col: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  personal: {
    borderLeftWidth: 3,
    borderLeftColor: '#00B1EA',
  },
  business: {
    borderLeftWidth: 3,
    borderLeftColor: '#1B4DA0',
  },
  kind: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: '700',
  },
  amount: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs + 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.sm,
  },
  subLabel: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    flex: 1,
  },
  subAmount: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
