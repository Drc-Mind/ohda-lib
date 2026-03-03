# Gestion des Charges

Enregistrez les charges d'exploitation (eau, loyer, honoraires, etc.) via des catégories sémantiques. **Ohada Lib** mappe automatiquement chaque catégorie vers le compte SYSCOHADA adapté et génère des écritures équilibrées selon le **principe de constatation des dettes** (Compte 4011).

---

## Référence des Types

### `ExpenseInput`

```typescript
interface ExpenseInput {
  category: ExpenseCategory;   // Catégorie de la charge (voir tableau ci-dessous)
  amount: number;              // Montant hors taxe (HT)
  label: string;               // Libellé pour les journaux comptables
  date?: Date;                 // Date de l'écriture (aujourd'hui par défaut)

  // Gestion de la TVA (manuel prioritaire)
  vatAmount?: number;          // Montant TVA exact
  vatRate?: number;            // Taux TVA en pourcentage (ex : 18 pour 18 %)

  // Règlements optionnels (un par mode de paiement)
  payments?: ExpensePayment[];
}
```

### `ExpensePayment`

```typescript
interface ExpensePayment {
  method: 'cash' | 'bank';   // Mode de règlement
  amount: number;             // Montant réglé (TTC)
}
```

### `ExpenseVATConfig`

```typescript
interface ExpenseVATConfig {
  defaultVATRate?: number;      // Taux TVA appliqué par défaut à toutes les charges
  vatOnExpenses?: boolean;      // Activer/désactiver la TVA globalement (défaut : false)
  serviceVATAccount?: string;   // Compte TVA services (défaut : 4454)
  goodsVATAccount?: string;     // Compte TVA achats (défaut : 4452)
}
```

---

## Tableau des Comptes

| Catégorie | Compte | Description |
| :--- | :---: | :--- |
| `WATER` | `6051` | Eau |
| `ELECTRICITY` | `6052` | Électricité |
| `GAS` | `6053` | Gaz |
| `OFFICE_SUPPLIES` | `604` | Fournitures de bureau et consommables |
| `FUEL` | `6042` | Carburants et combustibles |
| `SMALL_EQUIPMENT` | `6056` | Petit matériel et outillage |
| `RENT` | `611` | Loyers et charges locatives |
| `MAINTENANCE_REPAIRS` | `613` | Entretien et réparations |
| `INSURANCE` | `615` | Primes d'assurance |
| `RESEARCH_DOCUMENTATION` | `616` | Études, recherches et documentation |
| `HONORAIRES` | `622` | Honoraires (avocats, experts) |
| `TRANSPORT` | `624` | Transports et acheminements |
| `TRAVEL_RECEPTION` | `625` | Déplacements et réceptions |
| `BANK_SERVICES` | `627` | Frais bancaires et agios |
| `TELECOMMUNICATIONS` | `628` | Frais de télécommunications |
| `ADVERTISING` | `6271` | Publicité et promotion |
| `SOFTWARE_LICENSE` | `6343` | Licences logiciels |
| `PERSONNEL_CHARGES` | `64` | Salaires et charges sociales |
| `MISC_MANAGEMENT_CHARGES` | `658` | Charges diverses de gestion |
| `BUSINESS_LICENSE` | `6412` | Patentes et licences |
| `PROPERTY_TAX` | `6411` | Impôts fonciers |
| `PAYROLL_TAX` | `6413` | Taxes sur salaires |
| `REGISTRATION_FEES` | `6461` | Droits de mutation |
| `STAMP_DUTY` | `6462` | Droits de timbre |
| `VEHICLE_TAX` | `6463` | Taxes sur véhicules |

**Comptes TVA** : services → `4454`, achats de biens → `4452`

---

## Utilisation

### Charge simple (sans règlement immédiat)

Constate la dette fournisseur. Le règlement sera enregistré ultérieurement.

```typescript
const ohada = new Ohada({ disableVAT: true });

const entries = ohada.recordExpense({
  category: 'ELECTRICITY',
  amount: 50000,
  label: "Facture ENEO Janvier"
});
// Retourne 1 écriture : CONSTATATION (6052 débit / 4011 crédit)
```

### Avec TVA — montant manuel

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
// Écriture 1 — CONSTATATION : 622 débit 200 000, 4454 débit 36 000, 4011 crédit 236 000
// Écriture 2 — RÈGLEMENT :    4011 débit 236 000, 5211 crédit 236 000
```

### Avec TVA — calculée depuis le taux

```typescript
const entries = ohada.recordExpense(
  {
    category: 'TELECOMMUNICATIONS',
    amount: 80000,
    label: "Abonnement fibre",
    vatRate: 18,
    payments: [{ method: 'cash', amount: 94400 }]
  },
  { vatOnExpenses: true }
);
// Total TTC : 94 400
// Écriture 1 — CONSTATATION : 628 débit 80 000, 4454 débit 14 400, 4011 crédit 94 400
// Écriture 2 — RÈGLEMENT :    4011 débit 94 400, 5711 crédit 94 400
```

### Règlement en plusieurs modes (éclaté)

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
// Retourne 3 écritures :
//   Écriture 1 — CONSTATATION : 604 débit 25 000, 4452 débit 4 500 / 4011 crédit 29 500
//   Écriture 2 — RÈGLEMENT :    4011 débit 14 750 / 5711 crédit 14 750 (caisse)
//   Écriture 3 — RÈGLEMENT :    4011 débit 14 750 / 5211 crédit 14 750 (banque)
```

### Configuration TVA globale

```typescript
const entries = ohada.recordExpense(
  {
    category: 'RENT',
    amount: 150000,
    label: "Loyer Février"
  },
  { defaultVATRate: 18, vatOnExpenses: true }
);
// TVA calculée : 150 000 × 18 % = 27 000
// Écriture 1 — CONSTATATION : 611 débit 150 000, 4454 débit 27 000 / 4011 crédit 177 000
```

---

## Mode Dépense Directe

Pour les petites dépenses en espèces ne nécessitant pas d'étape facture, activez `directMode` dans la configuration `Ohada`. Ce mode regroupe les deux écritures en **une seule écriture** créditant directement la caisse ou la banque.

```typescript
const ohada = new Ohada({ directMode: true });

const entries = ohada.recordExpense({
  category: 'OFFICE_SUPPLIES',
  amount: 5000,
  label: "Stylos et cahiers",
  payments: [{ method: 'cash', amount: 5000 }]
});

// Retourne 1 écriture — RÈGLEMENT :
//   604  débit  5 000
//   5711 crédit 5 000  (caisse, déduit de payments[0].method)
```

:::tip
Le `directMode` utilise `payments[0].method` pour déterminer le compte à créditer (`5711` caisse ou `5211` banque). Si aucun règlement n'est fourni, la caisse est utilisée par défaut.
:::

---

## Référence des Paramètres

| Paramètre | Type | Requis | Description |
| :--- | :--- | :---: | :--- |
| `category` | `ExpenseCategory` | ✓ | Catégorie de la charge (mappe vers le compte SYSCOHADA) |
| `amount` | `number` | ✓ | Montant hors taxe (HT) |
| `label` | `string` | ✓ | Libellé des écritures de journal |
| `date` | `Date` | — | Date de l'écriture (aujourd'hui par défaut) |
| `vatAmount` | `number` | — | Montant TVA manuel (priorité sur `vatRate`) |
| `vatRate` | `number` | — | Taux TVA en pourcentage pour calcul automatique |
| `payments` | `ExpensePayment[]` | — | Un ou plusieurs règlements |
