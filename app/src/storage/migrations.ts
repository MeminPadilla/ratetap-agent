import { z } from 'zod';
import {
  CURRENT_SCHEMA_VERSION,
  StoreStateValidated,
  storeStateSchema,
  transactionSchema,
  loanSchema,
  leadSchema,
} from './schemas';
import { ACCOUNTS } from '../constants/accounts';
import { AccountId } from '../types';
import { seedLoans, seedOpeningBalances } from './seed';

// ============================================================
// Migration system for AsyncStorage payloads
//
// On every app boot we read the raw blob from storage, run it
// through `migrate()`, and get back a validated state plus
// metadata about what was dropped along the way.
//
// Schema version history:
//   v0  pre-versioning (no __schemaVersion field). Original
//       shape: { transactions, leads }.
//   v1  adds __schemaVersion. Same field shapes.
//   v2  current. New account model (real accounts + credit cards),
//       expanded TxType, plus `loans` and `openingBalances`.
//       Transactions/leads referencing the old model that no longer
//       validate are dropped item-by-item (never throws on one bad row).
//
// To add v3: bump CURRENT_SCHEMA_VERSION in schemas.ts and extend
// the seed/merge logic below as needed.
// ============================================================

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

/**
 * Merges any stored opening-balance overrides on top of the seed
 * defaults, guaranteeing every account id is present with a finite
 * number (so the final strict parse never fails on this field).
 */
const mergeOpeningBalances = (raw: unknown): Record<AccountId, number> => {
  const base = seedOpeningBalances();
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    for (const a of ACCOUNTS) {
      const v = obj[a.id];
      if (typeof v === 'number' && Number.isFinite(v)) base[a.id] = v;
    }
  }
  return base;
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
 * validated state at the current schema version. Individual malformed
 * items are dropped rather than throwing; the final zod parse only
 * throws if the assembled shape is fundamentally broken — call sites
 * treat that as "data corrupt, back up the raw blob and start fresh".
 */
export const migrate = (raw: unknown): MigrateResult => {
  const obj = (raw ?? {}) as {
    __schemaVersion?: unknown;
    transactions?: unknown;
    leads?: unknown;
    loans?: unknown;
    openingBalances?: unknown;
  };
  const fromVersion =
    typeof obj.__schemaVersion === 'number' ? obj.__schemaVersion : 0;

  const tx = safeParseArray(obj.transactions, transactionSchema);
  const ld = safeParseArray(obj.leads, leadSchema);

  // loans: when the field is entirely absent (upgrade from v0/v1) seed the
  // initial loans; otherwise validate + drop malformed rows.
  const loans =
    obj.loans === undefined ? seedLoans() : safeParseArray(obj.loans, loanSchema).valid;

  const openingBalances = mergeOpeningBalances(obj.openingBalances);

  const validated = storeStateSchema.parse({
    __schemaVersion: CURRENT_SCHEMA_VERSION,
    transactions: tx.valid,
    leads: ld.valid,
    loans,
    openingBalances,
  });

  return {
    state: validated,
    droppedTransactions: tx.dropped,
    droppedLeads: ld.dropped,
    fromVersion,
    migrated: fromVersion < CURRENT_SCHEMA_VERSION,
  };
};
