/**
 * OHADA Core Library
 * 
 * Main entry point for the OHADA accounting library.
 * This class orchestrates the various accounting operations (Sales, Purchases, Expenses)
 * and manages the shared resources like the Account Resolver.
 */
import { CHART_OF_ACCOUNTS } from './index';
import { PurchaseInput, recordPurchase } from '../business/purchase';
import { SaleInput, recordSale } from '../business/sales';
import { ExpenseInput, ExpenseVATConfig, recordExpense } from '../business/expenses';
import { recordAsset } from '../business/assets/processor';
import { AssetInput } from '../business/assets/types';
import { calculateOpeningBalance } from '../business/onboarding/processor';
import { OpeningBalanceInput } from '../business/onboarding/types';
import { JournalEntry } from '../types';

import { AccountResolver } from './account-resolver';
import { OhadaConfig } from '../types';
import { getTranslations } from '../i18n/translations';

export class Ohada {
  private resolver: AccountResolver;
  private config: OhadaConfig;

  constructor(config: OhadaConfig = {}) {
    this.resolver = new AccountResolver(CHART_OF_ACCOUNTS);
    // VAT is disabled by default unless specified
    this.config = {
      disableVAT: true,
      ...config
    };
  }

  /**
   * Records a purchase transaction in the SYSCOHADA journal.
   * 
   * This method follows the "Golden Rule":
   * 1. Constatation (Invoice): Acknowledges the debt to the supplier.
   * 2. Règlement (Payment): Records the payment(s) to settle the debt.
   * 
   * @example
   * ```typescript
   * ohada.recordPurchase({
   *   amount: 1000,
   *   label: "Achat de fournitures",
   *   payments: [{ method: 'cash', amount: 1000 }]
   * });
   * ```
   * 
   * @param input - The purchase details or a simple amount.
   * @returns An array of JournalEntry objects.
   */
  recordPurchase(input: PurchaseInput | number): JournalEntry[] {
    const locale = this.config.locale || 'fr';
    const t = getTranslations(locale);
    
    if (typeof input === 'number') {
      return recordPurchase({
        amount: input,
        label: t.genericPurchase
      }, locale, !!this.config.disableVAT);
    }
    return recordPurchase(input, locale, !!this.config.disableVAT);
  }

  /**
   * Records a sale transaction in the SYSCOHADA journal.
   * 
   * Handles various sale types (Goods, Manufactured, Services) and 
   * optionally inventory exits and payments.
   * 
   * @param input - Detailed sale information.
   * @returns An array of JournalEntry objects.
   */
  recordSale(input: SaleInput): JournalEntry[] {
    const locale = this.config.locale || 'fr';
    return recordSale(input, locale, !!this.config.disableVAT);
  }

  /**
   * Records an asset acquisition in the SYSCOHADA journal.
   * 
   * Handles multi-step valuation (price, installation, dismantling)
   * and separates investment debt (481) from operations.
   * 
   * @param input - Asset acquisition details.
   * @returns An array of JournalEntry objects.
   */
  recordAsset(input: AssetInput): JournalEntry[] {
    const locale = this.config.locale || 'fr';
    return recordAsset(input, locale, !!this.config.disableVAT);
  }

  /**
   * Records an expense transaction in the SYSCOHADA journal.
   * 
   * Automatically maps expense categories to the correct OHADA accounts.
   * 
   * @param input - Expense details.
   * @param vatConfig - Optional specific VAT account overrides.
   * @returns An array of JournalEntry objects.
   */
  recordExpense(input: ExpenseInput, vatConfig?: ExpenseVATConfig): JournalEntry[] {
    const locale = this.config.locale || 'fr';
    return recordExpense(
      input, 
      locale, 
      vatConfig, 
      !!this.config.disableVAT, 
      !!this.config.directExpense
    );
  }

  /**
   * Records the initial opening balance (Bilan d'Ouverture) for a new company.
   * 
   * This handles the initial "A-Nouveaux" entries, calculating the Capital
   * based on the provided Assets and Liabilities.
   * 
   * @param input - The inventory of assets, stocks, and debts.
   * @returns A single balanced JournalEntry representing the starting position.
   */
  recordOpeningBalance(input: OpeningBalanceInput): JournalEntry {
    const locale = this.config.locale || 'fr';
    return calculateOpeningBalance(input, locale);
  }

  // Methods temporarily commented out pending restructuring
  
  /*
  sale(request: SaleRequest): AccoutingResult {
    const validated = SaleRequestSchema.parse(request);
    return handleSale(validated as SaleRequest);
  }

  purchase(request: PurchaseRequest): AccoutingResult {
    const validated = PurchaseRequestSchema.parse(request);
    return handlePurchase(validated as unknown as PurchaseRequest, this.resolver);
  }

  expense(request: ExpenseRequest): AccoutingResult {
      const validated = ExpenseRequestSchema.parse(request);
      return handleExpense(validated as ExpenseRequest, this.resolver);
  }
  */
}
