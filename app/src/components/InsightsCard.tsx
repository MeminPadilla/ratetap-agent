import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../constants/theme';
import { Insight } from '../utils/analytics';

interface Props {
  insights: Insight[];
}

const tintFor = (kind: Insight['kind']): string => {
  switch (kind) {
    case 'good':
      return colors.income;
    case 'warn':
      return colors.expense;
    default:
      return colors.primary;
  }
};

export const InsightsCard = ({ insights }: Props) => {
  if (insights.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Weekly insights</Text>
      {insights.map((ins, i) => (
        <View
          key={ins.id}
          style={[
            styles.row,
            i < insights.length - 1 && styles.rowBorder,
            { borderLeftColor: tintFor(ins.kind) },
          ]}
        >
          <Text style={styles.icon}>{ins.icon}</Text>
          <Text style={styles.text}>{ins.text}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm + 2,
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.sm,
    width: 22,
    textAlign: 'center',
  },
  text: {
    color: colors.text,
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 18,
  },
});
