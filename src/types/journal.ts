/**
 * Journal Entry Types
 * 
 * These types are used across multiple modules (purchase, sales, etc.)
 * to represent accounting journal entries in SYSCOHADA format.
 */

export interface JournalEntry {
  date: Date;
  lines: Array<{
    account: string;      // Example: "6011"
    label: string;        // Example: "Achat Marchandises"
    debit: number;
    credit: number;
  }>;
  totals: {
    debit: number;
    credit: number;
  };
  isBalanced: boolean;    // True if debit === credit
}
