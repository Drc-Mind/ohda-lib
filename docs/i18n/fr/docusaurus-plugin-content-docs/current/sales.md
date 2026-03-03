# Gestion des Ventes & Revenus

Enregistrez les revenus de ventes, gérez les créances clients et suivez les sorties de stocks selon les normes SYSCOHADA. Gérez les scénarios complexes incluant les escomptes financiers, frais de transport, consignations d'emballages et paiements échelonnés.

## Le Cycle de Vente

En SYSCOHADA, une vente est enregistrée en trois étapes au maximum :

1. **Constatation** — Enregistrement de la facture et de la créance client (Compte **4111**).
2. **Sortie de Stock** *(optionnel)* — Enregistrement du coût des marchandises vendues (Compte **6031** / **311**).
3. **Réglement** — Enregistrement du/des paiement(s) reçu(s) pour solder la créance.

Chaque étape est une écriture équilibrée séparée pour piste d'audit claire.

## Exemples Rapides

### Vente Simple à Crédit

```typescript
const journal = ohada.recordSale({
  amount: 100000,
  label: "Marchandises",
  saleType: 'GOODS',
  vatRate: 18
});
```

**Résultat** : 1 écriture (Constatation uniquement)

### Vente avec Paiement Immédiat

```typescript
const journal = ohada.recordSale({
  amount: 100000,
  label: "Vente comptant",
  saleType: 'GOODS',
  vatRate: 18,
  payments: [{ method: 'cash', amount: 118000 }]
});
```

**Résultat** : 2 écritures (Constatation + Réglement)

---

## Référence des Types

### `SaleInput`

```typescript
interface SaleInput {
  // Requis
  amount: number;                // Montant vente (HT)
  label: string;                 // Description (ex : "Vente marchandises")
  saleType: SaleType;            // 'GOODS' | 'MANUFACTURED' | 'SERVICES'

  // Optionnel
  date?: Date;                   // Date transaction (défaut : maintenant)
  vatRate?: number;              // Taux TVA en % (défaut : 18)
  
  // Options Avancées
  financialDiscount?: FinancialDiscount;   // Escompte (enregistré comme dépense)
  packagingDeposit?: PackagingDeposit;     // Consignation (pas de TVA)
  transportCharge?: TransportCharge;       // Port facturé (7071)
  inventoryExit?: InventoryExit;           // Sortie stock (coût des biens)
  payments?: SalePayment[];                // Un ou plusieurs paiements
}
```

### `SaleType`

```typescript
type SaleType = 'GOODS' | 'MANUFACTURED' | 'SERVICES';
```

### `SalePayment`

```typescript
interface SalePayment {
  method: 'cash' | 'bank';  // Mode paiement
  amount: number;           // Montant reçu
}
```

### `FinancialDiscount`

```typescript
interface FinancialDiscount {
  percentage: number;  // ex : 2 pour 2% (enregistré comme dépense 673)
}
```

### `TransportCharge`

```typescript
interface TransportCharge {
  amount: number;        // Montant transport (ajouté à base TVA)
  description?: string;
}
```

### `PackagingDeposit`

```typescript
interface PackagingDeposit {
  amount: number;        // Montant consignation (NON soumis à TVA)
  description?: string;
}
```

### `InventoryExit`

```typescript
interface InventoryExit {
  costPrice: number;  // Coût des biens vendus (CMUP - coût moyen pondéré)
}
```

---

## Fonctionnalités Principales

### Classification des Revenus

Les revenus sont automatiquement mappés au bon compte SYSCOHADA selon type vente :

| Type Vente | Compte | Description |
| :--- | :--- | :--- |
| `GOODS` | `701` | Vente de marchandises. |
| `MANUFACTURED` | `702` | Vente de produits finis. |
| `SERVICES` | `706` | Revenu de services. |

```typescript
const goodsSale = ohada.recordSale({
  amount: 50000,
  label: "Vente Stock",
  saleType: 'GOODS'
});

const serviceSale = ohada.recordSale({
  amount: 25000,
  label: "Consulting",
  saleType: 'SERVICES'
});
```

---

### Transport & Emballages

Incluez les frais d'expédition et montants de consignation dans factures.

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

**Points Clés** :
- **Transport** (5 000) s'ajoute à base imposable → TVA calculée sur 105 000
- **Consignation Emballage** (1 000) est dette → PAS soumise à TVA

---

### Escompte Financier

Enregistrez escomptes paiement anticipé comme dépense (Compte **673**).

```typescript
const journal = ohada.recordSale({
  amount: 100000,
  label: "Vente avec escompte",
  saleType: 'GOODS',
  vatRate: 18,
  financialDiscount: { percentage: 2 }  // 2% = 2 000
});
```

**Écriture Générée** :
- D 4111 : 116 360 (Créance client = 100 000 - 2 000 + 18% TVA)
- D 673 : 2 000 (Charge financière - escompte accordé)
- C 701 : 100 000 (Revenu)
- C 4431 : 18 360 (TVA sur 102 000)

---

### Sortie de Stock (Coût des Marchandises)

Enregistrez automatiquement réduction stock lors vente.

```typescript
const journal = ohada.recordSale({
  amount: 100000,
  label: "Vente marchandises",
  saleType: 'GOODS',
  inventoryExit: { costPrice: 65000 }
});
```

**Écritures Générées** :
1. **Constatation** — Facture (4111/701)
2. **Sortie de Stock** — Coût biens :
   - D 6031 : 65 000 (Coût des ventes)
   - C 311 : 65 000 (Réduction stock)

---

### Paiements Échelonnés (Paiements Fractionnés)

