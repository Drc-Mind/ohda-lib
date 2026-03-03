import { useMemo } from 'react';
import { Link } from 'react-router';
import { useStore } from '../store/StoreContext';
import type { AppRecord } from '../types/app';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(n);

const TYPE_BADGE: Record<AppRecord['type'], string> = {
  sale: 'badge-success',
  purchase: 'badge-info',
  expense: 'badge-warning',
};

const TYPE_LABEL: Record<AppRecord['type'], string> = {
  sale: 'Sale',
  purchase: 'Purchase',
  expense: 'Expense',
};

function StatCard({
  title, value, sub, color, icon,
}: {
  title: string; value: string; sub?: string; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base-content/50 text-sm">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            {sub && <p className="text-xs text-base-content/40 mt-1">{sub}</p>}
          </div>
          <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('500', '100').replace('success', 'success/15').replace('error', 'error/15').replace('info', 'info/15').replace('base-content', 'base-200')}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { store } = useStore();
  const { records } = store;

  const stats = useMemo(() => {
    const sales = records.filter((r) => r.type === 'sale');
    const purchases = records.filter((r) => r.type === 'purchase');
    const expenses = records.filter((r) => r.type === 'expense');
    const totalSales = sales.reduce((s, r) => s + r.amount, 0);
    const totalPurchases = purchases.reduce((s, r) => s + r.amount, 0);
    const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0);
    const net = totalSales - totalPurchases - totalExpenses;
    return { totalSales, totalPurchases, totalExpenses, net, salesCount: sales.length, purchasesCount: purchases.length, expensesCount: expenses.length };
  }, [records]);

  const recent = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10),
    [records]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-base-content/50 text-sm mt-0.5">Overview of your accounting activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales (HT)"
          value={fmt(stats.totalSales)}
          sub={`${stats.salesCount} transaction${stats.salesCount !== 1 ? 's' : ''}`}
          color="text-success"
          icon={
            <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          title="Total Purchases (HT)"
          value={fmt(stats.totalPurchases)}
          sub={`${stats.purchasesCount} transaction${stats.purchasesCount !== 1 ? 's' : ''}`}
          color="text-info"
          icon={
            <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Expenses (HT)"
          value={fmt(stats.totalExpenses)}
          sub={`${stats.expensesCount} transaction${stats.expensesCount !== 1 ? 's' : ''}`}
          color="text-warning"
          icon={
            <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Net Position"
          value={fmt(stats.net)}
          sub="Sales − Purchases − Expenses"
          color={stats.net >= 0 ? 'text-success' : 'text-error'}
          icon={
            <svg className={`w-6 h-6 ${stats.net >= 0 ? 'text-success' : 'text-error'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(
          [
            { to: '/sales', label: 'New Sale', color: 'btn-success', icon: '＋' },
            { to: '/purchases', label: 'New Purchase', color: 'btn-info', icon: '＋' },
            { to: '/expenses', label: 'New Expense', color: 'btn-warning', icon: '＋' },
          ] as const
        ).map((action) => (
          <Link key={action.to} to={action.to} className={`btn ${action.color} btn-outline`}>
            {action.icon} {action.label}
          </Link>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-base-200">
            <h2 className="font-semibold">Recent Transactions</h2>
            <Link to="/journal" className="btn btn-ghost btn-sm">View all →</Link>
          </div>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-base-content/40">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">No transactions yet</p>
              <Link to="/sales" className="btn btn-sm btn-primary mt-3">Record your first sale</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th className="text-right">Amount HT</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((record) => (
                    <tr key={record.id} className="hover">
                      <td className="text-sm text-base-content/60 whitespace-nowrap">
                        {new Date(record.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td>
                        <span className={`badge badge-sm ${TYPE_BADGE[record.type]}`}>
                          {TYPE_LABEL[record.type]}
                        </span>
                      </td>
                      <td className="max-w-xs truncate">{record.label}</td>
                      <td className="text-right font-mono font-medium">{fmt(record.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
