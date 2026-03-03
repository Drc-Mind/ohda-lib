import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Ohada } from '@drcmind/ohada-lib';
import type {
  OpeningEntryInput, OpeningFixedAsset, OpeningStock,
  OpeningReceivable, OpeningLiability,
  FixedAssetType, StockType, ReceivableType, LiabilityType,
} from '@drcmind/ohada-lib';
import { useStore } from '../store/StoreContext';

// ── Label maps ────────────────────────────────────────────────
const ASSET_TYPES: Record<FixedAssetType, string> = {
  PATENT_LICENSE: 'Patent / License (212)',
  SOFTWARE: 'Software (2183)',
  INTANGIBLE_OTHER: 'Intangible — Other (21)',
  LAND: 'Land (22)',
  COMMERCIAL_BUILDING: 'Commercial Building (2313)',
  RESIDENTIAL_BUILDING: 'Residential Building (2314)',
  INDUSTRIAL_EQUIPMENT: 'Industrial Equipment (241)',
  AGRICULTURAL_EQUIPMENT: 'Agricultural Equipment (243)',
  OFFICE_EQUIPMENT: 'Office Equipment (2441)',
  COMPUTER_EQUIPMENT: 'Computer Equipment (2444)',
  OFFICE_FURNITURE: 'Office Furniture (2445)',
  PASSENGER_VEHICLE: 'Passenger Vehicle (2451)',
  UTILITY_VEHICLE: 'Utility Vehicle / Truck (2452)',
  FINANCIAL_ASSET: 'Financial Asset (27)',
};

const STOCK_TYPES: Record<StockType, string> = {
  MERCHANDISE: 'Merchandise (3111)',
  RAW_MATERIALS: 'Raw Materials (3211)',
  FINISHED_GOODS: 'Finished Goods (3411)',
  PACKAGING: 'Packaging (3611)',
  OTHER_SUPPLIES: 'Other Supplies (3811)',
};

const RECEIVABLE_TYPES: Record<ReceivableType, string> = {
  CUSTOMER: 'Customer Receivable (4111)',
  SUPPLIER_ADVANCE: 'Advance to Supplier (4091)',
  TAX_CREDIT: 'Tax Credit (4717)',
  OTHER_RECEIVABLE: 'Other Receivable (4721)',
};

