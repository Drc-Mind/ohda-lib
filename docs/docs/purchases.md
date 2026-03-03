# Purchase & Stock Management

Record inventory acquisitions, manage supplier debt, and automate stock variation following SYSCOHADA accounting rules. Every purchase generates automatic stock entries to maintain accurate inventory tracking.

## The Purchase Cycle

In SYSCOHADA, a purchase transaction follows a four-step process:

1. **Constatation** — Record the invoice and supplier debt (Account **4011**).
2. **Reduction** *(optional)* — Record any discounts received (RRR obtenus, Account **6019**).
3. **Réglement** — Record payment(s) to settle the debt.
4. **Stock Variation** — Auto-record inventory increase (Account **31** → **6031**).

Each step is a separate balanced journal entry for perfect audit trail compliance.

## Quick Examples

### Simple Purchase on Credit

```typescript
const journal = ohada.recordPurchase({
  amount: 100000,
  label: "Marchandises",
  vatRate: 18
});
```

**Result**: 2 entries (Constatation + Stock Variation)

### Purchase with Immediate Payment

```typescript
const journal = ohada.recordPurchase({
  amount: 100000,
  label: "Bureau Table",
  payments: [{ method: 'cash', amount: 100000 }]
});
```

**Result**: 3 entries (Constatation + Réglement + Stock Variation)

---

## Type Reference

### `PurchaseInput`

```typescript
interface PurchaseInput {
  // Required
  amount: number;           // Purchase amount (ex-VAT), in currency units
  label: string;            // Description (e.g., "Marchandises")

  // Optional
  date?: Date;              // Transaction date (default: now)
  vatRate?: number;         // VAT rate in % (default: 18)
  charges?: PurchaseCharge[];      // Transport, Customs, etc.
  payments?: PurchasePayment[];    // One or more payment methods
  reduction?: number;       // Discount amount received (RRR obtenus)
  stockEntry?: StockEntry;  // Custom stock account (default: '31')
}
```

### `PurchaseCharge`

```typescript
interface PurchaseCharge {
  type: 'Transport' | 'Douane' | 'Divers';
  amount: number;  // Added to stock value & VAT base
}
```

### `PurchasePayment`

```typescript
interface PurchasePayment {
  method: 'cash' | 'bank';  // Payment method
  amount: number;           // Amount paid
}
```

### `StockEntry`

```typescript
interface StockEntry {
  stockAccount?: string;  // Custom stock account (default: '31')
}
```

---

## Core Features

### Purchase with Transport & Customs

Include ancillary costs that increase inventory value.

```typescript
const journal = ohada.recordPurchase({
  amount: 100000,
  label: "Marchandises A",
  charges: [
    { type: 'Transport', amount: 5000 },
    { type: 'Douane', amount: 2000 }
  ],
  vatRate: 18
});
```

**Key Point**: Stock Variation includes charges → Stock increases by `100000 + 5000 + 2000 = 107000`

---

### Reduction (RRR Obtenus)

Record supplier discounts automatically with correct VAT treatment.

#### Without VAT

```typescript
const journal = ohada.recordPurchase({
  amount: 100000,
  label: "Marchandises",
  reduction: 20000
});
```

**Generated Entries**:
- Constatation (debt 100,000)
- **Reduction**: D 4011 / C 6019 for 20,000
- Stock Variation (31/6031 for 100,000)

#### With VAT (Automatic VAT Reversal)

```typescript
const journal = ohada.recordPurchase({
  amount: 100000,
  label: "Marchandises",
  vatRate: 18,
  reduction: 10000
});
```

**Generated Reduction Entry**:
- D 4011: **11,800** (10,000 base + 1,800 VAT)
- C 6019: **10,000** (RRR base)
- C 4451: **1,800** (VAT reversal — tax is reversed on discounted amounts)

The VAT is automatically calculated and reversed because you don't pay tax on amounts you don't receive.

---

### Multi-Step Payments

Split payments across cash and bank accounts.

```typescript
const journal = ohada.recordPurchase({
  amount: 100000,
  label: "Marchandises",
  payments: [
    { method: 'cash', amount: 50000 },
    { method: 'bank', amount: 50000 }
  ]
});
```

**Entry Order**:
1. Constatation (debt 100,000)
2. Réglement #1 (cash, -50,000)
3. Réglement #2 (bank, -50,000)
4. Stock Variation

