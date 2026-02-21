# Démarrage

Apprenez à intégrer `@drcmind/ohada-lib` dans votre projet et déposez votre première écriture de journal professionnelle.

## Installation

Installez le package via votre gestionnaire de paquets préféré :

```bash
npm install @drcmind/ohada-lib
# ou
yarn add @drcmind/ohada-lib
# ou
pnpm add @drcmind/ohada-lib
```

## Configuration de Base

Le cœur de la bibliothèque est la classe `Ohada`. Vous pouvez l'initialiser avec des paramètres globaux comme les taux de TVA et la devise.

```typescript
import { Ohada } from '@drcmind/ohada-lib';

const ohada = new Ohada({
  locale: 'fr',
  disableVAT: false
});
```

## Ma première écriture

Enregistrons une simple vente au comptant.

```typescript
const journal = ohada.recordSale({
  amount: 250000,
  label: "Vente de 5 ordinateurs",
  vatRate: 18,
  payment: {
    method: 'cash',
    amount: 295000 // Total TTC
  }
});

console.log(journal);
/*
Résultat: [
  {
    "type": "CONSTATATION",
    "lines": [
      { "account": "4111", "label": "Client - Vente de 5 ordinateurs", "debit": 295000, "credit": 0 },
      { "account": "701", "label": "Vente de marchandises - Vente de 5 ordinateurs", "debit": 0, "credit": 250000 },
      { "account": "4431", "label": "TVA facturée - Vente de 5 ordinateurs", "debit": 0, "credit": 45000 }
    ],
    "isBalanced": true
  },
  {
    "type": "REGLEMENT",
    ... lignes de paiement (Compte 5711, 4111)
  }
]
*/
```

## Étapes suivantes

Maintenant que vous êtes prêt, apprenez à enregistrer différents types de transactions :

- [Enregistrement des Ventes](./sales.md)
- [Enregistrement des Achats](./purchases.md)
- [Enregistrement des Dépenses](./expenses.md)
