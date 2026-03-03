# Gestion des Achats & Stock

Enregistrez les acquisitions de stocks, gérez la dette fournisseur et automatisez la variation de stock selon les règles de comptabilité SYSCOHADA. Chaque achat génère automatiquement des écritures de stock pour maintenir une traçabilité d'audit parfaite.

## Le Cycle d'Achat

En SYSCOHADA, une transaction d'achat suit un processus en quatre étapes :

1. **Constatation** — Enregistrement de la facture et de la dette fournisseur (Compte **4011**).
2. **Réduction** *(optionnel)* — Enregistrement des rabais obtenus (RRR, Compte **6019**).
3. **Réglement** — Enregistrement du/des paiement(s) pour solder la dette.
4. **Variation de Stock** — Enregistrement automatique de l'augmentation du stock (Compte **31** → **6031**).

Chaque étape est une écriture équilibrée séparée pour la conformité de la piste d'audit.

## Exemples Rapides

### Achat Simple à Crédit

```typescript
const journal = ohada.recordPurchase({
  amount: 100000,
  label: "Marchandises",
  vatRate: 18
});
```

**Résultat** : 2 écritures (Constatation + Variation de Stock)

### Achat avec Paiement Immédiat

```typescript
const journal = ohada.recordPurchase({
  amount: 100000,
  label: "Table de Bureau",
  payments: [{ method: 'cash', amount: 100000 }]
});
```

**Résultat** : 3 écritures (Constatation + Réglement + Variation de Stock)

---

## Référence des Types

### `PurchaseInput`

```typescript
interface PurchaseInput {
  // Requis
  amount: number;                   // Montant achat (HT)
  label: string;                    // Description (ex : "Marchandises")

  // Optionnel
  date?: Date;                      // Date transaction (défaut : maintenant)
  vatRate?: number;                 // Taux TVA en % (défaut : 18)
  charges?: PurchaseCharge[];       // Transport, Douane, etc.
  payments?: PurchasePayment[];     // Un ou plusieurs paiements
  reduction?: number;               // Rabais (RRR obtenus)
  stockEntry?: StockEntry;          // Compte stock personnalisé (défaut : '31')
}
```

### `PurchaseCharge`

```typescript
interface PurchaseCharge {
  type: 'Transport' | 'Douane' | 'Divers';
  amount: number;  // Ajouté à la valeur stock & base TVA
}
```

### `PurchasePayment`

```typescript
interface PurchasePayment {
  method: 'cash' | 'bank';  // Mode de paiement
  amount: number;           // Montant payé
}
```

### `StockEntry`

```typescript
interface StockEntry {
  stockAccount?: string;  // Compte stock personnalisé (défaut : '31')
}
```

---

## Fonctionnalités Principales

### Achat avec Transport & Douane

Incluez les frais accessoires qui augmentent la valeur du stock.

```typescript
const journal = ohada.recordPurchase({
  amount: 100000,
  label: "Marchandises A",
  charges: [
    { type: 'Transport', amount: 5000 },
    { type: 'Douane', amount: 2000 }
  ],
  vatRate: 18
});
```

**Point Clé** : La variation de stock inclut les frais → Stock augmente de `100000 + 5000 + 2000 = 107000`

---

### Réduction (RRR Obtenus)

Enregistrez les rabais fournisseur automatiquement avec le traitement TVA correct.

#### Sans TVA

```typescript
const journal = ohada.recordPurchase({
  amount: 100000,
  label: "Marchandises",
  reduction: 20000
});
```

**Écritures Générées** :
- Constatation (dette 100 000)
- **Réduction** : D 4011 / C 6019 pour 20 000
- Variation de Stock (31/6031 pour 100 000)

#### Avec TVA (Annulation Automatique)

```typescript
const journal = ohada.recordPurchase({
  amount: 100000,
  label: "Marchandises",
  vatRate: 18,
  reduction: 10000
});
```

**Écriture de Réduction Générée** :
- D 4011 : **11 800** (10 000 base + 1 800 TVA)
- C 6019 : **10 000** (Base RRR)
- C 4451 : **1 800** (Annulation TVA — la taxe est annulée sur montants non reçus)

La TVA est automatiquement calculée et annulée car on ne paie pas taxe sur montants non reçus.

---

### Paiements Échelonnés

Divisez les paiements entre caisse et banque.

```typescript
const journal = ohada.recordPurchase({
  amount: 100000,
  label: "Marchandises",
  payments: [
    { method: 'cash', amount: 50000 },
    { method: 'bank', amount: 50000 }
  ]
});
```

**Ordre des Écritures** :
1. Constatation (dette 100 000)
2. Réglement #1 (caisse, -50 000)
3. Réglement #2 (banque, -50 000)
4. Variation de Stock

