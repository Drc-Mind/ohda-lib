import { describe, it, expect } from 'vitest';
import { Ohada } from '../../src/core/ohada';

describe('API Validation & Features', () => {
    const ohada = new Ohada();

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
});
