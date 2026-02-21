import { ExpenseCategory } from './types';

/**
 * SYSCOHADA account mapping for each expense category
 */
export const EXPENSE_ACCOUNTS: Record<ExpenseCategory, string> = {
  // Class 60: Supplies & Utilities
  WATER: '6051',
  ELECTRICITY: '6052',
  GAS: '6053',
  OFFICE_SUPPLIES: '604',
  FUEL: '6042',
  SMALL_EQUIPMENT: '6056',
  
  // Class 61: External Services A
  RENT: '611',
  MAINTENANCE_REPAIRS: '613',
  INSURANCE: '615',
  RESEARCH_DOCUMENTATION: '616',
  
  // Class 62: External Services B
  HONORAIRES: '622',
  TRANSPORT: '624',
  TRAVEL_RECEPTION: '625',
  BANK_SERVICES: '627',
  TELECOMMUNICATIONS: '628',
  ADVERTISING: '6271',
  SOFTWARE_LICENSE: '6343',
  
  // Class 64: Personnel Charges
  PERSONNEL_CHARGES: '64',
  
  // Class 65: Other Management Charges
  MISC_MANAGEMENT_CHARGES: '658',
  
  // Legacy / Other
  BUSINESS_LICENSE: '6412',
  PROPERTY_TAX: '6411',
  PAYROLL_TAX: '6413',
  REGISTRATION_FEES: '6461',
  STAMP_DUTY: '6462',
  VEHICLE_TAX: '6463'
};

/**
 * Determine if expense category is a service (uses 4454) or goods (uses 4452)
 * Following SYSCOHADA VAT recovery rules.
 */
export const isServiceExpense = (category: ExpenseCategory): boolean => {
  const serviceCategories: ExpenseCategory[] = [
    'RENT',
    'MAINTENANCE_REPAIRS',
    'INSURANCE',
    'RESEARCH_DOCUMENTATION',
    'HONORAIRES',
    'TRANSPORT',
    'TRAVEL_RECEPTION',
    'BANK_SERVICES',
    'TELECOMMUNICATIONS',
    'ADVERTISING',
    'SOFTWARE_LICENSE',
    'PERSONNEL_CHARGES', // Usually VAT-exempt, but categorized as service
    'MISC_MANAGEMENT_CHARGES',
    // Legacy
    'BUSINESS_LICENSE',
    'PROPERTY_TAX',
    'PAYROLL_TAX',
    'REGISTRATION_FEES',
    'STAMP_DUTY',
    'VEHICLE_TAX'
  ];
  
  return serviceCategories.includes(category);
};

/**
 * Common SYSCOHADA accounts used in expense recording
 */
export const COMMON_ACCOUNTS = {
  SUPPLIER: '4011',              // Fournisseurs
  VAT_SERVICES: '4454',          // TVA récupérable sur services
  VAT_GOODS: '4452',             // TVA récupérable sur achats
  CASH: '5711',                  // Caisse
  BANK: '5211'                   // Banque
};
