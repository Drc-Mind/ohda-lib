# ERP Demo Application - Implementation Plan

## Project Overview
A professional ERP demo application built with React, Vite, and shadcn/ui that showcases the OHADA accounting library functionality. Features POS system, purchase management, and real-time accounting calculations.

## Architecture Overview

### Core Technology Stack
- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **UI Framework**: shadcn/ui + Tailwind CSS 4
- **Icons**: Lucide React
- **Accounting Engine**: @drcmind/ohada-lib

### Project Structure
```
demo-vite/
├── src/
│   ├── components/
│   │   ├── ui/                    (shadcn/ui components)
│   │   ├── ProductCard.tsx
│   │   ├── LineItemForm.tsx
│   │   ├── JournalEntry.tsx
│   │   └── CurrencyInput.tsx
│   ├── pages/
│   │   ├── POS.tsx               (Point of Sales System)
│   │   ├── Purchase.tsx           (Purchase Management)
│   │   ├── Cashflow.tsx           (Cashflow for expenses/incomes)
│   │   └── Reports.tsx            (Accounting Reports)
│   ├── data/
│   │   ├── products.ts            (Mock product catalog)
│   │   └── mockData.ts
│   ├── lib/
│   │   ├── utils.ts              (Utility functions)
│   │   ├── i18n.ts               (Translations - FR/EN)
│   │   ├── currency.ts           (Currency formatting)
│   │   └── accounting.ts         (Library integration)
│   ├── types/
│   │   └── index.ts              (TypeScript definitions)
│   ├── App.tsx                   (Main application)
│   ├── main.tsx                  (Entry point)
│   ├── App.css                   (Global styles)
│   └── index.css                 (Tailwind directives)
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tailwind.config.ts
├── components.json                (shadcn/ui config)
└── package.json
```

## Implementation Phases

### Phase 1: Project Setup & Configuration

#### 1.1 Dependencies Installation
```bash
npm install
npm install tailwindcss @tailwindcss/vite
npm install react react-dom
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @types/react @types/react-dom -D
npm install @vitejs/plugin-react -D
npm install @types/node -D
```

#### 1.2 Configuration Files

