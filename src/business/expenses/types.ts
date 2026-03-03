export type ExpenseCategory = 
  // Class 60: Supplies & Utilities
  | 'WATER'                    // 6051 - Eau
  | 'ELECTRICITY'              // 6052 - Électricité
  | 'GAS'                      // 6053 - Gaz
  | 'OFFICE_SUPPLIES'          // 604 - Fournitures de bureau
  | 'FUEL'                     // 6042 - Matières combustibles
  | 'SMALL_EQUIPMENT'          // 6056 - Petit matériel et outillage
  
  // Class 61: External Services A
  | 'RENT'                     // 611 - Locations
  | 'MAINTENANCE_REPAIRS'      // 613 - Entretien et réparations
  | 'INSURANCE'                // 615 - Primes d'assurance
  | 'RESEARCH_DOCUMENTATION'   // 616 - Études, recherches et documentation
  
  // Class 62: External Services B
  | 'HONORAIRES'               // 622 - Honoraires (Avocats, Experts)
  | 'TRANSPORT'                // 624 - Transports (Personnel, plis)
  | 'TRAVEL_RECEPTION'         // 625 - Déplacements et réceptions
  | 'BANK_SERVICES'            // 627 - Services bancaires
  | 'TELECOMMUNICATIONS'       // 628 - Frais de télécommunications
  | 'ADVERTISING'              // 6271 - Legacy Advertising
  | 'SOFTWARE_LICENSE'         // 6343 - Legacy Software
  
  // Class 64: Personnel Charges
  | 'PERSONNEL_CHARGES'        // 64 - Salaires et charges sociales
  
  // Class 65: Other Management Charges
  | 'MISC_MANAGEMENT_CHARGES'  // 658 - Charges diverses de gestion
  
  // Legacy / Other (Keep for compatibility if needed)
  | 'BUSINESS_LICENSE'         // 6412 - Patentes, licences
  | 'PROPERTY_TAX'             // 6411 - Impôts fonciers
  | 'PAYROLL_TAX'              // 6413 - Taxes sur appointements
  | 'REGISTRATION_FEES'        // 6461 - Droits de mutation
  | 'STAMP_DUTY'               // 6462 - Droits de timbre
  | 'VEHICLE_TAX';             // 6463 - Taxes sur véhicules

export interface ExpensePayment {
  method: 'cash' | 'bank';
  amount: number;
}

export interface ExpenseInput {
  category: ExpenseCategory;
  amount: number;
  label: string;
  date?: Date;
  
  // Flexible VAT handling
  vatAmount?: number;      // Manual VAT amount (takes precedence)
  vatRate?: number;        // Auto-calculate VAT from rate
  
  // Optional payments (array for multiple payment methods)
  payments?: ExpensePayment[];
}

// Configuration for global VAT settings
export interface ExpenseVATConfig {
  defaultVATRate?: number;           // Default VAT rate for all expenses
  vatOnExpenses?: boolean;           // Global flag to enable/disable VAT
  serviceVATAccount?: string;        // Custom VAT account for services (default: 4454)
  goodsVATAccount?: string;          // Custom VAT account for goods (default: 4452)
}