import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, spacing } from '../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tint?: string;
}

export const PrimaryButton = ({ label, onPress, disabled, tint = colors.primary }: Props) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.btn,
      { backgroundColor: tint },
      disabled && styles.disabled,
      pressed && !disabled && styles.pressed,
    ]}
  >
    <Text style={styles.label}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  btn: {
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