Each payment is a separate entry for clear audit trail.

---

### Custom Stock Account

Use a different stock account (default is **31**).

```typescript
const journal = ohada.recordPurchase({
  amount: 100000,
  label: "Raw Materials",
  stockEntry: {
    stockAccount: '312'
  }
});
```

---

## Account Mapping

| Feature | Account | Description |
| :--- | :--- | :--- |
| Goods Purchase | `6011` | Purchase of merchandise. |
| Charges | `6015` | Transport, customs, ancillary costs. |
| VAT Recoverable | `4452` | VAT on purchases (deductible). |
| Supplier Debt | `4011` | Accounts payable (operating). |
| **RRR Received** | **`6019`** | **Rebates/discounts obtained.** |
| **VAT on Credit Notes** | **`4451`** | **VAT reversal on discounts.** |
| **Stock (Inventory)** | **`31`** | **Goods in store.** |
| **Stock Variation** | **`6031`** | **Cost of goods sold/variation.** |
| Cash Account | `5711` | Cash on hand. |
| Bank Account | `5211` | Bank transfers. |

---

## Full Example: Complete Purchase Workflow

A realistic purchase with transport, reduction, and split payment:

```typescript
const journal = ohada.recordPurchase({
  amount: 1000000,
  label: "Achat - Fourniture Bureau",
  date: new Date('2026-01-15'),
  vatRate: 18,
  charges: [
    { type: 'Transport', amount: 50000 },
    { type: 'Douane', amount: 30000 }
  ],
  reduction: 100000,
  payments: [
    { method: 'bank', amount: 450000 },
    { method: 'cash', amount: 450000 }
  ]
});
```

**Generated Journal Entries** (5 total):

| # | Type | Account | Debit | Credit | Description |
|:---|:---|:---|---:|---:|:---|
| 1 | Constatation | 6011 | 1,000,000 | | Goods purchase |
| 1 | Constatation | 6015 | 80,000 | | Transport + Customs |
| 1 | Constatation | 4452 | 194,400 | | VAT (18% on 1,080,000) |
| 1 | Constatation | 4011 | | 1,274,400 | Total TTC debt |
| 2 | Reduction | 4011 | 118,000 | | Reduce debt by reduction + VAT |
| 2 | Reduction | 6019 | | 100,000 | RRR base |
| 2 | Reduction | 4451 | | 18,000 | VAT reversal |
| 3 | Réglement | 4011 | 412,200 | | Bank payment |
| 3 | Réglement | 5211 | | 412,200 | Bank out |
| 4 | Réglement | 4011 | 412,200 | | Cash payment |
| 4 | Réglement | 5711 | | 412,200 | Cash out |
| 5 | Stock Var. | 31 | 1,080,000 | | Cost: 1,000,000 + 80,000 charges |
| 5 | Stock Var. | 6031 | | 1,080,000 | Stock increase |

---

## Key Rules

✓ **Automatic stock variation** — Every purchase triggers a stock entry (31/6031).

✓ **Charges included** — Transport and customs costs are capitalized into stock value.

✓ **VAT reversal on discounts** — Reduction amounts automatically reverse proportional VAT.

✓ **Overpayment protection** — Total payments cannot exceed net amount due after reduction.

✓ **Separate entries** — Each phase (Constatation, Reduction, Payment, Stock) is a distinct entry for audit trail.

---

## Parameter Reference

| Parameter | Type | Required | Example | Notes |
|:---|:---|:---|:---|:---|
| `amount` | `number` | Yes | `100000` | Base purchase (ex-VAT). |
| `label` | `string` | Yes | `"Marchandises"` | Transaction description. |
| `date` | `Date` | No | `new Date()` | Defaults to now. |
| `vatRate` | `number` | No | `18` | VAT % (default: 18, ignored if `disableVAT: true`). |
| `charges` | `PurchaseCharge[]` | No | `[{type: 'Transport', amount: 5000}]` | Ancillary costs, added to stock and VAT base. |
| `payments` | `PurchasePayment[]` | No | `[{method: 'bank', amount: 100000}]` | One or more payment entries. |
| `reduction` | `number` | No | `20000` | Discount amount; triggers VAT reversal if enabled. |
| `stockEntry` | `StockEntry` | No | `{stockAccount: '312'}` | Custom stock account (default: `'31'`). |
