---
slug: ohada-lib-v1-stable-release
title: "@drcmind/ohada-lib v1.0.0 — First Stable Release"
authors: [tacite]
tags: [launch, ohada, typescript]
---

We are thrilled to announce the official launch of **@drcmind/ohada-lib v1.0.0 — First Stable Release**, the first developer-first TypeScript library designed for the SYSCOHADA accounting framework.

### The Problem: Accounting is Hard for Developers
Integrating accounting logic into business applications has historically been a nightmare. Developers are forced to become amateur accountants, memorizing account codes like `701`, `601`, and `4431`, and manually balancing debits and credits. This lead to bugs, compliance issues, and slow development cycles.

### The Solution: @drcmind/ohada-lib
**@drcmind/ohada-lib** changes this dynamic. Instead of thinking in accounts, you think in **Business Events**.

Want to record a sale with a discount and immediate bank payment?
```typescript
ohada.recordSale({
  amount: 1000000,
  label: "Large Order",
  financialDiscount: { percentage: 2 },
  payment: { method: 'bank', amount: 1156400 }
});
```

The library handles the rest, generating a fully balanced, SYSCOHADA-compliant journal entry ready for your ledger.

### Key Features at Launch
- **Direct Accounting Verbs**: `recordSale`, `recordPurchase`, `recordExpense`.
- **Smart Adjustments**: Automatic handling of transport, customs, and escomptes.
- **Multi-Locale Support**: English and French out of the box.
- **Type-Safe API**: Never guess what an input should look like again.

### What's Next?
We are actively working on expanding the library to support inventory management, payroll modules, and automated tax reporting.

Explore the [documentation](/docs/intro) to get started today!
