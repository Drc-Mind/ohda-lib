# Expense Management

Record operating costs (utilities, rent, honoraires, etc.) using semantic categories. **Ohada Lib** automatically maps each category to the correct SYSCOHADA account and generates balanced journal entries following the **debt recognition principle** (Account 4011).

---

## Types Reference

### `ExpenseInput`

```typescript
interface ExpenseInput {
  category: ExpenseCategory;   // Semantic expense category (see table below)
  amount: number;              // Amount before VAT (HT)
  label: string;               // Description for journal entry labels
  date?: Date;                 // Entry date (defaults to today)

  // VAT handling (pick one — manual takes precedence)
  vatAmount?: number;          // Exact VAT amount
  vatRate?: number;            // VAT rate in percent (e.g. 18 for 18%)

  // Optional payment entries (one per payment method)
  payments?: ExpensePayment[];
}
```

### `ExpensePayment`

```typescript
interface ExpensePayment {
  method: 'cash' | 'bank';   // Payment method
  amount: number;             // Amount paid (TTC)
}
```

### `ExpenseVATConfig`

```typescript
interface ExpenseVATConfig {
  defaultVATRate?: number;      // Default VAT rate applied to all expenses
  vatOnExpenses?: boolean;      // Enable/disable VAT globally (default: false)
  serviceVATAccount?: string;   // Override VAT account for services (default: 4454)
  goodsVATAccount?: string;     // Override VAT account for goods (default: 4452)
}
```

---

## Account Mapping

| Category | Account | Description |
| :--- | :---: | :--- |
| `WATER` | `6051` | Water |
| `ELECTRICITY` | `6052` | Electricity |
| `GAS` | `6053` | Gas |
| `OFFICE_SUPPLIES` | `604` | Office supplies & consumables |
| `FUEL` | `6042` | Fuel & combustibles |
| `SMALL_EQUIPMENT` | `6056` | Small tools & equipment |
| `RENT` | `611` | Rental charges |
| `MAINTENANCE_REPAIRS` | `613` | Maintenance & repairs |
| `INSURANCE` | `615` | Insurance premiums |
| `RESEARCH_DOCUMENTATION` | `616` | Research & documentation |
| `HONORAIRES` | `622` | Professional fees (lawyers, auditors) |
| `TRANSPORT` | `624` | Transport & courier |
| `TRAVEL_RECEPTION` | `625` | Travel & business entertainment |
| `BANK_SERVICES` | `627` | Bank charges & fees |
| `TELECOMMUNICATIONS` | `628` | Phone & internet |
| `ADVERTISING` | `6271` | Advertising & promotion |
| `SOFTWARE_LICENSE` | `6343` | Software licenses |
| `PERSONNEL_CHARGES` | `64` | Salaries & payroll charges |
| `MISC_MANAGEMENT_CHARGES` | `658` | Miscellaneous management charges |
| `BUSINESS_LICENSE` | `6412` | Business license (patente) |
| `PROPERTY_TAX` | `6411` | Property tax |
| `PAYROLL_TAX` | `6413` | Payroll taxes |
| `REGISTRATION_FEES` | `6461` | Registration & transfer fees |
| `STAMP_DUTY` | `6462` | Stamp duty |
| `VEHICLE_TAX` | `6463` | Vehicle tax |

**VAT accounts**: services → `4454`, goods → `4452`

---

## Usage

### Basic Expense (no payment yet)

Records the liability. A second payment entry can be added later when settlement occurs.

```typescript
const ohada = new Ohada({ disableVAT: true });

const entries = ohada.recordExpense({
  category: 'ELECTRICITY',
  amount: 50000,
  label: "Facture ENEO Janvier"
});
// Returns 1 entry: CONSTATATION (628 debit / 4011 credit)
```

### With VAT — manual amount

```typescript
const ohada = new Ohada({ disableVAT: false });

const entries = ohada.recordExpense(
  {
    category: 'HONORAIRES',
    amount: 200000,
    label: "Honoraires Avocat",
    vatAmount: 36000,
    payments: [{ method: 'bank', amount: 236000 }]
  },
  { vatOnExpenses: true }
);
// Entry 1 — CONSTATATION: 622 debit 200 000, 4454 debit 36 000, 4011 credit 236 000
// Entry 2 — REGLEMENT:    4011 debit 236 000, 5211 credit 236 000
```

### With VAT — calculated from rate

```typescript
const entries = ohada.recordExpense(
  {
    category: 'TELECOMMUNICATIONS',
    amount: 80000,
    label: "Abonnement fibre",
    vatRate: 18,                                      // 18% → VAT = 14 400
    payments: [{ method: 'cash', amount: 94400 }]
  },
  { vatOnExpenses: true }
);
// Total TTC: 94 400
// Entry 1 — CONSTATATION: 628 debit 80 000, 4454 debit 14 400, 4011 credit 94 400
// Entry 2 — REGLEMENT:    4011 debit 94 400, 5711 credit 94 400
```

### Split Payment (multiple methods)

```typescript
const entries = ohada.recordExpense({
  category: 'OFFICE_SUPPLIES',
  amount: 25000,
  label: "Fournitures bureau",
  vatRate: 18,
  payments: [
    { method: 'cash', amount: 14750 },
    { method: 'bank', amount: 14750 }
  ]
});
// Returns 3 entries:
//   Entry 1 — CONSTATATION: 604 debit 25 000, 4452 debit 4 500 / 4011 credit 29 500
//   Entry 2 — REGLEMENT:    4011 debit 14 750 / 5711 credit 14 750 (cash)
//   Entry 3 — REGLEMENT:    4011 debit 14 750 / 5211 credit 14 750 (bank)
```

### Global VAT Configuration

Apply a default VAT rate to all expenses without specifying it per entry:

```typescript
const entries = ohada.recordExpense(
  {
    category: 'RENT',
    amount: 150000,
    label: "Loyer Février"
  },
  { defaultVATRate: 18, vatOnExpenses: true }
);
// VAT auto-calculated: 150 000 × 18% = 27 000
// Entry 1 — CONSTATATION: 611 debit 150 000, 4454 debit 27 000 / 4011 credit 177 000
```

---

## Direct Expense Mode

For minor cash expenses that don't require a supplier invoice step (e.g., petty cash purchases), enable `directMode` in `Ohada` config. This collapses the two-entry flow into **one single entry** that credits cash or bank directly.

```typescript
const ohada = new Ohada({ directMode: true });

const entries = ohada.recordExpense({
  category: 'OFFICE_SUPPLIES',
  amount: 5000,
  label: "Stylos et cahiers",
  payments: [{ method: 'cash', amount: 5000 }]
});

// Returns 1 entry — REGLEMENT:
//   604  debit  5 000
//   5711 credit 5 000  (cash, inferred from payments[0].method)
```

:::tip
`directMode` reads `payments[0].method` to determine which account to credit (`5711` cash or `5211` bank). If no payment is provided, it defaults to cash.
:::

---

## Parameter Reference

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `category` | `ExpenseCategory` | ✓ | Expense category (maps to SYSCOHADA account) |
| `amount` | `number` | ✓ | Amount before VAT (HT) |
| `label` | `string` | ✓ | Journal entry description |
| `date` | `Date` | — | Entry date (defaults to today) |
| `vatAmount` | `number` | — | Manual VAT amount (overrides `vatRate`) |
| `vatRate` | `number` | — | VAT rate in percent for auto-calculation |
| `payments` | `ExpensePayment[]` | — | One or more payment entries |
