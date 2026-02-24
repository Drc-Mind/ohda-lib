/**
 * Purchase Fees with linked OHADA accounts
 */
export const PurchaseFees = {
  Transport: { label: "Transport", account: "6015" },
  Customs: { label: "Douane", account: "6014" },
  Handling: { label: "Manutention", account: "6015" }, 
  Insurance: { label: "Assurance", account: "6015" },
  Commission: { label: "Commission", account: "622" },
  Other: { label: "Divers", account: "6015" }
} as const;

// Helper type to capture the structure of a fee
export type PurchaseFeeType = typeof PurchaseFees[keyof typeof PurchaseFees];

/**
 * SYSCOHADA Account Codes for Purchase Operations
 */
export const PURCHASE_ACCOUNTS = {
  // Purchase Base
  MERCHANDISE: '6011',             // Achat de marchandises
  SERVICES: '6012',                // Achat de services
  CHARGES: '6015',                 // Frais sur achat
  
  // VAT
  VAT_RECOVERABLE: '4452',         // TVA récupérable
  
  // Supplier
  SUPPLIER: '4011',                // Fournisseurs
  
  // Inventory (Stock)
  STOCK_VARIATION: '6031',         // Variation de stocks de marchandises
  STOCK_ACCOUNT: '31',             // Stocks de marchandises
  
  // Monetary Accounts
  BANK: '5211',                    // Banque
  CASH: '5711'                     // Caisse
} as const;
