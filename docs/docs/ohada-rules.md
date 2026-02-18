# OHADA Accounting Rules

To build compliant financial software for the region, it's essential to understand the legal and technical framework of OHADA.

## What is OHADA?

**OHADA** (Organisation pour l'Harmonisation en Afrique du Droit des Affaires) is a system of uniform corporate laws adopted by seventeen West and Central African nations. It was created in 1993 to foster economic growth by providing a modern and secure legal environment for business.

### Member States (17 Nations)

The following countries follow the OHADA accounting standards:

- 🇧🇯 Benin
- 🇧🇫 Burkina Faso
- 🇨🇲 Cameroon
- 🇨🇫 Central African Republic
- 🇹🇩 Chad
- 🇰🇲 Comoros
- 🇨🇬 Congo
- 🇨🇩 Democratic Republic of Congo
- 🇬🇶 Equatorial Guinea
- 🇬🇦 Gabon
- 🇬🇳 Guinea
- 🇬🇼 Guinea-Bissau
- 🇨🇮 Ivory Coast
- 🇲🇱 Mali
- 🇳🇪 Niger
- 🇸🇳 Senegal
- 🇹🇬 Togo

## The SYSCOHADA Standard

The **SYSCOHADA** (Système Comptable OHADA) is the regional chart of accounts. **ohada-lib** follows the **Uniform Act on Accounting Law and Financial Reporting (AUDCIF)**, specifically the "Revised SYSCOHADA" structure.

### Core Principles

#### 1. The Double Step Constraint (Constatation vs Règlement)
In SYSCOHADA, you never record a credit transaction directly to cash. You must always:
1. **Constatation**: Recognize the debt (Supplier) or claim (Client).
2. **Règlement**: Settle the transaction with a monetary account (Cash/Bank).

*`ohada-lib` enforces this by generating two journal entries for sales/purchases with payments.*

#### 2. The Golden Rule of Invoices
Every purchase of goods must pass through account **4011** (Suppliers) to maintain a perfect audit trail, even if paid immediately.

#### 3. Distinct VAT Accounts
VAT is not a single bucket. It's tracked differently based on the business event:
- **4431**: VAT Collected on Sales.
- **4452**: VAT Recoverable on Goods.
- **4454**: VAT Recoverable on Services.
- **4451**: VAT Recoverable on Assets (Immobilisations).

## How the library helps

Instead of memorizing these account codes, you use natural developer logic:

```typescript
// The library knows this is a SERVICE and uses account 4454 automatically
ohada.recordExpense({
  category: 'RENT',
  amount: 500000,
  label: "Office Rent"
});
```

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
