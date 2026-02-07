# Recording Purchases

Recording purchases is the core of your accounting flow. Ohada Lib provides multiple ways to record a purchase depending on your needs.

## Simple Purchase

If you just want to record a quick cash purchase by amount, use the simplified signature:

```typescript
const result = ohada.recordPurchase(50000);
```

This will automatically generate journal entries for:
- **Debit 6011** (Goods): 50,000
- **Credit 571** (Cash): 50,000 (via Supplier 4011)

## Detailed Purchase

For more complex scenarios, you can pass a full configuration object.

```typescript
const result = ohada.recordPurchase({
  supplier: "GLOBAL TRADE",
  items: [
    { label: "Rice bag 50kg", quantity: 10, unitPrice: 45000 }
  ],
  payments: [
    { method: "bank", amount: 450000 }
  ],
  additionalCharges: [
    { label: "Transport", amount: 15000 }
  ]
});
```

### Item Types

You can specify the type of items to ensure correct account resolution:
- `GOODS` (default): Maps to 601 accounts.
- `ASSET`: Maps to 24xx accounts (Immobilisations).
- `CONSUMABLE`: Maps to 604 accounts (Fournitures).

## Additional Charges

You can add fees like Transport, Customs, or Handling. The library matches these to the correct OHADA codes (e.g., 6015 for Transport).
