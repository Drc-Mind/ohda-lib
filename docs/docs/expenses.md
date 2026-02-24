# Expense Management

Manage operating costs like rent, electricity, and materials. **Ohada Lib** automatically maps 20+ expense categories to the correct SYSCOHADA accounts.

## Dynamic Mapping

Instead of looking up account codes, you use natural categories:

```typescript
const journal = ohada.recordExpense({
  category: 'OFFICE_SUPPLIES',  // Auto-maps to 604
  amount: 80000,
  label: "Office Materials",
  payment: { method: 'bank', amount: 94400 }
});
```

## Direct Expense Mode (Express)

For minor expenses that don't require an invoice step, you can enable `directExpense` in your global configuration. This records the expense directly against the cash or bank account in a single entry.

## Account Mapping

| Category | Account | Description |
| :--- | :--- | :--- |
| `ELECTRICITY` | `6052` | Energy & Fluid. |
| `RENT` | `622` | Rental charges. |
| `OFFICE_SUPPLIES` | `604` | Non-stock materials. |
| `TRAVEL` | `627` | Transport & Mission. |

## Expected Output

By default, even expenses follow the debt recognition principle (Account 4011) unless `directExpense` is enabled.

```json
[
  {
    "type": "CONSTATATION",
    "lines": [
      { "account": "604", "label": "Office Materials", "debit": 80000, "credit": 0 },
      { "account": "4011", "label": "Fournisseur", "debit": 0, "credit": 80000 }
    ],
    "isBalanced": true
  },
  {
    "type": "REGLEMENT",
    "lines": [
      { "account": "4011", "debit": 94400, "credit": 0 },
      { "account": "5211", "debit": 0, "credit": 94400 }
    ],
    "isBalanced": true
  }
]
```
