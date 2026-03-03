# Sales & Revenue Management

Record sales revenue, manage customer receivables, and track inventory exits following SYSCOHADA standards. Handle complex scenarios including financial discounts, transport charges, packaging deposits, and split payments.

## The Sales Lifecycle

In SYSCOHADA, a sale is recorded in up to three steps:

1. **Constatation** — Record the invoice and customer claim/receivable (Account **4111**).
2. **Sortie de Stock** *(optional)* — Record the cost of goods sold (Account **6031** / **311**).
3. **Réglement** — Record payment(s) received to settle the receivable.

Each step is a separate balanced journal entry for clear audit trail.

## Quick Examples

### Simple Sale on Credit

```typescript
const journal = ohada.recordSale({
  amount: 100000,
  label: "Marchandises",
  saleType: 'GOODS',
  vatRate: 18
});
```

**Result**: 1 entry (Constatation only)

### Sale with Immediate Payment

```typescript
const journal = ohada.recordSale({
  amount: 100000,
  label: "Vente comptant",
  saleType: 'GOODS',
  vatRate: 18,
  payments: [{ method: 'cash', amount: 118000 }]
});
```

**Result**: 2 entries (Constatation + Réglement)

---

## Type Reference

### `SaleInput`

```typescript
interface SaleInput {
  // Required
  amount: number;                // Sale amount (ex-VAT), in currency units
  label: string;                 // Description (e.g., "Vente marchandises")
  saleType: SaleType;            // 'GOODS' | 'MANUFACTURED' | 'SERVICES'

  // Optional
  date?: Date;                   // Transaction date (default: now)
  vatRate?: number;              // VAT rate in % (default: 18)
  
  // Advanced Options
  financialDiscount?: FinancialDiscount;   // Escompte (recorded as expense)
  packagingDeposit?: PackagingDeposit;     // Consignation (no VAT)
  transportCharge?: TransportCharge;       // Port facturé (7071)
  inventoryExit?: InventoryExit;           // Stock exit (cost of goods sold)
  payments?: SalePayment[];                // One or more payment entries
}
```

### `SaleType`

```typescript
type SaleType = 'GOODS' | 'MANUFACTURED' | 'SERVICES';
```

### `SalePayment`

```typescript
interface SalePayment {
  method: 'cash' | 'bank';  // Payment method
  amount: number;           // Amount received
}
```

### `FinancialDiscount`

```typescript
interface FinancialDiscount {
  percentage: number;  // e.g., 2 for 2% discount (recorded as expense 673)
}
```

### `TransportCharge`

```typescript
interface TransportCharge {
  amount: number;        // Transport amount (added to taxable base)
  description?: string;
}
```

### `PackagingDeposit`

```typescript
interface PackagingDeposit {
  amount: number;        // Deposit amount (NOT subject to VAT)
  description?: string;
}
```

### `InventoryExit`

```typescript
interface InventoryExit {
  costPrice: number;  // Cost of goods sold (CMUP - weighted average cost)
}
```

---

## Core Features

### Revenue Classification

Revenue is automatically mapped to the correct SYSCOHADA account based on sale type:

| Sale Type | Account | Description |
| :--- | :--- | :--- |
| `GOODS` | `701` | Sale of merchandise. |
| `MANUFACTURED` | `702` | Sale of manufactured products. |
| `SERVICES` | `706` | Service revenue. |

```typescript
const goodsSale = ohada.recordSale({
  amount: 50000,
  label: "Stock Sale",
  saleType: 'GOODS'
});

const serviceSale = ohada.recordSale({
  amount: 25000,
  label: "Consulting",
  saleType: 'SERVICES'
});
```

---

### Transport & Packaging

Include delivery charges and deposit amounts in your invoices.

```typescript
const journal = ohada.recordSale({
  amount: 100000,
  label: "Vente avec frais",
  saleType: 'GOODS',
  vatRate: 18,
  transportCharge: { amount: 5000 },
  packagingDeposit: { amount: 1000 }
});
```

**Key Points**:
- **Transport** (5,000) is added to the taxable base → VAT is calculated on 105,000
- **Packaging Deposit** (1,000) is a liability → NOT subject to VAT

---

### Financial Discount (Escompte)

Record discounts for early payment as an expense (Account **673**).

```typescript
const journal = ohada.recordSale({
  amount: 100000,
  label: "Vente avec escompte",
  saleType: 'GOODS',
  vatRate: 18,
  financialDiscount: { percentage: 2 }  // 2% = 2,000
});
```

**Generated Entry**:
- D 4111: 116,360 (Customer receivable = 100,000 - 2,000 + 18% VAT)
- D 673: 2,000 (Financial charge - escompte accordé)
- C 701: 100,000 (Revenue)
- C 4431: 18,360 (VAT on 102,000)

---

### Inventory Exit (Cost of Goods Sold)

Automatically record stock reduction when goods are sold.

```typescript
const journal = ohada.recordSale({
  amount: 100000,
  label: "Vente marchandises",
  saleType: 'GOODS',
  inventoryExit: { costPrice: 65000 }
});
```

**Generated Entries**:
1. **Constatation** — Invoice (4111/701)
2. **Sortie de Stock** — Cost of goods:
   - D 6031: 65,000 (Cost of Sales)
   - C 311: 65,000 (Stock reduction)

