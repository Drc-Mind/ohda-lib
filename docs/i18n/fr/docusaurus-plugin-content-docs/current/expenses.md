# Gestion des Charges

Gérez les coûts d'exploitation tels que le loyer, l'électricité et les fournitures. **Ohada Lib** mappe automatiquement plus de 20 catégories de charges aux comptes SYSCOHADA corrects.

## Cartographie Dynamique

Au lieu de chercher des codes de compte, vous utilisez des catégories naturelles :

```typescript
const journal = ohada.recordExpense({
  category: 'OFFICE_SUPPLIES',  // Mappe vers le compte 604
  amount: 80000,
  label: "Fournitures de bureau",
  payment: { method: 'bank', amount: 94400 }
});
```

## Mode Charge Directe (Express)

Pour les petites dépenses qui ne nécessitent pas d'étape de facturation, vous pouvez activer `directExpense` dans votre configuration globale. Cela enregistre la charge directement contre le compte de trésorerie en une seule écriture.

## Correspondance des Comptes

| Catégorie | Compte | Description |
| :--- | :--- | :--- |
| `ELECTRICITY` | `6052` | Énergie et fluides. |
| `RENT` | `622` | Locations. |
| `OFFICE_SUPPLIES` | `604` | Achats de fournitures. |
| `TRAVEL` | `627` | Frais de mission. |

## Résultat Attendu

Par défaut, même les charges suivent le principe de reconnaissance de dette (Compte 4011) sauf si `directExpense` est activé.

```json
[
  {
    "type": "CONSTATATION",
    "lines": [
      { "account": "604", "label": "Fournitures de bureau", "debit": 80000, "credit": 0 },
      { "account": "4011", "label": "Fournisseur", "debit": 0, "credit": 80000 }
    ],
    "isBalanced": true
  },
  {
    "type": "REGLEMENT",
    "lines": [
      { "account": "4011", "debit": 94400, "credit": 0 },
      { "account": "5211", "debit": 0, "credit": 94400 }
    ],
    "isBalanced": true
  }
]
```
