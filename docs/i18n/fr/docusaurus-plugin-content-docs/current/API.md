# Référence API

Référence complète de l'API principale de `@drcmind/ohada-lib`.

## Classe `Ohada`

Le point d'entrée principal de la bibliothèque. Elle orchestre toutes les opérations comptables.

### `constructor(config: OhadaConfig)`

Initialise le moteur avec les paramètres globaux. Voir [Configuration](./config.md) pour plus de détails.

### `recordSale(input: SaleInput): JournalEntry[]`

Enregistre une vente.
- **Règles** : Suit la reconnaissance de créance client (4111) et le revenu (70x).
- **Fonctionnalités** : Supporte les escomptes, le transport, les emballages et les paiements.

### `recordPurchase(input: PurchaseInput | number): JournalEntry[]`

Enregistre un achat de marchandises.
- **Règles** : Impose la dette fournisseur (4011) et l'entrée en stock (6011).
- **Fonctionnalités** : Supporte le transport, la douane et le paiement multi-étapes.

### `recordExpense(input: ExpenseInput, vatConfig?: ExpenseVATConfig): JournalEntry[]`

Enregistre les charges d'exploitation.
- **Règles** : Utilise la résolution intelligente pour mapper les catégories (Loyer, Services) aux comptes.
- **Fonctionnalités** : Supporte le "Mode Direct" (Base caisse) pour ignorer les comptes fournisseurs.

### `recordAsset(input: AssetInput): JournalEntry[]`

Enregistre l'acquisition d'actifs à long terme (Immobilisations).
- **Règles** : Utilise le fournisseur d'investissement (481) et la TVA sur immobilisations (4451).
- **Fonctionnalités** : Supporte la décomposition par composants et les provisions pour démantèlement.

## Types Globaux

### `JournalEntry`

| Champ | Type | Description |
| :--- | :--- | :--- |
| `type` | `'CONSTATATION' \| 'REGLEMENT' \| 'VIRTUAL'` | La nature comptable de l'écriture. |
| `label` | `string` | Description lisible par l'homme (localisée). |
| `lines` | `JournalLine[]` | Tableau de lignes de débit et de crédit. |
| `isBalanced` | `boolean` | Vérifie si le total des débits est égal au total des crédits. |

### `JournalLine`

| Champ | Type | Description |
| :--- | :--- | :--- |
| `account` | `string` | Le code de compte SYSCOHADA (ex : '5211'). |
| `label` | `string` | Description spécifique de la ligne. |
| `debit` | `number` | Montant au débit. |
| `credit` | `number` | Montant au crédit. |
