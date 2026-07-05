import { z } from 'zod';

// ============================================================
// Atomic schemas — mirror src/types.ts exactly
// ============================================================

export const accountIdSchema = z.enum([
  'cash',
  'mp',
  'revolut',
  'bbva',
  'spin',
  'tc_mp',
  'tc_vexi',
  'tc_didi',
]);

export const txTypeSchema = z.enum([
  'income',
  'expense',
  'transfer',
  'cc_payment',
  'cc_purchase',
  'loan_out',
  'loan_repayment',
]);

export const leadStatusSchema = z.enum(['new', 'qualified', 'won', 'lost']);

export const transactionSchema = z.object({
  id: z.string().min(1),
  type: txTypeSchema,
  amount: z.number().finite(),
  accountId: accountIdSchema,
  toAccountId: accountIdSchema.optional(),
  incomeCategoryId: z.string().optional(),
  category: z.string().optional(),
  note: z.string().optional(),
  createdAt: z.string().min(1),
});

export const loanSchema = z.object({
  id: z.string().min(1),
  debtor: z.string().min(1),
  amountOriginal: z.number().finite(),
  amountOutstanding: z.number().finite(),
  dateGiven: z.string().min(1),
  dateEstimatedRepayment: z.string().optional(),
  note: z.string().optional(),
  createdAt: z.string().min(1),
});

export const leadSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  contact: z.string().optional(),
  status: leadStatusSchema,
  mrr: z.number().finite().optional(),
  note: z.string().optional(),
  createdAt: z.string().min(1),
});

// Saldos/usados iniciales editables, uno por cuenta.
export const openingBalancesSchema = z.record(accountIdSchema, z.number().finite());

// ============================================================
// Top-level state — what we serialize to AsyncStorage
// ============================================================

export const CURRENT_SCHEMA_VERSION = 2 as const;

export const storeStateSchema = z.object({
  __schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  transactions: z.array(transactionSchema),
  leads: z.array(leadSchema),
  loans: z.array(loanSchema),
  openingBalances: openingBalancesSchema,
});

export type StoreStateValidated = z.infer<typeof storeStateSchema>;
export type TransactionValidated = z.infer<typeof transactionSchema>;
export type LoanValidated = z.infer<typeof loanSchema>;
export type LeadValidated = z.infer<typeof leadSchema>;
