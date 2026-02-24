import { describe, it, expect } from 'vitest';
import { Ohada } from '../../src/core/ohada';

describe('SYSCOHADA Assets Logic (Immobilisations)', () => {

    describe('Test Case 1: Simple Asset Acquisition with Dismantling', () => {
        it('should record an industrial machine with dismantling provision', () => {
            const ohada = new Ohada({ disableVAT: false });
            
            // From User Scenario: Machine 200M, Dismantling 3,219,732
            const results = ohada.recordAsset({
                assetName: "Machine Industrielle X1",
                type: 'INDUSTRIAL_EQUIPMENT',
                amount: 200000000,
                dismantlingEstimate: 3219732,
                vatRate: 18
            });

            expect(results.length).toBe(1);
            const entry = results[0];
            expect(entry.type).toBe('CONSTATATION');

            // 1. Asset Value (Debit 241): 200,000,000 + 3,219,732 = 203,219,732
            const assetLine = entry.lines.find(l => l.account === '241');
            expect(assetLine?.debit).toBe(203219732);

            // 2. VAT (Debit 4451): 18% of 200,000,000 = 36,000,000
            const vatLine = entry.lines.find(l => l.account === '4451');
            expect(vatLine?.debit).toBe(36000000);

            // 3. Investment Supplier (Credit 4812): Price + VAT = 236,000,000
            const supplierLine = entry.lines.find(l => l.account === '4812');
            expect(supplierLine?.credit).toBe(236000000);

            // 4. Dismantling Provision (Credit 1984): 3,219,732
            const provisionLine = entry.lines.find(l => l.account === '1984');
            expect(provisionLine?.credit).toBe(3219732);

            expect(entry.isBalanced).toBe(true);
        });
    });

    describe('Test Case 2: Component Split (Building Scenario)', () => {
        it('should split building into structure and elevator', () => {
            const ohada = new Ohada({ disableVAT: true }); // VAT disabled for simplicity

            // From User Scenario: Building 150M. Structure 120M, Elevator 30M
            const results = ohada.recordAsset({
                assetName: "Immeuble Siège",
                type: 'BUILDING',
                amount: 150000000,
                components: [
                    { name: "Structure", amount: 120000000, account: "23131" },
                    { name: "Ascenseur", amount: 30000000, account: "23132" }
                ]
            });

            const entry = results[0];
            
            expect(entry.lines.filter(l => l.debit > 0).length).toBe(2);
            
            const structureLine = entry.lines.find(l => l.account === '23131');
            const elevatorLine = entry.lines.find(l => l.account === '23132');
            const supplierLine = entry.lines.find(l => l.account === '4812');

            expect(structureLine?.debit).toBe(120000000);
            expect(elevatorLine?.debit).toBe(30000000);
            expect(supplierLine?.credit).toBe(150000000);
            
            expect(entry.isBalanced).toBe(true);
        });
    });

    describe('Test Case 3: Acquisition with Payment', () => {
        it('should record acquisition and then immediate payment', () => {
            const ohada = new Ohada({ disableVAT: false });

            const results = ohada.recordAsset({
                assetName: "MacBook Pro",
                type: 'COMPUTER_EQUIPMENT',
                amount: 1500000,
                vatRate: 18,
                payment: { method: 'bank', amount: 1770000 } // Total TTC
            });

            expect(results.length).toBe(2);

            // Entry 1: Constatation
            const acquisition = results[0];
            const supplierDebt = acquisition.lines.find(l => l.account === '4812');
            expect(supplierDebt?.credit).toBe(1770000);

            // Entry 2: Reglement
            const payment = results[1];
            expect(payment.type).toBe('REGLEMENT');
            
            const supplierPayment = payment.lines.find(l => l.account === '4812');
            const bankLine = payment.lines.find(l => l.account === '5211');

            expect(supplierPayment?.debit).toBe(1770000);
            expect(bankLine?.credit).toBe(1770000);
        });
    });

    describe('Various Asset Types', () => {
        it('should record a computer purchase with transport fees', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordAsset({
                assetName: "Serveur Dell",
                type: 'COMPUTER_EQUIPMENT',
                amount: 2500000,
                transport: 50000,
                vatRate: 18
            });

            const entry = results[0];
            // Total Immobilized: 2,500,000 + 50,000 = 2,550,000
            const assetLine = entry.lines.find(l => l.account === '2444');
            expect(assetLine?.debit).toBe(2550000);

            // VAT on base value (Price + Transport): 18% of 2,550,000 = 459,000
            const vatLine = entry.lines.find(l => l.account === '4451');
            expect(vatLine?.debit).toBe(459000);
            
            expect(entry.isBalanced).toBe(true);
        });

        it('should record land acquisition', () => {
            const ohada = new Ohada({ disableVAT: true });
            const results = ohada.recordAsset({
                assetName: "Terrain Zone Industrielle",
                type: 'LAND',
                amount: 50000000,
                otherCosts: 5000000 // Notary/Registration
            });

            const entry = results[0];
            const landLine = entry.lines.find(l => l.account === '22');
            expect(landLine?.debit).toBe(55000000);
            expect(entry.isBalanced).toBe(true);
        });

        it('should record office furniture with installation', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordAsset({
                assetName: "Mobilier Bureau DG",
                type: 'FURNITURE',
                amount: 1000000,
                installation: 100000,
                vatRate: 18
            });

            const entry = results[0];
            const assetLine = entry.lines.find(l => l.account === '2447');
            expect(assetLine?.debit).toBe(1100000);
            expect(entry.isBalanced).toBe(true);
        });

        it('should record intangible assets (Software)', () => {
            const ohada = new Ohada({ disableVAT: false });
            const results = ohada.recordAsset({
                assetName: "ERP JeGere",
                type: 'SOFTWARE',
                amount: 5000000,
                vatRate: 18
            });

            const entry = results[0];
            const assetLine = entry.lines.find(l => l.account === '2183');
            expect(assetLine?.debit).toBe(5000000);
            
            const vatLine = entry.lines.find(l => l.account === '4451');
            expect(vatLine?.debit).toBe(900000);
            expect(entry.isBalanced).toBe(true);
        });
    });
});
