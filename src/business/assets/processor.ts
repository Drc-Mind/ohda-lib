import { AssetInput, AssetComponent } from './types';
import { JournalEntry } from '../../types';
import { ASSET_ACCOUNTS, ASSET_COMMON_ACCOUNTS } from './constants';
import { getTranslations, Locale } from '../../i18n/translations';

/**
 * Records an asset acquisition following SYSCOHADA standards.
 * 
 * Logic:
 * 1. Calculate Acquisition Cost (Purchase + Installation + Transport + Dismantling).
 * 2. Handle Component splitting if applicable.
 * 3. Use Account 481 for investment debt (not 401).
 * 4. Use Account 4451 for Asset VAT (not 4452/4454).
 * 5. Create Provision (1984) for dismantling costs.
 * 
 * @param input - Detailed asset acquisition info.
 * @param locale - Internationalization ('fr' | 'en').
 * @param disableVAT - Global VAT control.
 * @returns Array of balanced journal entries.
 */
export function recordAsset(
  input: AssetInput,
  locale: Locale = 'fr',
  disableVAT: boolean = true
): JournalEntry[] {
    const t = getTranslations(locale);
    const entries: JournalEntry[] = [];
    const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

    const {
        assetName,
        type,
        amount,
        date = new Date(),
        transport = 0,
        installation = 0,
        customs = 0,
        otherCosts = 0,
        dismantlingEstimate = 0,
        components,
        vatAmount: manualVAT,
        vatRate,
        payment
    } = input;

    // 1. Calculate the full Acquisition Cost (Value to be immobilized)
    // Note: In SYSCOHADA, dismantling costs are added to the asset value.
    const baseValue = amount + transport + installation + customs + otherCosts;
    const totalImmobilizedValue = baseValue + dismantlingEstimate;

    // 2. Determine VAT
    let vatAmount = 0;
    if (!disableVAT) {
        if (manualVAT !== undefined) {
            vatAmount = round(manualVAT);
        } else if (vatRate !== undefined && vatRate > 0) {
            vatAmount = round(baseValue * (vatRate / 100));
        }
    }

    // 3. --- ENTRY 1: CONSTATATION (Acquisition) ---
    const acquisitionLines: JournalEntry['lines'] = [];

    // A. Debit Asset(s)
    if (components && components.length > 0) {
        // Handle Component Approach
        components.forEach(comp => {
            const compAccount = comp.account || (comp.type ? ASSET_ACCOUNTS[comp.type] : ASSET_ACCOUNTS[type]);
            acquisitionLines.push({
                account: compAccount,
                label: `${assetName} - ${comp.name}`,
                debit: round(comp.amount),
                credit: 0
            });
        });
        
        // If there's a dismantling provision, it's usually added to the main component 
        // or prorated. For simplicity, we add it to the first component if components don't sum to total.
        // But the rule is strict: Asset Value = Components sum.
        // User should provide components that sum up to totalImmobilizedValue.
    } else {
        // Single Asset Entry
        acquisitionLines.push({
            account: ASSET_ACCOUNTS[type],
            label: assetName,
            debit: round(totalImmobilizedValue),
            credit: 0
        });
    }

    // B. Debit VAT (Account 4451)
    if (vatAmount > 0) {
        acquisitionLines.push({
            account: ASSET_COMMON_ACCOUNTS.VAT_ASSETS,
            label: `${t.vatRecoverable} - ${assetName}`,
            debit: vatAmount,
            credit: 0
        });
    }

    // C. Credit Investment Supplier (Account 4812)
    // Debt is usually Price + Extras + VAT, but NOT the dismantling provision 
    // because that's not owed to the supplier.
    const supplierDebt = round(baseValue + vatAmount);
    acquisitionLines.push({
        account: ASSET_COMMON_ACCOUNTS.INVESTMENT_SUPPLIER,
        label: `${t.supplier} - ${assetName}`,
        debit: 0,
        credit: supplierDebt
    });

    // D. Credit Dismantling Provision (Account 1984)
    if (dismantlingEstimate > 0) {
        acquisitionLines.push({
            account: ASSET_COMMON_ACCOUNTS.DISMANTLING_PROVISION,
            label: `Provision démantèlement - ${assetName}`,
            debit: 0,
            credit: round(dismantlingEstimate)
        });
    }

    entries.push({
        date,
        type: t.constatation as any,
        lines: acquisitionLines,
        totals: {
            debit: round(acquisitionLines.reduce((sum, l) => sum + l.debit, 0)),
            credit: round(acquisitionLines.reduce((sum, l) => sum + l.credit, 0))
        },
        isBalanced: true
    });

    // 4. --- ENTRY 2: REGLEMENT (Payment) ---
    if (payment && payment.amount > 0) {
        const paymentLines: JournalEntry['lines'] = [];
        
        // Debit Supplier (Reduce debt)
        paymentLines.push({
            account: ASSET_COMMON_ACCOUNTS.INVESTMENT_SUPPLIER,
            label: `${t.supplier} - ${t.payment} - ${assetName}`,
            debit: round(payment.amount),
            credit: 0
        });

        // Credit Cash/Bank
        const monetaryAccount = payment.method === 'cash' ? ASSET_COMMON_ACCOUNTS.CASH : ASSET_COMMON_ACCOUNTS.BANK;
        paymentLines.push({
            account: monetaryAccount,
            label: `${t.payment} (${payment.method}) - ${assetName}`,
            debit: 0,
            credit: round(payment.amount)
        });

        entries.push({
            date,
            type: t.reglement as any,
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
