import React, { useRef, useState } from 'react';
import { Ohada } from '@drcmind/ohada-lib';
import { useStore } from '../store/StoreContext';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(n);

function JournalLines({ entry, index }: { entry: any; index: number }) {
  const typeLabel = index === 0 ? 'Validation de l\'achat' : 'Paiement effectué';
  return (
    <div className="bg-base-200/50 p-4 rounded-lg mt-2 mb-4">
      <p className="text-xs font-bold mb-2 uppercase opacity-50 tracking-wider font-mono">{typeLabel} — {entry.label}</p>
      <table className="table table-xs">
        <thead>
          <tr>
            <th>Opération</th>
            <th className="text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          {entry.lines.map((line: any, i: number) => {
            return (
              <tr key={i}>
                <td>{line.label}</td>
                <td className="text-right font-mono">
                  {line.debit ? fmt(line.debit) : fmt(line.credit)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const PAYMENT_METHODS = [
  { value: 'none', label: 'Not yet paid' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank Transfer' },
];

const initForm = () => ({
  label: '',
  supplierName: '',
  amount: '',
  vatRate: '18',
  paymentMethod: 'none',
});

export default function Purchases() {
  const { store, addRecord } = useStore();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState(initForm());
  const [error, setError] = useState('');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggleId = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const purchases = store.records
    .filter((r) => r.type === 'purchase')
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalHT = purchases.reduce((s, r) => s + r.amount, 0);
  const totalVAT = purchases.reduce((s, r) => s + (r.meta.vatAmount ?? 0), 0);
  const totalTTC = totalHT + totalVAT;

  const openModal = () => {
    setForm(initForm());
    setError('');
    dialogRef.current?.showModal();
  };

  const handleSubmit = () => {
    const amount = Number(form.amount);
    const vatRate = Number(form.vatRate);
    if (!form.label.trim() || !amount || amount <= 0) {
      setError('Please fill in all required fields.');
      return;
    }

    const ohada = new Ohada({ disableVAT: vatRate === 0 });
    const ttc = amount * (1 + vatRate / 100);
    const payments =
      form.paymentMethod !== 'none'
        ? [{ method: form.paymentMethod as 'cash' | 'bank', amount: ttc }]
        : [];

    const journalEntries = ohada.recordPurchase({
      label: form.label,
      amount,
      vatRate: vatRate || undefined,
      payments,
    });

    addRecord({
      label: form.label,
      amount,
      type: 'purchase',
      meta: {
        supplierName: form.supplierName,
        vatAmount: amount * (vatRate / 100),
        paymentMethod: form.paymentMethod,
      },
      journalEntries,
    });

    dialogRef.current?.close();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchases</h1>
          <p className="text-base-content/50 text-sm mt-0.5">Record supplier purchases and invoices</p>
        </div>
        <button className="btn btn-info" onClick={openModal}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Purchase
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total HT', value: fmt(totalHT), color: 'text-info' },
          { label: 'Total VAT', value: fmt(totalVAT), color: 'text-base-content' },
          { label: 'Total TTC', value: fmt(totalTTC), color: 'text-info font-bold' },
        ].map((s) => (
          <div key={s.label} className="stat bg-base-100 shadow rounded-box py-3 px-4">
            <div className="stat-title text-xs">{s.label}</div>
            <div className={`stat-value text-xl ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Supplier</th>
                  <th className="text-right">Amount HT</th>
                  <th className="text-right">VAT</th>
                  <th className="text-right">Total TTC</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-base-content/40">
                      No purchases recorded yet. Click <strong>New Purchase</strong> to start.
                    </td>
                  </tr>
                ) : (
                  purchases.map((record) => {
                    const vat = record.meta.vatAmount ?? 0;
                    const isOpen = openIds.has(record.id);
                    return (
                      <React.Fragment key={record.id}>
                        <tr className="hover cursor-pointer" onClick={() => toggleId(record.id)}>
                          <td className="text-sm whitespace-nowrap text-base-content/60">
                            {new Date(record.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="max-w-48 truncate">{record.label}</td>
                          <td className="text-base-content/60">{record.meta.supplierName || '—'}</td>
                          <td className="text-right font-mono">{fmt(record.amount)}</td>
                          <td className="text-right font-mono text-base-content/60">{fmt(vat)}</td>
                          <td className="text-right font-mono font-semibold">{fmt(record.amount + vat)}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              {record.meta.paymentMethod && record.meta.paymentMethod !== 'none' ? (
                                <span className="badge badge-info badge-sm">
                                  {PAYMENT_METHODS.find((p) => p.value === record.meta.paymentMethod)?.label ?? record.meta.paymentMethod}
                                </span>
                              ) : (
                                <span className="badge badge-ghost badge-sm">Pending</span>
                              )}
                              <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr>
                            <td colSpan={7} className="p-0">
                              <div className="px-6">
                                {record.journalEntries.map((e, idx) => (
                                  <JournalLines key={idx} entry={e} index={idx} />
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dialog */}
      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-lg">
          <h3 className="font-bold text-lg mb-4">New Purchase</h3>

          <div className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Description *</span></label>
              <input
                className="input input-bordered w-full"
                placeholder="e.g. Office supplies — Supplier ABC"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Supplier Name</span></label>
              <input
                className="input input-bordered w-full"
                placeholder="Supplier name (optional)"
                value={form.supplierName}
                onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Amount HT *</span></label>
                <input
                  className="input input-bordered"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">VAT Rate (%)</span></label>
                <input
                  className="input input-bordered"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="18"
                  value={form.vatRate}
                  onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
                />
              </div>
            </div>

            {form.amount && Number(form.amount) > 0 && (
              <div className="bg-base-200 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-base-content/60">Amount HT</span>
                  <span className="font-mono">{fmt(Number(form.amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">VAT ({form.vatRate}%)</span>
                  <span className="font-mono">{fmt(Number(form.amount) * Number(form.vatRate) / 100)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-base-300 pt-1 mt-1">
                  <span>Total TTC</span>
                  <span className="font-mono text-info">{fmt(Number(form.amount) * (1 + Number(form.vatRate) / 100))}</span>
                </div>
              </div>
            )}

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Payment Method</span></label>
              <select
                className="select select-bordered"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                {PAYMENT_METHODS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {error && <div className="alert alert-error text-sm py-2">{error}</div>}
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost mr-2">Cancel</button>
            </form>
            <button className="btn btn-info" onClick={handleSubmit}>Record Purchase</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </div>
  );
}
