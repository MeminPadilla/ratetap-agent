import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Account } from '../constants/accounts';
import { colors, fontSize, radius, spacing } from '../constants/theme';

interface Props {
  account: Account;
  selected: boolean;
  onPress: () => void;
}

export const AccountChip = ({ account, selected, onPress }: Props) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.chip,
      { borderColor: selected ? account.color : colors.border },
      selected && { backgroundColor: account.color + '22' },
    ]}
  >
    <View style={[styles.dot, { backgroundColor: account.color }]} />
    <Text style={[styles.label, selected && { color: colors.text }]}>
      {account.label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  label: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
