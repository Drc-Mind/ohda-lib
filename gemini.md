# OHADA-Lib Agent Instructions

## 1. Project Overview
OHADA-Lib is a developer-friendly OHADA accounting library that transforms business events into type-safe journal entries, manages stock movements, tracks expenses, and generates compliant financial reports such as the Grand Livre and Trial Balance.

## 2. Development Environment
- Language: TypeScript (ES2022)
- Module Support: CommonJS and ES Modules
- Decimal Precision: `decimal.js`
- Testing Framework: Vitest
- Documentation: JSDoc
- Naming Convention: camelCase
- IDE: Antigravity

## 3. Folder Structure
```

ohada-lib/
├─ src/
│  ├─ core/
│  │   ├─ ohada.ts
│  │   ├─ journal.ts
│  │   ├─ stock.ts
│  │   ├─ expense.ts
│  │   └─ utils.ts
│  ├─ data/
│  │   └─ chartOfAccounts.json
│  ├─ types/
│  │   ├─ index.d.ts
│  │   └─ ohadaTypes.ts
│  └─ config/
│      └─ defaultConfig.ts
├─ tests/
│  ├─ ohada.test.ts
│  ├─ journal.test.ts
│  └─ stock.test.ts
├─ package.json
├─ tsconfig.json
├─ README.md
└─ instructions.md

````

## 4. TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowJs": true,
    "outDir": "./dist",
    "declaration": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
````

## 5. Testing

All tests use Vitest.

```ts
import { describe, it, expect } from "vitest";
import { Ohada } from "../src/core/ohada";

describe("OHADA Lib", () => {
  it("should create a balanced sale journal entry", () => {
    const ohada = new Ohada();
    const journal = ohada.sale({
      customerId: "C001",
      items: [{ sku: "P001", quantity: 1, unitPrice: 100 }],
      payment: { cash: 50, bank: 50 }
    });
    expect(journal.totalDebit).toBe(journal.totalCredit);
  });
});
```

## 6. Decimal & Precision

Use `decimal.js` for all monetary calculations:

```ts
import Decimal from "decimal.js";

const total = new Decimal(0.1).plus(0.2); // precise 0.3
```

## 7. JSDoc & Documentation

Every public function and class should include a JSDoc block:

```ts
/**
 * Record a sale transaction and generate OHADA journal entries.
 *
 * @param {SaleRequest} sale - Sale details including customer, items, and payments.
 * @returns {JournalEntry[]} Array of OHADA-compliant journal entries
 */
sale(sale: SaleRequest): JournalEntry[] { ... }
```

## 8. Importing the Library

```ts
import { Ohada } from "ohada-lib";

const ohada = new Ohada();
```

Use camelCase for instances and method calls: `ohada.sale()`, `ohada.purchase()`, `ohada.expense()`. The library includes the OHADA chart of accounts JSON internally.

## 9. Summary

* Simple and modular folder structure: core, data, types, config, tests.
* Type-safe with TypeScript and decimal.js.
* Testing via Vitest.
* DX-first with autocompletion, JSDoc, and manual overrides.
* Fully OHADA-compliant out-of-the-box with optional developer customization.
