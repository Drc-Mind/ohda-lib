import { describe, it, expect } from 'vitest';
import { Ohada } from '../../src/core/ohada';

describe('Simplified SYSCOHADA Purchase Logic (Multi-Entry)', () => {

    it('Scenario A: should record a purchase on credit correctly (constatation + stock variation)', () => {
        const ohada = new Ohada({ disableVAT: false });
        const results = ohada.recordPurchase({ amount: 100000, label: "Marchandises", vatRate: 18 });

        expect(results.length).toBe(2); // Constatation + Stock Variation
        
        const invoice = results[0];
        expect(invoice.isBalanced).toBe(true);
        expect(invoice.totals.debit).toBe(118000);
        expect(invoice.lines.find(l => l.account === '6011' && l.debit === 100000)).toBeDefined();
        expect(invoice.lines.find(l => l.account === '4452' && l.debit === 18000)).toBeDefined();
        expect(invoice.lines.find(l => l.account === '4011' && l.credit === 118000)).toBeDefined();

        // Stock Variation (Debit 31, Credit 6031)
        const stockVar = results[1];
        expect(stockVar.type).toBe('VARIATION_STOCK');
        expect(stockVar.isBalanced).toBe(true);
        expect(stockVar.lines.find(l => l.account === '31' && l.debit === 100000)).toBeDefined();
        expect(stockVar.lines.find(l => l.account === '6031' && l.credit === 100000)).toBeDefined();
    });

    it('Scenario B: should record a cash purchase with 3 entries (constatation + reglement + stock variation)', () => {
        const ohada = new Ohada({ disableVAT: false });
        const results = ohada.recordPurchase({ 
            amount: 100000, 
            label: "Marchandises",
            vatRate: 18,
            payments: [{ method: 'cash', amount: 118000 }]
        });

        expect(results.length).toBe(3); // Constatation + Payment + Stock Variation
        
        // Check Invoice
        const invoice = results[0];
        expect(invoice.lines.find(l => l.account === '4011' && l.credit === 118000)).toBeDefined();
        
        // Check Payment
        const payment = results[1];
        expect(payment.isBalanced).toBe(true);
        expect(payment.lines.find(l => l.account === '4011' && l.debit === 118000)).toBeDefined();
        expect(payment.lines.find(l => l.account === '5711' && l.credit === 118000)).toBeDefined();

        // Check Stock Variation
        const stockVar = results[2];
        expect(stockVar.type).toBe('VARIATION_STOCK');
        expect(stockVar.lines.find(l => l.account === '31' && l.debit === 100000)).toBeDefined();
        expect(stockVar.lines.find(l => l.account === '6031' && l.credit === 100000)).toBeDefined();
    });

    it('Scenario C: should handle split payments and charges with stock variation', () => {
        const ohada = new Ohada({ disableVAT: false });
        const results = ohada.recordPurchase({ 
            amount: 100000, 
            label: "Marchandises",
            vatRate: 18,
            charges: [{ type: 'Transport', amount: 5000 }],
            payments: [{ method: 'bank', amount: 61950 }]
        });

        expect(results.length).toBe(3); // Constatation + Payment + Stock Variation
        
        const invoice = results[0];
        expect(invoice.lines.find(l => l.account === '6011' && l.debit === 100000)).toBeDefined();
        expect(invoice.lines.find(l => l.account === '6015' && l.label.includes('Transport'))).toBeDefined();

        const payment = results[1];
        expect(payment.lines.find(l => l.account === '5211' && l.credit === 61950)).toBeDefined();

        // Stock Variation includes charges (100000 + 5000 = 105000)
        const stockVar = results[2];
        expect(stockVar.type).toBe('VARIATION_STOCK');
        expect(stockVar.lines.find(l => l.account === '31' && l.debit === 105000)).toBeDefined();
        expect(stockVar.lines.find(l => l.account === '6031' && l.credit === 105000)).toBeDefined();
    });

    it('should handle multiple payments as separate entries with stock variation at end', () => {
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

        expect(results.length).toBe(4); // Constatation + 2 Payments + Stock Variation
        expect(results[0].type).toBe('CONSTATATION');
        expect(results[1].type).toBe('REGLEMENT');
        expect(results[2].type).toBe('REGLEMENT');
        expect(results[3].type).toBe('VARIATION_STOCK');

        expect(results[1].lines.find(l => l.account === '5711' && l.credit === 5000)).toBeDefined();
        expect(results[2].lines.find(l => l.account === '5211' && l.credit === 2000)).toBeDefined();
        expect(results[3].lines.find(l => l.account === '31' && l.debit === 10000)).toBeDefined();
        expect(results[3].lines.find(l => l.account === '6031' && l.credit === 10000)).toBeDefined();
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
            expect(results[2].type).toBe('VARIATION_STOCK');
        });
    });

    describe('Stock Variation (Automatic for every purchase)', () => {
        it('should always generate stock variation entry (Debit 31, Credit 6031)', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordPurchase({
                amount: 50000,
                label: "Purchase with Auto Stock",
                vatRate: 18,
            });

            // Should have: Constatation + Stock Variation
            expect(results.length).toBe(2);
            
            const stockVar = results[1];
            expect(stockVar.type).toBe('VARIATION_STOCK');
            expect(stockVar.lines.find(l => l.account === '31' && l.debit === 50000)).toBeDefined();
            expect(stockVar.lines.find(l => l.account === '6031' && l.credit === 50000)).toBeDefined();
            expect(stockVar.isBalanced).toBe(true);
        });

        it('should include charges in stock variation amount', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordPurchase({
                amount: 50000,
                label: "Purchase with Charges",
                vatRate: 18,
                charges: [
                    { type: 'Transport', amount: 5000 },
                    { type: 'Douane', amount: 2000 }
                ]
            });

            // Should have: Constatation + Stock Variation
            expect(results.length).toBe(2);
            
            const stockVar = results[1];
            const expectedStockValue = 57000; // 50000 + 5000 + 2000
            expect(stockVar.lines.find(l => l.account === '31' && l.debit === expectedStockValue)).toBeDefined();
            expect(stockVar.lines.find(l => l.account === '6031' && l.credit === expectedStockValue)).toBeDefined();
            expect(stockVar.isBalanced).toBe(true);
        });

        it('should use custom stock account when provided via stockEntry', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordPurchase({
                amount: 50000,
                label: "Purchase with Custom Stock Account",
                vatRate: 18,
                stockEntry: {
                    stockAccount: '311'  // Specific stock account
                }
            });

            const stockVar = results[1];
            expect(stockVar.lines.find(l => l.account === '311' && l.debit === 50000)).toBeDefined();
            expect(stockVar.lines.find(l => l.account === '6031' && l.credit === 50000)).toBeDefined();
        });

        it('should record 3 entries: constatation + reglement + stock variation', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordPurchase({
                amount: 50000,
                label: "Complete Purchase Flow",
                vatRate: 18,
                payments: [{ method: 'bank', amount: 59000 }]
            });

            // Should have: Constatation + Payment + Stock Variation
            expect(results.length).toBe(3);
            expect(results[0].type).toBe('CONSTATATION');
            expect(results[1].type).toBe('REGLEMENT');
            expect(results[2].type).toBe('VARIATION_STOCK');

            // Stock variation = amount only (no charges)
            expect(results[2].lines.find(l => l.account === '31' && l.debit === 50000)).toBeDefined();
            expect(results[2].lines.find(l => l.account === '6031' && l.credit === 50000)).toBeDefined();
        });
    });

    describe('Reduction (RRR obtenus)', () => {
        it('should add reduction entry after constatation (VAT disabled)', () => {
            const ohada = new Ohada(); // disableVAT = true by default
            const results = ohada.recordPurchase({
                amount: 100000,
                label: "Marchandises",
                reduction: 20000
            });

            // Constatation + Reduction + Stock Variation
            expect(results.length).toBe(3);
            expect(results[0].type).toBe('CONSTATATION');
            expect(results[1].type).toBe('REDUCTION');
            expect(results[2].type).toBe('VARIATION_STOCK');

            // Reduction entry: D 4011 20000, C 6019 20000
            const red = results[1];
            expect(red.isBalanced).toBe(true);
            expect(red.lines.find(l => l.account === '4011' && l.debit === 20000)).toBeDefined();
            expect(red.lines.find(l => l.account === '6019' && l.credit === 20000)).toBeDefined();
            // No VAT line when VAT disabled
            expect(red.lines.find(l => l.account === '4451')).toBeUndefined();
        });

        it('should add reduction entry with VAT reversal (VAT enabled)', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordPurchase({
                amount: 100000,
                label: "Marchandises",
                vatRate: 18,
                reduction: 10000
            });

            // Constatation + Reduction + Stock Variation
            expect(results.length).toBe(3);

            const red = results[1];
            expect(red.type).toBe('REDUCTION');
            expect(red.isBalanced).toBe(true);

            // D 4011 = 10000 + 1800 = 11800
            expect(red.lines.find(l => l.account === '4011' && l.debit === 11800)).toBeDefined();
            // C 6019 = 10000
            expect(red.lines.find(l => l.account === '6019' && l.credit === 10000)).toBeDefined();
            // C 4451 = 1800
            expect(red.lines.find(l => l.account === '4451' && l.credit === 1800)).toBeDefined();
        });

        it('should place reduction before reglement, after constatation', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordPurchase({
                amount: 100000,
                label: "Marchandises",
                vatRate: 18,
                reduction: 10000,
                payments: [{ method: 'cash', amount: 50000 }]
            });

            // Constatation + Reduction + Payment + Stock Variation
            expect(results.length).toBe(4);
            expect(results[0].type).toBe('CONSTATATION');
            expect(results[1].type).toBe('REDUCTION');
            expect(results[2].type).toBe('REGLEMENT');
            expect(results[3].type).toBe('VARIATION_STOCK');
        });

        it('should validate overpayment against net amount after reduction', () => {
            const ohada = new Ohada();
            // amount=100000, reduction=20000 → net=80000
            expect(() => {
                ohada.recordPurchase({
                    amount: 100000,
                    label: "Test",
                    reduction: 20000,
                    payments: [{ method: 'cash', amount: 90000 }]
                });
            }).toThrow(/exceed the total amount due/);

            // Should NOT throw when paying net amount
            expect(() => {
                ohada.recordPurchase({
                    amount: 100000,
                    label: "Test",
                    reduction: 20000,
                    payments: [{ method: 'cash', amount: 80000 }]
                });
            }).not.toThrow();
        });

        it('should validate overpayment with VAT against net TTC after reduction', () => {
            const ohada = new Ohada({ disableVAT: false });
            // amount=100000, VAT 18% → TTC=118000, reduction=10000 → reductionTTC=11800, net=106200
            expect(() => {
                ohada.recordPurchase({
                    amount: 100000,
                    label: "Test",
                    vatRate: 18,
                    reduction: 10000,
                    payments: [{ method: 'cash', amount: 106200 }]
                });
            }).not.toThrow();

            expect(() => {
                ohada.recordPurchase({
                    amount: 100000,
                    label: "Test",
                    vatRate: 18,
                    reduction: 10000,
                    payments: [{ method: 'cash', amount: 106201 }]
                });
            }).toThrow(/exceed the total amount due/);
        });
    });
});
