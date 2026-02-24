# API Reference

Complete reference for the `@drcmind/ohada-lib` main API.

## `Ohada` Class

The main entry point for the library. It orchestrates all accounting operations.

### `constructor(config: OhadaConfig)`

Initializes the engine with global settings. See [Configuration](./config.md) for details.

### `recordSale(input: SaleInput): JournalEntry[]`

Records a sale transaction.
- **Rules**: Follows client debt recognition (4111) and revenue (70x).
- **Features**: Supports discounts, transport, packaging, and payments.

### `recordPurchase(input: PurchaseInput | number): JournalEntry[]`

Records a purchase of goods.
- **Rules**: Enforces supplier debt (4011) and inventory entry (6011).
- **Features**: Supports transport, customs, and multi-step payment.

### `recordExpense(input: ExpenseInput, vatConfig?: ExpenseVATConfig): JournalEntry[]`

Records operating expenses.
- **Rules**: Uses smart resolution to map categories (Rent, Utilities) to accounts.
- **Features**: Supports "Direct Mode" (Cash basis) to skip supplier accounts.

### `recordAsset(input: AssetInput): JournalEntry[]`

Records the acquisition of long-term assets.
- **Rules**: Uses investment supplier (481) and asset VAT (4451).
- **Features**: Supports component splitting and dismantling provisions.

## Global Types

### `JournalEntry`

| Field | Type | Description |
| :--- | :--- | :--- |
| `type` | `'CONSTATATION' \| 'REGLEMENT' \| 'VIRTUAL'` | The accounting nature of the entry. |
| `label` | `string` | Human-readable description (localized). |
| `lines` | `JournalLine[]` | Array of debit and credit lines. |
| `isBalanced` | `boolean` | Safely check if total debits equal total credits. |

### `JournalLine`

| Field | Type | Description |
| :--- | :--- | :--- |
| `account` | `string` | The SYSCOHADA account code (e.g., '5211'). |
| `label` | `string` | Specific line description. |
| `debit` | `number` | Amount debited. |
| `credit` | `number` | Amount credited. |
