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
import { JournalEntry } from '../types';

import { AccountResolver } from './account-resolver';
import { OhadaConfig } from '../types';
import { getTranslations } from '../i18n/translations';

export class Ohada {
  private resolver: AccountResolver;
  private config: OhadaConfig;

  constructor(config: OhadaConfig = {}) {
    this.resolver = new AccountResolver(CHART_OF_ACCOUNTS);
    this.config = config;
  }

  /**
   * Record a purchase transaction.
   */
  recordPurchase(input: PurchaseInput | number): JournalEntry[] {
    const locale = this.config.locale || 'fr';
    const t = getTranslations(locale);
    
    if (typeof input === 'number') {
      return recordPurchase({
        amount: input,
        label: t.genericPurchase
      }, locale);
    }
    return recordPurchase(input, locale);
  }

  /**
   * Record a sale transaction.
   */
  recordSale(input: SaleInput): JournalEntry[] {
    const locale = this.config.locale || 'fr';
    return recordSale(input, locale);
  }

  /**
   * Record an expense transaction.
   * @param input - Expense input data
   * @param vatConfig - Optional VAT configuration (global settings)
   */
  recordExpense(input: ExpenseInput, vatConfig?: ExpenseVATConfig): JournalEntry[] {
    const locale = this.config.locale || 'fr';
    return recordExpense(input, locale, vatConfig);
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
