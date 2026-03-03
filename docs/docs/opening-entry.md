# Opening Entry

Record the initial state of a company's books by listing all assets and liabilities at the start of operations (or the start of a new fiscal year). **Ohada Lib** automatically routes each item to the correct SYSCOHADA account and calculates the equity (capital) as the balancing figure.

In accounting, this journal entry is called **A-Nouveaux** or **Journal d'Ouverture**. Every opening entry must be perfectly balanced:

```
Debit (Assets) = Credit (Liabilities) + Credit (Capital)
```

---

## Types Reference

### `OpeningEntryInput`

```typescript
interface OpeningEntryInput {
  date?: Date;

  // ── Debit side (Assets) ──────────────────────────────────
  fixedAssets?:  OpeningFixedAsset[];   // Immobilisations — Class 2
  stocks?:       OpeningStock[];        // Stocks — Class 3
  receivables?:  OpeningReceivable[];   // Receivables — Class 4
  bank?:         number;                // Account 5211
  cash?:         number;                // Account 5711
  mobileMoney?:  number;                // Account 5141 (Orange Money, MTN MoMo…)

  // ── Credit side (Liabilities) ────────────────────────────
  liabilities?:  OpeningLiability[];
}
```

### `OpeningFixedAsset`

```typescript
interface OpeningFixedAsset {
  label:  string;         // e.g. "MacBook Pro", "Camion Isuzu"
  type:   FixedAssetType; // See table below
  amount: number;         // Net book value (valeur nette comptable)
}
```

### `OpeningStock`

```typescript
interface OpeningStock {
  label:  string;
  type:   StockType;      // See table below
  amount: number;         // Total value at cost price
}
```

### `OpeningReceivable`

```typescript
interface OpeningReceivable {
  label:  string;
  type:   ReceivableType; // See table below
  amount: number;
}
```

### `OpeningLiability`

```typescript
interface OpeningLiability {
  label:  string;
  type:   LiabilityType;  // See table below
  amount: number;
}
```

---

## Account Mapping

### Fixed Assets (`FixedAssetType`)

| Type | Account | Description |
| :--- | :---: | :--- |
| `PATENT_LICENSE` | `212` | Brevets, licences, concessions |
| `SOFTWARE` | `2183` | Logiciels et sites internet |
| `INTANGIBLE_OTHER` | `21` | Autres immobilisations incorporelles |
| `LAND` | `22` | Terrains |
| `COMMERCIAL_BUILDING` | `2313` | Bâtiments commerciaux et industriels |
| `RESIDENTIAL_BUILDING` | `2314` | Bâtiments d'habitation |
| `INDUSTRIAL_EQUIPMENT` | `241` | Matériel et outillage industriel |
| `AGRICULTURAL_EQUIPMENT` | `243` | Matériel agricole |
| `OFFICE_EQUIPMENT` | `2441` | Matériel de bureau |
| `COMPUTER_EQUIPMENT` | `2444` | Matériel informatique (PC, imprimantes…) |
| `OFFICE_FURNITURE` | `2445` | Mobilier de bureau |
| `PASSENGER_VEHICLE` | `2451` | Véhicules de tourisme |
| `UTILITY_VEHICLE` | `2452` | Véhicules utilitaires, camions |
| `FINANCIAL_ASSET` | `27` | Immobilisations financières (titres, prêts) |

### Stocks (`StockType`)

| Type | Account | Description |
| :--- | :---: | :--- |
| `MERCHANDISE` | `3111` | Marchandises |
| `RAW_MATERIALS` | `3211` | Matières premières |
| `FINISHED_GOODS` | `3411` | Produits finis |
| `PACKAGING` | `3611` | Emballages commerciaux |
| `OTHER_SUPPLIES` | `3811` | Autres approvisionnements |

### Receivables (`ReceivableType`)

| Type | Account | Description |
| :--- | :---: | :--- |
| `CUSTOMER` | `4111` | Clients |
| `SUPPLIER_ADVANCE` | `4091` | Avances versées aux fournisseurs |
| `TAX_CREDIT` | `4717` | Créances fiscales et sociales |
| `OTHER_RECEIVABLE` | `4721` | Débiteurs divers |

### Liabilities (`LiabilityType`)

