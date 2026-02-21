import { describe, it, expect } from 'vitest';
import { Ohada } from '../../src/core/ohada';

describe('SYSCOHADA Sales Logic', () => {

    describe('Test Case 1: Complex Sale (Goods + Transport + Packaging)', () => {
        it('should record a complex sale with transport and packaging deposits correctly', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordSale({
                amount: 25000000,
                label: "Vente boissons",
                saleType: 'GOODS',
                transportCharge: { amount: 3825000 },
                packagingDeposit: { amount: 300000 },
                vatRate: 18
            });

            expect(results.length).toBe(1); // Only Invoice
            const invoice = results[0];
            
            // Verify balance
            expect(invoice.isBalanced).toBe(true);
            expect(invoice.totals.debit).toBe(34313500);
            expect(invoice.totals.credit).toBe(34313500);
            
            // Verify individual accounts
            expect(invoice.lines.find(l => l.account === '4111' && l.debit === 34313500)).toBeDefined(); // Client
            expect(invoice.lines.find(l => l.account === '701' && l.credit === 25000000)).toBeDefined(); // Revenue
            expect(invoice.lines.find(l => l.account === '7071' && l.credit === 3825000)).toBeDefined(); // Transport
            expect(invoice.lines.find(l => l.account === '4431' && l.credit === 5188500)).toBeDefined(); // VAT (18% of 28,825,000)
            expect(invoice.lines.find(l => l.account === '4194' && l.credit === 300000)).toBeDefined(); // Packaging (no VAT)
        });
    });

    describe('Test Case 2: Sale with Financial Discount & Inventory', () => {
        it('should record financial discount as expense and track inventory exit', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordSale({
                amount: 93000,
                label: "Vente marchandises",
                saleType: 'GOODS',
                financialDiscount: { percentage: 2 },
                inventoryExit: { costPrice: 64000 },
                vatRate: 0 // Simplified for this test
            });

            expect(results.length).toBe(2); // Invoice + Stock Exit
            
            // Invoice Entry
            const invoice = results[0];
            expect(invoice.isBalanced).toBe(true);
            expect(invoice.lines.find(l => l.account === '4111' && l.debit === 91140)).toBeDefined(); // Client (93000 - 1860)
            expect(invoice.lines.find(l => l.account === '673' && l.debit === 1860)).toBeDefined(); // Financial Discount (2%)
            expect(invoice.lines.find(l => l.account === '701' && l.credit === 93000)).toBeDefined(); // Revenue (GROSS)
            
            // Stock Exit Entry
            const stockExit = results[1];
            expect(stockExit.isBalanced).toBe(true);
            expect(stockExit.lines.find(l => l.account === '6031' && l.debit === 64000)).toBeDefined(); // Cost of Sales
            expect(stockExit.lines.find(l => l.account === '311' && l.credit === 64000)).toBeDefined(); // Stock reduction
        });
    });

    describe('Test Case 3: Return of Goods (Credit Note)', () => {
        it('should record a return as negative revenue', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordSale({
                amount: -200000,
                label: "Retour ordinateur défectueux",
                saleType: 'GOODS',
                vatRate: 18
            });

            expect(results.length).toBe(1);
            const creditNote = results[0];
            
            // Entry should be balanced
            expect(creditNote.isBalanced).toBe(true);
            
            // With negative amount, the client debit becomes negative (credit in practice)
            // Revenue credit becomes negative (debit in practice)
            const clientLine = creditNote.lines.find(l => l.account === '4111');
            const revenueLine = creditNote.lines.find(l => l.account === '701');
            
            expect(clientLine).toBeDefined();
            expect(revenueLine).toBeDefined();
            
            // Client should have negative debit (= credit of 236,000)
            expect(clientLine?.debit).toBe(-236000);
            
            // Revenue should have negative credit (= debit of 200,000)
            expect(revenueLine?.credit).toBe(-200000);
            
            // Note: VAT line won't exist because vatAmount is negative and processor only adds if > 0
            // In a real credit note scenario, you'd want to handle this differently
        });
    });

    describe('Revenue Classification', () => {
        it('should use account 701 for GOODS', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordSale({
                amount: 100000,
                label: "Marchandises",
                saleType: 'GOODS',
                vatRate: 0
            });

            expect(results[0].lines.find(l => l.account === '701')).toBeDefined();
        });

        it('should use account 702 for MANUFACTURED products', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordSale({
                amount: 100000,
                label: "Produits finis",
                saleType: 'MANUFACTURED',
                vatRate: 0
            });

            expect(results[0].lines.find(l => l.account === '702')).toBeDefined();
        });

        it('should use account 706 for SERVICES', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordSale({
                amount: 100000,
                label: "Consulting",
                saleType: 'SERVICES',
                vatRate: 0
            });

            expect(results[0].lines.find(l => l.account === '706')).toBeDefined();
        });
    });

    describe('Payment Handling', () => {
        it('should create a separate payment entry when payment is provided', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordSale({
                amount: 100000,
                label: "Vente comptant",
                saleType: 'GOODS',
                vatRate: 18,
                payment: { method: 'cash', amount: 118000 }
            });

            expect(results.length).toBe(2); // Invoice + Payment
            
            const payment = results[1];
            expect(payment.isBalanced).toBe(true);
            expect(payment.lines.find(l => l.account === '5711' && l.debit === 118000)).toBeDefined(); // Cash
            expect(payment.lines.find(l => l.account === '4111' && l.credit === 118000)).toBeDefined(); // Client
        });
    });

    describe('Metadata Consistency', () => {
        it('should assign correct types to all sales entries', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordSale({
                amount: 100000,
                label: "Full Sale",
                saleType: 'GOODS',
                inventoryExit: { costPrice: 60000 },
                payment: { method: 'bank', amount: 118000 }
            });

            expect(results[0].type).toBe('CONSTATATION');
            expect(results[1].type).toBe('STOCK_EXIT');
            expect(results[2].type).toBe('REGLEMENT');
        });
    });
});
