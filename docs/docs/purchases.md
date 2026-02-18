# Purchase Management

Record inventory acquisitions and manage supplier debt following the SYSCOHADA "Double Step" rule.

## Core Rules

All purchases of goods (Stock) must follow a two-step process:
1. **Constatation**: Recording the invoice and recognition of debt to the supplier (**Account 4011**).
2. **Règlement**: The actual payment to clear that debt.

*Even if paid in cash immediately, the library ensures the transaction passes through the supplier account for a perfect audit trail.*

## Quick Purchase Example

Recording a stock purchase with immediate cash payment.

```typescript
const journal = ohada.recordPurchase({
  amount: 500000,
  label: "Vendor Stock",
  charges: [{ type: 'Transport', amount: 25000 }],
  vatRate: 18,
  payments: [{ method: 'cash', amount: 619500 }]
});
```

## Advanced Costs

Include ancillary costs often associated with purchases.

### Transport & Customs
Costs like transport and customs are capitalized into the total value of the goods purchased (Account 6015).

```typescript
charges: [
  { type: 'Transport', amount: 50000 },
  { type: 'Douane', amount: 150000 }
]
```

## Account Mapping

| Input | Account Code | Description |
| :--- | :--- | :--- |
| Goods | `6011` | Purchase of Merchandise. |
| Fees | `6015` | Ancillary costs (Transport/Customs). |
| VAT | `4452` | VAT Recoverable on Goods. |
| Supplier | `4011` | Accounts Payable (Trade). |

## Expected Output

The library generates both the invoice recognition (**Constatation**) and the settlement (**Règlement**).

```json
[
  {
    "type": "CONSTATATION",
    "lines": [
      { "account": "6011", "label": "Vendor Stock", "debit": 500000, "credit": 0 },
      { "account": "6015", "label": "Frais (Transport) - Vendor Stock", "debit": 25000, "credit": 0 },
      { "account": "4452", "label": "TVA récupérable - Vendor Stock", "debit": 94500, "credit": 0 },
      { "account": "4011", "label": "Fournisseur - Vendor Stock", "debit": 0, "credit": 619500 }
    ],
    "isBalanced": true
  },
  {
    "type": "REGLEMENT",
    "lines": [
      { "account": "4011", "label": "Paiement Fournisseur (cash) - #Stock", "debit": 619500, "credit": 0 },
      { "account": "5711", "label": "Sortie de trésorerie (cash) - #Stock", "debit": 0, "credit": 619500 }
    ],
    "isBalanced": true
  }
]
```
