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
}

