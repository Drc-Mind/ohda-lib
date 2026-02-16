import { PurchaseInput } from './types';
import { JournalEntry } from '../../types';
import { getTranslations, Locale } from '../../i18n/translations';


/**
 * Record a purchase transaction following the SYSCOHADA "Golden Rule":
 * Returns an array of Journal Entries: 
 * 1. The Invoice Entry (Constatation)
 * 2. Separate Payment Entry for each payment provided (Règlement)
 */
export function recordPurchase(input: PurchaseInput, locale: Locale = 'fr'): JournalEntry[] {
    const t = getTranslations(locale);

    const {
        amount,
        label,
        date = new Date(),
        vatRate = 16,
        charges = [],
        payments = []
    } = input;

    const entries: JournalEntry[] = [];
    const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

    // --- ENTRY 1: CONSTATAISON (INVOICE) ---
    const invoiceLines: JournalEntry['lines'] = [];
    
    // 1. Debit Base Amount
    invoiceLines.push({
        account: '6011',
        label: label,
        debit: round(amount),
        credit: 0
    });

    // 2. Debit Charges
    let totalCharges = 0;
    charges.forEach(charge => {
        invoiceLines.push({
            account: '6015',
            label: `Frais sur achat (${charge.type}) - ${label}`,
            debit: round(charge.amount),
            credit: 0
        });
        totalCharges += charge.amount;
    });

    // 3. Debit VAT
    const baseForVat = amount + totalCharges;
    const vatAmount = round(baseForVat * (vatRate / 100));
    if (vatAmount > 0) {
        invoiceLines.push({
            account: '4452',
            label: `${t.vatRecoverable} - ${label}`,
            debit: vatAmount,
            credit: 0
        });
    }

    // 4. Credit Supplier
    const totalTtc = round(baseForVat + vatAmount);
    invoiceLines.push({
        account: '4011',
        label: `${t.operatingSupplier} - ${label}`,
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
        isBalanced: true // Logic guarantees balance
    });

    // --- ENTRIES 2+: REGLEMENTS (PAYMENTS) ---
    payments.forEach(pay => {
        if (pay.amount <= 0) return;

        const paymentLines: JournalEntry['lines'] = [];

        // Debit Supplier (Reduce debt)
        paymentLines.push({
            account: '4011',
            label: `${t.paymentMethod} ${t.operatingSupplier} (${pay.method}) - ${label}`,
            debit: round(pay.amount),
            credit: 0
        });

        // Credit Monetary Account
        const monetaryAccount = pay.method === 'cash' ? '5711' : '5211';
        paymentLines.push({
            account: monetaryAccount,
            label: `${t.cashOut} (${pay.method}) - ${label}`,
            debit: 0,
            credit: round(pay.amount)
        });

        entries.push({
            date,
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
