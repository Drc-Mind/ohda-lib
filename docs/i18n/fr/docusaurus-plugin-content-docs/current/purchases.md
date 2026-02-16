# Recording Purchases

Purchases of goods and raw materials are recorded following the SYSCOHADA "Invoice then Payment" rule. **Ohada Lib** simplifies this by allowing you to record the acquisition and its settlement in a single call.

## Basic Purchase

A simple purchase records the stock entry and the supplier debt.

```typescript
const result = ohada.recordPurchase({
  amount: 500000,
  label: "Achat de marchandises - Facture Fournisseur #X",
  vatRate: 18
});
```

## Additional Acquisition Costs

Purchases often involve fees like transport or customs that must be incorporated into the acquisition cost of the goods.

```typescript
const result = ohada.recordPurchase({
  amount: 1000000,
  label: "Importation Marchandises",
  charges: [
    { type: 'Transport', amount: 50000 },
    { type: 'Douane', amount: 150000 },
    { type: 'Divers', amount: 10000 }
  ]
});
```

## Complex Multi-Payment

In many ERP scenarios, a purchase is settled using multiple payment methods or in several installments. The `payments` array handles this complexity by generating a settlement entry for each item.

```typescript
const result = ohada.recordPurchase({
  amount: 2000000,
  label: "Major Purchase with Split Payment",
  payments: [
    { method: 'bank', amount: 1000000 }, // Partial bank transfer
    { method: 'cash', amount: 500000 }    // Partial cash payment
    // Remaining 500k stays as debt in Account 4011
  ]
});
```

## Expected Output

For a purchase involving multiple payments, the library generates both the invoice recognition and the settlement entries.

```json
[
  {
    "label": "Invoice Recognition",
    "lines": [
      { "account": "6011", "label": "Achat de marchandises", "debit": 1000000, "credit": 0 },
      { "account": "4452", "label": "Etat, TVA récupérable", "debit": 180000, "credit": 0 },
      { "account": "4011", "label": "Fournisseurs", "debit": 0, "credit": 1180000 }
    ]
  },
  {
    "label": "Settlement Layer",
    "lines": [
      { "account": "4011", "label": "Fournisseurs", "debit": 500000, "credit": 0 },
      { "account": "521", "label": "Banque", "debit": 0, "credit": 500000 }
    ]
  }
]
```

## How it works (The Audit Trail)

When you record a purchase with charges and payments, **Ohada Lib** generates two distinct layers of journal entries:

1. **Recognition**: Debits the goods (601) and VAT (4452), and credits the Supplier (4011).
2. **Settlement**: For each payment provided, it debits the Supplier (4011) and credits the corresponding treasury account (Bank/Cash).

This behavior ensures full compliance with the [OHADA "Golden Rules"](./ohada-rules.md).
