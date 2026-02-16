# Getting Started

Learn how to install and set up **Ohada Lib** in your project, or explore the library using our pre-built demo.

## Installation

Install the core library using your preferred package manager:

```bash
npm install ohada-lib
# or
yarn add ohada-lib
```

## Basic Setup

Initialize the `Ohada` engine with your global configuration.

```typescript
import { Ohada } from 'ohada-lib';

const ohada = new Ohada({
  locale: 'fr',        // 'fr' (default) or 'en'
  // Global defaults (can be overridden per transaction)
  vat: 18,             // Default VAT rate percentage
  taxInclusive: true   // Input prices are Gross (TTC) by default
});
```

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
