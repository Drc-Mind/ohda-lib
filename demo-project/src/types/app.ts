import type { JournalEntry } from '@drcmind/ohada-lib';

export type RecordType = 'sale' | 'purchase' | 'expense';

export interface RecordMeta {
  clientName?: string;
  supplierName?: string;
  saleType?: string;
  expenseCategory?: string;
  vatAmount?: number;
  paymentMethod?: string;
}

export interface AppRecord {
  id: string;
  date: string;           // ISO string
  label: string;
  amount: number;         // HT amount
  type: RecordType;
  meta: RecordMeta;
  journalEntries: JournalEntry[];
}

export interface AppStore {
  openingEntry: JournalEntry | null;
  records: AppRecord[];
}
