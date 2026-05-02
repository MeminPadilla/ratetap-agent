import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../constants/theme';

interface Props {
  leading: { color: string; emoji: string };
  title: string;
  subtitle?: string;
  amount?: string;
  amountColor?: string;
  trailing?: string;
}

export const ListRow = ({ leading, title, subtitle, amount, amountColor, trailing }: Props) => (
  <View style={styles.row}>
    <View style={[styles.bubble, { backgroundColor: leading.color + '33' }]}>
      <Text style={styles.emoji}>{leading.emoji}</Text>
    </View>
    <View style={styles.middle}>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
    </View>
    <View style={styles.right}>
      {amount ? (
        <Text style={[styles.amount, { color: amountColor ?? colors.text }]}>{amount}</Text>
      ) : null}
      {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 18,
  },
  middle: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  trailing: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
});
