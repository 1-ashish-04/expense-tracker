import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Wallet } from 'lucide-react';
import * as accountsApi from '../api/accounts';
import Modal from '../components/Modal';

const currency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(
    Number(n || 0)
  );

const TYPE_LABELS = { cash: 'Cash', bank: 'Bank', upi: 'UPI', card: 'Card' };

const emptyForm = { name: '', account_type: 'bank', balance: '0' };

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setAccounts(await accountsApi.listAccounts());
    } catch {
      setError('Could not load accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(a) {
    setEditingId(a.id);
    setForm({ name: a.name, account_type: a.account_type, balance: a.balance });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Please enter an account name.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await accountsApi.updateAccount(editingId, form);
      } else {
        await accountsApi.createAccount(form);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      const data = err.response?.data;
      const msg =
        (typeof data === 'object' && data ? Object.values(data).flat().join(' ') : null) ||
        'Could not save the account.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this account? Its transactions will also be removed.')) return;
    try {
      await accountsApi.deleteAccount(id);
      await load();
    } catch {
      window.alert('Could not delete the account.');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">Where your money lives.</p>
        </div>
        <button className="btn btn-primary desktop-add-btn" type="button" onClick={openCreate}>
          <Plus size={16} aria-hidden="true" /> Add account
        </button>
      </div>

      <div className="card card-pad">
        {loading ? (
          <div className="loading-block">Loading accounts…</div>
        ) : error ? (
          <div className="form-error-banner">{error}</div>
        ) : accounts.length === 0 ? (
          <div className="empty-state">
            <h3>No accounts yet</h3>
            <p>Add a cash, bank, or card account to start logging transactions.</p>
            <button className="btn btn-primary" type="button" onClick={openCreate}>
              Add an account
            </button>
          </div>
        ) : (
          <div>
            {accounts.map((a) => (
              <div className="ledger-row" key={a.id}>
                <div className="ledger-row-main">
                  <span className="ledger-row-icon income">
                    <Wallet size={17} aria-hidden="true" />
                  </span>
                  <div className="ledger-row-text">
                    <div className="ledger-row-desc">{a.name}</div>
                    <div className="ledger-row-meta">{TYPE_LABELS[a.account_type] ?? a.account_type}</div>
                  </div>
                </div>
                <span className="ledger-row-amount num">{currency(a.balance)}</span>
                <div className="ledger-row-actions">
                  <button className="btn-icon" onClick={() => openEdit(a)} type="button" aria-label="Edit account">
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDelete(a.id)}
                    type="button"
                    aria-label="Delete account"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="fab" type="button" onClick={openCreate} aria-label="Add account">
        <Plus size={24} aria-hidden="true" />
      </button>

      {modalOpen && (
        <Modal title={editingId ? 'Edit account' : 'Add account'} onClose={() => setModalOpen(false)}>
          {formError && <div className="form-error-banner">{formError}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="acc-name">Account name</label>
              <input
                id="acc-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. HDFC Savings"
                required
              />
            </div>
            <div className="field-row field-row-2">
              <div className="field">
                <label htmlFor="acc-type">Type</label>
                <select
                  id="acc-type"
                  value={form.account_type}
                  onChange={(e) => setForm({ ...form, account_type: e.target.value })}
                >
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="acc-balance">
                  {editingId ? 'Balance' : 'Starting balance'}
                </label>
                <input
                  id="acc-balance"
                  type="number"
                  step="0.01"
                  value={form.balance}
                  onChange={(e) => setForm({ ...form, balance: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Add account'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
