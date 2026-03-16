export interface OhadaConfig {
  /**
   * Default VAT rate (e.g., 0.18 for 18%).
   * Used when no specific VAT is provided in requests.
   */
  vat?: number;

  /**
   * Currency code (e.g., 'XAF', 'EUR', 'USD', 'CDF).
   * Used for formatting and validation.
   */
  currency?: string;

  /**
   * Whether input prices include VAT (TTC).
   * - true: Input prices are TTC. VAT will be extracted.
   * - false (default): Input prices are HT. VAT will be added on top.
   */
  taxInclusive?: boolean;

  /**
   * Locale for journal entry labels.
   * - 'fr' (default): French labels.
   * - 'en': English labels.
   */
  locale?: 'fr' | 'en';
  /**
   * Whether to disable VAT calculation globally.
   * - true (default): VAT lines will not be generated.
   * - false: VAT will be calculated according to rules.
   */
  disableVAT?: boolean;

  /**
   * Whether to record expenses as direct payments (skipping supplier account 4011).
   * - true: Records a single entry direct to cash/bank.
   * - false (default): Records two entries (Constatation -> Règlement).
   */
  directMode?: boolean;
}

