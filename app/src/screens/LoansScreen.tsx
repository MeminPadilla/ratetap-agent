// Pantalla "Por cobrar" — lista los préstamos activos y permite registrar
// abonos. Diseño básico a propósito (el rediseño visual es fase 2). Se
// presenta como modal desde el Dashboard para no tocar la navegación de tabs.

import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { AmountInput } from '../components/AmountInput';
import { AccountChip } from '../components/AccountChip';
import { PrimaryButton } from '../components/PrimaryButton';
import { ACCOUNTS } from '../constants/accounts';
import { colors, fontSize, formatMoney, radius, spacing } from '../constants/theme';
import { useStore } from '../storage/useStore';
import { AccountId } from '../types';

const DAY_MS = 86_400_000;

const daysSince = (iso: string): number => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / DAY_MS));
};

interface Props {
  onClose: () => void;
}

// Solo se puede abonar a cuentas de débito (ahí entra el dinero cobrado).
const DEBIT_ACCOUNTS = ACCOUNTS.filter((a) => a.kind === 'debit');

export const LoansScreen = ({ onClose }: Props) => {
  const { loans, finances, addLoanRepayment, lastAccountId } = useStore();

  // Préstamo actualmente en modo "registrar abono", el monto tecleado y la
  // cuenta destino donde entra el dinero cobrado.
  const [activeLoanId, setActiveLoanId] = useState<string | null>(null);
  const [amountText, setAmountText] = useState('');
  const [depositAccountId, setDepositAccountId] = useState<AccountId>(
    DEBIT_ACCOUNTS[0].id,
  );

  const defaultDeposit = (): AccountId =>
    lastAccountId && DEBIT_ACCOUNTS.some((a) => a.id === lastAccountId)
      ? lastAccountId
      : DEBIT_ACCOUNTS[0].id;

  const startAbono = (loanId: string) => {
    setActiveLoanId(loanId);
    setAmountText('');
    setDepositAccountId(defaultDeposit());
  };

  const confirmAbono = (loanId: string) => {
    const amount = parseFloat(amountText || '0');
    if (!(amount > 0)) return;
    addLoanRepayment(loanId, amount, depositAccountId);
    setActiveLoanId(null);
    setAmountText('');
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Por cobrar</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.close}>Cerrar</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Total pendiente: {formatMoney(finances.porCobrar)}
      </Text>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {loans.length === 0 ? (
          <Text style={styles.empty}>No tienes préstamos registrados.</Text>
        ) : (
          loans.map((loan) => {
            const pagado = loan.amountOriginal - loan.amountOutstanding;
            const cobrado = loan.amountOutstanding <= 0;
            return (
              <View key={loan.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={styles.debtor}>{loan.debtor}</Text>
                  <Text
                    style={[
                      styles.outstanding,
                      { color: cobrado ? colors.income : colors.text },
                    ]}
                  >
                    {formatMoney(loan.amountOutstanding)}
                  </Text>
                </View>

                <Text style={styles.meta}>
                  Prestado {formatMoney(loan.amountOriginal)} ·{' '}
                  {daysSince(loan.dateGiven)} días
                  {pagado > 0 ? ` · abonado ${formatMoney(pagado)}` : ''}
                </Text>
                {loan.dateEstimatedRepayment ? (
                  <Text style={styles.meta}>
                    Pago estimado:{' '}
                    {new Date(loan.dateEstimatedRepayment).toLocaleDateString()}
                  </Text>
                ) : (
                  <Text style={styles.meta}>Sin fecha de pago definida</Text>
                )}

                {cobrado ? (
                  <Text style={styles.doneTag}>Cobrado ✓</Text>
                ) : activeLoanId === loan.id ? (
                  <View style={styles.abonoBox}>
                    <AmountInput
                      value={amountText}
                      onChange={setAmountText}
                      tint={colors.income}
                      autoFocus
                    />
                    <Text style={styles.abonoLabel}>Entra a</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      contentContainerStyle={styles.chipsRow}
                    >
                      {DEBIT_ACCOUNTS.map((acc) => (
                        <AccountChip
                          key={acc.id}
                          account={acc}
                          selected={depositAccountId === acc.id}
                          onPress={() => setDepositAccountId(acc.id)}
                        />
                      ))}
                    </ScrollView>
                    <View style={styles.abonoActions}>
                      <Pressable
                        onPress={() => setActiveLoanId(null)}
                        style={styles.cancelBtn}
                        hitSlop={8}
                      >
                        <Text style={styles.cancelText}>Cancelar</Text>
                      </Pressable>
                      <View style={styles.confirmWrap}>
                        <PrimaryButton
                          label="Registrar abono"
                          onPress={() => confirmAbono(loan.id)}
                          disabled={!(parseFloat(amountText || '0') > 0)}
                          tint={colors.income}
                        />
                      </View>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => startAbono(loan.id)}
                    style={styles.abonoTrigger}
                  >
                    <Text style={styles.abonoTriggerText}>Registrar abono</Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
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
    fontWeight: '600',
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
  empty: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debtor: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  outstanding: {
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  meta: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  doneTag: {
    color: colors.income,
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  abonoTrigger: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.income + '66',
    alignItems: 'center',
  },
  abonoTriggerText: {
    color: colors.income,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  abonoBox: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  abonoLabel: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  chipsRow: {
    paddingBottom: spacing.sm,
    paddingRight: spacing.md,
  },
  abonoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cancelBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  cancelText: {
    color: colors.textDim,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  confirmWrap: {
    flex: 1,
  },
});
