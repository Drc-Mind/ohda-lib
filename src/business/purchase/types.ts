export type PurchaseType = 'GOODS';

export interface PurchaseCharge {
  type: 'Transport' | 'Douane' | 'Divers';
  amount: number;
}

export interface PurchasePayment {
  method: 'cash' | 'bank';
  amount: number;
}

/**
 * Stock inventory entry for purchases
 * Handles both initial stock (opening) and final stock (closing) adjustments
 * 
 * If finalStock is not provided, it will be auto-calculated as:
 * finalStock = amount + charges (the full cost of the purchase)
 */
export interface StockEntry {
  initialStock?: number;  // Opening inventory value (annulation/closing from previous period)
  finalStock?: number;    // Closing inventory value. Auto-calculated if not provided (amount + charges)
  stockAccount?: string;  // OHADA stock account (default: '31' for Marchandises)
}

export type PurchaseInput = {
  // REQUIRED FIELDS
  amount: number;          // The base amount (HT)
  label: string;           // Description (e.g., "Achat Marchandises")

  // OPTIONAL FIELDS (With Smart Defaults)
  date?: Date;             // Default: new Date()
  vatRate?: number;        // Default: 18 (Standard OHADA rate)
  
  // ADVANCED OPTIONS
  charges?: PurchaseCharge[];
  payments?: PurchasePayment[];
  stockEntry?: StockEntry;  // Inventory adjustment entries
};
