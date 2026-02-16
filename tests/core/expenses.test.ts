import { describe, it, expect } from 'vitest';
import { Ohada } from '../../src/core/ohada';

describe('SYSCOHADA Expenses Logic', () => {

    describe('Test Case 1: Utility Bill (Electricity)', () => {
        it('should record electricity expense with VAT', () => {
            const ohada = new Ohada();
            const results = ohada.recordExpense({
                category: 'ELECTRICITY',
                amount: 50000,
                label: "Facture CIE",
                vatAmount: 9000
            });

            expect(results.length).toBe(1);
            const invoice = results[0];
            
            expect(invoice.isBalanced).toBe(true);
            expect(invoice.totals.debit).toBe(59000);
            expect(invoice.totals.credit).toBe(59000);

            // Check accounts
            const expenseLine = invoice.lines.find(l => l.account === '6052');
            const vatLine = invoice.lines.find(l => l.account === '4452'); // Goods VAT
            const supplierLine = invoice.lines.find(l => l.account === '4011');

            expect(expenseLine).toBeDefined();
            expect(expenseLine?.debit).toBe(50000);

            expect(vatLine).toBeDefined();
            expect(vatLine?.debit).toBe(9000);

            expect(supplierLine).toBeDefined();
            expect(supplierLine?.credit).toBe(59000);
        });
    });

    describe('Test Case 2: Rent (VAT-Exempt)', () => {
        it('should record rent without VAT', () => {
            const ohada = new Ohada();
            const results = ohada.recordExpense({
                category: 'RENT_BUILDING',
                amount: 8000,
                label: "Loyer mensuel"
            });

            expect(results.length).toBe(1);
            const invoice = results[0];
            
            expect(invoice.isBalanced).toBe(true);
            expect(invoice.totals.debit).toBe(8000);
            expect(invoice.totals.credit).toBe(8000);

            // Should have only 2 lines (no VAT)
            expect(invoice.lines.length).toBe(2);

            const expenseLine = invoice.lines.find(l => l.account === '6222');
            const supplierLine = invoice.lines.find(l => l.account === '4011');

            expect(expenseLine).toBeDefined();
            expect(expenseLine?.debit).toBe(8000);

            expect(supplierLine).toBeDefined();
            expect(supplierLine?.credit).toBe(8000);
        });
    });

    describe('Test Case 3: Professional Fees (Honoraires)', () => {
        it('should record legal fees with VAT on services', () => {
            const ohada = new Ohada();
            const results = ohada.recordExpense({
                category: 'LEGAL_FEES',
                amount: 100000,
                label: "Honoraires notaire",
                vatRate: 18
            });

            expect(results.length).toBe(1);
            const invoice = results[0];
            
            expect(invoice.isBalanced).toBe(true);
            expect(invoice.totals.debit).toBe(118000);
            expect(invoice.totals.credit).toBe(118000);

            const expenseLine = invoice.lines.find(l => l.account === '6324');
            const vatLine = invoice.lines.find(l => l.account === '4454'); // Services VAT
            const supplierLine = invoice.lines.find(l => l.account === '4011');

            expect(expenseLine).toBeDefined();
            expect(expenseLine?.debit).toBe(100000);

            expect(vatLine).toBeDefined();
            expect(vatLine?.debit).toBe(18000);

            expect(supplierLine).toBeDefined();
            expect(supplierLine?.credit).toBe(118000);
        });
    });

    describe('Test Case 4: Expense with Payment', () => {
        it('should create invoice and payment entries', () => {
            const ohada = new Ohada();
            const results = ohada.recordExpense({
                category: 'OFFICE_SUPPLIES',
                amount: 25000,
                label: "Fournitures bureau",
                vatRate: 18,
                payment: { method: 'cash', amount: 29500 }
            });

            expect(results.length).toBe(2);

            // Entry 1: Invoice
            const invoice = results[0];
            expect(invoice.isBalanced).toBe(true);
            expect(invoice.totals.debit).toBe(29500);
            expect(invoice.totals.credit).toBe(29500);

            // Entry 2: Payment
            const payment = results[1];
            expect(payment.isBalanced).toBe(true);
            expect(payment.totals.debit).toBe(29500);
            expect(payment.totals.credit).toBe(29500);

            const cashLine = payment.lines.find(l => l.account === '5711');
            const supplierPaymentLine = payment.lines.find(l => l.account === '4011');

            expect(supplierPaymentLine?.debit).toBe(29500);
            expect(cashLine?.credit).toBe(29500);
        });
    });

    describe('Global VAT Configuration', () => {
        it('should apply global VAT rate when specified', () => {
            const ohada = new Ohada();
            const results = ohada.recordExpense(
                {
                    category: 'TELECOMMUNICATIONS',
                    amount: 50000,
                    label: "Frais téléphone"
                },
                { defaultVATRate: 18 } // Global VAT config
            );

            const invoice = results[0];
            const vatLine = invoice.lines.find(l => l.account === '4454');
            
            expect(vatLine).toBeDefined();
            expect(vatLine?.debit).toBe(9000); // 18% of 50000
        });

        it('should disable VAT globally when vatOnExpenses is false', () => {
            const ohada = new Ohada();
            const results = ohada.recordExpense(
                {
                    category: 'TELECOMMUNICATIONS',
                    amount: 50000,
                    label: "Frais téléphone",
                    vatRate: 18 // This should be ignored
                },
                { vatOnExpenses: false } // Disable VAT
            );

            const invoice = results[0];
            const vatLine = invoice.lines.find(l => l.account === '4454');
            
            expect(vatLine).toBeUndefined();
            expect(invoice.totals.debit).toBe(50000); // No VAT added
        });

        it('should prioritize manual VAT over global config', () => {
            const ohada = new Ohada();
            const results = ohada.recordExpense(
                {
                    category: 'ADVERTISING',
                    amount: 100000,
                    label: "Publicité",
                    vatAmount: 15000 // Manual VAT
                },
                { defaultVATRate: 18 } // Global config should be ignored
            );

            const invoice = results[0];
            const vatLine = invoice.lines.find(l => l.account === '4454');
            
            expect(vatLine?.debit).toBe(15000); // Manual amount, not 18%
        });
    });

    describe('Service vs Goods VAT Account', () => {
        it('should use 4454 for service expenses', () => {
            const ohada = new Ohada();
            const results = ohada.recordExpense({
                category: 'LEGAL_FEES',
                amount: 100000,
                label: "Honoraires",
                vatRate: 18
            });

            const vatLine = results[0].lines.find(l => l.account === '4454');
            expect(vatLine).toBeDefined();
        });

        it('should use 4452 for goods expenses', () => {
            const ohada = new Ohada();
            const results = ohada.recordExpense({
                category: 'OFFICE_SUPPLIES',
                amount: 50000,
                label: "Fournitures",
                vatRate: 18
            });

            const vatLine = results[0].lines.find(l => l.account === '4452');
            expect(vatLine).toBeDefined();
        });
    });

    describe('Various Expense Categories', () => {
        it('should handle bank fees', () => {
            const ohada = new Ohada();
            const results = ohada.recordExpense({
                category: 'BANK_FEES',
                amount: 5000,
                label: "Frais bancaires"
            });

            const expenseLine = results[0].lines.find(l => l.account === '6318');
            expect(expenseLine).toBeDefined();
        });

        it('should handle business license', () => {
            const ohada = new Ohada();
            const results = ohada.recordExpense({
                category: 'BUSINESS_LICENSE',
                amount: 50000,
                label: "Patente annuelle"
            });

            const expenseLine = results[0].lines.find(l => l.account === '6412');
            expect(expenseLine).toBeDefined();
        });

        it('should handle software license', () => {
            const ohada = new Ohada();
            const results = ohada.recordExpense({
                category: 'SOFTWARE_LICENSE',
                amount: 100000,
                label: "Licence logiciel",
                vatRate: 18
            });

            const expenseLine = results[0].lines.find(l => l.account === '6343');
            const vatLine = results[0].lines.find(l => l.account === '4454'); // Service
            
            expect(expenseLine).toBeDefined();
            expect(vatLine).toBeDefined();
        });
    });
});
