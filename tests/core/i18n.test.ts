import { describe, it, expect } from 'vitest';
import { Ohada } from '../../src/core/ohada';

describe('Internationalization (i18n) Support', () => {
  describe('French locale (default)', () => {
    it('should use French labels when no locale is specified', () => {
      const ohada = new Ohada({ disableVAT: false });
      const results = ohada.recordPurchase({ amount: 1000, label: 'Riz' });
      const invoiceLines = results[0].lines;

      // Check French translations
      expect(invoiceLines.find(l => l.label === 'Riz')).toBeDefined();
      expect(invoiceLines.find(l => l.label.includes('TVA récupérable'))).toBeDefined();
      expect(invoiceLines.find(l => l.label.includes('Fournisseur'))).toBeDefined();
    });

    it('should use French default label for numeric input', () => {
      const ohada = new Ohada();
      const results = ohada.recordPurchase(1000);
      const invoiceLines = results[0].lines;

      expect(invoiceLines.find(l => l.label === 'Achat (Générique)')).toBeDefined();
      expect(invoiceLines.find(l => l.label.includes('Fournisseur'))).toBeDefined();
    });

    it('should use French labels for payment entries', () => {
      const ohada = new Ohada({ locale: 'fr', disableVAT: false });
      const results = ohada.recordPurchase({
        amount: 1000,
        label: 'Fournitures',
        payments: [{ method: 'cash', amount: 500 }]
      });

      const paymentEntry = results[1];
      expect(paymentEntry).toBeDefined();
      expect(paymentEntry.lines.find(l => l.label.includes('Paiement'))).toBeDefined();
      expect(paymentEntry.lines.find(l => l.label.includes('Sortie de trésorerie'))).toBeDefined();
    });
  });

  describe('English locale', () => {
    it('should use English labels when locale is set to "en"', () => {
      const ohada = new Ohada({ locale: 'en', disableVAT: false });
      const results = ohada.recordPurchase({ amount: 1000, label: 'Rice' });
      const invoiceLines = results[0].lines;

      // Check English translations
      expect(invoiceLines.find(l => l.label === 'Rice')).toBeDefined();
      expect(invoiceLines.find(l => l.label.includes('Recoverable VAT'))).toBeDefined();
      expect(invoiceLines.find(l => l.label.includes('Supplier'))).toBeDefined();
      
      // Should NOT contain French labels
      expect(invoiceLines.find(l => l.label.includes('TVA récupérable'))).toBeUndefined();
      expect(invoiceLines.find(l => l.label.includes('Fournisseur'))).toBeUndefined();
    });

    it('should use English default label for numeric input', () => {
      const ohada = new Ohada({ locale: 'en', disableVAT: false });
      const results = ohada.recordPurchase(1000);
      const invoiceLines = results[0].lines;

      expect(invoiceLines.find(l => l.label === 'Purchase (Generic)')).toBeDefined();
      expect(invoiceLines.find(l => l.label.includes('Supplier'))).toBeDefined();
      
      // Should NOT contain French labels
      expect(invoiceLines.find(l => l.label === 'Achat (Générique)')).toBeUndefined();
    });

    it('should use English labels for payment entries', () => {
      const ohada = new Ohada({ locale: 'en', disableVAT: false });
      const results = ohada.recordPurchase({
        amount: 1000,
        label: 'Supplies',
        payments: [{ method: 'bank', amount: 1160 }]
      });

      const paymentEntry = results[1];
      expect(paymentEntry).toBeDefined();
      expect(paymentEntry.lines.find(l => l.label.includes('Payment'))).toBeDefined();
      expect(paymentEntry.lines.find(l => l.label.includes('Cash Outflow'))).toBeDefined();
      
      // Should NOT contain French labels
      expect(paymentEntry.lines.find(l => l.label.includes('Paiement'))).toBeUndefined();
      expect(paymentEntry.lines.find(l => l.label.includes('Sortie de trésorerie'))).toBeUndefined();
    });
  });

  describe('Locale switching', () => {
    it('should produce different labels for the same transaction in different locales', () => {
      const ohadaFr = new Ohada({ locale: 'fr', disableVAT: false });
      const ohadaEn = new Ohada({ locale: 'en', disableVAT: false });

      const resultsFr = ohadaFr.recordPurchase({ amount: 1000, label: 'Test' });
      const resultsEn = ohadaEn.recordPurchase({ amount: 1000, label: 'Test' });

      const frVatLabel = resultsFr[0].lines.find(l => l.account === '4452')?.label;
      const enVatLabel = resultsEn[0].lines.find(l => l.account === '4452')?.label;

      expect(frVatLabel).toContain('TVA récupérable');
      expect(enVatLabel).toContain('Recoverable VAT');
      expect(frVatLabel).not.toEqual(enVatLabel);
    });

    it('should maintain accounting accuracy regardless of locale', () => {
      const ohadaFr = new Ohada({ locale: 'fr', disableVAT: false });
      const ohadaEn = new Ohada({ locale: 'en', disableVAT: false });

      const resultsFr = ohadaFr.recordPurchase({ amount: 1000, label: 'Test' });
      const resultsEn = ohadaEn.recordPurchase({ amount: 1000, label: 'Test' });

      // Same amounts
      expect(resultsFr[0].totals.debit).toEqual(resultsEn[0].totals.debit);
      expect(resultsFr[0].totals.credit).toEqual(resultsEn[0].totals.credit);
      
      // Same accounts
      const frAccounts = resultsFr[0].lines.map(l => l.account).sort();
      const enAccounts = resultsEn[0].lines.map(l => l.account).sort();
      expect(frAccounts).toEqual(enAccounts);
    });
  });
});
