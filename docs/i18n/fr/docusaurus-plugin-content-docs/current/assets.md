# Gestion des Immobilisations

Gérez vos investissements à long terme (actifs immobilisés) selon les règles d'évaluation SYSCOHADA obligatoires.

## Principes Fondamentaux

### Évaluation
Le coût d'acquisition comprend :
1. **Prix d'achat net** (Compte 24x/22x/21x).
2. **Frais d'installation et de transport**.
3. **Provisions pour démantèlement** (Compte 1984).

### La Règle d'Or de l'Investissement
En SYSCOHADA, la dette liée à l'investissement est gérée via le compte **4812** (Fournisseurs d'investissements) au lieu du compte opérationnel 4011.

## Exemple d'Acquisition d'Actif

```typescript
const journal = ohada.recordAsset({
  assetName: "Serveur Dell",
  type: 'COMPUTER_EQUIPMENT',
  amount: 2500000,
  transport: 50000,
  vatRate: 18,
  payment: { method: 'bank', amount: 3009000 }
});
```

## Fonctionnalités Avancées

### Décomposition par Composants
Pour les actifs complexes dont les composants ont des durées de vie différentes (ex: un ascenseur dans un immeuble), la bibliothèque permet de répartir le coût en plusieurs lignes de débit.

### Provision pour Démantèlement
Automatisez la reconnaissance des coûts futurs de démantèlement ou de remise en état du site dans la valeur de l'actif.

## Résultat Attendu

```json
[
  {
    "type": "CONSTATATION",
    "lines": [
      { "account": "2444", "label": "Serveur Dell", "debit": 2550000, "credit": 0 },
      { "account": "4451", "label": "TVA récupérable sur achats", "debit": 459000, "credit": 0 },
      { "account": "4812", "label": "Fournisseur d'investissement", "debit": 0, "credit": 3009000 }
    ],
    "isBalanced": true
  },
  {
    "type": "REGLEMENT",
    "lines": [
      { "account": "4812", "debit": 3009000, "credit": 0 },
      { "account": "5211", "debit": 0, "credit": 3009000 }
    ],
    "isBalanced": true
  }
]
```
