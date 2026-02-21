# Getting Started

Learn how to integrate `@drcmind/ohada-lib` into your project and record your first professional journal entry.

## Installation

Install the package via your preferred package manager:

```bash
npm install @drcmind/ohada-lib
# or
yarn add @drcmind/ohada-lib
# or
pnpm add @drcmind/ohada-lib
```

## Basic Setup

The core of the library is the `Ohada` class. You can initialize it with global settings like VAT rates and currency.

```typescript
import { Ohada } from '@drcmind/ohada-lib';

const ohada = new Ohada({
  vat: 0.18,          // Default VAT rate (18%)
  currency: 'XAF',    // West African CFA Franc
  taxInclusive: false // Prices provided are HT (Hors Taxe)
});
```

## First Journal Entry

Let's record a simple cash sale of products.

```typescript
const journal = ohada.recordSale({
  amount: 250000,
  label: "Sale of 5 Computers",
  vatRate: 18,
  payment: {
    method: 'cash',
    amount: 295000 // Total TTC
  }
});

console.log(journal);
/*
Output: [
  {
    "type": "CONSTATATION",
    "lines": [
      { "account": "4111", "label": "Client - Sale of 5 Computers", "debit": 295000, "credit": 0 },
      { "account": "701", "label": "Vente de marchandises - Sale of 5 Computers", "debit": 0, "credit": 250000 },
      { "account": "4431", "label": "TVA facturée - Sale of 5 Computers", "debit": 0, "credit": 45000 }
    ],
    "isBalanced": true
  },
  {
    "type": "REGLEMENT",
    ... payment lines (Account 5711, 4111)
  }
]
*/
```

### What happens under the hood?

The engine automatically handles:
1. **Account Mapping**: Maps your sale to high-level revenue accounts (e.g., 701).
2. **VAT Calculation**: Generates the correct tax lines (Account 4431).
3. **Double Step**: Records both the invoice (Constatation) and the payment (Règlement).

## Exploring the Demo

Before writing code, we recommend running the **OHADA ERP Engine** demo located in the `demo-vite` directory. It provides a visual interface to see how different business events generate accounting journals.

### Running the Demo locally

1. Clone the repository and navigate to the demo folder.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

The demo will be available at `http://localhost:5173`.

## Next Steps

Now that you're set up, learn how to record different types of business transactions:

- [Recording Sales](./sales.md)
- [Recording Purchases](./purchases.md)
- [Recording Expenses](./expenses.md)
