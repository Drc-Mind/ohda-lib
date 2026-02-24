export interface InteractionItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  type?: 'GOODS' | 'SERVICE' | 'ASSET' | 'CONSUMABLE'; // Important for OHADA distinction
  account?: string; // Optional override
}

export interface PaymentDetails {
  cash?: number;
  bank?: number;
  due?: number;
}

export interface SaleRequest {
  customerId: string;
  date?: string; // ISO string
  items: InteractionItem[];
  payment: PaymentDetails;
}

export interface Fee {
  label: string;
  amount: number;
  account?: string;
}

export interface PurchaseRequest {
  supplierId: string;
  date?: string;
  items: InteractionItem[];
  payment: PaymentDetails;
  tva?: number; // Optional override or percentage
  additionalCharges?: Fee[];
}

export interface ExpenseRequest {
  label: string;
  amount: number;
  paymentMethod: 'cash' | 'bank';
  account?: string; // Optional override
  date?: string;
}

export interface JournalLine {
  accountCode: string;
  label: string;
  debit?: number;
  credit?: number;
}


export interface AccoutingResult {
  journalEntries: JournalLine[];
  warnings?: string[];
}
