# Sales Management

Record revenue and collected VAT while maintaining a compliant audit trail. **Ohada Lib** handles sale recognition following SYSCOHADA standards, including commercial and financial adjustments.

## The Sale Lifecycle

In SYSCOHADA, a sale is recorded in two steps:
1. **Constatation**: Recording the invoice and client claim (**Account 4111**).
2. **Règlement**: Recording the payment receipt to settle the claim.

`@drcmind/ohada-lib` handles this by returning an array of balanced journal entries.

## Quick Sale Example

A simple sale of goods with immediate bank payment.

```typescript
const journal = ohada.recordSale({
  amount: 1000000,
  label: "Large Order #42",
  saleType: 'GOODS',
  vatRate: 18,
  payment: {
    method: 'bank',
    amount: 1180000 // Total TTC (1M + 18%)
  }
});
```

## Advanced Features

### Financial Discounts (Escomptes)
If you grant a discount for early payment, use the `financialDiscount` field. The library correctly records the financial expense (Account 673).

```typescript
financialDiscount: { percentage: 2 } // 2% discount
```

### Transport & Packaging
Include transport charges (Revenue for you, account 7071) and packaging deposits (Liabilities, account 4194).

```typescript
transportCharge: { amount: 25000 },
packagingDeposit: { amount: 5000 }
```

### Inventory Exit (COGS)
To maintain accurate stock levels, you can trigger an inventory exit (6031/311) alongside the sale.

```typescript
inventoryExit: { costPrice: 800000 }
```

## Account Mapping

| Input | Account Code | Description |
| :--- | :--- | :--- |
| Revenue | `701/702/706` | Sales of Goods, Manufactured products, or Services. |
| VAT | `4431` | VAT Collected. |
| Client | `4111` | Client Claims. |
| Discount | `673` | Financial Expenses (Discounts granted). |

## Expected Output

For a sale with immediate payment, the library generates two entries: the invoice recognition and the treasury entry.

```json
[
  {
    "type": "CONSTATATION",
    "lines": [
      { "account": "4111", "label": "Client - Large Order #42", "debit": 1180000, "credit": 0 },
      { "account": "701", "label": "Vente de marchandises - #42", "debit": 0, "credit": 1000000 },
      { "account": "4431", "label": "TVA facturée - #42", "debit": 0, "credit": 180000 }
    ],
    "isBalanced": true
  },
  {
    "type": "REGLEMENT",
    "lines": [
      { "account": "5211", "label": "Entrée de trésorerie (bank) - #42", "debit": 1180000, "credit": 0 },
      { "account": "4111", "label": "Règlement reçu (bank) - #42", "debit": 0, "credit": 1180000 }
    ],
    "isBalanced": true
  }
]
```
