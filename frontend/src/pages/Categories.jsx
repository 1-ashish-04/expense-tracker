import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react';
import * as categoriesApi from '../api/categories';
import Modal from '../components/Modal';

const emptyForm = { name: '' };

export default function Categories() {
  const [categories, setCategories] = useState([]);
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
      setCategories(await categoriesApi.listCategories());
    } catch {
      setError('Could not load categories.');
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

  function openEdit(c) {
    setEditingId(c.id);
    setForm({ name: c.name });
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) {
      setFormError('Please enter a category name.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await categoriesApi.updateCategory(editingId, form);
      } else {
        await categoriesApi.createCategory(form);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      const data = err.response?.data;
      const msg =
        (typeof data === 'object' && data ? Object.values(data).flat().join(' ') : null) ||
        'Could not save the category.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this category? Related transactions will lose their category.')) return;
    try {
      await categoriesApi.deleteCategory(id);
      await load();
    } catch {
      window.alert('Could not delete the category.');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize your income and expenses.</p>
        </div>
        <button className="btn btn-primary desktop-add-btn" type="button" onClick={openCreate}>
          <Plus size={16} aria-hidden="true" /> Add category
        </button>
      </div>

      <div className="card card-pad">
        {loading ? (
          <div className="loading-block">Loading categories…</div>
        ) : error ? (
          <div className="form-error-banner">{error}</div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <h3>No categories yet</h3>
            <p>Create categories like Groceries or Salary to organize transactions.</p>
            <button className="btn btn-primary" type="button" onClick={openCreate}>
              Add a category
            </button>
          </div>
        ) : (
          <div>
            {categories.map((c) => (
              <div className="ledger-row" key={c.id}>
                <div className="ledger-row-main">
                  <span className="ledger-row-icon expense">
                    <Tag size={16} aria-hidden="true" />
                  </span>
                  <div className="ledger-row-text">
                    <div className="ledger-row-desc">{c.name}</div>
                  </div>
                </div>
                <div className="ledger-row-actions">
                  <button className="btn-icon" onClick={() => openEdit(c)} type="button" aria-label="Edit category">
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleDelete(c.id)}
                    type="button"
                    aria-label="Delete category"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="fab" type="button" onClick={openCreate} aria-label="Add category">
        <Plus size={24} aria-hidden="true" />
      </button>

      {modalOpen && (
        <Modal title={editingId ? 'Edit category' : 'Add category'} onClose={() => setModalOpen(false)}>
          {formError && <div className="form-error-banner">{formError}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="cat-name">Category name</label>
              <input
                id="cat-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Groceries"
                required
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Add category'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
