import { OpeningBalanceInput } from './types';
import { JournalEntry } from '../../types/journal';
import { getTranslations, Locale } from '../../i18n/translations';

/**
 * Calculates and records the Opening Balance (Bilan d'Ouverture).
 * 
 * Formula: Capital = Total Assets (Actif) - Total Debts (Passif Externe)
 */
export function calculateOpeningBalance(
    input: OpeningBalanceInput,
    locale: Locale = 'fr'
): JournalEntry {
    const t = getTranslations(locale);
    const {
        date = new Date(),
        fixedAssets,
        stocks,
        receivables,
        liquidities,
        payables
    } = input;

    const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

    const lines: JournalEntry['lines'] = [];

    // 1. Assets (Actif - DEBIT)
    let totalAssets = 0;

    // Fixed Assets (2x)
    fixedAssets.forEach(asset => {
        lines.push({
            account: asset.account || '2411', // Default to Material
            label: asset.name,
            debit: round(asset.amount),
            credit: 0
        });
        totalAssets += asset.amount;
    });

    // Stocks (3x)
    stocks.forEach(stock => {
        lines.push({
            account: stock.account || '3111', // Default to Merchandise
            label: stock.name,
            debit: round(stock.amount),
            credit: 0
        });
        totalAssets += stock.amount;
    });

    // Receivables (411)
    receivables.forEach(rec => {
        lines.push({
            account: '4111',
            label: `${t.client} - ${rec.name}`,
            debit: round(rec.amount),
            credit: 0
        });
        totalAssets += rec.amount;
    });

    // Cash/Bank (5x)
    if (liquidities.bank && liquidities.bank > 0) {
        lines.push({
            account: '5211',
            label: 'Banque',
            debit: round(liquidities.bank),
            credit: 0
        });
        totalAssets += liquidities.bank;
    }
    if (liquidities.cash && liquidities.cash > 0) {
        lines.push({
            account: '5711',
            label: 'Caisse',
            debit: round(liquidities.cash),
            credit: 0
        });
        totalAssets += liquidities.cash;
    }

    // 2. Liabilities (Passif - CREDIT)
    let totalLiabilities = 0;
    payables.forEach(debt => {
        lines.push({
            account: debt.account || '4011',
            label: `${t.supplier} - ${debt.name}`,
            debit: 0,
            credit: round(debt.amount)
        });
        totalLiabilities += debt.amount;
    });

    // 3. Equity (Capital - Balancing figure - Usually CREDIT)
    const netEquity = round(totalAssets - totalLiabilities);
    
    // If Net Equity > 0 (Standard), Credit Account 101
    // If Net Equity < 0 (Deficit), Debit Account 131 (Report à Nouveau Débiteur)
    if (netEquity >= 0) {
        lines.push({
            account: '1011', // Capital Social
            label: 'Capital Social (Calculé)',
            debit: 0,
            credit: netEquity
        });
    } else {
        lines.push({
            account: '1311', // Résultat net (Perte) or Report à Nouveau Débiteur
            label: 'Report à nouveau débiteur (Insuffisance d\'actif)',
            debit: Math.abs(netEquity),
            credit: 0
        });
    }

    return {
        date,
        type: t.openingBalance as any,
        lines,
        totals: {
            debit: round(lines.reduce((sum, l) => sum + l.debit, 0)),
            credit: round(lines.reduce((sum, l) => sum + l.credit, 0))
        },
        isBalanced: true
    };
}