Recevez paiement en plusieurs versements via différentes méthodes.

```typescript
const journal = ohada.recordSale({
  amount: 100000,
  label: "Vente paiement échelonné",
  saleType: 'GOODS',
  vatRate: 18,
  payments: [
    { method: 'cash', amount: 59000 },
    { method: 'bank', amount: 59000 }
  ]
});
```

**Écritures Générées** :
1. Constatation (facture)
2. Réglement #1 (caisse, -59 000)
3. Réglement #2 (banque, -59 000)

Chaque paiement est écriture séparée pour suivi clair.

---

### Avoirs (Retours / Ventes Négatives)

Enregistrez retours avec montants négatifs.

```typescript
const journal = ohada.recordSale({
  amount: -50000,
  label: "Retour produit défectueux",
  saleType: 'GOODS',
  vatRate: 18
});
```

Ceci génère avoir avec montants inversés (débits deviennent crédits et vice versa).

---

## Correspondance des Comptes

| Fonctionnalité | Compte | Description |
| :--- | :--- | :--- |
| **Vente Marchandises** | **`701`** | **Ventes marchandises.** |
| **Produits Finis** | **`702`** | **Produits manufacturés.** |
| **Services** | **`706`** | **Revenus services.** |
| Transport Facturé | `7071` | Transport/port facturé client. |
| TVA Collectée | `4431` | TVA sur ventes (dette TVA). |
| Escompte Accordé | `673` | Escomptes accordés. |
| Créance Client | `4111` | Créances clients. |
| Consignation Emballage | `4194` | Consignations emballages (dette). |
| Coût des Ventes | `6031` | Coût marchandises vendues. |
| Stock | `311` | Stock marchandises. |
| Compte Caisse | `5711` | Caisse en main. |
| Compte Banque | `5211` | Dépôts bancaires. |

---

## Exemple Complet : Vente Complexe

Vente réaliste incluant transport, emballage, escompte, sortie stock et paiement échelonné :

```typescript
const journal = ohada.recordSale({
  amount: 1000000,
  label: "Vente - Commande #X2026",
  date: new Date('2026-01-15'),
  saleType: 'GOODS',
  vatRate: 18,
  
  // Frais accessoires
  transportCharge: { amount: 50000 },
  packagingDeposit: { amount: 10000 },
  
  // Escompte paiement anticipé
  financialDiscount: { percentage: 2 },
  
  // Suivi coût standard
  inventoryExit: { costPrice: 650000 },
  
  // Paiement échelonné
  payments: [
    { method: 'bank', amount: 588000 },
    { method: 'cash', amount: 588000 }
  ]
});
```

**Écritures de Journal Générées** (4 au total) :

| # | Type | Compte | Débit | Crédit | Description |
|:---|:---|:---|---:|---:|:---|
| 1 | Constatation | 4111 | 1 175 600 | | Créance totale |
| 1 | Constatation | 673 | 20 000 | | Escompte paiement anticipé (2%) |
| 1 | Constatation | 701 | | 1 000 000 | Revenu |
| 1 | Constatation | 7071 | | 50 000 | Transport facturé |
| 1 | Constatation | 4431 | | 189 000 | TVA (18% sur 1 050 000) |
| 1 | Constatation | 4194 | | 10 000 | Consignation emballage |
| 2 | Sortie Stock | 6031 | 650 000 | | Coût marchandises vendues |
| 2 | Sortie Stock | 311 | | 650 000 | Réduction stock |
| 3 | Réglement | 5211 | 588 000 | | Entrée banque |
| 3 | Réglement | 4111 | | 588 000 | Réduction créance |
| 4 | Réglement | 5711 | 588 000 | | Entrée caisse |
| 4 | Réglement | 4111 | | 588 000 | Réduction créance |

---

## Règles Clés

✓ **Classification revenus** — Mapping automatique selon type vente (GOODS/MANUFACTURED/SERVICES).

✓ **Base imposable** — Transport inclus ; consignation emballage exclue TVA.

✓ **Escompte financier** — Enregistré comme dépense (673), réduit créance client.

✓ **Suivi inventaire** — Écriture séparée coût biens vendus si fourni.

✓ **Paiements échelonnés** — Chaque paiement est écriture propre pour clarté piste d'audit.

✓ **Piste d'audit** — Toutes phases transaction sont écritures séparées avec traçabilité totale.

---

## Référence des Paramètres

| Paramètre | Type | Requis | Exemple | Notes |
|:---|:---|:---|:---|:---|
| `amount` | `number` | Oui | `100000` | Montant vente (HT). |
| `label` | `string` | Oui | `"Vente marchandises"` | Description transaction. |
| `saleType` | `SaleType` | Oui | `'GOODS'` | Détermine compte revenu (701/702/706). |
| `date` | `Date` | Non | `new Date()` | Défaut : maintenant. |
| `vatRate` | `number` | Non | `18` | Taux TVA (défaut : 18, ignoré si `disableVAT: true`). |
| `financialDiscount` | `FinancialDiscount` | Non | `{percentage: 2}` | Escompte paiement anticipé (dépense 673). |
| `transportCharge` | `TransportCharge` | Non | `{amount: 5000}` | Inclus dans base imposable. |
| `packagingDeposit` | `PackagingDeposit` | Non | `{amount: 1000}` | Exclu TVA. |
| `inventoryExit` | `InventoryExit` | Non | `{costPrice: 65000}` | Génère écriture sortie stock séparée. |
| `payments` | `SalePayment[]` | Non | `[{method: 'bank', amount: 100000}]` | Un ou plusieurs paiements ; chacun génère écriture séparée. |
