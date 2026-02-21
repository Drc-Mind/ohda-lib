import { describe, it, expect } from 'vitest';
import { Ohada } from '../../src/core/ohada';

describe('API Validation & Features', () => {
    const ohada = new Ohada({ disableVAT: false });

    it('should default to GOODS if type is invalid', () => {
        const results = ohada.recordPurchase({
            // @ts-ignore
            type: "INVALID_TYPE",
            amount: 100,
            label: "Test"
        });

        expect(results[0].lines.find(l => l.account === '6011')).toBeDefined();
    });

    it('should handle specialized fields', () => {
        const results = ohada.recordPurchase({
            amount: 1000,
            label: "Complex",
            charges: [{ type: 'Transport', amount: 50 }],
            payments: [{ method: 'bank', amount: 10 }]
        });

        expect(results[0].lines.find(l => l.account === '6015' && l.debit === 50)).toBeDefined();
        expect(results[1].lines.find(l => l.account === '5211' && l.credit === 10)).toBeDefined();
    });

    describe('Global VAT Control', () => {
        it('should have VAT disabled by default', () => {
            const ohadaDefault = new Ohada(); // Use default config
            const entries = ohadaDefault.recordPurchase({
                amount: 10000,
                label: "Test Purchase"
            });

            const constatation = entries.find(e => e.type === 'CONSTATATION');
            const supplierLine = constatation?.lines.find(l => l.account === '4011');
            expect(supplierLine?.credit).toBe(10000);
            
            // Should NOT have a VAT line (4452)
            const vatLine = constatation?.lines.find(l => l.account === '4452');
            expect(vatLine).toBeUndefined();
        });

        it('should allow enabling VAT explicitly in config', () => {
            const ohadaVat = new Ohada({ disableVAT: false });
            const entries = ohadaVat.recordPurchase({
                amount: 10000,
                label: "Test Purchase",
                vatRate: 18
            });

            const constatation = entries.find(e => e.type === 'CONSTATATION');
            const vatLine = constatation?.lines.find(l => l.account === '4452');
            expect(vatLine).toBeDefined();
            expect(vatLine?.debit).toBe(1800);
        });
    });
});
