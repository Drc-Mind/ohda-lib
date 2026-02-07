# Getting Started

Learn how to install and set up Ohada Lib in your project.

## Installation

Install the library using npm or yarn:

```bash
npm install ohada-lib
# or
yarn add ohada-lib
```

## Basic Setup

Import the `Ohada` class and initialize it with your configuration.

```typescript
import { Ohada } from 'ohada-lib';

const ohada = new Ohada({
  vat: 0.18,          // Default VAT rate
  taxInclusive: true, // Input prices include VAT
  locale: 'fr'        // Label language ('fr' or 'en')
});
```

## First Steps

Ready to record your first transaction? Head over to the [Purchases](./core-concepts) section to see how it works.
