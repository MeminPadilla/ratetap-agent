import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';

interface Props {
  value: string;
  onChange: (next: string) => void;
  tint?: string;
  autoFocus?: boolean;
}

export const AmountInput = forwardRef<TextInput, Props>(
  ({ value, onChange, tint = colors.text, autoFocus }, ref) => {
    const handleChange = (raw: string) => {
      // allow only digits and a single decimal
      const cleaned = raw.replace(/[^0-9.]/g, '');
      const parts = cleaned.split('.');
      const normalized =
        parts.length <= 2 ? cleaned : `${parts[0]}.${parts.slice(1).join('')}`;
      onChange(normalized);
    };

    return (
      <View style={styles.row}>
        <Text style={[styles.currency, { color: tint }]}>$</Text>
        <TextInput
          ref={ref}
          autoFocus={autoFocus}
          value={value}
          onChangeText={handleChange}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          style={[styles.input, { color: tint }]}
        />
      </View>
    );
  },
);

AmountInput.displayName = 'AmountInput';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  currency: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.display,
    fontWeight: '700',
    padding: 0,
  },
});
