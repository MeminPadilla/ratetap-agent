import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AccountChip } from '../components/AccountChip';
import { AmountInput } from '../components/AmountInput';
import { Field } from '../components/Field';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SegmentedControl } from '../components/SegmentedControl';
import { ACCOUNTS } from '../constants/accounts';
import { colors, fontSize, spacing } from '../constants/theme';
import { useStore } from '../storage/useStore';
import { AccountId, TxType } from '../types';

export const AddTransactionScreen = () => {
  const nav = useNavigation();
  const { addTransaction, lastAccountId, setLastAccountId } = useStore();

  const [type, setType] = useState<TxType>('expense');
  const [amountText, setAmountText] = useState('');
  const [accountId, setAccountId] = useState<AccountId>(lastAccountId ?? 'mp');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (lastAccountId) setAccountId(lastAccountId);
  }, [lastAccountId]);

  const amount = parseFloat(amountText || '0');
  const canSave = !isNaN(amount) && amount > 0;
  const tint = type === 'income' ? colors.income : colors.expense;

  const onSave = () => {
    if (!canSave) return;
    addTransaction({
      type,
      amount,
      accountId,
      category: category.trim() || undefined,
      note: note.trim() || undefined,
    });
    setLastAccountId(accountId);
    nav.goBack();
  };

  return (
    <ScreenContainer padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <SegmentedControl<TxType>
            options={[
              { value: 'expense', label: 'Expense', color: colors.expense },
              { value: 'income', label: 'Income', color: colors.income },
            ]}
            value={type}
            onChange={setType}
          />

          <AmountInput
            value={amountText}
            onChange={setAmountText}
            tint={tint}
            autoFocus
          />

          <Text style={styles.sectionLabel}>Account</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {ACCOUNTS.map((acc) => (
              <AccountChip
                key={acc.id}
                account={acc}
                selected={accountId === acc.id}
                onPress={() => setAccountId(acc.id)}
              />
            ))}
          </ScrollView>

          <View style={styles.fields}>
            <Field
              label="Category (optional)"
              placeholder="Groceries, Rent, Salary…"
              value={category}
              onChangeText={setCategory}
              returnKeyType="next"
            />
            <Field
              label="Note (optional)"
              placeholder="What was this for?"
              value={note}
              onChangeText={setNote}
              returnKeyType="done"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={`Save ${type === 'income' ? 'income' : 'expense'}`}
            onPress={onSave}
            disabled={!canSave}
            tint={tint}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chipsRow: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.lg,
  },
  fields: {
    marginTop: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
