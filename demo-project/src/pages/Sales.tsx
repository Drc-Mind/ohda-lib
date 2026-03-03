import React, { useRef, useState } from 'react';
import { Ohada } from '@drcmind/ohada-lib';
import type { SaleType } from '@drcmind/ohada-lib';
import { useStore } from '../store/StoreContext';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(n);

function JournalLines({ entry, index }: { entry: any; index: number }) {
  const typeLabel = index === 0 ? 'Validation de la vente' : 'Règlement reçu';
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

const MOCK_PRODUCTS = [
  { id: '1', name: 'Ordinateur Portable', price: 850000, category: 'GOODS' },
  { id: '2', name: 'Smartphone Pro', price: 450000, category: 'GOODS' },
  { id: '3', name: 'Service Maintenance', price: 50000, category: 'SERVICES' },
  { id: '4', name: 'Logiciel ERP V1', price: 1200000, category: 'MANUFACTURED' },
];

const MOCK_CLIENTS = [
  'Client Particulier',
  'Société Nouvelle SARL',
  'Etablissements MBAYA',
  'Ministère des Finances',
];

const PAYMENT_METHODS = [
  { value: 'none', label: 'En attente' },
  { value: 'cash', label: 'Espèces' },
  { value: 'bank', label: 'Virement/Carte' },
];

const initForm = () => ({
  saleType: 'GOODS' as SaleType,
  label: '',
  clientName: '',
  amount: '',
  vatRate: '18',
  paymentMethod: 'none',
});

export default function Sales() {
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

  const sales = store.records
    .filter((r) => r.type === 'sale')
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalHT = sales.reduce((s, r) => s + r.amount, 0);
  const totalVAT = sales.reduce((s, r) => s + (r.meta.vatAmount ?? 0), 0);
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

    const journalEntries = ohada.recordSale({
      saleType: form.saleType,
      label: form.label,
      amount,
      vatRate: vatRate || undefined,
      payments,
    });

    addRecord({
      label: form.label,
      amount,
      type: 'sale',
      meta: {
        clientName: form.clientName,
        saleType: form.saleType,
        vatAmount: amount * (vatRate / 100),
        paymentMethod: form.paymentMethod,
      },
      journalEntries,
    });

    dialogRef.current?.close();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Point de Vente (POS)</h1>
          <p className="text-sm text-base-content/50">Enregistrez vos ventes et factures clients</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle Vente
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Chiffre d\'Affaires (HT)', value: fmt(totalHT), color: 'text-primary' },
          { label: 'TVA Collectée', value: fmt(totalVAT), color: 'text-base-content' },
          { label: 'Total Encaissé (TTC)', value: fmt(totalTTC), color: 'text-primary font-bold' },
        ].map((s) => (
          <div key={s.label} className="stat bg-base-100 shadow rounded-box py-3 px-4 border border-base-200">
            <div className="stat-title text-xs uppercase tracking-widest opacity-60">{s.label}</div>
            <div className={`stat-value text-xl font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card bg-base-100 shadow border border-base-200 overflow-hidden">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-base-200/50">
                <tr>
                  <th>Date</th>
                  <th>Produit / Service</th>
                  <th>Client</th>
                  <th className="text-right">Montant HT</th>
                  <th className="text-right">TVA</th>
                  <th className="text-right">Total TTC</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-20 text-base-content/40">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        <p>Aucune vente enregistrée. Cliquez sur <strong>Nouvelle Vente</strong>.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sales.map((record) => {
                    const vat = record.meta.vatAmount ?? 0;
                    const isOpen = openIds.has(record.id);
                    return (
                      <React.Fragment key={record.id}>
                        <tr className="hover cursor-pointer border-b border-base-200/50" onClick={() => toggleId(record.id)}>
                          <td className="text-xs font-medium opacity-60">
                            {new Date(record.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="font-medium">{record.label}</td>
                          <td className="text-base-content/70">{record.meta.clientName || 'Client Comptant'}</td>
                          <td className="text-right font-mono text-sm">{fmt(record.amount)}</td>
                          <td className="text-right font-mono text-sm opacity-60">{fmt(vat)}</td>
                          <td className="text-right font-mono font-bold text-primary">{fmt(record.amount + vat)}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              {record.meta.paymentMethod && record.meta.paymentMethod !== 'none' ? (
                                <span className="badge badge-success badge-soft badge-sm">Payé</span>
                              ) : (
                                <span className="badge badge-warning badge-soft badge-sm">Crédit</span>
                              )}
                              <svg className={`w-3 h-3 opacity-30 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr>
                            <td colSpan={7} className="p-0 bg-base-200/20">
                              <div className="px-8 py-4">
                                <div className="text-xs font-bold mb-3 uppercase tracking-widest opacity-40">Détails de la transaction (Automatique)</div>
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

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box max-w-lg p-0 overflow-hidden">
          <div className="bg-primary p-6 text-primary-content">
            <h3 className="font-bold text-xl">Vendre un article</h3>
            <p className="text-sm opacity-80">Remplissez les détails pour générer la transaction</p>
          </div>

          <div className="p-6 space-y-5">
            {error && (
              <div className="alert alert-error text-sm py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <div className="form-control">
              <label className="label"><span className="label-text font-bold">Sélectionner un produit modèle</span></label>
              <select
                className="select select-bordered w-full"
                onChange={(e) => {
                  const p = MOCK_PRODUCTS.find(x => x.id === e.target.value);
                  if (p) {
                    setForm({
                      ...form,
                      label: p.name,
                      amount: p.price.toString(),
                      saleType: p.category as SaleType
                    });
                  }
                }}
              >
                <option value="">-- Choisir un produit (ou saisir manuellement) --</option>
                {MOCK_PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({fmt(p.price)})</option>
                ))}
              </select>
            </div>

            <div className="divider text-xs opacity-30 mt-0">OU SAISIR MANUELLEMENT</div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Nom du produit / Service *</span></label>
              <input
                className="input input-bordered w-full"
                placeholder="Ex: Prestation de service"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Client</span></label>
                <input
                  list="clients-list"
                  className="input input-bordered"
                  placeholder="Rechercher..."
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                />
                <datalist id="clients-list">
                  {MOCK_CLIENTS.map(c => <option key={c} value={c} />)}
                </datalist>
                </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Mode de paiement</span></label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Prix de vente HT *</span></label>
                <input
                  className="input input-bordered"
                  type="number"
                  placeholder="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label group">
                  <span className="label-text font-medium">Taux TVA (%)</span>
                  <span className="label-text-alt opacity-50">Standard: 18%</span>
                </label>
                <input
                  className="input input-bordered"
                  type="number"
                  value={form.vatRate}
                  onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
                />
              </div>
            </div>

            {form.amount && Number(form.amount) > 0 && (
              <div className="bg-base-200/50 rounded-xl p-4 text-sm space-y-2 border border-base-300">
                <div className="flex justify-between items-center text-base-content/60 italic">
                  <span>Sous-total Hors Taxes</span>
                  <span className="font-mono">{fmt(Number(form.amount))}</span>
                </div>
                <div className="flex justify-between items-center text-error italic">
                  <span>Taxe (TVA {form.vatRate}%)</span>
                  <span className="font-mono">+{fmt(Number(form.amount) * (Number(form.vatRate)/100))}</span>
                </div>
                <div className="divider my-0 opacity-20"></div>
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>NET À PAYER (TTC)</span>
                  <span className="text-primary">{fmt(Number(form.amount) * (1 + Number(form.vatRate)/100))}</span>
                </div>
              </div>
            )}

            <div className="modal-action mt-2">
              <form method="dialog" className="flex gap-2 w-full">
                <button className="btn btn-ghost flex-1">Annuler</button>
                <button type="button" className="btn btn-primary flex-1" onClick={handleSubmit}>Confirmer la Vente</button>
              </form>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </div>
  );
}
