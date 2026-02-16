export type PurchaseType = 'GOODS';

export interface PurchaseCharge {
  type: 'Transport' | 'Douane' | 'Divers';
  amount: number;
}

export interface PurchasePayment {
  method: 'cash' | 'bank';
  amount: number;
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
};