**vite.config.ts**
- Register @vitejs/plugin-react
- Register @tailwindcss/vite plugin
- Configure path alias (@/* → ./src/*)
- Allow imported TS extensions

**tsconfig.json & tsconfig.app.json**
- Set baseUrl and paths for @ alias
- Configure React JSX compilation
- Enable strict mode

<!-- Please you are using tailwind v4 all configutations happens in the style.css file -->

**components.json**
- Configure shadcn/ui component resolution
- Set alias to @/components
- Set imports format

#### 1.3 Setup shadcn/ui
```bash
npx shadcn-ui@latest init
# Select components: button, input, select, card, table, tabs, dialog, form, toast
```

#### 1.4 Directory Structure & Base Files
- Create src/components/ui/, src/pages/, src/data/, src/lib/, src/types/
- Create index.css with Tailwind directives
- Create App.tsx main layout

---

### Phase 2: Core Infrastructure

#### 2.1 Type Definitions (src/types/index.ts)
```typescript
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  discount?: number;
  discountType: 'percentage' | 'fixed';
}

interface PurchaseLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  charges?: { type: string; amount: number }[];
  total: number;
}

interface Transaction {
  type: 'SALE' | 'PURCHASE';
  entries: JournalEntry[];
  timestamp: Date;
  notes?: string;
}
```

#### 2.2 Mock Data (src/data/products.ts)
Create realistic product catalog:
- Electronics (laptops, monitors, keyboards)
- Office supplies (paper, pens, folders)
- Hardware (tools, fasteners)
Each with: id, name, category, price, stock, description

#### 2.3 Internationalization (src/lib/i18n.ts)
```typescript
const translations = {
  fr: {
    pos: "Point de Vente",
    purchase: "Achat",
    reports: "Rapports",
    addToCart: "Ajouter au panier",
    discount: "Réduction",
    total: "Total",
    // ... complete translations
  },
  en: {
    pos: "Point of Sale",
    purchase: "Purchase",
    reports: "Reports",
    addToCart: "Add to cart",
    discount: "Discount",
    total: "Total",
    // ... complete translations
  }
}
```

#### 2.4 Utility Functions (src/lib/utils.ts)
- Currency formatting (CDF)
- Number formatting with 2 decimals
- Date formatting
- Price calculation helpers
- Tax calculation

#### 2.5 Accounting Integration (src/lib/accounting.ts)
```typescript
import { Ohada } from '@drcmind/ohada-lib';

const ohadaInstance = new Ohada({ disableVAT: false, locale: 'fr' });

export function recordPOSSale(cart: CartItem[], paymentMethod: string) {
  // Calculate totals
  // Apply discounts
  // Call ohadaInstance.recordSale()
  // Return journal entries
}

export function recordPurchase(lineItems: PurchaseLineItem[], supplier: string) {
  // Calculate totals with charges
  // Call ohadaInstance.recordPurchase()
  // Return journal entries
}
```

#### 2.6 Currency Helper (src/lib/currency.ts)
```typescript
export const formatCurrency = (amount: number, locale: 'fr' | 'en') => {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'XOF', // West African CFA franc
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
```

---

### Phase 3: Reusable Components

#### 3.1 UI Components (shadcn/ui)
Add via CLI:
- Button
- Input
- Select
- Card
- Tabs
- Dialog
- Form
- Table
- Toast
- Badge

#### 3.2 Custom Components

**src/components/ProductCard.tsx**
- Display product info
- Stock status indicator
- Add to cart button
- Price display

**src/components/LineItemForm.tsx**
- Quantity input with +/- buttons
- Unit price input
- Charge/fee inputs (dynamic)
- Discount input with type selector
- Line total calculation

**src/components/JournalEntry.tsx**
- Display accounting entries
- Table format: Account | Label | Debit | Credit
- Totals row
- Entry type badge

**src/components/CurrencyInput.tsx**
- Formatted currency input
- Thousand separators
- Auto-mask for decimals
- Real-time formatting

**src/components/Cart.tsx**
- List of cart items
- Remove item buttons
- Subtotal | Charges | Tax | Total
- Global discount application
- Checkout button

**src/components/LanguageSwitcher.tsx**
- FR/EN toggle button
- Uses React context for state

**src/components/Header.tsx**
- Company branding
- Current locale display
- Language switcher
- Navigation tabs

---

### Phase 4: Main Pages

#### 4.1 POS System (src/pages/POS.tsx)

**Features:**
- Product grid/list with search & filter
- Shopping cart sidebar
- Quantity controls with increment/decrement
- Discount application:
  - Percentage discount per item
  - Fixed amount discount per item
  - Global discount
- Payment methods: Cash | Bank | Credit
- Real-time calculation using Ohada library
- Receipt generation/preview
- Journal entry display

**Workflow:**
1. Browse products
2. Add items to cart
3. Apply discounts (item-level or global)
4. Select payment method
5. Process transaction (calls recordPOSSale)
6. Display receipt & accounting entries
7. Clear cart for next transaction

**UI Layout:**
```
Header (Language, tabs)
─────────────────────────────────
Product Catalog        │  Shopping Cart
(Grid/List)           │  • Item 1 × 2
Search & Filter       │  • Item 2 × 1
                      │  ─────────────
                      │  Subtotal: 150,000
                      │  Discount: -15,000
                      │  Tax (18%): 24,300
                      │  Total: 159,300
                      │
                      │  [Discount Controls]
                      │  [Payment Method]
                      │  [Checkout Button]
─────────────────────────────────
Journal Entries (Collapsible)
```

#### 4.2 Purchase Management (src/pages/Purchase.tsx)

**Features:**
- Supplier selection/input
- Dynamic line items:
  - Add/remove line buttons
  - Description input
  - Quantity × Unit Price
  - Multiple charge types (Transport, Duties, etc.) per line
  - Line total auto-calculation
- Stock entry management:
  - Initial stock input (optional)
  - Final stock input (optional)
  - Auto-calculation checkbox
  - Stock account selector
- Payment tracking:
  - Multiple payment methods
  - Partial/full payment
  - Payment date tracking
- Form validation
- Real-time total calculation
- Submit to library (calls recordPurchase)
- Display accounting entries

**Workflow:**
1. Enter supplier information
2. Add purchase line items (can add multiple)
3. For each line:
   - Enter description & quantity
   - Set unit price
   - Add charges (optional)
   - Auto-calculated total
4. Configure stock entry if needed
5. Record payment information
6. Submit form
7. View generated accounting entries
8. Export/print option

**UI Layout:**
```
Header
─────────────────────────────────
Supplier: [Dropdown/Input]
─────────────────────────────────
Purchase Lines:
┌─ Line 1 ─────────────────────┐
│ Description: [Input]          │
│ Qty: [Input] × Price: [Input] │
│ Charges: [Add Charge BTN]    │
│   └─ Transport: 5,000         │
│   └─ Duties: 2,000           │
│ Line Total: 57,000            │
│ [Remove Line]                 │
└───────────────────────────────┘
[Add Line Button]
─────────────────────────────────
Stock Management:
□ Use Initial Stock: [Input]
□ Use Final Stock: [Input] OR ☑ Auto-calculate
[Custom Stock Account]: [Input, default: 31]
─────────────────────────────────
Payments:
┌─ Payment 1 ─────────────────┐
│ Method: [Bank/Cash/Credit]   │
│ Amount: [Input]              │
│ [Remove Payment]             │
└──────────────────────────────┘
[Add Payment Button]
─────────────────────────────────
Summary:
Total HT: 1,000,000
Total Charges: 7,000
Total TTC: 1,194,600 (with 18% VAT)
─────────────────────────────────
[Submit Purchase]
─────────────────────────────────
Journal Entries (Collapsible)
```

#### 4.3 Reports (src/pages/Reports.tsx)

**Features:**
- Transaction history table
- Filter by type (Sales/Purchases)
- Filter by date range
- Journal entry viewer:
  - Expandable entries
  - Format: Account | Label | Debit | Credit
  - Show totals
  - Balance validation indicator
- Summary statistics:
  - Total sales
  - Total purchases
  - Total VAT collected/paid
  - Period overview

**Sections:**
1. Summary Dashboard
2. Transaction List with filters
3. Detailed Journal Entry Viewer
4. Export options (CSV, PDF)

---

### Phase 5: Main Application Shell

#### 5.1 App.tsx
```typescript
- Language context provider
- Tab navigation (POS | Purchase | Reports)
- Header with language switcher
- Route to active page component
- Toast notifications for feedback
- Error boundaries
```

#### 5.2 main.tsx
```typescript
- React 18 strict mode
- Render App to #app element
```

---

## Features Checklist

### Core Functionality
- [ ] Product catalog with search/filter
- [ ] POS cart system with add/remove
- [ ] Per-item and global discounts
- [ ] Multiple payment methods
- [ ] Purchase order with dynamic line items
- [ ] Charge management (fees/duties/transport)
- [ ] Stock entry management with auto-calculation
- [ ] Journal entry generation via Ohada library
- [ ] Transaction history and reporting

### User Experience
- [ ] Bilingual support (French/English)
- [ ] Real-time calculation display
- [ ] Currency formatting (FCFA)
- [ ] Form validation
- [ ] Toast notifications for actions
- [ ] Responsive design
- [ ] Receipt/invoice preview
- [ ] Print functionality

### Accounting Integration
- [ ] POS sales use recordSale() with inventory exit
- [ ] Purchase orders use recordPurchase() with stock entry
- [ ] Proper VAT handling (18% OHADA standard)
- [ ] Account mapping correct
- [ ] Journal entries display accurately
- [ ] All transactions balanced

### Testing & Quality
- [ ] All OHADA library tests pass
- [ ] POS system tested with multiple discounts
- [ ] Purchase forms tested with various charges
- [ ] Stock calculations verified
- [ ] Currency formatting validated
- [ ] I18n translations complete
- [ ] Responsive layout checked
- [ ] Edge cases handled (overpayment, negative values, etc.)

---

## Styling Strategy

### Tailwind CSS
- Use predefined color palette (slate/neutral)
- Responsive breakpoints for mobile/tablet/desktop
- Dark mode support optional
- Consistent spacing (4px grid)

### Component Styling
- Use shadcn/ui components as base
- Leverage Tailwind utilities for customization
- Card containers for sections
- Form styling with proper labels
- Table styling for journal entries
- Badge styling for status indicators

### Accessibility
- Proper semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Focus indicators

---

## Development Workflow

### Setup Phase
1. Install all dependencies
2. Configure all config files
3. Initialize shadcn/ui components
4. Create directory structure
5. Create base types

### Build Phase
1. Implement utility functions
2. Create reusable components
3. Implement accounting integration
4. Build POS page
5. Build Purchase page
6. Build Reports page
7. Create main App shell

### Testing Phase
1. Test POS workflows
2. Test purchase workflows
3. Test all discounts scenarios
4. Test stock calculations
5. Verify journal entries
6. Test i18n switching
7. Test responsive layout
8. Run full test suite

### Polish Phase
1. Optimize performance
2. Add animations/transitions
3. Improve error messages
4. Add loading states
5. Refine styling
6. Final accessibility audit

---

## Performance Considerations

- Lazy load pages with React.lazy()
- Memoize expensive calculations
- Use useMemo/useCallback appropriately
- Debounce search input
- Optimize re-renders with proper React hooks
- Bundle size monitoring
- Code splitting for production build

---

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

---

## Future Enhancements
1. Database persistence
2. User authentication
3. Multi-company support
4. Custom report builder
5. Automated inventory alerts
6. Integration with banking APIs
7. Mobile native app
8. Real-time sync across devices
9. Advanced analytics dashboard
10. Supplier/customer management views
