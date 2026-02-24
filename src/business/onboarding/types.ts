export interface OpeningBalanceInput {
  date?: Date;
  /**
   * Fixed Assets (Immobilisations) - Account Class 2
   */
  fixedAssets: Array<{
    name: string;
    amount: number;
    account?: string; // Optional: e.g., 241, 23, 21 depending on asset
  }>;
  /**
   * Current Assets (Stocks) - Account Class 3
   */
  stocks: Array<{
    name: string;
    amount: number; // Cost price total (Quantity * Unit Cost)
    account?: string; // Optional: e.g., 311
  }>;
  /**
   * Receivables (Créances Clients) - Account 411
   */
  receivables: Array<{
    name: string;
    amount: number;
  }>;
  /**
   * Cash and Equivalents - Account Class 5
   */
  liquidities: {
    cash?: number;
    bank?: number;
  };
  /**
   * Payables (Dettes) - Account Class 4
   */
  payables: Array<{
    name: string;
    amount: number;
    account?: string; // Optional: 401 (Operating) or 162 (Loan)
  }>;
}

export interface OpeningBalanceResult {
  totalAssets: number;
  totalLiabilities: number;
  netEquity: number;
  isSolvent: boolean;
}
