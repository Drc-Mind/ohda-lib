// ============================================================
// Fixed Asset Types (Immobilisations — Class 2)
// ============================================================
export type FixedAssetType =
  // Intangibles (21)
  | 'PATENT_LICENSE'          // 212  - Brevets, licences, concessions
  | 'SOFTWARE'                // 2183 - Logiciels et sites internet
  | 'INTANGIBLE_OTHER'        // 21   - Autres immobilisations incorporelles
  // Land (22)
  | 'LAND'                    // 22   - Terrains
  // Buildings (23)
  | 'COMMERCIAL_BUILDING'     // 2313 - Bâtiments commerciaux et industriels
  | 'RESIDENTIAL_BUILDING'    // 2314 - Bâtiments d'habitation
  // Equipment (24)
  | 'INDUSTRIAL_EQUIPMENT'    // 241  - Matériel et outillage industriel
  | 'AGRICULTURAL_EQUIPMENT'  // 243  - Matériel agricole
  | 'OFFICE_EQUIPMENT'        // 2441 - Matériel de bureau
  | 'COMPUTER_EQUIPMENT'      // 2444 - Matériel informatique (PC, serveurs, imprimantes…)
  | 'OFFICE_FURNITURE'        // 2445 - Mobilier de bureau
  // Vehicles (245)
  | 'PASSENGER_VEHICLE'       // 2451 - Véhicules de tourisme
  | 'UTILITY_VEHICLE'         // 2452 - Véhicules utilitaires, camions
  // Financial (27)
  | 'FINANCIAL_ASSET';        // 27   - Immobilisations financières (titres, prêts)

// ============================================================
// Stock Types (Stocks — Class 3)
// ============================================================
export type StockType =
  | 'MERCHANDISE'             // 3111 - Marchandises
  | 'RAW_MATERIALS'           // 3211 - Matières premières
  | 'FINISHED_GOODS'          // 3411 - Produits finis
  | 'PACKAGING'               // 3611 - Emballages commerciaux
  | 'OTHER_SUPPLIES';         // 3811 - Autres approvisionnements

// ============================================================
// Receivable Types (Créances — Class 4)
// ============================================================
export type ReceivableType =
  | 'CUSTOMER'                // 4111 - Clients
  | 'SUPPLIER_ADVANCE'        // 4091 - Avances versées aux fournisseurs
  | 'TAX_CREDIT'              // 4717 - Créances fiscales et sociales
  | 'OTHER_RECEIVABLE';       // 4721 - Débiteurs divers

// ============================================================
// Liability Types (Dettes — Class 1 & 4)
// ============================================================
export type LiabilityType =
  | 'SUPPLIER'                // 4011 - Fournisseurs
  | 'BANK_LOAN'               // 1621 - Emprunts auprès d'établissements de crédit
  | 'OPERATING_CREDIT'        // 1622 - Crédits de trésorerie à court terme
  | 'OTHER_DEBT';             // 4711 - Créditeurs divers

// ============================================================
// Line-item interfaces
// ============================================================
export interface OpeningFixedAsset {
  /** Human-readable description (e.g. "Camion Isuzu", "MacBook Pro") */
  label: string;
  /** SYSCOHADA asset category — determines the account */
  type: FixedAssetType;
  /** Net book value (valeur nette comptable) */
  amount: number;
}

export interface OpeningStock {
  /** Human-readable description */
  label: string;
  /** Stock category — determines the account */
  type: StockType;
  /** Total value at cost price */
  amount: number;
}

export interface OpeningReceivable {
  /** Human-readable description (e.g. "Client Dupont SARL") */
  label: string;
  /** Receivable category — determines the account */
  type: ReceivableType;
  amount: number;
}

export interface OpeningLiability {
  /** Human-readable description (e.g. "Emprunt BNI", "Fournisseur X") */
  label: string;
  /** Liability category — determines the account */
  type: LiabilityType;
  amount: number;
}

// ============================================================
// Main Input Interface
// ============================================================
export interface OpeningEntryInput {
  /** Entry date — defaults to today */
  date?: Date;

  // ── DEBIT SIDE (Assets) ────────────────────────────────

  /** Fixed assets / immobilisations — Class 2 */
  fixedAssets?: OpeningFixedAsset[];

  /** Inventory / stocks — Class 3 */
  stocks?: OpeningStock[];

  /** Receivables / créances — Class 4 */
  receivables?: OpeningReceivable[];

  /** Bank balance — Account 5211 */
  bank?: number;

  /** Cash on hand — Account 5711 */
  cash?: number;

  /** Mobile money balance (Orange Money, MTN MoMo…) — Account 5141 */
  mobileMoney?: number;

  // ── CREDIT SIDE (Liabilities) ──────────────────────────

  /** Supplier debts, loans, and other liabilities */
  liabilities?: OpeningLiability[];
}
