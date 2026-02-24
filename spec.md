# OHADA Accounting Engine — Specification

## 1. Overview

**OHADA Accounting Engine** is an open-source, developer-first accounting library designed primarily for African contexts, with **default compliance to SYSCOHADA** standards.

The library converts **business events** into **accounting entries**, then uses those entries to generate standard accounting outputs such as:

* Trial balance (Balance)
* General ledger (Grand livre)
* Account balances

The engine prioritizes:

* Strong accounting correctness
* Excellent developer experience (DX)
* Audit-ready data structures

It is **not** an end-user accounting application, but a **core accounting engine** meant to be embedded into software products (ERP, POS, fintech, SMB tools, educational platforms).

---

## 2. Target Audience

Primary:

* Software engineers building business or financial applications
* Fintech, POS, ERP, SME management tools

Secondary:

* Educational platforms (accounting, finance, business)
* Students learning accounting through code

---

## 3. Design Philosophy

### 3.1 Developer-First (DX-first)

Accounting should not be a burden for developers.

The library abstracts accounting complexity by allowing developers to:

* Work with **business events** instead of raw debit/credit
* Rely on strong defaults aligned with SYSCOHADA

At the same time, it keeps **escape hatches** for advanced usage.

---

### 3.2 Event → Accounting → Reports

The core pipeline:

```
Business Event
   ↓
Accounting Entries (immutable)
   ↓
Storage (handled by the host app)
   ↓
Reports & Aggregations
```

The engine **does not manage persistence**. Storage is the responsibility of the host application.

---

## 4. Core Guarantees (Non‑Negotiable)

The library officially guarantees:

1. **Balanced Entries**
   Every generated or accepted accounting entry satisfies:

   ```
   Σ Debit = Σ Credit
   ```

2. **SYSCOHADA Structural Compliance**

   * Chart of accounts follows SYSCOHADA classes
   * Account relationships and constraints are enforced

3. **Audit‑Ready Outputs**

   * Deterministic calculations
   * Traceability from reports back to original entries
   * Reproducible results given the same inputs

---

## 5. Explicit Non‑Goals / Disclaimers

The library does **not** guarantee:

* Country‑specific tax compliance (VAT rules, fiscal declarations)
* Legal responsibility for financial statements
* Replacement of professional accountants or auditors

The engine is **audit‑ready**, not **legally liable**.

---

## 6. Chart of Accounts

### 6.1 Built‑in Chart

* The library ships with a **built‑in SYSCOHADA chart of accounts**
* Default configuration matches SYSCOHADA standards
* Country‑level variations may be layered via configuration

### 6.2 Account Access Rules

Accounts can be referenced in two ways:

1. **Implicit (recommended)**

   * Accounts are selected automatically based on business events

2. **Explicit (advanced usage)**

   * Developers may specify accounts manually
   * Constraints:

     * Account must exist in the chart
     * Account must be valid for the operation
     * Strong typing / autocompletion encouraged

Free‑form or unknown accounts are **never allowed**.

---

## 7. Business Events API

### 7.1 Purpose

Business events allow developers to describe **what happened**, not **how to debit/credit**.

Examples:

* Sale
* Purchase
* Expense
* Salary payment
* Cash deposit

### 7.2 Example (Conceptual)

```ts
recordSale({
  amount: 100000,
  currency: 'XAF',
  paymentMethod: 'CASH'
})
```

The engine internally generates compliant accounting entries.

---

## 8. Accounting Entries

### 8.1 Entry Structure

Each accounting entry includes:

* Date
* Account
* Debit or Credit amount
* Currency
* Reference to originating event

Entries are:

* Immutable
* Append‑only
* Pure data (no side effects)

### 8.2 Manual Entries

Manual entries are allowed **only if**:

* Accounts exist in the chart
* Entry remains balanced
* Structural rules are respected

---

## 9. Reporting Engine

The engine can generate, from stored entries:

* Journal
* Trial Balance
* General Ledger
* Account balances

Properties:

* Deterministic
* Stateless
* Reproducible

---

## 10. Configuration Model

### 10.1 Defaults

* SYSCOHADA configuration enabled by default
* Sensible account mappings for common events

### 10.2 Overrides

Developers may:

* Override event → account mappings
* Extend charts while preserving structure
* Enable country‑specific layers

---

## 11. Performance & Packaging

* Library includes embedded chart data (optimized for size)
* Lazy loading where applicable
* Tree‑based and indexed account resolution

Target size is optimized for backend and frontend usage.

---

## 12. Educational Use

The engine is intentionally designed to:

* Make accounting logic readable
* Allow inspection of generated entries
* Be usable as a teaching tool

---

## 13. Open Source

* Fully open‑source
* Designed for community extension
* Clear contribution boundaries (core vs country layers)

---

## 14. Summary

**OHADA Accounting Engine** is:

* A serious accounting core
* Safe by default
* Flexible by design
* Built for African realities
* Ready for production and audits

But it remains a **tool**, not a legal authority.
