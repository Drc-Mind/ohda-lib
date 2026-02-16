# Recording Sales

Sales represent the primary revenue stream of a business. **Ohada Lib** handles sale recognition following SYSCOHADA standards, including commercial and financial adjustments.

## Basic Sale

A simple sale records the revenue and the client's debt.

```typescript
const result = ohada.recordSale({
  saleType: 'GOODS',            // 'GOODS' (701), 'MANUFACTURED' (702), or 'SERVICES' (706)
  amount: 1000000,              // Net commercial amount
  label: "Vente de marchandises - Facture #001",
  vatRate: 18                   // Optional, defaults to configuration
});
```

## Advanced Adjustments

The library supports various real-world scenarios through the `SaleInput` interface.

### Financial Discounts (Escompte)
If you grant a discount for early payment, use the `financialDiscount` property. This is recorded as an expense for the business (account 673).

```typescript
financialDiscount: { percentage: 2 } // 2% discount
```

### Transport & Packaging
You can record transport costs billed to the client and security deposits for packaging (Consignation).

```typescript
transportCharge: { amount: 25000 },
packagingDeposit: { amount: 5000 }
```

### Inventory Exit (COGS)
To maintain accurate stock levels and recognize the Cost of Goods Sold (COGS), you can trigger an inventory exit alongside the sale.

```typescript
inventoryExit: { costPrice: 650000 } // CMUP (Average Weighted Cost)
```

## Immediate Payment (Settlement)

If the sale is settled immediately, providing the payment method will generate the secondary accounting entry to clear the client's debt.

```typescript
payment: {
  method: 'bank', // 'bank' or 'cash'
  amount: 1180000 // Total TTC
}
```

## Complete Example

```typescript
const journal = ohada.recordSale({
  saleType: 'GOODS',
  amount: 1000000,
  label: "Large delivery to Client X",
  vatRate: 18,
  financialDiscount: { percentage: 2 },
  transportCharge: { amount: 50000 },
  inventoryExit: { costPrice: 700000 },
  payment: {
    method: 'bank',
    amount: 1215400 // Net to pay + Transport - Discount + VAT
  }
});

## Expected Output

When you record a sale, the engine returns an array of accounting layers. Below is what the output looks like for a basic sale of 1M FCFA with 18% VAT.

```json
[
  {
    "lines": [
      { "account": "4111", "label": "Clients", "debit": 1180000, "credit": 0 },
      { "account": "7011", "label": "Ventes de marchandises", "debit": 0, "credit": 1000000 },
      { "account": "4431", "label": "Etat, TVA facturée", "debit": 0, "credit": 180000 }
    ],
    "totals": { "debit": 1180000, "credit": 1180000 }
  }
]
```
```
