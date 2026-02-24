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

    describe('Stock Entry Support (OHADA Inventory)', () => {
        it('should handle initial stock recognition', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordPurchase({
                amount: 50000,
                label: "Purchase with Initial Stock",
                vatRate: 18,
                stockEntry: {
                    initialStock: 200000
                }
            });

            // Should have: Invoice + Stock Entry
            expect(results.length).toBe(2);
            
            const stockEntry = results[1];
            expect(stockEntry.lines.find(l => l.account === '6031' && l.debit === 200000)).toBeDefined();
            expect(stockEntry.lines.find(l => l.account === '31' && l.credit === 200000)).toBeDefined();
            expect(stockEntry.isBalanced).toBe(true);
        });

        it('should handle final stock recognition', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordPurchase({
                amount: 50000,
                label: "Purchase with Final Stock",
                vatRate: 18,
                stockEntry: {
                    finalStock: 250000
                }
            });

            // Should have: Invoice + Stock Entry
            expect(results.length).toBe(2);
            
            const stockEntry = results[1];
            expect(stockEntry.lines.find(l => l.account === '31' && l.debit === 250000)).toBeDefined();
            expect(stockEntry.lines.find(l => l.account === '6031' && l.credit === 250000)).toBeDefined();
            expect(stockEntry.isBalanced).toBe(true);
        });

        it('should handle both initial and final stock', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordPurchase({
                amount: 100000,
                label: "Purchase with Initial and Final Stock",
                vatRate: 18,
                stockEntry: {
                    initialStock: 200000,
                    finalStock: 350000
                }
            });

            // Should have: Invoice + Initial Stock Entry + Final Stock Entry
            expect(results.length).toBe(3);
            
            const initialStock = results[1];
            expect(initialStock.lines.find(l => l.account === '6031' && l.debit === 200000)).toBeDefined();
            expect(initialStock.lines.find(l => l.account === '31' && l.credit === 200000)).toBeDefined();
            
            const finalStock = results[2];
            expect(finalStock.lines.find(l => l.account === '31' && l.debit === 350000)).toBeDefined();
            expect(finalStock.lines.find(l => l.account === '6031' && l.credit === 350000)).toBeDefined();
        });

        it('should use custom stock account when provided', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordPurchase({
                amount: 50000,
                label: "Purchase with Custom Stock Account",
                vatRate: 18,
                stockEntry: {
                    finalStock: 300000,
                    stockAccount: '311'  // Specific stock account
                }
            });

            const stockEntry = results[1];
            expect(stockEntry.lines.find(l => l.account === '311' && l.debit === 300000)).toBeDefined();
            expect(stockEntry.lines.find(l => l.account === '6031' && l.credit === 300000)).toBeDefined();
        });

        it('should record multiple entries with payments and stock', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordPurchase({
                amount: 50000,
                label: "Complete Purchase Flow",
                vatRate: 18,
                payments: [{ method: 'bank', amount: 59000 }],
                stockEntry: {
                    initialStock: 150000,
                    finalStock: 200000
                }
            });

            // Should have: Invoice + Payment + Initial Stock + Final Stock
            expect(results.length).toBe(4);
            expect(results[0].type).toBe('CONSTATATION');
            expect(results[1].type).toBe('REGLEMENT');
            expect(results[2].type).toBe('SORTIE_STOCK');  // Stock exit type
            expect(results[3].type).toBe('SORTIE_STOCK');  // Stock exit type
        });

        it('should auto-calculate finalStock as amount + charges when not provided', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordPurchase({
                amount: 50000,
                label: "Purchase with Auto Stock Calculation",
                vatRate: 18,
                charges: [
                    { type: 'Transport', amount: 5000 },
                    { type: 'Douane', amount: 2000 }
                ],
                stockEntry: {
                    // finalStock NOT specified - should auto-calculate to 57000 (50000 + 5000 + 2000)
                }
            });

            // Should have: Invoice + Stock Entry
            expect(results.length).toBe(2);
            
            const stockEntry = results[1];
            const expectedStockValue = 57000; // 50000 + 5000 + 2000
            expect(stockEntry.lines.find(l => l.account === '31' && l.debit === expectedStockValue)).toBeDefined();
            expect(stockEntry.lines.find(l => l.account === '6031' && l.credit === expectedStockValue)).toBeDefined();
            expect(stockEntry.isBalanced).toBe(true);
        });

        it('should override auto-calculation when finalStock is explicitly provided', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordPurchase({
                amount: 50000,
                label: "Purchase with Override Stock",
                vatRate: 18,
                charges: [{ type: 'Transport', amount: 5000 }],
                stockEntry: {
                    finalStock: 100000  // Explicitly override auto-calculation
                }
            });

            // Should have: Invoice + Stock Entry
            expect(results.length).toBe(2);
            
            const stockEntry = results[1];
            // Should use explicit value (100000) not auto-calculated (55000)
            expect(stockEntry.lines.find(l => l.account === '31' && l.debit === 100000)).toBeDefined();
            expect(stockEntry.lines.find(l => l.account === '6031' && l.credit === 100000)).toBeDefined();
        });
    });
});
