import './style.css'
import { Ohada } from '../../src/index'

const app = document.querySelector<HTMLDivElement>('#app')!

// --- Types ---
interface Transaction {
  id: string;
  module: 'sales' | 'purchase' | 'expense';
  label: string;
  amount: number;
  date: Date;
  results: any[];
  category?: string;
}

// --- State ---
let currentModule: 'sales' | 'purchase' | 'expense' = 'sales'
let transactions: Transaction[] = []
let isModalOpen = false
let modalType: 'form' | 'detail' = 'form'
let selectedTransaction: Transaction | null = null
let activeDetailTab: 'journal' | 'json' = 'journal'

// Form temporary states
let purchasePayments: { method: 'bank' | 'cash', amount: number }[] = []
let purchaseCharges: { type: 'Transport' | 'Douane' | 'Divers', amount: number }[] = []

const ohada = new Ohada()

// --- Core Rendering ---
function render() {
  app.innerHTML = `
    <div class="dashboard">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <h1>📊 OHADA ERP</h1>
        </div>
        <nav>
          <ul class="sidebar-nav">
            <li class="nav-item ${currentModule === 'sales' ? 'active' : ''}" data-mod="sales">
              <span>💰 Sales</span>
            </li>
            <li class="nav-item ${currentModule === 'purchase' ? 'active' : ''}" data-mod="purchase">
              <span>🛒 Purchases</span>
            </li>
            <li class="nav-item ${currentModule === 'expense' ? 'active' : ''}" data-mod="expense">
              <span>💳 Expenses</span>
            </li>
          </ul>
        </nav>
      </aside>

      <main class="main-content">
        ${renderHeader()}
        ${renderStats()}
        
        <div class="content-card">
          <div class="data-table-container">
            ${renderTable()}
          </div>
        </div>
      </main>
    </div>

    ${renderModal()}
  `
  setupEventListeners()
}

function renderHeader() {
  const titles = { sales: 'Sales Ledger', purchase: 'Purchase Ledger', expense: 'Expense Ledger' }
  return `
    <header class="page-header">
      <div class="header-text">
        <h2>${titles[currentModule]}</h2>
        <p>Manage and track all SYSCOHADA compliant transactions.</p>
      </div>
      <div class="action-bar">
        <button class="btn btn-lg" id="btn-new-transaction">
          <span>+ New ${currentModule.charAt(0).toUpperCase() + currentModule.slice(1)}</span>
        </button>
      </div>
    </header>
  `
}

function renderStats() {
  const modTransactions = transactions.filter(t => t.module === currentModule)
  const totalAmount = modTransactions.reduce((acc, t) => acc + t.amount, 0)
  
  return `
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Total Volume</span>
        <span class="stat-value">${totalAmount.toLocaleString()} FCFA</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Total Count</span>
        <span class="stat-value">${modTransactions.length}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Last Activity</span>
        <span class="stat-value" style="font-size: 1.25rem">
          ${modTransactions.length > 0 ? modTransactions[modTransactions.length-1].date.toLocaleDateString() : 'No entries'}
        </span>
      </div>
    </div>
  `
}

