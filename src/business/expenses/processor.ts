import { ExpenseInput, ExpenseVATConfig } from './types';
import { JournalEntry } from '../../types';
import { getTranslations, Locale } from '../../i18n/translations';
import { EXPENSE_ACCOUNTS, COMMON_ACCOUNTS, isServiceExpense } from './constants';

/**
 * Record an expense transaction following SYSCOHADA standards.
 * Returns an array of Journal Entries:
 * 1. The Invoice Entry (expense + VAT → supplier)
 * 2. Payment Entry (if payment provided)
 * 
 * SYSCOHADA Rule: All expenses MUST go through Account 4011 (Fournisseurs)
 * to enable proper Cash Flow Statement generation.
 */
export function recordExpense(
  input: ExpenseInput, 
  locale: Locale = 'fr',
  vatConfig?: ExpenseVATConfig
): JournalEntry[] {
    const t = getTranslations(locale);
    
    const {
        category,
        amount,
        label,
        date = new Date(),
        vatAmount: manualVAT,
        vatRate,
        payment
    } = input;

    const entries: JournalEntry[] = [];
    const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

    // Get expense account based on category
    const expenseAccount = EXPENSE_ACCOUNTS[category];
    
    // Determine VAT handling
    let vatAmount = 0;
    let vatAccount = '';
    
    // Check if VAT should be applied
    const vatEnabled = vatConfig?.vatOnExpenses !== false; // Default: enabled
    
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

    // Calculate total payable to supplier
    const totalTtc = round(amount + vatAmount);

    // --- ENTRY 1: INVOICE ---
    const invoiceLines: JournalEntry['lines'] = [];

    // 1. Debit Expense Account
    invoiceLines.push({
        account: expenseAccount,
        label: `${label}`,
        debit: round(amount),
        credit: 0
    });

    // 2. Debit VAT Recoverable (if applicable)
    if (vatAmount > 0) {
        invoiceLines.push({
            account: vatAccount,
            label: `${t.vatRecoverable} - ${label}`,
            debit: vatAmount,
            credit: 0
        });
    }

    // 3. Credit Supplier (Total TTC)
    invoiceLines.push({
        account: COMMON_ACCOUNTS.SUPPLIER,
        label: `${t.supplier} - ${label}`,
        debit: 0,
        credit: totalTtc
    });

    entries.push({
        date,
        lines: invoiceLines,
        totals: {
            debit: round(invoiceLines.reduce((sum, l) => sum + l.debit, 0)),
            credit: round(invoiceLines.reduce((sum, l) => sum + l.credit, 0))
        },
        isBalanced: true
    });

    // --- ENTRY 2: PAYMENT (if immediate payment) ---
    if (payment && payment.amount > 0) {
        const paymentLines: JournalEntry['lines'] = [];
        
        // Debit Supplier (Reduce debt)
        paymentLines.push({
            account: COMMON_ACCOUNTS.SUPPLIER,
            label: `${t.supplier} - ${t.payment} - ${label}`,
            debit: round(payment.amount),
            credit: 0
        });

        // Credit Cash/Bank
        const monetaryAccount = payment.method === 'cash' ? COMMON_ACCOUNTS.CASH : COMMON_ACCOUNTS.BANK;
        paymentLines.push({
            account: monetaryAccount,
            label: `${t.payment} (${payment.method}) - ${label}`,
            debit: 0,
            credit: round(payment.amount)
        });

        entries.push({
            date,
            lines: paymentLines,
            totals: {
                debit: round(payment.amount),
                credit: round(payment.amount)
            },
            isBalanced: true
        });
    }

    return entries;
}
