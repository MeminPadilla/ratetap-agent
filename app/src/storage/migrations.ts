import { z } from 'zod';
import {
  CURRENT_SCHEMA_VERSION,
  StoreStateValidated,
  storeStateSchema,
  transactionSchema,
  leadSchema,
} from './schemas';

// ============================================================
// Migration system for AsyncStorage payloads
//
// On every app boot we read the raw blob from storage, run it
// through `migrate()`, and get back a validated state plus
// metadata about what was dropped along the way.
//
// Schema version history:
//   v0  pre-versioning (no __schemaVersion field). Original
//       shape: { transactions: Transaction[], leads: Lead[] }.
//   v1  current. Adds __schemaVersion. Same field shapes; just
//       enforces validation and dedupes/drops malformed items.
//
// To add v2: write `migrateV1ToV2`, append to the chain, bump
// CURRENT_SCHEMA_VERSION in schemas.ts.
// ============================================================

interface UnvalidatedState {
  transactions: unknown[];
  leads: unknown[];
}

interface ArrayResult<T> {
  valid: T[];
  dropped: number;
}

const safeParseArray = <T>(items: unknown, schema: z.ZodSchema<T>): ArrayResult<T> => {
  if (!Array.isArray(items)) return { valid: [], dropped: 0 };
  const valid: T[] = [];
  let dropped = 0;
  for (const item of items) {
    const result = schema.safeParse(item);
    if (result.success) valid.push(result.data);
    else dropped++;
  }
  return { valid, dropped };
};

interface StepResult {
  state: UnvalidatedState;
  droppedTransactions: number;
  droppedLeads: number;
}

// v0 → v1: validate each item individually, drop bad ones, attach version field
const migrateV0ToV1 = (raw: unknown): StepResult => {
  const obj = (raw ?? {}) as { transactions?: unknown; leads?: unknown };
  const tx = safeParseArray(obj.transactions, transactionSchema);
  const ld = safeParseArray(obj.leads, leadSchema);
  return {
    state: { transactions: tx.valid, leads: ld.valid },
    droppedTransactions: tx.dropped,
    droppedLeads: ld.dropped,
  };
};

export interface MigrateResult {
  state: StoreStateValidated;
  droppedTransactions: number;
  droppedLeads: number;
  fromVersion: number;
  migrated: boolean;
}

/**
 * Reads any past or present payload shape and returns a fully
 * validated state at the current schema version. Throws only on
 * the final zod parse — call sites should treat throws as
 * "data corrupt, back up the raw blob and start fresh".
 */
export const migrate = (raw: unknown): MigrateResult => {
  const obj = (raw ?? {}) as { __schemaVersion?: unknown };
  const fromVersion =
    typeof obj.__schemaVersion === 'number' ? obj.__schemaVersion : 0;

  let working: UnvalidatedState = {
    transactions: ((obj as { transactions?: unknown }).transactions ?? []) as unknown[],
    leads: ((obj as { leads?: unknown }).leads ?? []) as unknown[],
  };
  let droppedTransactions = 0;
  let droppedLeads = 0;

  if (fromVersion < 1) {
    const step = migrateV0ToV1(obj);
    working = step.state;
    droppedTransactions += step.droppedTransactions;
    droppedLeads += step.droppedLeads;
  }
  // future: if (fromVersion < 2) { ... }

  const validated = storeStateSchema.parse({
    __schemaVersion: CURRENT_SCHEMA_VERSION,
    transactions: working.transactions,
    leads: working.leads,
  });

  return {
    state: validated,
    droppedTransactions,
    droppedLeads,
    fromVersion,
    migrated: fromVersion < CURRENT_SCHEMA_VERSION,
  };
};
