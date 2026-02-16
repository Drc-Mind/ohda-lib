export type ExpenseCategory = 
  // Class 60: Consumables (Fournitures & Energie)
  | 'WATER'                    // 6051 - Eau
  | 'ELECTRICITY'              // 6052 - Électricité
  | 'OTHER_ENERGY'             // 6053 - Autres énergies
  | 'OFFICE_SUPPLIES'          // 6055 - Fournitures de bureau
  | 'FUEL'                     // 6042 - Matières combustibles
  | 'MAINTENANCE_SUPPLIES'     // 6043 - Produits d'entretien
  | 'SMALL_EQUIPMENT'          // 6056 - Petit matériel et outillage
  
  // Class 61: Transport & Travel
  | 'PERSONNEL_TRANSPORT'      // 614 - Transport du personnel
  | 'BUSINESS_TRAVEL'          // 6181 - Voyages et déplacements
  | 'MAIL_TRANSPORT'           // 616 - Transport de plis
  
  // Class 62: External Services A
  | 'RENT_BUILDING'            // 6222 - Locations de bâtiments
  | 'RENT_EQUIPMENT'           // 6223 - Locations de matériels
  | 'MAINTENANCE'              // 6242 - Entretien et réparations
  | 'INSURANCE'                // 6251 - Assurances multirisques
  | 'DOCUMENTATION'            // 6265 - Documentation générale
  | 'ADVERTISING'              // 6271 - Annonces, insertions
  | 'TELECOMMUNICATIONS'       // 6281 - Frais de téléphone
  
  // Class 63: External Services B
  | 'BANK_FEES'                // 6318 - Autres frais bancaires
  | 'LEGAL_FEES'               // 6324 - Honoraires professions réglementées
  | 'ACCOUNTING_FEES'          // 6324 - Honoraires professions réglementées
  | 'PROFESSIONAL_FEES'        // 6327 - Autres prestataires de services
  | 'TRAINING'                 // 633 - Formation du personnel
  | 'SOFTWARE_LICENSE'         // 6343 - Redevances pour logiciels
  
  // Class 64: Taxes & Duties
  | 'BUSINESS_LICENSE'         // 6412 - Patentes, licences
  | 'PROPERTY_TAX'             // 6411 - Impôts fonciers
  | 'PAYROLL_TAX'              // 6413 - Taxes sur appointements
  | 'REGISTRATION_FEES'        // 6461 - Droits de mutation
  | 'STAMP_DUTY'               // 6462 - Droits de timbre
  | 'VEHICLE_TAX';             // 6463 - Taxes sur véhicules

export interface ExpenseInput {
  category: ExpenseCategory;
  amount: number;
  label: string;
  date?: Date;
  
  // Flexible VAT handling
  vatAmount?: number;      // Manual VAT amount (takes precedence)
  vatRate?: number;        // Auto-calculate VAT from rate
  
  // Optional payment
  payment?: {
    method: 'cash' | 'bank';
    amount: number;
  };
}

// Configuration for global VAT settings
export interface ExpenseVATConfig {
  defaultVATRate?: number;           // Default VAT rate for all expenses
  vatOnExpenses?: boolean;           // Global flag to enable/disable VAT
  serviceVATAccount?: string;        // Custom VAT account for services (default: 4454)
  goodsVATAccount?: string;          // Custom VAT account for goods (default: 4452)
}
