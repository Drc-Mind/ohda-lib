import { describe, it, expect } from 'vitest';
import { Ohada } from '../../src/core/ohada';
import { OpeningBalanceInput } from '../../src/business/onboarding/types';

describe('Onboarding (Opening Balance Sheet)', () => {
    const ohada = new Ohada();

    it('should correctly calculate opening capital (Application 3 scenario)', () => {
        const input: OpeningBalanceInput = {
            fixedAssets: [
                { name: "Camion", amount: 1500000 },
                { name: "Mobilier", amount: 2000000 }
            ],
            stocks: [
                { name: "Marchandises", amount: 300000 }
            ],
            receivables: [],
            liquidities: {
                cash: 500000
            },
            payables: [
                { name: "Fournisseur", amount: 1500000 }
            ]
        };

        const entry = ohada.recordOpeningBalance(input);

        // Assets = 1.5M + 2M + 0.3M + 0.5M = 4.3M
        // Debts = 1.5M
        // Capital = 4.3M - 1.5M = 2.8M

        expect(entry.totals.debit).toBe(4300000);
        expect(entry.totals.credit).toBe(4300000);
        expect(entry.isBalanced).toBe(true);

        const capitalLine = entry.lines.find(l => l.account === '1011');
        expect(capitalLine).toBeDefined();
        expect(capitalLine?.credit).toBe(2800000);
        expect(entry.type).toBe('BILAN_OUVERTURE');
    });

    it('should handle negative capital (Deficit scenario)', () => {
        const input: OpeningBalanceInput = {
            fixedAssets: [],
            stocks: [],
            receivables: [],
            liquidities: { cash: 1000 },
            payables: [
                { name: "Gros Prêt", amount: 5000, account: '1621' }
            ]
        };

        const entry = ohada.recordOpeningBalance(input);

        // Assets = 1000
        // Debts = 5000
        // Capital = 1000 - 5000 = -4000 (Debit 1311)

        expect(entry.totals.debit).toBe(5000);
        expect(entry.totals.credit).toBe(5000);
        
        const deficitLine = entry.lines.find(l => l.account === '1311');
        expect(deficitLine).toBeDefined();
        expect(deficitLine?.debit).toBe(4000);
    });

    it('should respect English locale for entry type label', () => {
        const ohadaEn = new Ohada({ locale: 'en' });
        const entry = ohadaEn.recordOpeningBalance({
            fixedAssets: [],
            stocks: [],
            receivables: [],
            liquidities: { cash: 100 },
            payables: []
        });

        expect(entry.type).toBe('OPENING_BALANCE');
    });
});
