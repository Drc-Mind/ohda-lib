# Gestion des Ventes

Enregistrez vos revenus et la TVA collectée tout en maintenant une piste d'audit conforme. **Ohada Lib** gère la reconnaissance des ventes selon les normes SYSCOHADA, incluant les ajustements commerciaux et financiers.

## Le Cycle de Vente

Dans le système SYSCOHADA, une vente est enregistrée en deux étapes :
1. **Constatation** : Enregistrement de la facture et de la créance client (**Compte 4111**).
2. **Règlement** : Enregistrement de l'encaissement pour solder la créance.

`ohada-lib` gère cela en retournant un tableau d'écritures comptables équilibrées.

## Exemple de Vente Rapide

Une vente simple de marchandises avec règlement immédiat par banque.

```typescript
const journal = ohada.recordSale({
  amount: 1000000,
  label: "Commande #42",
  saleType: 'GOODS',
  vatRate: 18,
  payment: {
    method: 'bank',
    amount: 1180000 // Total TTC (1M + 18%)
  }
});
```

## Fonctionnalités Avancées

### Escomptes Financiers
Si vous accordez une remise pour paiement anticipé, utilisez le champ `financialDiscount`. La bibliothèque enregistre correctement la charge financière (Compte 673).

```typescript
financialDiscount: { percentage: 2 } // 2% d'escompte
```

### Transport & Emballages
Incluez les frais de transport facturés (Revenu pour vous, compte 7071) et les consignations d'emballages (Dettes, compte 4194).

```typescript
transportCharge: { amount: 25000 },
packagingDeposit: { amount: 5000 }
```

### Sortie de Stock (Variation)
Pour maintenir des niveaux de stock précis, vous pouvez déclencher une sortie de stock (6031/311) en même temps que la vente.

```typescript
inventoryExit: { costPrice: 800000 }
```

## Correspondance des Comptes

| Entrée | Code Compte | Description |
| :--- | :--- | :--- |
| Revenu | `701/702/706` | Ventes de marchandises, produits finis ou services. |
| TVA | `4431` | TVA Facturée. |
| Client | `4111` | Créances Clients. |
| Escompte | `673` | Charges financières (Escomptes accordés). |

## Résultat Attendu

Pour une vente avec paiement immédiat, la bibliothèque génère deux écritures : la constatation de la facture et l'écriture de trésorerie.

```json
[
  {
    "type": "CONSTATATION",
    "lines": [
      { "account": "4111", "label": "Client - Commande #42", "debit": 1180000, "credit": 0 },
      { "account": "701", "label": "Vente de marchandises - #42", "debit": 0, "credit": 1000000 },
      { "account": "4431", "label": "TVA facturée - #42", "debit": 0, "credit": 180000 }
    ],
    "isBalanced": true
  },
  {
    "type": "REGLEMENT",
    "lines": [
      { "account": "5211", "label": "Entrée de trésorerie (bank) - #42", "debit": 1180000, "credit": 0 },
      { "account": "4111", "label": "Règlement reçu (bank) - #42", "debit": 0, "credit": 1180000 }
    ],
    "isBalanced": true
  }
]
```
