export type SaleType = 'GOODS' | 'MANUFACTURED' | 'SERVICES';

export interface PackagingDeposit {
  amount: number;
  description?: string;
}

export interface TransportCharge {
  amount: number;
  description?: string;
}

export interface FinancialDiscount {
  percentage: number;  // e.g., 2 for 2%
}

export interface InventoryExit {
  costPrice: number;  // CMUP (Coût Moyen Unitaire Pondéré)
}

export interface SaleInput {
  // REQUIRED
  amount: number;           // Net commercial price (after RRR if applicable)
  label: string;
  saleType: SaleType;       // Determines account: 701, 702, or 706
  
  // OPTIONAL
  date?: Date;
  vatRate?: number;         // Default: 18
  
  // ADVANCED OPTIONS
  financialDiscount?: FinancialDiscount;  // Escompte (recorded as expense)
  packagingDeposit?: PackagingDeposit;    // Consignation (no VAT)
  transportCharge?: TransportCharge;       // Port facturé (7071)
  inventoryExit?: InventoryExit;          // Stock exit (6031/311)
  
  // PAYMENT (optional - if immediate payment)
  payment?: {
    method: 'cash' | 'bank';
    amount: number;
  };
}

// Re-export JournalEntry from global types
export type { JournalEntry } from '../../types';
