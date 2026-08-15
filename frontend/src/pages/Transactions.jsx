import { useCallback, useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Pencil, Plus, Trash2 } from 'lucide-react';
import * as txnApi from '../api/transactions';
import * as accountsApi from '../api/accounts';
import * as categoriesApi from '../api/categories';
import Modal from '../components/Modal';

const currency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(
    Number(n || 0)
  );

const emptyForm = {
  account: '',
  category: '',
  transaction_type: 'expense',
  amount: '',
  description: '',
  transaction_date: new Date().toISOString().slice(0, 10),
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({ transaction_type: '', category: '' });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.transaction_type) params.transaction_type = filters.transaction_type;
      if (filters.category) params.category = filters.category;

      const [txnRes, accRes, catRes] = await Promise.all([
        txnApi.listTransactions(params),
        accountsApi.listAccounts(),
        categoriesApi.listCategories(),
      ]);
      setTransactions(txnRes.results ?? txnRes);
      setAccounts(accRes);
      setCategories(catRes);
    } catch {
      setError('Could not load transactions.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  function openCreate() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      account: accounts[0]?.id ?? '',
      category: categories[0]?.id ?? '',
    });
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(t) {
    setEditingId(t.id);
    setForm({
      account: t.account,
      category: t.category,
      transaction_type: t.transaction_type,
      amount: t.amount,
      description: t.description ?? '',
      transaction_date: t.transaction_date,
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!form.account || !form.category) {
      setFormError('Please choose an account and category.');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setFormError('Amount must be greater than zero.');
      return;
    }
    if (form.transaction_date > new Date().toISOString().slice(0, 10)) {
      setFormError('Date cannot be in the future.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await txnApi.updateTransaction(editingId, form);
      } else {
        await txnApi.createTransaction(form);
      }
      setModalOpen(false);
      await loadAll();
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.non_field_errors?.[0] ||
        (typeof data === 'object' && data ? Object.values(data).flat().join(' ') : null) ||
        'Could not save the transaction.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return;
    try {
      await txnApi.deleteTransaction(id);
      await loadAll();
    } catch {
      window.alert('Could not delete the transaction.');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Every income and expense entry, in one place.</p>
        </div>
        <button className="btn btn-primary desktop-add-btn" type="button" onClick={openCreate}>
          <Plus size={16} aria-hidden="true" /> Add transaction
        </button>
      </div>

      <div className="filter-bar">
        <select
          value={filters.transaction_type}
          onChange={(e) => setFilters({ ...filters, transaction_type: e.target.value })}
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card card-pad">
        {loading ? (
          <div className="loading-block">Loading transactions…</div>
        ) : error ? (
          <div className="form-error-banner">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <h3>No transactions found</h3>
            <p>Try changing your filters, or add a new transaction.</p>
            <button className="btn btn-primary" type="button" onClick={openCreate}>
              Add a transaction
            </button>
          </div>
        ) : (
          <div>
            {transactions.map((t) => {
              const account = accounts.find((a) => a.id === t.account);
              const category = categories.find((c) => c.id === t.category);
              return (
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
                      <div className="ledger-row-desc">{t.description || category?.name || 'Untitled'}</div>
                      <div className="ledger-row-meta">
                        {t.transaction_date} · {category?.name ?? 'Uncategorized'} · {account?.name ?? ''}
                      </div>
                    </div>
                  </div>
                  <span className={`ledger-row-amount num ${t.transaction_type}`}>
                    {t.transaction_type === 'income' ? '+' : '−'}
                    {currency(t.amount)}
                  </span>
                  <div className="ledger-row-actions">
                    <button className="btn-icon" onClick={() => openEdit(t)} type="button" aria-label="Edit transaction">
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(t.id)}
                      type="button"
                      aria-label="Delete transaction"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button className="fab" type="button" onClick={openCreate} aria-label="Add transaction">
        <Plus size={24} aria-hidden="true" />
      </button>

      {modalOpen && (
        <Modal title={editingId ? 'Edit transaction' : 'Add transaction'} onClose={() => setModalOpen(false)}>
          {formError && <div className="form-error-banner">{formError}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="field-row field-row-2">
              <div className="field">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  value={form.transaction_type}
                  onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="amount">Amount</label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="account">Account</label>
              <select
                id="account"
                value={form.account}
                onChange={(e) => setForm({ ...form, account: e.target.value })}
                required
              >
                <option value="" disabled>
                  Select an account
                </option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                value={form.transaction_date}
                onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="description">Description (optional)</label>
              <input
                id="description"
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Grocery run"
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Add transaction'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