const LIABILITY_TYPES: Record<LiabilityType, string> = {
  SUPPLIER: 'Supplier Debt (4011)',
  BANK_LOAN: 'Bank Loan (1621)',
  OPERATING_CREDIT: 'Short-term Credit (1622)',
  OTHER_DEBT: 'Other Debt (4711)',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(n);

// ── Generic list item editor ──────────────────────────────────
function ListEditor<T extends { label: string; type: string; amount: number }>({
  items,
  onAdd,
  onRemove,
  typeOptions,
  placeholder,
}: {
  items: T[];
  onAdd: (item: { label: string; type: string; amount: number }) => void;
  onRemove: (label: string) => void;
  typeOptions: Record<string, string>;
  placeholder: string;
}) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState(Object.keys(typeOptions)[0]);
  const [amount, setAmount] = useState('');

  const handleAdd = () => {
    if (!label.trim() || !amount || Number(amount) <= 0) return;
    onAdd({ label: label.trim(), type, amount: Number(amount) });
    setLabel('');
    setAmount('');
  };

  return (
    <div className="space-y-3">
      {/* Input row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className="input input-bordered flex-1"
          placeholder={placeholder}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <select
          className="select select-bordered sm:w-64"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {Object.entries(typeOptions).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          className="input input-bordered w-full sm:w-36"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={0}
        />
        <button className="btn btn-primary" onClick={handleAdd}>Add</button>
      </div>

      {/* List */}
      {items.length > 0 && (
        <div className="overflow-x-auto rounded-box border border-base-200">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th className="text-right">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.label}>
                  <td>{item.label}</td>
                  <td className="text-base-content/60 text-xs">{typeOptions[item.type]}</td>
                  <td className="text-right font-mono">{fmt(item.amount)}</td>
                  <td>
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => onRemove(item.label)}
                    >✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Steps ──────────────────────────────────────────────────────
const STEPS = ['Welcome', 'Fixed Assets', 'Stocks', 'Receivables & Cash', 'Liabilities', 'Review'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setOpeningEntry } = useStore();
  const [step, setStep] = useState(0);

  // form state
  const [fixedAssets, setFixedAssets] = useState<OpeningFixedAsset[]>([]);
  const [stocks, setStocks] = useState<OpeningStock[]>([]);
  const [receivables, setReceivables] = useState<OpeningReceivable[]>([]);
  const [bank, setBank] = useState('');
  const [cash, setCash] = useState('');
  const [mobileMoney, setMobileMoney] = useState('');
  const [liabilities, setLiabilities] = useState<OpeningLiability[]>([]);

  const totalAssets =
    fixedAssets.reduce((s, i) => s + i.amount, 0) +
    stocks.reduce((s, i) => s + i.amount, 0) +
    receivables.reduce((s, i) => s + i.amount, 0) +
    (Number(bank) || 0) +
    (Number(cash) || 0) +
    (Number(mobileMoney) || 0);

  const totalLiabilities = liabilities.reduce((s, i) => s + i.amount, 0);
  const capital = totalAssets - totalLiabilities;

  const handleSubmit = () => {
    const input: OpeningEntryInput = {
      fixedAssets,
      stocks,
      receivables,
      bank: Number(bank) || undefined,
      cash: Number(cash) || undefined,
      mobileMoney: Number(mobileMoney) || undefined,
      liabilities,
    };
    const ohada = new Ohada();
    const entry = ohada.recordOpeningEntry(input);
    setOpeningEntry(entry);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-start py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="bg-primary text-primary-content rounded-2xl p-4 inline-flex mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold">Opening Journal Entry</h1>
        <p className="text-base-content/60 mt-1">Set up your company's initial accounting position</p>
      </div>

      {/* Steps indicator */}
      <ul className="steps steps-horizontal mb-8 w-full max-w-3xl overflow-x-auto">
        {STEPS.map((label, i) => (
          <li key={label} className={`step ${i <= step ? 'step-primary' : ''}`}>
            <span className="hidden sm:inline">{label}</span>
          </li>
        ))}
      </ul>

      {/* Card */}
      <div className="card bg-base-100 shadow-xl w-full max-w-3xl">
        <div className="card-body gap-6">

          {/* Step 0 — Welcome */}
          {step === 0 && (
            <div className="text-center py-6 space-y-4">
              <h2 className="text-2xl font-bold">Welcome to OHADA ERP</h2>
              <p className="text-base-content/70 max-w-md mx-auto">
                Before you can record transactions, you need to enter your company's current
                financial position — this is your <strong>Opening Journal Entry</strong> (A-Nouveaux).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-left">
                {[
                  { icon: '🏗️', title: 'Assets', desc: 'Buildings, vehicles, equipment, stocks, cash…' },
                  { icon: '💳', title: 'Liabilities', desc: 'Supplier debts, bank loans, credits…' },
                  { icon: '⚖️', title: 'Capital', desc: 'Auto-calculated as Assets − Liabilities' },
                ].map((item) => (
                  <div key={item.title} className="bg-base-200 rounded-xl p-4">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-base-content/60">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — Fixed Assets */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Fixed Assets</h2>
                <p className="text-sm text-base-content/60">Immobilisations — vehicles, equipment, buildings, software…</p>
              </div>
              <ListEditor
                items={fixedAssets}
                typeOptions={ASSET_TYPES}
                placeholder="e.g. MacBook Pro, Camion Toyota…"
                onAdd={(item) =>
                  setFixedAssets((p) => [...p, item as OpeningFixedAsset])
                }
                onRemove={(label) =>
                  setFixedAssets((p) => p.filter((i) => i.label !== label))
                }
              />
              {fixedAssets.length === 0 && (
                <p className="text-sm text-base-content/40 italic">No fixed assets added yet — skip if none.</p>
              )}
            </div>
          )}

          {/* Step 2 — Stocks */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Stocks</h2>
                <p className="text-sm text-base-content/60">Merchandise, raw materials, finished goods at cost price.</p>
              </div>
              <ListEditor
                items={stocks}
                typeOptions={STOCK_TYPES}
                placeholder="e.g. Stock marchandises…"
                onAdd={(item) => setStocks((p) => [...p, item as OpeningStock])}
                onRemove={(label) => setStocks((p) => p.filter((i) => i.label !== label))}
              />
              {stocks.length === 0 && (
                <p className="text-sm text-base-content/40 italic">No stocks — skip if none.</p>
              )}
            </div>
          )}

          {/* Step 3 — Receivables + Cash */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">Receivables & Cash</h2>
                <p className="text-sm text-base-content/60">Customer debts, bank balance, cash on hand, and mobile money.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">Receivables</p>
                <ListEditor
                  items={receivables}
                  typeOptions={RECEIVABLE_TYPES}
                  placeholder="e.g. Client Dupont SARL…"
                  onAdd={(item) => setReceivables((p) => [...p, item as OpeningReceivable])}
                  onRemove={(label) => setReceivables((p) => p.filter((i) => i.label !== label))}
                />
              </div>

              <div className="divider">Cash & Equivalents</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Bank (5211)</span></label>
                  <input className="input input-bordered" type="number" min={0} placeholder="0" value={bank} onChange={(e) => setBank(e.target.value)} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Cash — Caisse (5711)</span></label>
                  <input className="input input-bordered" type="number" min={0} placeholder="0" value={cash} onChange={(e) => setCash(e.target.value)} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Mobile Money (5141)</span></label>
                  <input className="input input-bordered" type="number" min={0} placeholder="0" value={mobileMoney} onChange={(e) => setMobileMoney(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Liabilities */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Liabilities</h2>
                <p className="text-sm text-base-content/60">Supplier debts, bank loans, and other obligations.</p>
              </div>
              <ListEditor
                items={liabilities}
                typeOptions={LIABILITY_TYPES}
                placeholder="e.g. Emprunt BNI, Fournisseur X…"
                onAdd={(item) => setLiabilities((p) => [...p, item as OpeningLiability])}
                onRemove={(label) => setLiabilities((p) => p.filter((i) => i.label !== label))}
              />
              {liabilities.length === 0 && (
                <p className="text-sm text-base-content/40 italic">No liabilities — skip if none.</p>
              )}
            </div>
          )}

          {/* Step 5 — Review */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">Review & Confirm</h2>
                <p className="text-sm text-base-content/60">Your opening journal entry will be generated with these values.</p>
              </div>
              <div className="overflow-x-auto rounded-box border border-base-200">
                <table className="table">
                  <tbody>
                    <tr>
                      <td className="font-medium">Fixed Assets</td>
                      <td className="text-right font-mono">{fmt(fixedAssets.reduce((s, i) => s + i.amount, 0))}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Stocks</td>
                      <td className="text-right font-mono">{fmt(stocks.reduce((s, i) => s + i.amount, 0))}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Receivables</td>
                      <td className="text-right font-mono">{fmt(receivables.reduce((s, i) => s + i.amount, 0))}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Bank</td>
                      <td className="text-right font-mono">{fmt(Number(bank) || 0)}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Cash</td>
                      <td className="text-right font-mono">{fmt(Number(cash) || 0)}</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Mobile Money</td>
                      <td className="text-right font-mono">{fmt(Number(mobileMoney) || 0)}</td>
                    </tr>
                    <tr className="bg-base-200 font-bold">
                      <td>Total Assets</td>
                      <td className="text-right font-mono text-success">{fmt(totalAssets)}</td>
                    </tr>
                    <tr className="border-t-2">
                      <td className="font-medium text-error">Total Liabilities</td>
                      <td className="text-right font-mono text-error">{fmt(totalLiabilities)}</td>
                    </tr>
                    <tr className="bg-primary/10 font-bold text-lg">
                      <td>Opening Capital</td>
                      <td className={`text-right font-mono ${capital >= 0 ? 'text-success' : 'text-error'}`}>
                        {fmt(capital)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {capital < 0 && (
                <div className="alert alert-warning">
                  <span>⚠️ Negative capital — will be recorded as Report à nouveau débiteur (1311).</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-2">
            <button
              className="btn btn-ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
                Next →
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleSubmit}>
                ✓ Create Opening Entry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
