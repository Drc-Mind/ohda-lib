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

const MOCK_SUPPLIERS = [
  'Bralima SARL',
  'Congo Airways',
  'Shoprite Goma',
  'GTS Security',
  'Vodacom RDC',
];

const MOCK_RAW_MATERIALS = [
  { id: '1', name: 'Rame de Papier A4', price: 5500, category: 'OFFICE' },
  { id: '2', name: 'Cartouche Encre HP', price: 45000, category: 'OFFICE' },
  { id: '3', name: 'Carburant Gazoil (L)', price: 3200, category: 'FUEL' },
  { id: '4', name: 'Maintenance Clim', price: 25000, category: 'MAINTENANCE' },
];

const PAYMENT_METHODS = [
  { value: 'none', label: 'En attente' },
  { value: 'cash', label: 'Espèces' },
  { value: 'bank', label: 'Banque/Virement' },
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
      setError('Veuillez remplir les champs obligatoires.');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Approvisionnements</h1>
          <p className="text-base-content/50 text-sm">Gérez vos achats et stocks fournisseurs</p>
        </div>
        <button className="btn btn-info" onClick={openModal}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel Achat
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Achat (HT)', value: fmt(totalHT), color: 'text-info' },
          { label: 'TVA Récupérable', value: fmt(totalVAT), color: 'text-base-content' },
          { label: 'Total TTC', value: fmt(totalTTC), color: 'text-info font-bold' },
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
                  <th>Article / Service</th>
                  <th>Fournisseur</th>
                  <th className="text-right">Montant HT</th>
                  <th className="text-right">TVA</th>
                  <th className="text-right">Total TTC</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-20 text-base-content/40">
                       <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        <p>Aucun achat enregistré. Cliquez sur <strong>Nouvel Achat</strong>.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  purchases.map((record) => {
                    const vat = record.meta.vatAmount ?? 0;
                    const isOpen = openIds.has(record.id);
                    return (
                      <React.Fragment key={record.id}>
                        <tr className="hover cursor-pointer border-b border-base-200/50" onClick={() => toggleId(record.id)}>
                          <td className="text-xs font-medium opacity-60">
                            {new Date(record.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="font-medium">{record.label}</td>
                          <td className="text-base-content/70">{record.meta.supplierName || '—'}</td>
                          <td className="text-right font-mono text-sm">{fmt(record.amount)}</td>
                          <td className="text-right font-mono text-sm opacity-60">{fmt(vat)}</td>
                          <td className="text-right font-mono font-bold text-info">{fmt(record.amount + vat)}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              {record.meta.paymentMethod && record.meta.paymentMethod !== 'none' ? (
                                <span className="badge badge-info badge-soft badge-sm">Payé</span>
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
                                <div className="text-xs font-bold mb-3 uppercase tracking-widest opacity-40">Imputation automatique (Journal des Achats)</div>
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
        <div className="bg-info p-6 text-info-content">
            <h3 className="font-bold text-xl">Saisir un Achat</h3>
            <p className="text-sm opacity-80">Enregistrez une facture fournisseur ou un achat comptant</p>
          </div>

          <div className="p-6 space-y-4">
            {error && <div className="alert alert-error text-sm py-2">{error}</div>}

            <div className="form-control">
              <label className="label"><span className="label-text font-bold">Modèle d'article</span></label>
              <select
                className="select select-bordered"
                onChange={(e) => {
                  const p = MOCK_RAW_MATERIALS.find(x => x.id === e.target.value);
                  if (p) {
                    setForm({ ...form, label: p.name, amount: p.price.toString() });
                  }
                }}
              >
                <option value="">-- Choisir un article courant --</option>
                {MOCK_RAW_MATERIALS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({fmt(p.price)})</option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Libellé de l'achat *</span></label>
              <input
                className="input input-bordered"
                placeholder="Ex: Fournitures de bureau"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Fournisseur</span></label>
                <input
                  list="suppliers-list"
                  className="input input-bordered"
                  placeholder="Rechercher..."
                  value={form.supplierName}
                  onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                />
                <datalist id="suppliers-list">
                  {MOCK_SUPPLIERS.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Règlement</span></label>
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
                <label className="label"><span className="label-text font-medium">Montant HT *</span></label>
                <input
                  className="input input-bordered"
                  type="number"
                  placeholder="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">TVA (%)</span></label>
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
                <div className="flex justify-between font-bold text-lg">
                  <span>NET À PAYER (TTC)</span>
                  <span className="text-info">{fmt(Number(form.amount) * (1 + Number(form.vatRate) / 100))}</span>
                </div>
              </div>
            )}

            <div className="modal-action mt-2">
              <form method="dialog" className="flex gap-2 w-full">
                <button className="btn btn-ghost flex-1">Annuler</button>
                <button type="button" className="btn btn-info flex-1" onClick={handleSubmit}>Enregistrer l'Achat</button>
              </form>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </div>
  );
}
