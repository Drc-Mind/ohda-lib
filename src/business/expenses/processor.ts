import { ExpenseInput, ExpenseVATConfig } from './types';
import { JournalEntry } from '../../types';
import { getTranslations, Locale } from '../../i18n/translations';
import { EXPENSE_ACCOUNTS, COMMON_ACCOUNTS, isServiceExpense } from './constants';

/**
 * Records an expense transaction following SYSCOHADA standards.
 * 
 * Returns an array of Journal Entries:
 * 1. **CONSTATATION (Invoice)**: Maps the expense category to the correct OHADA account
 *    and records the liability to the supplier.
 * 2. **REGLEMENT (Payment)**: Records immediate payment if provided.
 * 
 * All expenses MUST go through Account 4011 (Fournisseurs) to enable proper 
 * Cash Flow Statement generation in the ODS (Tableau des Flux de Trésorerie).
 * 
 * @example
 * ```typescript
 * const entries = recordExpense({
 *   category: 'WATER',
 *   amount: 15000,
 *   label: "Facture d'eau Janvier",
 *   payment: { method: 'cash', amount: 15000 }
 * });
 * ```
 * 
 * @param input - The expense details.
 * @param locale - Language for labels ('fr' | 'en').
 * @param vatConfig - Optional VAT configuration (global settings).
 * @param disableVAT - If true, VAT lines will not be generated.
 * @param directMode - If true, records directly to cash/bank without 4011.
 * @returns An array of balanced Journal entries.
 */
export function recordExpense(
  input: ExpenseInput, 
  locale: Locale = 'fr',
  vatConfig?: ExpenseVATConfig,
  disableVAT: boolean = true,
  directMode: boolean = false
): JournalEntry[] {
    const t = getTranslations(locale);
    
    const {
        category,
        amount,
        label,
        date = new Date(),
        vatAmount: manualVAT,
        vatRate,
        payments = []
    } = input;

    const entries: JournalEntry[] = [];
    const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

    // Get expense account based on category
    const expenseAccount = EXPENSE_ACCOUNTS[category];
    
    // Determine VAT handling
    let vatAmount = 0;
    let vatAccount = '';
    
    // Check if VAT should be applied (Global disable flag OR local config)
    const vatEnabled = !disableVAT && vatConfig?.vatOnExpenses !== false;
    
    if (vatEnabled) {
        // Priority 1: Manual VAT amount
        if (manualVAT !== undefined) {
            vatAmount = round(manualVAT);
        }
        // Priority 2: Calculate from vatRate
        else if (vatRate !== undefined && vatRate > 0) {
            vatAmount = round(amount * (vatRate / 100));
        }
        // Priority 3: Use global default VAT rate
        else if (vatConfig?.defaultVATRate !== undefined && vatConfig.defaultVATRate > 0) {
            vatAmount = round(amount * (vatConfig.defaultVATRate / 100));
        }
        
        // Determine VAT account (service vs goods)
        if (vatAmount > 0) {
            const isService = isServiceExpense(category);
            vatAccount = isService 
                ? (vatConfig?.serviceVATAccount || COMMON_ACCOUNTS.VAT_SERVICES)
                : (vatConfig?.goodsVATAccount || COMMON_ACCOUNTS.VAT_GOODS);
        }
    }

    // Calculate total TTC
    const totalTtc = round(amount + vatAmount);

    // --- ENTRY 1: MAIN ENTRY ---
    const mainLines: JournalEntry['lines'] = [];

    // 1. Debit Expense Account
    mainLines.push({
        account: expenseAccount,
        label: `${label}`,
        debit: round(amount),
        credit: 0
    });

    // 2. Debit VAT Recoverable (if applicable)
    if (vatAmount > 0) {
        mainLines.push({
            account: vatAccount,
            label: `${t.vatRecoverable} - ${label}`,
            debit: vatAmount,
            credit: 0
        });
    }

    // 3. Credit Side: Supplier or Cash/Bank
    if (directMode) {
        // In Direct Mode: Credit Cash/Bank directly
        const paymentMethod = (payments && payments.length > 0) ? payments[0].method : 'cash';
        const monetaryAccount = (paymentMethod === 'bank') ? COMMON_ACCOUNTS.BANK : COMMON_ACCOUNTS.CASH;
        mainLines.push({
            account: monetaryAccount,
            label: `${label} (${paymentMethod})`,
            debit: 0,
            credit: totalTtc
        });
    } else {
        // Standard Mode: Credit Supplier (4011)
        mainLines.push({
            account: COMMON_ACCOUNTS.SUPPLIER,
            label: `${t.supplier} - ${label}`,
            debit: 0,
            credit: totalTtc
        });
    }

    entries.push({
        date,
        type: directMode ? t.reglement as any : t.constatation as any,
        lines: mainLines,
        totals: {
            debit: round(mainLines.reduce((sum, l) => sum + l.debit, 0)),
            credit: round(mainLines.reduce((sum, l) => sum + l.credit, 0))
        },
        isBalanced: true
    });

    // --- ENTRY 2: PAYMENTS (only if NOT in directMode and payments are provided) ---
    payments.forEach(pay => {
        if (pay.amount <= 0) return;

        const paymentLines: JournalEntry['lines'] = [];
        
        // Debit Supplier (Reduce debt)
        paymentLines.push({
            account: COMMON_ACCOUNTS.SUPPLIER,
            label: `${t.supplier} - ${t.payment} - ${label}`,
            debit: round(pay.amount),
            credit: 0
        });

        // Credit Cash/Bank
        const monetaryAccount = pay.method === 'cash' ? COMMON_ACCOUNTS.CASH : COMMON_ACCOUNTS.BANK;
        paymentLines.push({
            account: monetaryAccount,
            label: `${t.payment} (${pay.method}) - ${label}`,
            debit: 0,
            credit: round(pay.amount)
        });

        entries.push({
            date,
            type: t.reglement as any,
            lines: paymentLines,
            totals: {
                debit: round(pay.amount),
                credit: round(pay.amount)
            },
            isBalanced: true
        });
    });
    return entries;
}
