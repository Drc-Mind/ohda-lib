# API Reference

Complete reference for the Ohada Lib main API.

## `Ohada` Class

Main entry point for the library.

### `constructor(config: OhadaConfig)`

Initializes the library.

| Property | Type | Description |
| :--- | :--- | :--- |
| `vat` | `number` | Default VAT rate (e.g., 0.18). |
| `taxInclusive` | `boolean` | Whether input prices are TTC. |
| `locale` | `'fr' \| 'en'` | Label language. |

### `recordPurchase(input: PurchaseInput | number)`

Records a purchase transaction.

- **Parameters**: 
  - `input`: A `number` for simplified cash purchase, or a `PurchaseInput` object for detailed recording.
- **Returns**: `AccoutingResult` containing the Generated Journal Entries and any warnings.

## Types

### `PurchaseInput`

| Field | Type | Description |
| :--- | :--- | :--- |
| `supplier` | `string` | Name of the supplier. |
| `items` | `PurchaseItem[]` | List of items purchased. |
| `payments` | `PurchasePayment[]` | Payment details. |
| `additionalCharges` | `PurchaseCharge[]` | Fees like Transport/Customs. |

### `JournalEntry`

| Field | Type | Description |
| :--- | :--- | :--- |
| `accountCode` | `string` | OHADA Account code. |
| `label` | `string` | Description of the entry. |
| `debit` | `number` | Debit amount. |
| `credit` | `number` | Credit amount. |
