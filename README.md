# Ohada Lib 📈

[![npm version](https://img.shields.io/npm/v/ohada-lib.svg)](https://www.npmjs.com/package/ohada-lib)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Documentation](https://img.shields.io/badge/docs-GitHub%20Pages-green.svg)](https://marcellintacite.github.io/ohada-lib/)

**A developer-friendly OHADA accounting library** that transforms business events into type-safe journal entries, manages stock and expenses, and generates compliant financial reports.

---

## 🚀 Key Features

- **✅ OHADA Compliant**: Strictly follows the SYSCOHADA "Golden Rule" (Invoice then Payment).
- **🛡️ Type-Safe**: Built with TypeScript for maximum developer productivity and error prevention.
- **🌍 Multi-language**: Full support for English and French translations out of the box.
- **📦 Modular Design**: Specialized modules for Purchases, Sales, and Expenses.
- **🏗️ Automated Journal Entries**: Generates accurate accounting records from simple business inputs.

---

## 📦 Installation

```bash
npm install ohada-lib
# or
yarn add ohada-lib
```

---

## 📖 Quick Start

```typescript
import { Ohada } from 'ohada-lib';

// Initialize the library
const ohada = new Ohada({ locale: 'en' });

// Record a purchase
const entries = ohada.recordPurchase({
  amount: 150000,
  label: 'Laptop for office',
  category: 'EQUIPMENT'
});

console.log(entries);
/*
Output: Array of JournalEntry objects with correct 
debits/credits following OHADA standards.
*/
```

---

## 📚 Documentation

For full documentation, visit [https://marcellintacite.github.io/ohada-lib/](https://marcellintacite.github.io/ohada-lib/).

We cover:
- [Getting Started](https://marcellintacite.github.io/ohada-lib/docs/getting-started)
- [Accounting Rules](https://marcellintacite.github.io/ohada-lib/docs/ohada-rules)
- [API Reference](https://marcellintacite.github.io/ohada-lib/docs/API)
- [Internationalization](https://marcellintacite.github.io/ohada-lib/docs/i18n)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Aksanti bahiga Tacite](https://github.com/marcellintacite)
