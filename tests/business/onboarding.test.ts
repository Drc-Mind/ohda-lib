import { describe, it, expect } from 'vitest';
import { Ohada } from '../../src/core/ohada';
import { OpeningEntryInput } from '../../src/business/onboarding/types';

describe('Opening Entry (Journal d\'Ouverture)', () => {
    const ohada = new Ohada();

    // ─────────────────────────────────────────────────────────
    // Core: capital calculation
    // ─────────────────────────────────────────────────────────

    it('should calculate positive capital as balancing credit to 1011', () => {
        const input: OpeningEntryInput = {
            fixedAssets: [
                { label: "Camion Isuzu",   type: 'UTILITY_VEHICLE',   amount: 1500000 },
                { label: "Mobilier bureau", type: 'OFFICE_FURNITURE',  amount: 2000000 },
            ],
            stocks: [
                { label: "Stock marchandises", type: 'MERCHANDISE', amount: 300000 },
            ],
            cash: 500000,
            liabilities: [
                { label: "Fournisseur ACME", type: 'SUPPLIER', amount: 1500000 },
            ],
        };

        const entry = ohada.recordOpeningEntry(input);

        // Assets = 1 500 000 + 2 000 000 + 300 000 + 500 000 = 4 300 000
        // Liabilities = 1 500 000
        // Capital = 4 300 000 - 1 500 000 = 2 800 000

        expect(entry.isBalanced).toBe(true);
        expect(entry.totals.debit).toBe(4300000);
        expect(entry.totals.credit).toBe(4300000);

        const capitalLine = entry.lines.find(l => l.account === '1011');
        expect(capitalLine).toBeDefined();
        expect(capitalLine?.credit).toBe(2800000);
    });

    it('should calculate negative capital as balancing debit to 1311', () => {
        const input: OpeningEntryInput = {
            cash: 1000,
            liabilities: [
                { label: "Emprunt bancaire", type: 'BANK_LOAN', amount: 5000 },
            ],
        };

        const entry = ohada.recordOpeningEntry(input);

        // Assets = 1 000 / Liabilities = 5 000 → Capital = -4 000

        expect(entry.isBalanced).toBe(true);
        expect(entry.totals.debit).toBe(5000);
        expect(entry.totals.credit).toBe(5000);

        const deficitLine = entry.lines.find(l => l.account === '1311');
        expect(deficitLine).toBeDefined();
        expect(deficitLine?.debit).toBe(4000);
    });

    it('should produce zero capital when assets exactly equal liabilities', () => {
        const input: OpeningEntryInput = {
            bank: 100000,
            liabilities: [{ label: "Fournisseur", type: 'SUPPLIER', amount: 100000 }],
        };
        const entry = ohada.recordOpeningEntry(input);
        expect(entry.isBalanced).toBe(true);
        // No capital or deficit line because netEquity === 0
        expect(entry.lines.find(l => l.account === '1011')).toBeUndefined();
        expect(entry.lines.find(l => l.account === '1311')).toBeUndefined();
    });

    // ─────────────────────────────────────────────────────────
    // Fixed asset type → account routing
    // ─────────────────────────────────────────────────────────

    it.each([
        ['PATENT_LICENSE',        '212'],
        ['SOFTWARE',              '2183'],
        ['INTANGIBLE_OTHER',      '21'],
        ['LAND',                  '22'],
        ['COMMERCIAL_BUILDING',   '2313'],
        ['RESIDENTIAL_BUILDING',  '2314'],
        ['INDUSTRIAL_EQUIPMENT',  '241'],
        ['AGRICULTURAL_EQUIPMENT','243'],
        ['OFFICE_EQUIPMENT',      '2441'],
        ['COMPUTER_EQUIPMENT',    '2444'],
        ['OFFICE_FURNITURE',      '2445'],
        ['PASSENGER_VEHICLE',     '2451'],
        ['UTILITY_VEHICLE',       '2452'],
        ['FINANCIAL_ASSET',       '27'],
    ] as const)('fixed asset %s → account %s', (type, expectedAccount) => {
        const entry = ohada.recordOpeningEntry({
            fixedAssets: [{ label: 'Actif test', type, amount: 100000 }],
        });
        const line = entry.lines.find(l => l.account === expectedAccount);
        expect(line).toBeDefined();
        expect(line?.debit).toBe(100000);
    });

    // ─────────────────────────────────────────────────────────
    // Stock type → account routing
    // ─────────────────────────────────────────────────────────

    it.each([
        ['MERCHANDISE',    '3111'],
        ['RAW_MATERIALS',  '3211'],
        ['FINISHED_GOODS', '3411'],
        ['PACKAGING',      '3611'],
        ['OTHER_SUPPLIES', '3811'],
    ] as const)('stock %s → account %s', (type, expectedAccount) => {
        const entry = ohada.recordOpeningEntry({
            stocks: [{ label: 'Stock test', type, amount: 50000 }],
        });
        const line = entry.lines.find(l => l.account === expectedAccount);
        expect(line).toBeDefined();
        expect(line?.debit).toBe(50000);
    });

    // ─────────────────────────────────────────────────────────
    // Receivable type → account routing
    // ─────────────────────────────────────────────────────────

    it.each([
        ['CUSTOMER',          '4111'],
        ['SUPPLIER_ADVANCE',  '4091'],
        ['TAX_CREDIT',        '4717'],
        ['OTHER_RECEIVABLE',  '4721'],
    ] as const)('receivable %s → account %s', (type, expectedAccount) => {
        const entry = ohada.recordOpeningEntry({
            receivables: [{ label: 'Créance test', type, amount: 75000 }],
        });
        const line = entry.lines.find(l => l.account === expectedAccount);
        expect(line).toBeDefined();
        expect(line?.debit).toBe(75000);
    });

    // ─────────────────────────────────────────────────────────
    // Liability type → account routing
    // ─────────────────────────────────────────────────────────

    it.each([
        ['SUPPLIER',         '4011'],
        ['BANK_LOAN',        '1621'],
        ['OPERATING_CREDIT', '1622'],
        ['OTHER_DEBT',       '4711'],
    ] as const)('liability %s → account %s', (type, expectedAccount) => {
        const entry = ohada.recordOpeningEntry({
            cash: 200000,
            liabilities: [{ label: 'Dette test', type, amount: 50000 }],
        });
        const line = entry.lines.find(l => l.account === expectedAccount);
        expect(line).toBeDefined();
        expect(line?.credit).toBe(50000);
    });

    // ─────────────────────────────────────────────────────────
    // Liquidities: bank, cash, mobile money
    // ─────────────────────────────────────────────────────────

    it('should record bank balance on account 5211', () => {
        const entry = ohada.recordOpeningEntry({ bank: 500000 });
        const line = entry.lines.find(l => l.account === '5211');
        expect(line?.debit).toBe(500000);
    });

    it('should record cash on account 5711', () => {
        const entry = ohada.recordOpeningEntry({ cash: 25000 });
        const line = entry.lines.find(l => l.account === '5711');
        expect(line?.debit).toBe(25000);
    });

    it('should record mobile money on account 5141', () => {
        const entry = ohada.recordOpeningEntry({ mobileMoney: 150000 });
        const line = entry.lines.find(l => l.account === '5141');
        expect(line?.debit).toBe(150000);
    });

    it('should handle all three liquidity types together', () => {
        const entry = ohada.recordOpeningEntry({
            bank: 400000,
            cash: 50000,
            mobileMoney: 75000,
        });
        expect(entry.lines.find(l => l.account === '5211')?.debit).toBe(400000);
        expect(entry.lines.find(l => l.account === '5711')?.debit).toBe(50000);
        expect(entry.lines.find(l => l.account === '5141')?.debit).toBe(75000);
    });

    // ─────────────────────────────────────────────────────────
    // Full realistic scenario
    // ─────────────────────────────────────────────────────────

    it('should handle a realistic multi-asset opening entry', () => {
        const input: OpeningEntryInput = {
            fixedAssets: [
                { label: "MacBook Pro",        type: 'COMPUTER_EQUIPMENT', amount: 800000 },
                { label: "Véhicule Toyota",    type: 'PASSENGER_VEHICLE',  amount: 3000000 },
                { label: "Local commercial",   type: 'COMMERCIAL_BUILDING',amount: 5000000 },
            ],
            stocks: [
                { label: "Stock de départ",    type: 'MERCHANDISE',        amount: 2000000 },
            ],
            receivables: [
                { label: "Client Entreprise X",type: 'CUSTOMER',           amount: 450000 },
            ],
            bank: 1200000,
            cash: 100000,
            mobileMoney: 50000,
            liabilities: [
                { label: "Fournisseur Début",  type: 'SUPPLIER',           amount: 600000  },
                { label: "Emprunt BNI 5 ans",  type: 'BANK_LOAN',          amount: 4000000 },
            ],
        };

        const entry = ohada.recordOpeningEntry(input);

        // Total assets = 800k + 3M + 5M + 2M + 450k + 1.2M + 100k + 50k = 12 600 000
        // Total liabilities = 600k + 4M = 4 600 000
        // Capital = 12 600 000 - 4 600 000 = 8 000 000

        expect(entry.isBalanced).toBe(true);
        expect(entry.totals.debit).toBe(12600000);
        expect(entry.totals.credit).toBe(12600000);
        expect(entry.lines.find(l => l.account === '2444')?.debit).toBe(800000);
        expect(entry.lines.find(l => l.account === '2451')?.debit).toBe(3000000);
        expect(entry.lines.find(l => l.account === '2313')?.debit).toBe(5000000);
        expect(entry.lines.find(l => l.account === '1011')?.credit).toBe(8000000);
        expect(entry.type).toBe('BILAN_OUVERTURE');
    });

    // ─────────────────────────────────────────────────────────
    // i18n
    // ─────────────────────────────────────────────────────────

    it('should use OPENING_BALANCE as entry type in English locale', () => {
        const ohadaEn = new Ohada({ locale: 'en' });
        const entry = ohadaEn.recordOpeningEntry({ cash: 100 });
        expect(entry.type).toBe('OPENING_BALANCE');
    });

    it('should use BILAN_OUVERTURE as entry type in French locale', () => {
        const entry = ohada.recordOpeningEntry({ cash: 100 });
        expect(entry.type).toBe('BILAN_OUVERTURE');
    });
});

