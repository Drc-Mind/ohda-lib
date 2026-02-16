import { SaleInput } from './types';
import { JournalEntry } from '../../types';
import { getTranslations, Locale } from '../../i18n/translations';
import { SALE_ACCOUNTS } from './constants';

/**
 * Record a sale transaction following SYSCOHADA standards.
 * Returns an array of Journal Entries:
 * 1. The Invoice Entry (with revenue, VAT, packaging, transport, financial discount)
 * 2. Inventory Exit Entry (if inventoryExit provided)
 * 3. Payment Entry (if payment provided)
 */
export function recordSale(input: SaleInput, locale: Locale = 'fr'): JournalEntry[] {
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
        payment
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
    const vatAmount = round(taxableBase * (vatRate / 100));
    
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
            lines: stockLines,
            totals: {
                debit: round(inventoryExit.costPrice),
                credit: round(inventoryExit.costPrice)
            },
            isBalanced: true
        });
    }

    // --- ENTRY 3: PAYMENT (if immediate payment) ---
    if (payment && payment.amount > 0) {
        const paymentLines: JournalEntry['lines'] = [];
        
        // Debit Cash/Bank
        const monetaryAccount = payment.method === 'cash' ? '5711' : '5211';
        paymentLines.push({
            account: monetaryAccount,
            label: `${t.cashIn} (${payment.method}) - ${label}`,
            debit: round(payment.amount),
            credit: 0
        });

        // Credit Client (Reduce receivable)
        paymentLines.push({
            account: SALE_ACCOUNTS.CLIENT,
            label: `${t.paymentReceived} (${payment.method}) - ${label}`,
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