| Type | Account | Description |
| :--- | :---: | :--- |
| `SUPPLIER` | `4011` | Fournisseurs (dettes opérationnelles) |
| `BANK_LOAN` | `1621` | Emprunts auprès d'établissements de crédit |
| `OPERATING_CREDIT` | `1622` | Crédits de trésorerie à court terme |
| `OTHER_DEBT` | `4711` | Créditeurs divers |

### Cash & Equivalents (direct fields)

| Field | Account | Description |
| :--- | :---: | :--- |
| `bank` | `5211` | Solde bancaire |
| `cash` | `5711` | Caisse (espèces) |
| `mobileMoney` | `5141` | Mobile Money (Orange Money, MTN MoMo…) |

---

## Usage

### Minimal — cash only

```typescript
const ohada = new Ohada();

const entry = ohada.recordOpeningEntry({ cash: 500000 });
// 1 debit line:  5711 debit 500 000
// 1 credit line: 1011 credit 500 000 (capital)
```

### Standard scenario

```typescript
const entry = ohada.recordOpeningEntry({
  fixedAssets: [
    { label: "Camion Isuzu",    type: 'UTILITY_VEHICLE',  amount: 1500000 },
    { label: "Mobilier bureau", type: 'OFFICE_FURNITURE', amount: 2000000 },
  ],
  stocks: [
    { label: "Stock marchandises", type: 'MERCHANDISE', amount: 300000 },
  ],
  cash: 500000,
  liabilities: [
    { label: "Fournisseur ACME", type: 'SUPPLIER', amount: 1500000 },
  ],
});

// Assets  = 1 500 000 + 2 000 000 + 300 000 + 500 000 = 4 300 000
// Debts   = 1 500 000
// Capital = 4 300 000 - 1 500 000 = 2 800 000 → credited to 1011
```

### Full scenario — all asset categories

```typescript
const entry = ohada.recordOpeningEntry({
  fixedAssets: [
    { label: "MacBook Pro",      type: 'COMPUTER_EQUIPMENT', amount: 800000  },
    { label: "Toyota Hilux",     type: 'PASSENGER_VEHICLE',  amount: 3000000 },
    { label: "Local commercial", type: 'COMMERCIAL_BUILDING',amount: 5000000 },
  ],
  stocks: [
    { label: "Stock de départ",  type: 'MERCHANDISE',        amount: 2000000 },
  ],
  receivables: [
    { label: "Client Entreprise X", type: 'CUSTOMER',        amount: 450000  },
  ],
  bank:        1200000,
  cash:         100000,
  mobileMoney:   50000,
  liabilities: [
    { label: "Fournisseur Début", type: 'SUPPLIER',           amount:  600000 },
    { label: "Emprunt BNI 5 ans", type: 'BANK_LOAN',          amount: 4000000 },
  ],
});

// Total assets      = 12 600 000
// Total liabilities =  4 600 000
// Capital           =  8 000 000 → credited to 1011
```

### Deficit scenario

When total liabilities exceed total assets, the shortfall is debited to account **1311** (Report à nouveau débiteur) instead:

```typescript
const entry = ohada.recordOpeningEntry({
  cash: 1000,
  liabilities: [
    { label: "Emprunt impayé", type: 'BANK_LOAN', amount: 5000 },
  ],
});

// Assets = 1 000 / Liabilities = 5 000
// Capital = -4 000 → debited to 1311
```

---

## Capital Calculation Logic

| Situation | Result | Account |
| :--- | :--- | :---: |
| Assets > Liabilities | Credit the difference | `1011` |
| Assets < Liabilities | Debit the difference | `1311` |
| Assets = Liabilities | No equity line added | — |

---

## Parameter Reference

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `date` | `Date` | — | Entry date (defaults to today) |
| `fixedAssets` | `OpeningFixedAsset[]` | — | Immobilisations — Class 2 |
| `stocks` | `OpeningStock[]` | — | Stocks — Class 3 |
| `receivables` | `OpeningReceivable[]` | — | Receivables — Class 4 |
| `bank` | `number` | — | Bank balance — Account 5211 |
| `cash` | `number` | — | Cash on hand — Account 5711 |
| `mobileMoney` | `number` | — | Mobile money — Account 5141 |
| `liabilities` | `OpeningLiability[]` | — | Supplier debts, loans, other |
