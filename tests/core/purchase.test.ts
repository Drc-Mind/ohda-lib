import { describe, it, expect } from 'vitest';
import { Ohada } from '../../src/core/ohada';

describe('Simplified SYSCOHADA Purchase Logic (Multi-Entry)', () => {

    it('Scenario A: should record a purchase on credit correctly', () => {
        const ohada = new Ohada({ disableVAT: false });
        const results = ohada.recordPurchase({ amount: 100000, label: "Marchandises", vatRate: 18 });

        expect(results.length).toBe(1); // Only Invoice
        const invoice = results[0];
        expect(invoice.isBalanced).toBe(true);
        expect(invoice.totals.debit).toBe(118000);
        
        expect(invoice.lines.find(l => l.account === '6011' && l.debit === 100000)).toBeDefined();
        expect(invoice.lines.find(l => l.account === '4452' && l.debit === 18000)).toBeDefined();
        expect(invoice.lines.find(l => l.account === '4011' && l.credit === 118000)).toBeDefined();
    });

    it('Scenario B: should record a cash purchase with separate entities', () => {
        const ohada = new Ohada({ disableVAT: false });
        const results = ohada.recordPurchase({ 
            amount: 100000, 
            label: "Marchandises",
            vatRate: 18,
            payments: [{ method: 'cash', amount: 118000 }]
        });

        expect(results.length).toBe(2); // Invoice + Payment
        
        // Check Invoice
        const invoice = results[0];
        expect(invoice.lines.find(l => l.account === '4011' && l.credit === 118000)).toBeDefined();
        
        // Check Payment
        const payment = results[1];
        expect(payment.isBalanced).toBe(true);
        expect(payment.lines.find(l => l.account === '4011' && l.debit === 118000)).toBeDefined();
        expect(payment.lines.find(l => l.account === '5711' && l.credit === 118000)).toBeDefined();
    });

    it('Scenario C: should handle split payments and charges with separate entities', () => {
        const ohada = new Ohada({ disableVAT: false });
        const results = ohada.recordPurchase({ 
            amount: 100000, 
            label: "Marchandises",
            vatRate: 18,
            charges: [{ type: 'Transport', amount: 5000 }],
            payments: [{ method: 'bank', amount: 61950 }]
        });

        expect(results.length).toBe(2); // Invoice + 1 Payment
        
        const invoice = results[0];
        expect(invoice.lines.find(l => l.account === '6011' && l.debit === 100000)).toBeDefined();
        expect(invoice.lines.find(l => l.account === '6015' && l.label.includes('Transport'))).toBeDefined();

        const payment = results[1];
        expect(payment.lines.find(l => l.account === '5211' && l.credit === 61950)).toBeDefined();
    });

    it('should handle multiple payments as separate entries', () => {
        const ohada = new Ohada();
        const results = ohada.recordPurchase({
            amount: 10000,
            label: "Multi",
            vatRate: 18,
            payments: [
                { method: 'cash', amount: 5000 },
                { method: 'bank', amount: 2000 }
            ]
        });

        expect(results.length).toBe(3); // Invoice + 2 Payments
        expect(results[1].lines.find(l => l.account === '5711' && l.credit === 5000)).toBeDefined();
        expect(results[2].lines.find(l => l.account === '5211' && l.credit === 2000)).toBeDefined();
        
        // Metadata check
        expect(results[0].type).toBe('CONSTATATION');
        expect(results[1].type).toBe('REGLEMENT');
    });

    describe('Overpayment Validation', () => {
        it('should throw an error if payments exceed total due', () => {
            const ohada = new Ohada();
            expect(() => {
                ohada.recordPurchase({
                    amount: 10000,
                    label: "Overpayment Test",
                    payments: [
                        { method: 'cash', amount: 15000 }
                    ]
                });
            }).toThrow(/exceed the total amount due/);
        });
    });

    describe('Metadata Consistency', () => {
        it('should assign correct types to all purchase entries', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordPurchase({
                amount: 5000,
                label: "Metadata Test",
                payments: [{ method: 'bank', amount: 5000 }]
            });

            expect(results[0].type).toBe('CONSTATATION');
            expect(results[1].type).toBe('REGLEMENT');
        });
    });
});
