# Journal d'Ouverture

Enregistrez l'état initial des comptes d'une entreprise en listant tous les actifs et les passifs au démarrage (ou au début d'un exercice comptable). **Ohada Lib** route automatiquement chaque élément vers le compte SYSCOHADA correspondant et calcule les capitaux propres (capital social) comme solde d'équilibre.

Cette écriture est appelée **A-Nouveaux** ou **Journal d'Ouverture**. Elle doit être parfaitement équilibrée :

```
Débit (Actif) = Crédit (Passif) + Crédit (Capital)
```

---

## Référence des Types

### `OpeningEntryInput`

```typescript
interface OpeningEntryInput {
  date?: Date;

  // ── Côté Débit (Actif) ───────────────────────────────────
  fixedAssets?:  OpeningFixedAsset[];   // Immobilisations — Classe 2
  stocks?:       OpeningStock[];        // Stocks — Classe 3
  receivables?:  OpeningReceivable[];   // Créances — Classe 4
  bank?:         number;                // Compte 5211
  cash?:         number;                // Compte 5711
  mobileMoney?:  number;                // Compte 5141 (Orange Money, MTN MoMo…)

  // ── Côté Crédit (Passif) ─────────────────────────────────
  liabilities?:  OpeningLiability[];
}
```

### `OpeningFixedAsset`

```typescript
interface OpeningFixedAsset {
  label:  string;         // Ex. "MacBook Pro", "Camion Isuzu"
  type:   FixedAssetType; // Voir tableau ci-dessous
  amount: number;         // Valeur nette comptable
}
```

### `OpeningStock`

```typescript
interface OpeningStock {
  label:  string;
  type:   StockType;      // Voir tableau ci-dessous
  amount: number;         // Valeur totale au coût d'achat
}
```

### `OpeningReceivable`

```typescript
interface OpeningReceivable {
  label:  string;
  type:   ReceivableType; // Voir tableau ci-dessous
  amount: number;
}
```

### `OpeningLiability`

```typescript
interface OpeningLiability {
  label:  string;
  type:   LiabilityType;  // Voir tableau ci-dessous
  amount: number;
}
```

---

## Correspondance des Comptes

### Immobilisations (`FixedAssetType`)

| Type | Compte | Description |
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

| Type | Compte | Description |
| :--- | :---: | :--- |
| `MERCHANDISE` | `3111` | Marchandises |
| `RAW_MATERIALS` | `3211` | Matières premières |
| `FINISHED_GOODS` | `3411` | Produits finis |
| `PACKAGING` | `3611` | Emballages commerciaux |
| `OTHER_SUPPLIES` | `3811` | Autres approvisionnements |

### Créances (`ReceivableType`)

| Type | Compte | Description |
| :--- | :---: | :--- |
| `CUSTOMER` | `4111` | Clients |
| `SUPPLIER_ADVANCE` | `4091` | Avances versées aux fournisseurs |
| `TAX_CREDIT` | `4717` | Créances fiscales et sociales |
| `OTHER_RECEIVABLE` | `4721` | Débiteurs divers |

### Dettes (`LiabilityType`)

| Type | Compte | Description |
| :--- | :---: | :--- |
| `SUPPLIER` | `4011` | Fournisseurs (dettes opérationnelles) |
| `BANK_LOAN` | `1621` | Emprunts auprès d'établissements de crédit |
| `OPERATING_CREDIT` | `1622` | Crédits de trésorerie à court terme |
| `OTHER_DEBT` | `4711` | Créditeurs divers |

### Trésorerie (champs directs)

| Champ | Compte | Description |
| :--- | :---: | :--- |
| `bank` | `5211` | Solde bancaire |
| `cash` | `5711` | Caisse (espèces) |
| `mobileMoney` | `5141` | Mobile Money (Orange Money, MTN MoMo…) |

---

## Utilisation

### Minimal — caisse uniquement

```typescript
const ohada = new Ohada();

const entry = ohada.recordOpeningEntry({ cash: 500000 });
// 1 écriture débit :  5711 débit 500 000
// 1 écriture crédit : 1011 crédit 500 000 (capital)
```

### Cas standard

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

// Actif   = 1 500 000 + 2 000 000 + 300 000 + 500 000 = 4 300 000
// Passif  = 1 500 000
// Capital = 4 300 000 - 1 500 000 = 2 800 000 → crédit 1011
```

### Cas complet — toutes les catégories

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

// Total actif   = 12 600 000
// Total passif  =  4 600 000
// Capital       =  8 000 000 → crédit 1011
```

### Cas de déficit

Lorsque le passif dépasse l'actif, le solde négatif est débité sur le compte **1311** (Report à nouveau débiteur) :

```typescript
const entry = ohada.recordOpeningEntry({
  cash: 1000,
  liabilities: [
    { label: "Emprunt impayé", type: 'BANK_LOAN', amount: 5000 },
  ],
});

// Actif = 1 000 / Passif = 5 000
// Capital = -4 000 → débit 1311
```

---

## Logique de Calcul du Capital

| Situation | Résultat | Compte |
| :--- | :--- | :---: |
| Actif > Passif | Créditer la différence | `1011` |
| Actif < Passif | Débiter la différence | `1311` |
| Actif = Passif | Aucune ligne capital | — |

---

## Référence des Paramètres

| Paramètre | Type | Requis | Description |
| :--- | :--- | :---: | :--- |
| `date` | `Date` | — | Date de l'écriture (aujourd'hui par défaut) |
| `fixedAssets` | `OpeningFixedAsset[]` | — | Immobilisations — Classe 2 |
| `stocks` | `OpeningStock[]` | — | Stocks — Classe 3 |
| `receivables` | `OpeningReceivable[]` | — | Créances — Classe 4 |
| `bank` | `number` | — | Solde banque — Compte 5211 |
| `cash` | `number` | — | Caisse — Compte 5711 |
| `mobileMoney` | `number` | — | Mobile Money — Compte 5141 |
| `liabilities` | `OpeningLiability[]` | — | Dettes fournisseurs, emprunts, autres |
