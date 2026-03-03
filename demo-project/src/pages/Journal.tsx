import { useMemo, useState } from 'react';
import type { JournalEntry } from '@drcmind/ohada-lib';
import { useStore } from '../store/StoreContext';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(n);

type EntryType = 'opening' | 'sale' | 'purchase' | 'expense';

interface DisplayEntry {
  id: string;
  date: string;
  type: EntryType;
  entry: JournalEntry;
  debitTotal: number;
  creditTotal: number;
}

const TYPE_BADGE: Record<EntryType, string> = {
  opening: 'badge-neutral',
  sale: 'badge-success',
  purchase: 'badge-info',
  expense: 'badge-warning',
};

const TYPE_LABEL: Record<EntryType, string> = {
  opening: 'Opening',
  sale: 'Sale',
  purchase: 'Purchase',
  expense: 'Expense',
};

function JournalRow({ display, open, onToggle }: {
  display: DisplayEntry;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="hover cursor-pointer"
        onClick={onToggle}
      >
        <td className="text-sm whitespace-nowrap text-base-content/60">
          {new Date(display.date).toLocaleDateString('fr-FR')}
        </td>
        <td>
          <span className={`badge badge-sm ${TYPE_BADGE[display.type]}`}>
            {TYPE_LABEL[display.type]}
          </span>
        </td>
        <td className="max-w-xs">
          <p className="truncate">{(display.entry as any).label}</p>
        </td>
        <td className="text-right font-mono">{fmt(display.debitTotal)}</td>
        <td className="text-right font-mono">{fmt(display.creditTotal)}</td>
        <td className="text-center">
          <svg
            className={`w-4 h-4 inline-block transition-transform ${open ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} className="bg-base-200/60 px-8 py-3">
            <table className="table table-xs w-full">
              <thead>
                <tr>
                  <th className="w-24">Account</th>
                  <th>Label</th>
                  <th className="text-right w-32">Debit</th>
                  <th className="text-right w-32">Credit</th>
                </tr>
              </thead>
              <tbody>
                {display.entry.lines.map((line, i) => (
                  <tr key={i}>
                    <td className="font-mono text-xs text-primary">{line.account}</td>
                    <td className="text-sm">{line.label}</td>
                    <td className="text-right font-mono text-sm">
                      {line.debit ? (
                        <span className="text-success">{fmt(line.debit)}</span>
                      ) : (
                        <span className="text-base-content/20">—</span>
                      )}
                    </td>
                    <td className="text-right font-mono text-sm">
                      {line.credit ? (
                        <span className="text-error">{fmt(line.credit)}</span>
                      ) : (
                        <span className="text-base-content/20">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold bg-base-300/40 border-t border-base-300">
                  <td colSpan={2} className="text-xs text-right text-base-content/50">Totals</td>
                  <td className="text-right font-mono text-success">{fmt(display.debitTotal)}</td>
                  <td className="text-right font-mono text-error">{fmt(display.creditTotal)}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

export default function Journal() {
  const { store } = useStore();
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggleId = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const entries = useMemo<DisplayEntry[]>(() => {
    const result: DisplayEntry[] = [];

    // Opening entry
    if (store.openingEntry) {
      const e = store.openingEntry;
      const debitTotal = e.lines.reduce((s, l) => s + (l.debit ?? 0), 0);
      const creditTotal = e.lines.reduce((s, l) => s + (l.credit ?? 0), 0);
      result.push({
        id: 'opening-entry',
        date: e.date instanceof Date ? e.date.toISOString() : String(e.date),
        type: 'opening',
        entry: e,
        debitTotal,
        creditTotal,
      });
    }

    // All records
    for (const record of store.records) {
      for (let i = 0; i < record.journalEntries.length; i++) {
        const e = record.journalEntries[i];
        const debitTotal = e.lines.reduce((s, l) => s + (l.debit ?? 0), 0);
        const creditTotal = e.lines.reduce((s, l) => s + (l.credit ?? 0), 0);
        result.push({
          id: `${record.id}-${i}`,
          date: record.date,
          type: record.type,
          entry: e,
          debitTotal,
          creditTotal,
        });
      }
    }

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [store]);

  const grandDebit = entries.reduce((s, e) => s + e.debitTotal, 0);
  const grandCredit = entries.reduce((s, e) => s + e.creditTotal, 0);

  const balanceOk = Math.abs(grandDebit - grandCredit) < 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">General Journal</h1>
          <p className="text-base-content/50 text-sm mt-0.5">
            Livre Journal — all accounting entries in chronological order
          </p>
        </div>
        <div className={`badge ${balanceOk ? 'badge-success' : 'badge-error'} gap-1 py-3 px-4`}>
          {balanceOk ? '✓ Balanced' : '✕ Unbalanced'}
        </div>
      </div>

      {/* Grand totals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="stat bg-base-100 shadow rounded-box py-3 px-4">
          <div className="stat-title text-xs">Total Debit</div>
          <div className="stat-value text-xl text-success">{fmt(grandDebit)}</div>
        </div>
        <div className="stat bg-base-100 shadow rounded-box py-3 px-4">
          <div className="stat-title text-xs">Total Credit</div>
          <div className="stat-value text-xl text-error">{fmt(grandCredit)}</div>
        </div>
        <div className="stat bg-base-100 shadow rounded-box py-3 px-4">
          <div className="stat-title text-xs">Entries</div>
          <div className="stat-value text-xl">{entries.length}</div>
        </div>
      </div>

      {/* Journal table */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th className="text-right">
                    <span className="text-success">Debit</span>
                  </th>
                  <th className="text-right">
                    <span className="text-error">Credit</span>
                  </th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-base-content/40">
                      <p className="text-4xl mb-3">📒</p>
                      <p>No journal entries yet.</p>
                      <p className="text-xs mt-1">Start by recording a sale, purchase or expense.</p>
                    </td>
                  </tr>
                ) : (
                  entries.map((display) => (
                    <JournalRow
                      key={display.id}
                      display={display}
                      open={openIds.has(display.id)}
                      onToggle={() => toggleId(display.id)}
                    />
                  ))
                )}
              </tbody>
              {entries.length > 0 && (
                <tfoot>
                  <tr className="font-bold text-sm border-t-2 border-base-300">
                    <td colSpan={3} className="text-right text-base-content/50">Grand Totals</td>
                    <td className="text-right font-mono text-success">{fmt(grandDebit)}</td>
                    <td className="text-right font-mono text-error">{fmt(grandCredit)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
