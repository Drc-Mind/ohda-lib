import { SaleInput } from './types';
import { JournalEntry } from '../../types';
import { getTranslations, Locale } from '../../i18n/translations';
import { SALE_ACCOUNTS } from './constants';

/**
 * Records a sale transaction following SYSCOHADA standards.
 * 
 * Returns an array of Journal Entries:
 * 1. **CONSTATATION (Invoice)**: Sales revenue, VAT, packaging, and transport.
 * 2. **STOCK_EXIT (Inventory)**: Records the cost of goods sold (if provided).
 * 3. **REGLEMENT (Payment)**: Records immediate payment received (if provided).
 * 
 * @example
 * ```typescript
 * const entries = recordSale({
 *   amount: 100000,
 *   label: "Vente de marchandises",
 *   saleType: 'GOODS',
 *   payment: { method: 'bank', amount: 100000 }
 * });
 * ```
 * 
 * @param input - The sale data.
 * @param locale - Language for labels ('fr' | 'en').
 * @param disableVAT - If true, VAT lines (Account 4431) will not be generated.
 * @returns An array of balanced Journal entries.
 */
export function recordSale(
    input: SaleInput, 
    locale: Locale = 'fr', 
    disableVAT: boolean = true
): JournalEntry[] {
    const t = getTranslations(locale);
    
    const {
        amount,
        label,
        saleType,
        date = new Date(),
        vatRate = 18,
        financialDiscount,
        packagingDeposit,
        transportCharge,
        inventoryExit,
        payments = []
    } = input;

    const entries: JournalEntry[] = [];
    const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

    // Determine revenue account based on sale type
    const revenueAccount = saleType === 'GOODS' ? SALE_ACCOUNTS.GOODS :
                          saleType === 'MANUFACTURED' ? SALE_ACCOUNTS.MANUFACTURED :
                          SALE_ACCOUNTS.SERVICES;
    
    const revenueLabel = saleType === 'GOODS' ? t.saleOfGoods :
                        saleType === 'MANUFACTURED' ? t.saleOfManufactured :
                        t.saleOfServices;

    // --- ENTRY 1: INVOICE ---
    const invoiceLines: JournalEntry['lines'] = [];
    
    // Calculate taxable base (amount + transport, but NOT packaging deposit)
    const transportAmount = transportCharge?.amount || 0;
    const taxableBase = amount + transportAmount;
    const vatAmount = !disableVAT ? round(taxableBase * (vatRate / 100)) : 0;
    
    // Calculate financial discount if applicable
    const discountAmount = financialDiscount ? round(amount * (financialDiscount.percentage / 100)) : 0;
    
    // Calculate total client receivable
    const packagingAmount = packagingDeposit?.amount || 0;
    const totalTtc = round(taxableBase + vatAmount + packagingAmount - discountAmount);

    // 1. Debit Client (Total receivable)
    invoiceLines.push({
        account: SALE_ACCOUNTS.CLIENT,
        label: `${t.client} - ${label}`,
        debit: totalTtc,
        credit: 0
    });

    // 2. Debit Financial Discount (if applicable) - This is an EXPENSE
    if (discountAmount > 0) {
        invoiceLines.push({
            account: SALE_ACCOUNTS.FINANCIAL_DISCOUNT,
            label: `${t.financialDiscount} - ${label}`,
            debit: discountAmount,
            credit: 0
        });
    }

    // 3. Credit Revenue (Main sale)
    invoiceLines.push({
        account: revenueAccount,
        label: `${revenueLabel} - ${label}`,
        debit: 0,
        credit: round(amount)
    });

    // 4. Credit Transport Revenue (if applicable)
    if (transportAmount > 0) {
        invoiceLines.push({
            account: SALE_ACCOUNTS.TRANSPORT,
            label: `${t.transportCharged} - ${label}`,
            debit: 0,
            credit: round(transportAmount)
        });
    }

    // 5. Credit VAT Collected
    if (vatAmount > 0) {
        invoiceLines.push({
            account: SALE_ACCOUNTS.VAT_COLLECTED,
            label: `${t.vatCollected} - ${label}`,
            debit: 0,
            credit: vatAmount
        });
    }

    // 6. Credit Packaging Deposit (Liability - NO VAT)
    if (packagingAmount > 0) {
        invoiceLines.push({
            account: SALE_ACCOUNTS.PACKAGING_DEPOSIT,
            label: `${t.packagingDeposit} - ${label}`,
            debit: 0,
            credit: round(packagingAmount)
        });
    }

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

    // --- ENTRY 2: INVENTORY EXIT (CMUP) ---
    if (inventoryExit) {
        const stockLines: JournalEntry['lines'] = [];
        
        stockLines.push({
            account: SALE_ACCOUNTS.COST_OF_SALES,
            label: `${t.costOfSales} - ${label}`,
            debit: round(inventoryExit.costPrice),
            credit: 0
        });

        stockLines.push({
            account: SALE_ACCOUNTS.STOCK,
            label: `${t.stockExit} - ${label}`,
            debit: 0,
            credit: round(inventoryExit.costPrice)
        });

        entries.push({
            date,
            type: t.stockExit as any,
            lines: stockLines,
            totals: {
                debit: round(inventoryExit.costPrice),
                credit: round(inventoryExit.costPrice)
            },
            isBalanced: true
        });
    }

    // --- ENTRIES 3+: PAYMENTS (if immediate payments) ---
    payments.forEach(pay => {
        if (pay.amount <= 0) return;

        const paymentLines: JournalEntry['lines'] = [];

        // Debit Cash/Bank
        const monetaryAccount = pay.method === 'cash' ? '5711' : '5211';
        paymentLines.push({
            account: monetaryAccount,
            label: `${t.cashIn} (${pay.method}) - ${label}`,
            debit: round(pay.amount),
            credit: 0
        });

        // Credit Client (Reduce receivable)
        paymentLines.push({
            account: SALE_ACCOUNTS.CLIENT,
            label: `${t.paymentReceived} (${pay.method}) - ${label}`,
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
