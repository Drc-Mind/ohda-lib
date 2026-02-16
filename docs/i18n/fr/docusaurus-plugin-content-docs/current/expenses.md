# Recording Expenses

Expenses cover the operational costs of running a business (Class 6 in OHADA), such as electricity, rent, and telecommunications. Unlike purchases of goods, expenses are consumed immediately.

## Basic Expense

Record an operational expense with automatic account resolution.

```typescript
const result = ohada.recordExpense({
  category: 'ELECTRICITY',      // Maps to 6052
  amount: 80000,                // Amount TTC
  label: "Facture Senelec - Janvier",
  vatRate: 18
});
```

## Expense Categories

**Ohada Lib** includes a wide range of pre-mapped categories:

| Category | account | Description |
| :--- | :--- | :--- |
| `ELECTRICITY` | 6052 | Power & Light |
| `WATER` | 6051 | Water distribution |
| `RENT_BUILDING` | 6222 | Office/Warehouse rent |
| `TELECOMMUNICATIONS`| 6281 | Internet & Phone |
| `STATIONERY` | 6041 | Office supplies |

## Detailed VAT Configuration

Operational expenses have complex VAT rules. You can override the default recovery behavior using the `ExpenseVATConfig` object.

```typescript
const result = ohada.recordExpense({
  category: 'RENT_BUILDING',
  amount: 300000,
  label: "Loyer Bureau"
}, {
  recoverable: true,            // Is VAT recoverable?
  type: 'SERVICE'               // Maps to 4454 (Services) or 4452 (Goods)
});
```

## Immediate Settlement

By default, an expense is recorded as a debt to a supplier. To settle it immediately, provide a `payment` object.
## Expected Output

Operational expenses correctly resolve the specific OHADA account and handle VAT recovery rules.

```json
[
  {
    "label": "Expense Recording",
    "lines": [
      { "account": "6052", "label": "Electricité", "debit": 67797, "credit": 0 },
      { "account": "4454", "label": "TVA récupérable sur services", "debit": 12203, "credit": 0 },
      { "account": "4011", "label": "Fournisseurs", "debit": 0, "credit": 80000 }
    ],
    "totals": { "debit": 80000, "credit": 80000 }
  }
]
```

```typescript
const result = ohada.recordExpense({
  category: 'TELECOMMUNICATIONS',
  amount: 25000,
  label: "Orange Internet Bill",
  payment: {
    method: 'cash',
    amount: 25000
  }
});
```

> [!NOTE]
> For expenses, the `payment` amount usually matches the total expense amount for immediate cash/bank settlement.
