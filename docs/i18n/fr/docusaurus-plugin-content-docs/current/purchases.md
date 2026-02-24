# Gestion des Achats

Enregistrez vos acquisitions de stocks et gérez la dette fournisseur selon la règle de la "Double Étape" du SYSCOHADA.

## Règles de Base

Tous les achats de marchandises (Stocks) doivent suivre un processus en deux étapes :
1. **Constatation** : Enregistrement de la facture et reconnaissance de la dette envers le fournisseur (**Compte 4011**).
2. **Règlement** : Le paiement effectif pour éteindre cette dette.

*Même en cas de paiement comptant, la bibliothèque s'assure que la transaction passe par le compte fournisseur pour une piste d'audit parfaite.*

## Exemple d'Achat Rapide

Enregistrement d'un achat de stock avec paiement immédiat en espèces.

```typescript
const journal = ohada.recordPurchase({
  amount: 500000,
  label: "Stock Marchandises",
  charges: [{ type: 'Transport', amount: 25000 }],
  vatRate: 18,
  payments: [{ method: 'cash', amount: 619500 }]
});
```

## Frais Accessoires

Incluez les frais annexes souvent associés aux achats.

### Transport & Douane
Les frais de transport et de douane sont incorporés dans la valeur totale des marchandises achetées (Compte 6015).

```typescript
charges: [
  { type: 'Transport', amount: 50000 },
  { type: 'Douane', amount: 150000 }
]
```

## Correspondance des Comptes

| Entrée | Code Compte | Description |
| :--- | :--- | :--- |
| Marchandises | `6011` | Achats de marchandises. |
| Frais | `6015` | Frais accessoires (Transport/Douane). |
| TVA | `4452` | TVA récupérable sur achats. |
| Fournisseur | `4011` | Fournisseurs, dettes en compte. |

## Résultat Attendu

La bibliothèque génère à la fois la reconnaissance de facture (**Constatation**) et le paiement (**Règlement**).

```json
[
  {
    "type": "CONSTATATION",
    "lines": [
      { "account": "6011", "label": "Stock Marchandises", "debit": 500000, "credit": 0 },
      { "account": "6015", "label": "Frais (Transport) - Stock", "debit": 25000, "credit": 0 },
      { "account": "4452", "label": "TVA récupérable - Stock", "debit": 94500, "credit": 0 },
      { "account": "4011", "label": "Fournisseur - Stock", "debit": 0, "credit": 619500 }
    ],
    "isBalanced": true
  },
  {
    "type": "REGLEMENT",
    "lines": [
      { "account": "4011", "label": "Paiement Fournisseur (cash)", "debit": 619500, "credit": 0 },
      { "account": "5711", "label": "Sortie de trésorerie (cash)", "debit": 0, "credit": 619500 }
    ],
    "isBalanced": true
  }
]
```