Chaque paiement est une écriture séparée pour piste d'audit claire.

---

### Compte Stock Personnalisé

Utilisez un compte stock différent (défaut : **31**).

```typescript
const journal = ohada.recordPurchase({
  amount: 100000,
  label: "Matières Premières",
  stockEntry: {
    stockAccount: '312'
  }
});
```

---

## Correspondance des Comptes

| Fonctionnalité | Compte | Description |
| :--- | :--- | :--- |
| Achat Marchandises | `6011` | Achat de marchandises. |
| Frais | `6015` | Transport, douane, frais accessoires. |
| TVA Récupérable | `4452` | TVA sur achats (déductible). |
| Dette Fournisseur | `4011` | Dettes fournisseurs (exploitation). |
| **RRR Obtenus** | **`6019`** | **Rabais/remises/ristournes obtenus.** |
| **TVA sur Avoir** | **`4451`** | **Annulation TVA sur rabais.** |
| **Stock (Inventaire)** | **`31`** | **Marchandises en magasin.** |
| **Variation de Stock** | **`6031`** | **Variation/coût du stock.** |
| Compte Caisse | `5711` | Caisse en main. |
| Compte Banque | `5211` | Virements bancaires. |

---

## Exemple Complet : Flux Achat Complet

Un achat réaliste avec transport, rabais et paiement échelonné :

```typescript
const journal = ohada.recordPurchase({
  amount: 1000000,
  label: "Achat - Fourniture Bureau",
  date: new Date('2026-01-15'),
  vatRate: 18,
  charges: [
    { type: 'Transport', amount: 50000 },
    { type: 'Douane', amount: 30000 }
  ],
  reduction: 100000,
  payments: [
    { method: 'bank', amount: 450000 },
    { method: 'cash', amount: 450000 }
  ]
});
```

**Écritures de Journal Générées** (5 au total) :

| # | Type | Compte | Débit | Crédit | Description |
|:---|:---|:---|---:|---:|:---|
| 1 | Constatation | 6011 | 1 000 000 | | Achat marchandises |
| 1 | Constatation | 6015 | 80 000 | | Transport + Douane |
| 1 | Constatation | 4452 | 194 400 | | TVA (18% sur 1 080 000) |
| 1 | Constatation | 4011 | | 1 274 400 | Total TTC dû |
| 2 | Réduction | 4011 | 118 000 | | Réduction de dette (rabais + TVA) |
| 2 | Réduction | 6019 | | 100 000 | Base RRR |
| 2 | Réduction | 4451 | | 18 000 | Annulation TVA |
| 3 | Réglement | 4011 | 412 200 | | Paiement banque |
| 3 | Réglement | 5211 | | 412 200 | Sortie banque |
| 4 | Réglement | 4011 | 412 200 | | Paiement caisse |
| 4 | Réglement | 5711 | | 412 200 | Sortie caisse |
| 5 | Var. Stock | 31 | 1 080 000 | | Coût : 1 000 000 + 80 000 frais |
| 5 | Var. Stock | 6031 | | 1 080 000 | Augmentation stock |

---

## Règles Clés

✓ **Variation de stock automatique** — Chaque achat déclenche une écriture stock (31/6031).

✓ **Frais inclus** — Transport et douane sont capitalisés dans valeur stock.

✓ **Annulation TVA sur rabais** — Les montants rabais annulent automatiquement TVA proportionnelle.

✓ **Protection overpayment** — Total paiements ne peut dépasser montant net dû après réduction.

✓ **Écritures séparées** — Chaque phase (Constatation, Réduction, Paiement, Stock) est écriture distincte.

---

## Référence des Paramètres

| Paramètre | Type | Requis | Exemple | Notes |
|:---|:---|:---|:---|:---|
| `amount` | `number` | Oui | `100000` | Montant achat (HT). |
| `label` | `string` | Oui | `"Marchandises"` | Description transaction. |
| `date` | `Date` | Non | `new Date()` | Défaut : maintenant. |
| `vatRate` | `number` | Non | `18` | Taux TVA (défaut : 18, ignoré si `disableVAT: true`). |
| `charges` | `PurchaseCharge[]` | Non | `[{type: 'Transport', amount: 5000}]` | Frais accessoires, ajoutés stock & base TVA. |
| `payments` | `PurchasePayment[]` | Non | `[{method: 'bank', amount: 100000}]` | Un ou plusieurs paiements. |
| `reduction` | `number` | Non | `20000` | Montant rabais ; déclenche annulation TVA si activée. |
| `stockEntry` | `StockEntry` | Non | `{stockAccount: '312'}` | Compte stock personnalisé (défaut : `'31'`). |