function renderTable() {
  const modTransactions = transactions.filter(t => t.module === currentModule).reverse()
  
  if (modTransactions.length === 0) {
    return `
      <div style="padding: 4rem; text-align: center; color: var(--text-muted)">
        <p>No transactions found in this ledger.</p>
        <p style="font-size: 0.875rem">Click the button above to add your first entry.</p>
      </div>
    `
  }

  return `
    <table class="data-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Label</th>
          ${currentModule !== 'purchase' ? '<th>Category</th>' : ''}
          <th style="text-align: right">Amount (FCFA)</th>
          <th style="text-align: center">Status</th>
        </tr>
      </thead>
      <tbody>
        ${modTransactions.map(t => `
          <tr class="tr-clickable" data-id="${t.id}">
            <td>${t.date.toLocaleDateString()}</td>
            <td style="font-weight: 500">${t.label}</td>
            ${currentModule !== 'purchase' ? `<td><span class="badge ${getBadgeColor(t.module)}">${t.category || '-'}</span></td>` : ''}
            <td style="text-align: right; font-weight: 600">${t.amount.toLocaleString()}</td>
            <td style="text-align: center"><span class="badge badge-green">Balanced</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

function getBadgeColor(mod: string) {
  if (mod === 'sales') return 'badge-blue'
  return 'badge-orange'
}

// --- Modal Rendering ---

function renderModal() {
  if (!isModalOpen) return '<div class="modal-overlay"></div>'

  return `
    <div class="modal-overlay active">
      <div class="modal-content">
        <div class="modal-header">
          <h3>${modalType === 'form' ? `Add New ${currentModule}` : 'Transaction Detail'}</h3>
          <button class="modal-close" id="modal-close-btn">×</button>
        </div>
        <div class="modal-body">
          ${modalType === 'form' ? renderForm() : renderDetailView()}
        </div>
        ${modalType === 'form' ? `
          <div class="modal-footer">
            <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
            <button class="btn" form="erp-form">Save Transaction</button>
          </div>
        ` : ''}
      </div>
    </div>
  `
}

function renderForm() {
  if (currentModule === 'sales') {
    return `
      <form id="erp-form">
        <div class="form-section">
          <div class="form-section-title">General Information</div>
          <div class="form-group">
            <label>Sale Category</label>
            <select name="saleType">
              <option value="GOODS">Goods (701)</option>
              <option value="MANUFACTURED">Manufactured Products (702)</option>
              <option value="SERVICES">Services (706)</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Amount (Net Commercial)</label>
              <input type="number" name="amount" value="1000000" required>
            </div>
            <div class="form-group">
              <label>VAT Rate (%)</label>
              <input type="number" name="vatRate" value="18">
            </div>
          </div>
          <div class="form-group">
            <label>Transaction Label</label>
            <input type="text" name="label" value="Vente de marchandises" required>
          </div>
        </div>

        <div class="form-section">
          <div class="form-section-title">Adjustments</div>
          <div class="form-row">
            <div class="form-group">
              <label>Financial Discount (%)</label>
              <input type="number" name="discountPerc" value="0">
            </div>
            <div class="form-group">
              <label>Transport Charge</label>
              <input type="number" name="transport" value="0">
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="form-section-title">Inventory & Payment</div>
          <div class="form-group">
            <label>Cost of Goods Sold (CMUP)</label>
            <input type="number" name="costPrice" value="600000">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Payment Amount</label>
              <input type="number" name="paymentAmount" value="0">
            </div>
            <div class="form-group">
              <label>Method</label>
              <select name="paymentMethod">
                <option value="bank">Bank</option>
                <option value="cash">Cash</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    `
  }

  if (currentModule === 'purchase') {
    return `
      <form id="erp-form">
        <div class="form-section">
          <div class="form-section-title">Invoice Details</div>
          <div class="form-row">
            <div class="form-group">
              <label>Amount (HT)</label>
              <input type="number" name="amount" value="500000" required>
            </div>
            <div class="form-group">
              <label>VAT Rate (%)</label>
              <input type="number" name="vatRate" value="18">
            </div>
          </div>
          <div class="form-group">
            <label>Description</label>
            <input type="text" name="label" value="Achat de marchandises" required>
          </div>
        </div>

        <div class="form-section">
          <div class="form-section-title">Additional Charges</div>
          <div id="charges-list" class="dynamic-list">
            ${purchaseCharges.map((c, i) => `
              <div class="dynamic-item">
                <span>${c.type}</span>
                <span>${c.amount.toLocaleString()}</span>
                <button type="button" class="btn-remove" data-idx="${i}" data-type="charge">×</button>
              </div>
            `).join('')}
          </div>
          <div class="form-row">
            <select id="new-charge-type">
              <option value="Transport">Transport</option>
              <option value="Douane">Douane</option>
              <option value="Divers">Divers</option>
            </select>
            <input type="number" id="new-charge-amount" placeholder="Amount">
          </div>
          <button type="button" id="add-charge" class="btn btn-secondary" style="width: 100%; margin-top: 0.5rem">Add Charge</button>
        </div>

        <div class="form-section">
          <div class="form-section-title">Payments</div>
          <div id="payments-list" class="dynamic-list">
            ${purchasePayments.map((p, i) => `
              <div class="dynamic-item">
                <span style="text-transform: capitalize">${p.method}</span>
                <span>${p.amount.toLocaleString()}</span>
                <button type="button" class="btn-remove" data-idx="${i}" data-type="payment">×</button>
              </div>
            `).join('')}
          </div>
          <div class="form-row">
            <select id="new-payment-method">
              <option value="bank">Bank</option>
              <option value="cash">Cash</option>
            </select>
            <input type="number" id="new-payment-amount" placeholder="Amount">
          </div>
          <button type="button" id="add-payment" class="btn btn-secondary" style="width: 100%; margin-top: 0.5rem">Add Payment</button>
        </div>
      </form>
    `
  }

  return `
    <form id="erp-form">
      <div class="form-section">
        <div class="form-section-title">Expense Details</div>
        <div class="form-group">
          <label>Category</label>
          <select name="category">
            <option value="ELECTRICITY">Electricity (6052)</option>
            <option value="WATER">Water (6051)</option>
            <option value="RENT_BUILDING">Rent (6222)</option>
            <option value="TELECOMMUNICATIONS">Telecom (6281)</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Total TTC</label>
            <input type="number" name="amount" value="75000" required>
          </div>
          <div class="form-group">
            <label>VAT Rate (%)</label>
            <input type="number" name="vatRate" value="18">
          </div>
        </div>
        <div class="form-group">
          <label>Label</label>
          <input type="text" name="label" value="Payment of monthly bill" required>
        </div>
      </div>
    </form>
  `
}

function renderDetailView() {
  if (!selectedTransaction) return ''
  
  return `
    <div class="tabs">
      <div class="tab ${activeDetailTab === 'journal' ? 'active' : ''}" data-dtab="journal">Accounting Journal</div>
      <div class="tab ${activeDetailTab === 'json' ? 'active' : ''}" data-dtab="json">Raw Engine JSON</div>
    </div>
    <div id="detail-content">
      ${activeDetailTab === 'journal' ? renderJournal(selectedTransaction.results) : renderJson(selectedTransaction.results)}
    </div>
  `
}

function renderJournal(results: any[]) {
  return results.map((entry, idx) => `
    <div class="journal-entry">
      <div class="entry-header">
        <h4 style="font-size: 0.875rem">Entry Layer #${idx + 1}</h4>
        <span class="badge badge-green">Balanced</span>
      </div>
      <table class="journal-table">
        <thead>
          <tr>
            <th>Account</th>
            <th>Label</th>
            <th class="amount-cell">Debit</th>
            <th class="amount-cell">Credit</th>
          </tr>
        </thead>
        <tbody>
          ${entry.lines.map((l: any) => `
            <tr>
              <td class="account-cell" style="color: var(--primary); font-weight: 600">${l.account}</td>
              <td style="font-size: 0.75rem">${l.label}</td>
              <td class="amount-cell">${l.debit > 0 ? l.debit.toLocaleString() : '-'}</td>
              <td class="amount-cell">${l.credit > 0 ? l.credit.toLocaleString() : '-'}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2">TOTAL</td>
            <td class="amount-cell">${entry.totals.debit.toLocaleString()}</td>
            <td class="amount-cell">${entry.totals.credit.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `).join('')
}

function renderJson(results: any[]) {
  const jsonStr = JSON.stringify(results, null, 2)
  return `<pre class="json-viewer">${highlightJson(jsonStr)}</pre>`
}

function highlightJson(json: string) {
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
    let cls = 'json-number'
    if (/^"/.test(match)) {
      if (/:$/.test(match)) cls = 'json-key'
      else cls = 'json-string'
    } else if (/true|false/.test(match)) cls = 'json-boolean'
    return `<span class="${cls}">${match}</span>`
  })
}

// --- Logic ---

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      currentModule = el.getAttribute('data-mod') as any
      render()
    })
  })

  // Modal Close
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal)
  document.getElementById('modal-cancel-btn')?.addEventListener('click', closeModal)
  
  // New Transaction
  document.getElementById('btn-new-transaction')?.addEventListener('click', () => {
    isModalOpen = true
    modalType = 'form'
    purchasePayments = []
    purchaseCharges = []
    render()
  })

  // Table Row Click
  document.querySelectorAll('.tr-clickable').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-id')
      selectedTransaction = transactions.find(t => t.id === id) || null
      if (selectedTransaction) {
        isModalOpen = true
        modalType = 'detail'
        activeDetailTab = 'journal'
        render()
      }
    })
  })

  // Detail Tabs
  document.querySelectorAll('[data-dtab]').forEach(el => {
    el.addEventListener('click', () => {
      activeDetailTab = el.getAttribute('data-dtab') as any
      render()
    })
  })

  // Purchase Dynamic Fields
  if (currentModule === 'purchase' && modalType === 'form') {
    document.getElementById('add-charge')?.addEventListener('click', () => {
      const type = (document.getElementById('new-charge-type') as HTMLSelectElement).value
      const amount = Number((document.getElementById('new-charge-amount') as HTMLInputElement).value)
      if (amount > 0) {
        purchaseCharges.push({ type: type as any, amount })
        render()
      }
    })

    document.getElementById('add-payment')?.addEventListener('click', () => {
      const method = (document.getElementById('new-payment-method') as HTMLSelectElement).value
      const amount = Number((document.getElementById('new-payment-amount') as HTMLInputElement).value)
      if (amount > 0) {
        purchasePayments.push({ method: method as any, amount })
        render()
      }
    })

    document.querySelectorAll('.btn-remove').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        const idx = Number(el.getAttribute('data-idx'))
        const type = el.getAttribute('data-type')
        if (type === 'charge') purchaseCharges.splice(idx, 1)
        else purchasePayments.splice(idx, 1)
        render()
      })
    })
  }

  // Form Submission
  const form = document.getElementById('erp-form') as HTMLFormElement
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const fd = new FormData(form)
      let opResults: any[] = []
      const label = fd.get('label') as string
      const amount = Number(fd.get('amount'))

      try {
        if (currentModule === 'sales') {
          opResults = ohada.recordSale({
            saleType: fd.get('saleType') as any,
            amount,
            label,
            vatRate: Number(fd.get('vatRate')),
            financialDiscount: Number(fd.get('discountPerc')) > 0 ? { percentage: Number(fd.get('discountPerc')) } : undefined,
            transportCharge: Number(fd.get('transport')) > 0 ? { amount: Number(fd.get('transport')) } : undefined,
            inventoryExit: Number(fd.get('costPrice')) > 0 ? { costPrice: Number(fd.get('costPrice')) } : undefined,
            payment: Number(fd.get('paymentAmount')) > 0 ? {
              method: fd.get('paymentMethod') as any,
              amount: Number(fd.get('paymentAmount'))
            } : undefined
          })
        } else if (currentModule === 'purchase') {
          opResults = ohada.recordPurchase({
            amount,
            label,
            vatRate: Number(fd.get('vatRate')),
            charges: purchaseCharges,
            payments: purchasePayments
          })
        } else if (currentModule === 'expense') {
          opResults = ohada.recordExpense({
            category: fd.get('category') as any,
            amount,
            label,
            vatRate: Number(fd.get('vatRate')),
            payment: {
              method: fd.get('paymentMethod') as any,
              amount
            }
          })
        }

        transactions.push({
          id: Math.random().toString(36).substr(2, 9),
          module: currentModule,
          label,
          amount,
          date: new Date(),
          results: opResults,
          category: fd.get('category') as string || fd.get('saleType') as string
        })

        closeModal()
      } catch (err: any) {
        alert(err.message)
      }
    })
  }
}

function closeModal() {
  isModalOpen = false
  modalType = 'form'
  selectedTransaction = null
  render()
}

render()
