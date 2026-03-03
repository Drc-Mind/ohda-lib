import { PurchaseInput } from './types';
import { JournalEntry } from '../../types';
import { getTranslations, Locale } from '../../i18n/translations';
import { PURCHASE_ACCOUNTS } from './constants';


/**
 * Records a purchase transaction following the SYSCOHADA "Golden Rule".
 * 
 * Returns an array of Journal Entries: 
 * 1. **CONSTATATION (Invoice)**: Records the debt to the supplier, the base expense, 
 *    and optional charges/VAT.
 * 2. **REGLEMENT (Payment)**: Records separate payment entries for each payment 
 *    method provided (Cash/Bank).
 * 3. **VARIATION DE STOCK**: Records the stock increase (Debit 31, Credit 6031) 
 *    for the cost of goods acquired (amount + charges).
 * 
 * @example
 * ```typescript
 * const entries = recordPurchase({
 *   amount: 50000,
 *   label: "Bureau Table",
 *   payments: [{ method: 'cash', amount: 50000 }]
 * });
 * ```
 * 
 * @param input - The purchase data (amount, label, charges, payments, stockEntry).
 * @param locale - Language for labels ('fr' | 'en').
 * @param disableVAT - If true, VAT lines (Account 4452) will not be generated.
 * @throws {Error} If total payment amount exceeds the total invoice amount due (TTC).
 * @returns An array of balanced Journal entries.
 */
export function recordPurchase(
    input: PurchaseInput, 
    locale: Locale = 'fr', 
    disableVAT: boolean = true
): JournalEntry[] {
    const t = getTranslations(locale);

    const {
        amount,
        label,
        date = new Date(),
        vatRate = 18,
        charges = [],
        payments = [],
        reduction,
        stockEntry
    } = input;

    const entries: JournalEntry[] = [];
    const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

    // --- ENTRY 1: CONSTATATION (INVOICE) ---
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

    // 3. Debit VAT (Optional)
    const baseForVat = amount + totalCharges;
    const vatAmount = !disableVAT ? round(baseForVat * (vatRate / 100)) : 0;
    
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
        type: t.constatation as any,
        lines: invoiceLines,
        totals: {
            debit: round(invoiceLines.reduce((sum, l) => sum + l.debit, 0)),
            credit: round(invoiceLines.reduce((sum, l) => sum + l.credit, 0))
        },
        isBalanced: true
    });

    // --- ENTRY 2: REDUCTION (RRR obtenus) ---
    let reductionTtc = 0;
    if (reduction && reduction > 0) {
        const reductionLines: JournalEntry['lines'] = [];
        const reductionVat = !disableVAT ? round(reduction * (vatRate / 100)) : 0;
        reductionTtc = round(reduction + reductionVat);

        // Debit Supplier (reduce debt)
        reductionLines.push({
            account: '4011',
            label: `${t.operatingSupplier} - RRR - ${label}`,
            debit: reductionTtc,
            credit: 0
        });

        // Credit RRR obtenus
        reductionLines.push({
            account: PURCHASE_ACCOUNTS.REDUCTION,
            label: `RRR obtenus - ${label}`,
            debit: 0,
            credit: round(reduction)
        });

        // Credit VAT collected (avoir) if VAT is enabled
        if (reductionVat > 0) {
            reductionLines.push({
                account: PURCHASE_ACCOUNTS.VAT_COLLECTED,
                label: `TVA sur avoir - ${label}`,
                debit: 0,
                credit: reductionVat
            });
        }

        entries.push({
            date,
            type: t.reduction as any,
            lines: reductionLines,
            totals: {
                debit: reductionTtc,
                credit: reductionTtc
            },
            isBalanced: true
        });
    }

    // --- OVERPAYMENT VALIDATION ---
    const netTtc = round(totalTtc - reductionTtc);
    const totalPaid = round(payments.reduce((sum, p) => sum + p.amount, 0));
    if (totalPaid > netTtc) {
        throw new Error(
            `Total payments (${totalPaid}) exceed the total amount due (${netTtc}). Overpayment is not allowed.`
        );
    }

    // --- ENTRIES 3+: REGLEMENTS (PAYMENTS) ---
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
            type: t.reglement as any,
            lines: paymentLines,
            totals: {
                debit: round(pay.amount),
                credit: round(pay.amount)
            },
            isBalanced: true
        });
    });

    // --- ENTRY 3: VARIATION DE STOCK (Debit 31, Credit 6031) ---
    const stockAccount = stockEntry?.stockAccount || PURCHASE_ACCOUNTS.STOCK_ACCOUNT;
    const stockVariationAmount = round(amount + totalCharges);

    const stockLines: JournalEntry['lines'] = [];

    stockLines.push({
        account: stockAccount,
        label: `${t.stock || 'Stock'} - ${label}`,
        debit: stockVariationAmount,
        credit: 0
    });

    stockLines.push({
        account: PURCHASE_ACCOUNTS.STOCK_VARIATION,
        label: `${t.costOfSales || 'Variation de stock'} - ${label}`,
        debit: 0,
        credit: stockVariationAmount
    });

    entries.push({
        date,
        type: t.variationStock as any,
        lines: stockLines,
        totals: {
            debit: stockVariationAmount,
            credit: stockVariationAmount
        },
        isBalanced: true
    });

    return entries;
}
