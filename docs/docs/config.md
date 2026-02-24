# Global Configuration

Configure `@drcmind/ohada-lib` to match your legal jurisdiction and business defaults.

## The Ohada Instance

Initialize the `Ohada` class once and reuse it throughout your application.

```typescript
import { Ohada } from '@drcmind/ohada-lib';

const ohada = new Ohada({
  // --- Core ---
  currency: 'XAF',      // 'XAF', 'EUR', 'USD', etc.
  locale: 'fr',        // 'fr' (default) or 'en'
  
  // --- VAT Control ---
  vat: 0.18,           // Global default VAT rate (e.g., 18%)
  taxInclusive: false, // true = Prices are TTC, false = HT
  disableVAT: false,   // Set to true to skip VAT lines entirely
  
  // --- Expenses ---
  directExpense: false // true = Record expenses directly to cash (no 4011)
});
```

## Options Reference

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `currency` | `string` | - | Currency code used for label generation. |
| `locale` | `'fr' \| 'en'` | `'fr'` | Language for journal entry and translation labels. |
| `vat` | `number` | - | Default tax rate multiplier (0.18 for 18%). |
| `taxInclusive` | `boolean` | `false` | Whether amounts provided to functions include VAT. |
| `disableVAT` | `boolean` | `true` | Quickly disable VAT calculation across all modules. |
| `directExpense` | `boolean` | `false` | Bypasses the 2-step process for expenses. |

## Dynamic Overrides

Most methods allow overriding global settings for specific transactions:

```typescript
ohada.recordSale({
  amount: 1000,
  label: "Custom Sale",
  vatRate: 0.15 // Overrides global 0.18 for this entry
});
```
