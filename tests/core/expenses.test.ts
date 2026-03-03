import { describe, it, expect } from 'vitest';
import { Ohada } from '../../src/core/ohada';

describe('SYSCOHADA Expenses Logic', () => {

    describe('Test Case 1: Utility Bill (Electricity)', () => {
        it('should record electricity expense with VAT', () => {
            const ohada = new Ohada({ disableVAT: false });
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
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordExpense({
                category: 'RENT',
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

            const expenseLine = invoice.lines.find(l => l.account === '611');
            const supplierLine = invoice.lines.find(l => l.account === '4011');

            expect(expenseLine).toBeDefined();
            expect(expenseLine?.debit).toBe(8000);

            expect(supplierLine).toBeDefined();
            expect(supplierLine?.credit).toBe(8000);
        });
    });

    describe('Test Case 3: Professional Fees (Honoraires)', () => {
        it('should record legal fees with VAT on services', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordExpense({
                category: 'HONORAIRES',
                amount: 100000,
                label: "Honoraires notaire",
                vatRate: 18
            });

            expect(results.length).toBe(1);
            const invoice = results[0];
            
            expect(invoice.isBalanced).toBe(true);
            expect(invoice.totals.debit).toBe(118000);
            expect(invoice.totals.credit).toBe(118000);

            const expenseLine = invoice.lines.find(l => l.account === '622');
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
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordExpense({
                category: 'OFFICE_SUPPLIES',
                amount: 25000,
                label: "Fournitures bureau",
                vatRate: 18,
                payments: [{ method: 'cash', amount: 29500 }]
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

        it('should handle multiple split payments', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordExpense({
                category: 'OFFICE_SUPPLIES',
                amount: 25000,
                label: "Fournitures bureau",
                vatRate: 18,
                payments: [
                    { method: 'cash', amount: 14750 },
                    { method: 'bank', amount: 14750 }
                ]
            });

            expect(results.length).toBe(3); // Invoice + 2 Payments

            // Entry 1: Invoice
            const invoice = results[0];
            expect(invoice.isBalanced).toBe(true);

            // Entry 2: Payment 1 (cash)
            const payment1 = results[1];
            expect(payment1.lines.find(l => l.account === '5711' && l.credit === 14750)).toBeDefined();

            // Entry 3: Payment 2 (bank)
            const payment2 = results[2];
            expect(payment2.lines.find(l => l.account === '5211' && l.credit === 14750)).toBeDefined();
        });
    });

    describe('Global VAT Configuration', () => {
        it('should apply global VAT rate when specified', () => {
            const ohada = new Ohada({ disableVAT: false });
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
            const ohada = new Ohada({ disableVAT: false });
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
            const ohada = new Ohada({ disableVAT: false });
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
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordExpense({
                category: 'HONORAIRES',
                amount: 100000,
                label: "Honoraires",
                vatRate: 18
            });

            const vatLine = results[0].lines.find(l => l.account === '4454');
            expect(vatLine).toBeDefined();
        });

        it('should use 4452 for goods expenses', () => {
            const ohada = new Ohada({ disableVAT: false });
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
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordExpense({
                category: 'BANK_SERVICES',
                amount: 5000,
                label: "Frais bancaires"
            });

            const expenseLine = results[0].lines.find(l => l.account === '627');
            expect(expenseLine).toBeDefined();
        });

        it('should handle business license', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordExpense({
                category: 'BUSINESS_LICENSE',
                amount: 50000,
                label: "Patente annuelle"
            });

            const expenseLine = results[0].lines.find(l => l.account === '6412');
            expect(expenseLine).toBeDefined();
        });

        it('should handle software license', () => {
            const ohada = new Ohada({ disableVAT: false });
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

    describe('Metadata Consistency', () => {
        it('should assign correct types to all expense entries', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordExpense({
                category: 'OFFICE_SUPPLIES',
                amount: 10000,
                label: "Office test",
                payments: [{ method: 'cash', amount: 10000 }]
            });

            expect(results[0].type).toBe('CONSTATATION');
            expect(results[1].type).toBe('REGLEMENT');
        });
    });

    describe('Direct Expense Mode (Cash Basis)', () => {
        it('should record expense directly to cash when directExpense is true', () => {
            const ohada = new Ohada({ 
                disableVAT: false,
                directExpense: true 
            });
            
            const results = ohada.recordExpense({
                category: 'OFFICE_SUPPLIES',
                amount: 5000,
                label: "Achat direct papier",
                vatRate: 18
            });

            // Should have ONLY 1 entry
            expect(results.length).toBe(1);
            
            const entry = results[0];
            expect(entry.type).toBe('REGLEMENT'); // Direct payment
            
            // Check lines: Expense (D), VAT (D), Cash (C)
            expect(entry.lines.length).toBe(3);
            
            const expenseLine = entry.lines.find(l => l.account === '604');
            const vatLine = entry.lines.find(l => l.account === '4452');
            const cashLine = entry.lines.find(l => l.account === '5711');
            const supplierLine = entry.lines.find(l => l.account === '4011');

            expect(expenseLine?.debit).toBe(5000);
            expect(vatLine?.debit).toBe(900);
            expect(cashLine?.credit).toBe(5900);
            expect(supplierLine).toBeUndefined(); // NO SUPPLIER ACCOUNT
        });

        it('should use bank account if specified in payment', () => {
            const ohada = new Ohada({ 
                disableVAT: true,
                directExpense: true 
            });
            
            const results = ohada.recordExpense({
                category: 'MAINTENANCE_REPAIRS',
                amount: 20000,
                label: "Entretien clim",
                payments: [{ method: 'bank', amount: 20000 }]
            });

            const entry = results[0];
            const bankLine = entry.lines.find(l => l.account === '5211');
            expect(bankLine).toBeDefined();
            expect(bankLine?.credit).toBe(20000);
        });
    });

    describe('Functional Expenses (Expanded Coverage)', () => {
        const ohada = new Ohada({ disableVAT: false });

        it('should record Maintenance & Repairs (613)', () => {
            const results = ohada.recordExpense({
                category: 'MAINTENANCE_REPAIRS',
                amount: 50000,
                label: "Réparation clim"
            });
            expect(results[0].lines.find(l => l.account === '613')).toBeDefined();
        });

        it('should record Insurance (615)', () => {
            const results = ohada.recordExpense({
                category: 'INSURANCE',
                amount: 200000,
                label: "Assurance annuelle"
            });
            expect(results[0].lines.find(l => l.account === '615')).toBeDefined();
        });

        it('should record Research & Documentation (616)', () => {
            const results = ohada.recordExpense({
                category: 'RESEARCH_DOCUMENTATION',
                amount: 25000,
                label: "Abonnement revue fiscale"
            });
            expect(results[0].lines.find(l => l.account === '616')).toBeDefined();
        });

        it('should record Transport (624)', () => {
            const results = ohada.recordExpense({
                category: 'TRANSPORT',
                amount: 10000,
                label: "Taxi entreprise"
            });
            expect(results[0].lines.find(l => l.account === '624')).toBeDefined();
        });

        it('should record Personnel Charges (64)', () => {
            const results = ohada.recordExpense({
                category: 'PERSONNEL_CHARGES',
                amount: 500000,
                label: "Salaires Février"
            });
            expect(results[0].lines.find(l => l.account === '64')).toBeDefined();
        });

        it('should record Misc Management Charges (658)', () => {
            const results = ohada.recordExpense({
                category: 'MISC_MANAGEMENT_CHARGES',
                amount: 2000,
                label: "Timbres fiscaux"
            });
            expect(results[0].lines.find(l => l.account === '658')).toBeDefined();
        });
    });
});
