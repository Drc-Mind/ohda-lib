import { describe, it, expect } from 'vitest';
import { Ohada } from '../../src/core/ohada';

describe('Sales Internationalization (i18n)', () => {
  describe('French locale (default)', () => {
    it('should use French labels for sales', () => {
      const ohada = new Ohada({ locale: 'fr' });
      const results = ohada.recordSale({
        amount: 100000,
        label: 'Ordinateurs',
        saleType: 'GOODS',
        vatRate: 18
      });

      const invoice = results[0];
      expect(invoice.lines.find(l => l.label.includes('Client'))).toBeDefined();
      expect(invoice.lines.find(l => l.label.includes('Vente de marchandises'))).toBeDefined();
      expect(invoice.lines.find(l => l.label.includes('TVA facturée'))).toBeDefined();
    });

    it('should use French labels for financial discounts', () => {
      const ohada = new Ohada({ locale: 'fr' });
      const results = ohada.recordSale({
        amount: 100000,
        label: 'Test',
        saleType: 'GOODS',
        financialDiscount: { percentage: 2 },
        vatRate: 0
      });

      expect(results[0].lines.find(l => l.label.includes('Escompte accordé'))).toBeDefined();
    });
  });

  describe('English locale', () => {
    it('should use English labels for sales', () => {
      const ohada = new Ohada({ locale: 'en' });
      const results = ohada.recordSale({
        amount: 100000,
        label: 'Computers',
        saleType: 'GOODS',
        vatRate: 18
      });

      const invoice = results[0];
      expect(invoice.lines.find(l => l.label.includes('Customer'))).toBeDefined();
      expect(invoice.lines.find(l => l.label.includes('Sale of goods'))).toBeDefined();
      expect(invoice.lines.find(l => l.label.includes('VAT charged'))).toBeDefined();
      
      // Should NOT contain French labels
      expect(invoice.lines.find(l => l.label.includes('Client'))).toBeUndefined();
      expect(invoice.lines.find(l => l.label.includes('TVA facturée'))).toBeUndefined();
    });

    it('should use English labels for manufactured products', () => {
      const ohada = new Ohada({ locale: 'en' });
      const results = ohada.recordSale({
        amount: 100000,
        label: 'Products',
        saleType: 'MANUFACTURED',
        vatRate: 0
      });

      expect(results[0].lines.find(l => l.label.includes('Sale of finished products'))).toBeDefined();
    });

    it('should use English labels for services', () => {
      const ohada = new Ohada({ locale: 'en' });
      const results = ohada.recordSale({
        amount: 100000,
        label: 'Consulting',
        saleType: 'SERVICES',
        vatRate: 0
      });

      expect(results[0].lines.find(l => l.label.includes('Service provision'))).toBeDefined();
    });
  });

  describe('Locale switching', () => {
    it('should produce different labels for the same sale in different locales', () => {
      const ohadaFr = new Ohada({ locale: 'fr' });
      const ohadaEn = new Ohada({ locale: 'en' });

      const resultsFr = ohadaFr.recordSale({
        amount: 100000,
        label: 'Test',
        saleType: 'GOODS',
        vatRate: 18
      });
      
      const resultsEn = ohadaEn.recordSale({
        amount: 100000,
        label: 'Test',
        saleType: 'GOODS',
        vatRate: 18
      });

      const frVatLabel = resultsFr[0].lines.find(l => l.account === '4431')?.label;
      const enVatLabel = resultsEn[0].lines.find(l => l.account === '4431')?.label;

      expect(frVatLabel).toContain('TVA facturée');
      expect(enVatLabel).toContain('VAT charged');
      expect(frVatLabel).not.toEqual(enVatLabel);
    });

    it('should maintain accounting accuracy regardless of locale', () => {
      const ohadaFr = new Ohada({ locale: 'fr' });
      const ohadaEn = new Ohada({ locale: 'en' });

      const resultsFr = ohadaFr.recordSale({
        amount: 100000,
        label: 'Test',
        saleType: 'GOODS',
        vatRate: 18
      });
      
      const resultsEn = ohadaEn.recordSale({
        amount: 100000,
        label: 'Test',
        saleType: 'GOODS',
        vatRate: 18
      });

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
