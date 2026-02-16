# Introduction

Welcome to the **Ohada Lib** documentation. 

**Ohada Lib** is a specialized TypeScript library designed to bridge the gap between business operations and OHADA accounting compliance. It allows developers to focus on building features while the library handles the underlying SYSCOHADA logic, transforming simple business events into compliant journal entries.

## Core Mission

Traditional accounting integrations are often rigid, requiring developers to have deep knowledge of account codes and debit/credit rules. **Ohada Lib** abstracts this complexity by providing high-level "verbs" (like `recordSale`, `recordPurchase`) that automatically resolve the correct accounting treatment based on the transaction context.

## Key Capabilities

- **Automated Compliance**: Generates SYSCOHADA-compliant journal entries for Sales, Purchases, and Expenses.
- **Smart Account Resolution**: Identifies the correct accounting codes (701, 601, 445x, etc.) based on your data.
- **Advanced Adjustments**: Supports financial discounts, transport charges, packaging deposits, and inventory exits.
- **Multi-Payment Settlement**: Handles complex settlement scenarios involving multiple payment methods (Bank, Cash, Mobile Money).
- **Internationalization**: Full support for French and English accounting labels and locales.

## Visual Exploration

Want to see the engine in action before diving into the code? Check out our **OHADA ERP Engine Demo**, a real-world implementation of the library providing a visual dashboard for transaction management.

[Explore the Demo App](https://github.com/marcellintacite/ohada-lib/tree/main/demo-vite)

## Getting Started

Ready to integrate? Follow our [Getting Started](./getting-started.md) guide to install the library and record your first transaction.
