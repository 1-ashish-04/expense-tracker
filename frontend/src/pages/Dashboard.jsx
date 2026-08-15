import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import * as reportsApi from '../api/reports';
import * as txnApi from '../api/transactions';
import './Dashboard.css';

const currency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );

function buildTrendSeries(monthlyRows) {
  const buckets = {};
  for (const row of monthlyRows) {
    const key = row.month.slice(0, 7); // YYYY-MM
    buckets[key] = buckets[key] || { month: key, income: 0, expense: 0 };
    buckets[key][row.transaction_type] = Number(row.total);
  }
  return Object.values(buckets).sort((a, b) => a.month.localeCompare(b.month));
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trend, setTrend] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [summaryRes, catRes, monthlyRes, txnRes] = await Promise.all([
          reportsApi.getSummary(),
          reportsApi.getCategoryBreakdown(),
          reportsApi.getMonthlyReport(),
          txnApi.listTransactions({ ordering: '-transaction_date' }),
        ]);
        if (cancelled) return;
        setSummary(summaryRes);
        setCategories(catRes);
        setTrend(buildTrendSeries(monthlyRes));
        setRecent((txnRes.results ?? txnRes).slice(0, 5));
      } catch {
        if (!cancelled) setError('Could not load your dashboard. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxCategoryTotal = Math.max(1, ...categories.map((c) => Number(c.total)));

  if (loading) return <div className="loading-block">Loading your overview…</div>;
  if (error) return <div className="form-error-banner">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Your finances at a glance.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-label">Net balance</div>
          <div className="stat-value num">{currency(summary?.net_balance)}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Income</div>
          <div className="stat-value income num">{currency(summary?.total_income)}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Expenses</div>
          <div className="stat-value expense num">{currency(summary?.total_expense)}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card card-pad chart-card">
          <h2>Income vs. expenses</h2>
          {trend.length === 0 ? (
            <div className="empty-state">
              <p>No transactions yet — add one to see your trend.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trend} margin={{ left: -20, right: 10 }}>
                <CartesianGrid stroke="var(--color-hairline)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-ink-soft)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-ink-soft)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => currency(value)}
                  contentStyle={{
                    background: 'var(--color-paper-raised)',
                    border: '1px solid var(--color-hairline)',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
                <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card card-pad chart-card">
          <h2>Spending by category</h2>
          {categories.length === 0 ? (
            <div className="empty-state">
              <p>No expenses logged yet.</p>
            </div>
          ) : (
            <div className="category-list">
              {categories.map((c) => (
                <div className="category-bar-row" key={c.category__name}>
                  <span className="category-bar-name">{c.category__name ?? 'Uncategorized'}</span>
                  <span className="category-bar-amount">{currency(c.total)}</span>
                  <div className="category-bar-track">
                    <div
                      className="category-bar-fill"
                      style={{ width: `${(Number(c.total) / maxCategoryTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card card-pad" style={{ marginTop: 'var(--space-4)' }}>
        <div className="section-heading">
          <h2>Recent transactions</h2>
          <Link to="/transactions" className="btn btn-outline">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <h3>Nothing here yet</h3>
            <p>Log your first transaction to see it show up here.</p>
            <Link to="/transactions" className="btn btn-primary">
              Add a transaction
            </Link>
          </div>
        ) : (
          <div>
            {recent.map((t) => (
              <div className="ledger-row" key={t.id}>
                <div className="ledger-row-main">
                  <span className={`ledger-row-icon ${t.transaction_type}`}>
                    {t.transaction_type === 'income' ? (
                      <ArrowUpRight size={18} aria-hidden="true" />
                    ) : (
                      <ArrowDownRight size={18} aria-hidden="true" />
                    )}
                  </span>
                  <div className="ledger-row-text">
                    <div className="ledger-row-desc">{t.description || 'Untitled'}</div>
                    <div className="ledger-row-meta">{t.transaction_date}</div>
                  </div>
                </div>
                <span className={`ledger-row-amount num ${t.transaction_type}`}>
                  {t.transaction_type === 'income' ? '+' : '−'}
                  {currency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
