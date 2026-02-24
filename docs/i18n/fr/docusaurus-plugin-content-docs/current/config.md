# Configuration Globale

Configurez `@drcmind/ohada-lib` pour l'adapter à votre juridiction légale et aux paramètres par défaut de votre entreprise.

## L'Instance Ohada

Initialisez la classe `Ohada` une seule fois et réutilisez-la dans toute votre application.

```typescript
import { Ohada } from '@drcmind/ohada-lib';

const ohada = new Ohada({
  // --- Core ---
  currency: 'XAF',      // 'XAF', 'EUR', 'USD', etc.
  locale: 'fr',        // 'fr' (défaut) ou 'en'
  
  // --- Contrôle TVA ---
  vat: 0.18,           // Taux de TVA global par défaut (ex: 18%)
  taxInclusive: false, // true = Les prix sont TTC, false = HT
  disableVAT: false,   // Mettre à true pour ignorer les lignes de TVA
  
  // --- Charges ---
  directExpense: false // true = Enregistre les charges directement en caisse (pas de 4011)
});
```

## Référence des Options

| Propriété | Type | Défaut | Description |
| :--- | :--- | :--- | :--- |
| `currency` | `string` | - | Code de devise utilisé pour la génération des libellés. |
| `locale` | `'fr' \| 'en'` | `'fr'` | Langue pour les écritures de journal et les libellés. |
| `vat` | `number` | - | multiplicateur de taxe par défaut (0.18 pour 18%). |
| `taxInclusive` | `boolean` | `false` | Indique si les montants fournis incluent la TVA. |
| `disableVAT` | `boolean` | `true` | Désactive rapidement le calcul de la TVA. |
| `directExpense` | `boolean` | `false` | Ignore le processus en 2 étapes pour les charges. |

## Surcharges Dynamiques

La plupart des méthodes permettent de surcharger les paramètres globaux pour des transactions spécifiques :

```typescript
ohada.recordSale({
  amount: 1000,
  label: "Vente Spéciale",
  vatRate: 0.15 // Surcharge le 0.18 global pour cette écriture
});
```
