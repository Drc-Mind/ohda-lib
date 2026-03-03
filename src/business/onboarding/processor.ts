import { OpeningEntryInput, FixedAssetType, StockType, ReceivableType, LiabilityType } from './types';
import { JournalEntry } from '../../types/journal';
import { getTranslations, Locale } from '../../i18n/translations';

// ────────────────────────────────────────────────────────────
// Account Maps
// ────────────────────────────────────────────────────────────

const FIXED_ASSET_ACCOUNTS: Record<FixedAssetType, string> = {
  // Intangibles
  PATENT_LICENSE: '212',
  SOFTWARE: '2183',
  INTANGIBLE_OTHER: '21',
  // Land
  LAND: '22',
  // Buildings
  COMMERCIAL_BUILDING: '2313',
  RESIDENTIAL_BUILDING: '2314',
  // Equipment
  INDUSTRIAL_EQUIPMENT: '241',
  AGRICULTURAL_EQUIPMENT: '243',
  OFFICE_EQUIPMENT: '2441',
  COMPUTER_EQUIPMENT: '2444',
  OFFICE_FURNITURE: '2445',
  // Vehicles
  PASSENGER_VEHICLE: '2451',
  UTILITY_VEHICLE: '2452',
  // Financial
  FINANCIAL_ASSET: '27',
};

const STOCK_ACCOUNTS: Record<StockType, string> = {
  MERCHANDISE: '3111',
  RAW_MATERIALS: '3211',
  FINISHED_GOODS: '3411',
  PACKAGING: '3611',
  OTHER_SUPPLIES: '3811',
};

const RECEIVABLE_ACCOUNTS: Record<ReceivableType, string> = {
  CUSTOMER: '4111',
  SUPPLIER_ADVANCE: '4091',
  TAX_CREDIT: '4717',
  OTHER_RECEIVABLE: '4721',
};

const LIABILITY_ACCOUNTS: Record<LiabilityType, string> = {
  SUPPLIER: '4011',
  BANK_LOAN: '1621',
  OPERATING_CREDIT: '1622',
  OTHER_DEBT: '4711',
};

/**
 * Records the Opening Journal Entry (A-Nouveaux) for a new or reprised
 * company following SYSCOHADA standards.
 *
 * Formula: Capital = Σ Assets − Σ Liabilities
 *   • Capital > 0 → credited to account 1011 (Capital social)
 *   • Capital < 0 → debited  to account 1311 (Report à nouveau débiteur)
 */
export function recordOpeningEntry(
    input: OpeningEntryInput,
    locale: Locale = 'fr'
): JournalEntry {
    const t = getTranslations(locale);
    const {
        date = new Date(),
        fixedAssets = [],
        stocks = [],
        receivables = [],
        bank,
        cash,
        mobileMoney,
        liabilities = [],
    } = input;

    const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;
    const lines: JournalEntry['lines'] = [];
    let totalAssets = 0;
    let totalLiabilities = 0;

    // ── DEBIT SIDE ────────────────────────────────────────────

    // Fixed assets (Class 2)
    fixedAssets.forEach(asset => {
        lines.push({
            account: FIXED_ASSET_ACCOUNTS[asset.type],
            label: asset.label,
            debit: round(asset.amount),
            credit: 0,
        });
        totalAssets += asset.amount;
    });

    // Stocks (Class 3)
    stocks.forEach(stock => {
        lines.push({
            account: STOCK_ACCOUNTS[stock.type],
            label: stock.label,
            debit: round(stock.amount),
            credit: 0,
        });
        totalAssets += stock.amount;
    });

    // Receivables (Class 4)
    receivables.forEach(rec => {
        lines.push({
            account: RECEIVABLE_ACCOUNTS[rec.type],
            label: rec.label,
            debit: round(rec.amount),
            credit: 0,
        });
        totalAssets += rec.amount;
    });

    // Bank — 5211
    if (bank && bank > 0) {
        lines.push({ account: '5211', label: 'Banque', debit: round(bank), credit: 0 });
        totalAssets += bank;
    }

    // Cash — 5711
    if (cash && cash > 0) {
        lines.push({ account: '5711', label: 'Caisse', debit: round(cash), credit: 0 });
        totalAssets += cash;
    }

    // Mobile money — 5141
    if (mobileMoney && mobileMoney > 0) {
        lines.push({ account: '5141', label: 'Mobile Money', debit: round(mobileMoney), credit: 0 });
        totalAssets += mobileMoney;
    }

    // ── CREDIT SIDE ───────────────────────────────────────────

    liabilities.forEach(liability => {
        lines.push({
            account: LIABILITY_ACCOUNTS[liability.type],
            label: liability.label,
            debit: 0,
            credit: round(liability.amount),
        });
        totalLiabilities += liability.amount;
    });

    // ── EQUITY (balancing figure) ─────────────────────────────
    const netEquity = round(totalAssets - totalLiabilities);

    if (netEquity > 0) {
        lines.push({
            account: '1011',
            label: 'Capital social (Reports à nouveau)',
            debit: 0,
            credit: netEquity,
        });
    } else if (netEquity < 0) {
        lines.push({
            account: '1311',
            label: "Report à nouveau débiteur (Insuffisance d'actif)",
            debit: Math.abs(netEquity),
            credit: 0,
        });
    }

    const totalDebit = round(lines.reduce((s, l) => s + l.debit, 0));
    const totalCredit = round(lines.reduce((s, l) => s + l.credit, 0));

    return {
        date,
        type: t.openingBalance as any,
        lines,
        totals: { debit: totalDebit, credit: totalCredit },
        isBalanced: true,
    };
}
