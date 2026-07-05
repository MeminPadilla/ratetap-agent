// Pantalla "Editar saldos" — permite ajustar manualmente el saldo/usado
// inicial (openingBalance) de cualquier cuenta en cualquier momento.
// Se presenta como modal desde el Dashboard. Diseño básico (fase 2 = rediseño).

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { ACCOUNTS } from '../constants/accounts';
import { colors, fontSize, formatMoney, radius, spacing } from '../constants/theme';
import { useStore } from '../storage/useStore';

interface Props {
  onClose: () => void;
}

export const EditBalancesScreen = ({ onClose }: Props) => {
  const { openingBalances, balances, setOpeningBalance } = useStore();

  // Buffer de texto por cuenta mientras se edita, para no pelear con el input.
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const handleChange = (accountId: string, raw: string) => {
    // Permite dígitos, punto y signo negativo.
    let v = raw.replace(/,/g, '.').replace(/[^0-9.\-]/g, '');
    setDrafts((prev) => ({ ...prev, [accountId]: v }));
  };

  const commit = (accountId: (typeof ACCOUNTS)[number]['id']) => {
    const draft = drafts[accountId];
    if (draft === undefined) return;
    const value = parseFloat(draft);
    if (Number.isFinite(value)) setOpeningBalance(accountId, value);
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[accountId];
      return next;
    });
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Editar saldos</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>Listo</Text>
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Ajusta el saldo inicial de débito o el "usado" inicial de cada tarjeta.
          Las transacciones se suman sobre este valor.
        </Text>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {ACCOUNTS.map((acc) => {
            const draft = drafts[acc.id];
            const stored = openingBalances[acc.id] ?? acc.openingBalance;
            const value = draft !== undefined ? draft : String(stored);
            const current = balances[acc.id] ?? 0;
            return (
              <View key={acc.id} style={styles.row}>
                <View style={[styles.dot, { backgroundColor: acc.color }]} />
                <View style={styles.rowInfo}>
                  <Text style={styles.label}>{acc.label}</Text>
                  <Text style={styles.kind}>
                    {acc.kind === 'credit'
                      ? `usado · saldo actual ${formatMoney(current)}${
                          acc.limit ? ` / límite ${formatMoney(acc.limit)}` : ''
                        }`
                      : `débito · saldo actual ${formatMoney(current)}`}
                  </Text>
                </View>
                <TextInput
                  value={value}
                  onChangeText={(raw) => handleChange(acc.id, raw)}
                  onBlur={() => commit(acc.id)}
                  onEndEditing={() => commit(acc.id)}
                  keyboardType="numbers-and-punctuation"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                />
              </View>
            );
          })}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  close: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  rowInfo: {
    flex: 1,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  kind: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  input: {
    minWidth: 96,
    textAlign: 'right',
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
  },
});
