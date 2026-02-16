import { ExpenseCategory } from './types';

/**
 * SYSCOHADA account mapping for each expense category
 */
export const EXPENSE_ACCOUNTS: Record<ExpenseCategory, string> = {
  // Class 60: Consumables
  WATER: '6051',
  ELECTRICITY: '6052',
  OTHER_ENERGY: '6053',
  OFFICE_SUPPLIES: '6055',
  FUEL: '6042',
  MAINTENANCE_SUPPLIES: '6043',
  SMALL_EQUIPMENT: '6056',
  
  // Class 61: Transport & Travel
  PERSONNEL_TRANSPORT: '614',
  BUSINESS_TRAVEL: '6181',
  MAIL_TRANSPORT: '616',
  
  // Class 62: External Services A
  RENT_BUILDING: '6222',
  RENT_EQUIPMENT: '6223',
  MAINTENANCE: '6242',
  INSURANCE: '6251',
  DOCUMENTATION: '6265',
  ADVERTISING: '6271',
  TELECOMMUNICATIONS: '6281',
  
  // Class 63: External Services B
  BANK_FEES: '6318',
  LEGAL_FEES: '6324',
  ACCOUNTING_FEES: '6324',
  PROFESSIONAL_FEES: '6327',
  TRAINING: '633',
  SOFTWARE_LICENSE: '6343',
  
  // Class 64: Taxes
  BUSINESS_LICENSE: '6412',
  PROPERTY_TAX: '6411',
  PAYROLL_TAX: '6413',
  REGISTRATION_FEES: '6461',
  STAMP_DUTY: '6462',
  VEHICLE_TAX: '6463'
};

/**
 * Determine if expense category is a service (uses 4454) or goods (uses 4452)
 */
export const isServiceExpense = (category: ExpenseCategory): boolean => {
  const serviceCategories: ExpenseCategory[] = [
    'PERSONNEL_TRANSPORT',
    'BUSINESS_TRAVEL',
    'MAIL_TRANSPORT',
    'RENT_BUILDING',
    'RENT_EQUIPMENT',
    'MAINTENANCE',
    'INSURANCE',
    'DOCUMENTATION',
    'ADVERTISING',
    'TELECOMMUNICATIONS',
    'BANK_FEES',
    'LEGAL_FEES',
    'ACCOUNTING_FEES',
    'PROFESSIONAL_FEES',
    'TRAINING',
    'SOFTWARE_LICENSE'
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
