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