---

### Multi-Step Payments (Split Payments)

Receive payment in multiple installments across different methods.

```typescript
const journal = ohada.recordSale({
  amount: 100000,
  label: "Vente split payment",
  saleType: 'GOODS',
  vatRate: 18,
  payments: [
    { method: 'cash', amount: 59000 },
    { method: 'bank', amount: 59000 }
  ]
});
```

**Generated Entries**:
1. Constatation (invoice)
2. Réglement #1 (cash, -59,000)
3. Réglement #2 (bank, -59,000)

Each payment is a separate entry for clear tracking.

---

### Credit Notes (Negative Sales/Returns)

Record returns by using a negative amount.

```typescript
const journal = ohada.recordSale({
  amount: -50000,
  label: "Retour produit défectueux",
  saleType: 'GOODS',
  vatRate: 18
});
```

This generates a credit note with reversed amounts (debits become credits and vice versa).

---

## Account Mapping

| Feature | Account | Description |
| :--- | :--- | :--- |
| **Sale of Goods** | **`701`** | **Merchandise sales.** |
| **Mfg Products** | **`702`** | **Manufactured goods.** |
| **Services** | **`706`** | **Service revenue.** |
| Transport Revenue | `7071` | Transport/freight charged to customer. |
| VAT Collected | `4431` | VAT on sales (tax liability). |
| Financial Discount | `673` | Discounts accorded (escompte). |
| Customer Receivable | `4111` | Accounts receivable. |
| Packaging Deposit | `4194` | Customer deposits (liability). |
| Cost of Sales | `6031` | Cost of goods sold. |
| Stock | `311` | Merchandise inventory. |
| Cash Account | `5711` | Cash on hand. |
| Bank Account | `5211` | Bank deposits. |

---

## Full Example: Complex Sale

A realistic sale including transport, packaging, discount, inventory exit, and split payment:

```typescript
const journal = ohada.recordSale({
  amount: 1000000,
  label: "Vente - Commande #X2026",
  date: new Date('2026-01-15'),
  saleType: 'GOODS',
  vatRate: 18,
  
  // Ancillary costs
  transportCharge: { amount: 50000 },
  packagingDeposit: { amount: 10000 },
  
  // Early payment discount
  financialDiscount: { percentage: 2 },
  
  // Track standard cost of goods
  inventoryExit: { costPrice: 650000 },
  
  // Receive split payment
  payments: [
    { method: 'bank', amount: 588000 },
    { method: 'cash', amount: 588000 }
  ]
});
```

**Generated Journal Entries** (4 total):

| # | Type | Account | Debit | Credit | Description |
|:---|:---|:---|---:|---:|:---|
| 1 | Constatation | 4111 | 1,175,600 | | Total receivable |
| 1 | Constatation | 673 | 20,000 | | Early payment discount (2%) |
| 1 | Constatation | 701 | | 1,000,000 | Revenue |
| 1 | Constatation | 7071 | | 50,000 | Transport revenue |
| 1 | Constatation | 4431 | | 189,000 | VAT (18% on 1,050,000) |
| 1 | Constatation | 4194 | | 10,000 | Packaging deposit |
| 2 | Sortie Stock | 6031 | 650,000 | | Cost of goods sold |
| 2 | Sortie Stock | 311 | | 650,000 | Stock reduction |
| 3 | Réglement | 5211 | 588,000 | | Bank in |
| 3 | Réglement | 4111 | | 588,000 | Reduce receivable |
| 4 | Réglement | 5711 | 588,000 | | Cash in |
| 4 | Réglement | 4111 | | 588,000 | Reduce receivable |

---

## Key Rules

✓ **Revenue classification** — Automatic mapping based on sale type (GOODS/MANUFACTURED/SERVICES).

✓ **Taxable base** — Transport is included; packaging deposit is excluded from VAT.

✓ **Financial discount** — Recorded as expense (673), reduces customer receivable.

✓ **Inventory tracking** — Separate entry for cost of goods sold if provided.

✓ **Split payments** — Each payment is its own entry for audit trail clarity.

✓ **Audit trail** — All transaction phases are separate entries with full traceability.

---

## Parameter Reference

| Parameter | Type | Required | Example | Notes |
|:---|:---|:---|:---|:---|
| `amount` | `number` | Yes | `100000` | Sale amount (ex-VAT). |
| `label` | `string` | Yes | `"Vente marchandises"` | Transaction description. |
| `saleType` | `SaleType` | Yes | `'GOODS'` | Determines revenue account (701/702/706). |
| `date` | `Date` | No | `new Date()` | Defaults to now. |
| `vatRate` | `number` | No | `18` | VAT % (default: 18, ignored if `disableVAT: true`). |
| `financialDiscount` | `FinancialDiscount` | No | `{percentage: 2}` | Early payment discount (expense 673). |
| `transportCharge` | `TransportCharge` | No | `{amount: 5000}` | Included in taxable base. |
| `packagingDeposit` | `PackagingDeposit` | No | `{amount: 1000}` | Excluded from VAT. |
| `inventoryExit` | `InventoryExit` | No | `{costPrice: 65000}` | Generates separate stock exit entry. |
| `payments` | `SalePayment[]` | No | `[{method: 'bank', amount: 100000}]` | One or more payments; each generates separate entry. |
