# OHADA Accounting Rules

To effectively use **Ohada Lib**, it is essential to understand a few core principles of the SYSCOHADA (Système Comptable OHADA) framework. The library is built to enforce these rules automatically.

## 1. The "Golden Rule": Constatation vs. Règlement

In OHADA accounting, a business transaction is typically recorded in two distinct steps to maintain a clear audit trail.

### Step A: Constatation (Invoice Recognition)
When an invoice is issued or received, the theoretical debt or claim is recorded. This acknowledges the legal obligation before any money changes hands.
- **Purchase**: Debit an Expense (Class 6) and Credit the Supplier (Account 4011).
- **Sale**: Debit the Client (Account 4111) and Credit a Revenue account (Class 7).

### Step B: Règlement (Payment Settlement)
When money is actually paid or received, the debt/claim is settled.
- **Purchase**: Debit the Supplier (4011) and Credit the Payment Method (Cash 571 or Bank 521).
- **Sale**: Debit the Payment Method (Class 5) and Credit the Client (4111).

> [!IMPORTANT]
> **Ohada Lib** handles both steps. If you provide payment details in your input, two distinct entries (Invoice + Settlement) are generated automatically.

## 2. The Use of Intermediate Accounts (4011/4111)

Even for immediate cash transactions, SYSCOHADA standards recommend passing through personal accounts (4011 for Suppliers, 4111 for Clients). This ensures that the ledger accurately reflects with whom the business is transacting, providing a robust history for audits and financial reporting.

## 3. Value Added Tax (VAT/TVA)

The library defaults to the standard OHADA VAT rate of **18%**, but this is fully configurable.

- **Recoverable VAT (Purchases)**: Recorded in account **4452** (for goods) or **4454** (for services).
- **Collected VAT (Sales)**: Recorded in account **4431** (TVA facturée).

The engine automatically identifies whether an expense is a "Good" or a "Service" to select the correct VAT recovery account.

## 4. Account Resolution Logic

**Ohada Lib** uses a smart resolver to map business labels to accounting codes. For example:
- A sale labeled as "Goods" will resolve to account **701**.
- An expense labeled "Electricity" will resolve to account **6052**.

This abstraction allows you to record transactions using business terminology rather than memorizing the hundreds of codes in the Chart of Accounts.
