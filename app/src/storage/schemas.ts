import { z } from 'zod';

// ============================================================
// Atomic schemas — mirror src/types.ts exactly
// ============================================================

export const accountIdSchema = z.enum(['mp', 'bbva', 'spin', 'credit']);
export const txTypeSchema = z.enum(['income', 'expense']);
export const leadStatusSchema = z.enum(['new', 'qualified', 'won', 'lost']);

export const transactionSchema = z.object({
  id: z.string().min(1),
  type: txTypeSchema,
  amount: z.number().finite(),
  accountId: accountIdSchema,
  category: z.string().optional(),
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

// ============================================================
// Top-level state — what we serialize to AsyncStorage
// ============================================================

export const CURRENT_SCHEMA_VERSION = 1 as const;

export const storeStateSchema = z.object({
  __schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  transactions: z.array(transactionSchema),
  leads: z.array(leadSchema),
});

export type StoreStateValidated = z.infer<typeof storeStateSchema>;
export type TransactionValidated = z.infer<typeof transactionSchema>;
export type LeadValidated = z.infer<typeof leadSchema>;
