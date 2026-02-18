# Asset Management

Manage long-term investments (fixed assets) following mandatory SYSCOHADA valuation rules.

## Core Principles

### Valuation
The acquisition cost includes:
1. **Net Purchase Price** (Account 24x/22x/21x).
2. **Installation & Transport Costs**.
3. **Dismantling Provisions** (Account 1984).

### The Golden Rule of Investment
In SYSCOHADA, investment debt is managed via account **4812** (Fournisseurs d'investissements) instead of the operational account 4011.

## Asset Acquisition Example

```typescript
const journal = ohada.recordAsset({
  assetName: "Server Dell",
  type: 'COMPUTER_EQUIPMENT',
  amount: 2500000,
  transport: 50000,
  vatRate: 18,
  payment: { method: 'bank', amount: 3009000 }
});
```

## Advanced Features

### Component Splitting
For large assets with components having different useful lives (e.g., an elevator in a building), the library supports splitting the cost into multiple debit lines.

### Dismantling Provision
Automate the recognition of future dismantling or site restoration costs as part of the asset value.

## Expected Output

```json
[
  {
    "type": "CONSTATATION",
    "lines": [
      { "account": "2444", "label": "Server Dell", "debit": 2550000, "credit": 0 },
      { "account": "4451", "label": "TVA récupérable sur achats", "debit": 459000, "credit": 0 },
      { "account": "4812", "label": "Fournisseur d'investissement", "debit": 0, "credit": 3009000 }
    ],
    "isBalanced": true
  },
  {
    "type": "REGLEMENT",
    "lines": [
      { "account": "4812", "debit": 3009000, "credit": 0 },
      { "account": "5211", "debit": 0, "credit": 3009000 }
    ],
    "isBalanced": true
  }
]
```
