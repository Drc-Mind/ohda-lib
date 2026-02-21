export type Locale = 'fr' | 'en';

export interface Translations {
  // Purchase translations
  genericPurchase: string;
  vatRecoverable: string;
  investmentSupplier: string;
  operatingSupplier: string;
  cashOut: string;
  paymentMethod: string;
  
  // Sales translations
  saleOfGoods: string;
  saleOfManufactured: string;
  saleOfServices: string;
  vatCollected: string;
  client: string;
  transportCharged: string;
  packagingDeposit: string;
  financialDiscount: string;
  costOfSales: string;
  cashIn: string;
  paymentReceived: string;
  
  // Expense translations
  supplier: string;
  payment: string;

  // Transaction Types
  constatation: string;
  reglement: string;
  stockExit: string;
  openingBalance: string;
}

export const translations: Record<Locale, Translations> = {
  fr: {
    genericPurchase: 'Achat (Générique)',
    vatRecoverable: 'TVA récupérable sur achats',
    investmentSupplier: 'Fournisseur Invest.',
    operatingSupplier: 'Fournisseur',
    cashOut: 'Sortie de trésorerie',
    paymentMethod: 'Paiement',
    
    saleOfGoods: 'Vente de marchandises',
    saleOfManufactured: 'Vente de produits finis',
    saleOfServices: 'Prestation de services',
    vatCollected: 'TVA facturée',
    client: 'Client',
    transportCharged: 'Port facturé',
    packagingDeposit: 'Emballages consignés',
    financialDiscount: 'Escompte accordé',
    costOfSales: 'Variation de stocks',
    cashIn: 'Entrée de trésorerie',
    paymentReceived: 'Règlement reçu',
    
    supplier: 'Fournisseur',
    payment: 'Règlement',

    constatation: 'CONSTATATION',
    reglement: 'REGLEMENT',
    stockExit: 'STOCK_EXIT',
    openingBalance: 'BILAN_OUVERTURE'
  },
  en: {
    genericPurchase: 'Purchase (Generic)',
    vatRecoverable: 'Recoverable VAT on purchases',
    investmentSupplier: 'Investment Supplier',
    operatingSupplier: 'Supplier',
    cashOut: 'Cash Outflow',
    paymentMethod: 'Payment',
    
    saleOfGoods: 'Sale of goods',
    saleOfManufactured: 'Sale of finished products',
    saleOfServices: 'Service provision',
    vatCollected: 'VAT charged',
    client: 'Customer',
    transportCharged: 'Transport charged',
    packagingDeposit: 'Packaging deposits',
    financialDiscount: 'Cash discount granted',
    costOfSales: 'Cost of goods sold',
    cashIn: 'Cash Inflow',
    paymentReceived: 'Payment received',
    
    supplier: 'Supplier',
    payment: 'Payment',

    constatation: 'ACCRUAL',
    reglement: 'PAYMENT',
    stockExit: 'STOCK_EXIT',
    openingBalance: 'OPENING_BALANCE'
  }
};

export function getTranslations(locale: Locale = 'fr'): Translations {
  return translations[locale] || translations.fr;
}
