/**
 * SYSCOHADA Account Codes for Sales Operations
 */
export const SALE_ACCOUNTS = {
  // Revenue Accounts (Class 7)
  GOODS: '701',                    // Ventes de marchandises
  MANUFACTURED: '702',             // Ventes de produits finis
  SERVICES: '706',                 // Prestations de services
  TRANSPORT: '7071',               // Ports et frais accessoires facturés
  
  // Client & VAT
  CLIENT: '4111',                  // Clients
  VAT_COLLECTED: '4431',           // État, TVA facturée
  
  // Liabilities
  PACKAGING_DEPOSIT: '4194',       // Clients, dettes pour emballages consignés
  
  // Financial Expenses
  FINANCIAL_DISCOUNT: '673',       // Escomptes accordés
  
  // Inventory (CMUP)
  COST_OF_SALES: '6031',          // Variation de stocks de marchandises
  STOCK: '311'                     // Marchandises
} as const;
