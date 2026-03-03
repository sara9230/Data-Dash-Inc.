// frontend/src/pages/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const API = 'http://127.0.0.1:5000';

const CATEGORIES = ['Fast Food', 'Japanese', 'Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'Other'];
const EMPTY_FORM  = { name: '', category: '', address: '', phone: '', status: 'Open' };

export default function AdminDashboard() {
  const navigate = useNavigate();

  // --- STATE ---
  const [restaurants, setRestaurants] = useState([]);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [errors,      setErrors]      = useState({});
  const [search,      setSearch]      = useState('');
  const [deleteId,    setDeleteId]    = useState(null);
  const [toast,       setToast]       = useState('');
  const [loading,     setLoading]     = useState(true);
  const [apiError,    setApiError]    = useState('');

  // ── fetchStores is defined FIRST so useEffect can call it below ──
  async function fetchStores() {
    setLoading(true);
    setApiError('');
    try {
      const response = await fetch(`${API}/api/stores`);
      const data     = await response.json();
      setRestaurants(data);
    } catch {
      // _err: underscore prefix means "I know I'm not using this variable"
      setApiError('Could not connect to the server. Make sure the backend is running.');
    }
    setLoading(false);
  }

  // ── Runs once when the page loads ──
  useEffect(() => {
  (async () => {
    await fetchStores();
  })();
}, []);


  // ── Filter list based on search input ──
  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim())    errs.name     = 'Name is required.';
    if (!form.category)       errs.category = 'Select a category.';
    if (!form.address.trim()) errs.address  = 'Address is required.';
    if (!form.phone.trim())   errs.phone    = 'Phone is required.';
    return errs;
  }

  // ── ADD restaurant → POST /api/stores ──
  async function handleAdd() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setApiError('');
    try {
      const response = await fetch(`${API}/api/stores`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await response.json();

      if (response.ok) {
        setRestaurants((prev) => [...prev, { ...form, id: data.id }]);
        setForm(EMPTY_FORM);
        setErrors({});
        showToast(`"${form.name}" added!`);
      } else {
        setApiError(data.message || 'Failed to add store.');
      }
    } catch {
      setApiError('Could not connect to the server.');
    }
  }

  // ── DELETE restaurant → DELETE /api/stores/<id> ──
  async function handleDelete(id) {
    const name = restaurants.find((r) => r.id === id)?.name;
    setApiError('');
    try {
      const response = await fetch(`${API}/api/stores/${id}`, { method: 'DELETE' });

      if (response.ok) {
        setRestaurants((prev) => prev.filter((r) => r.id !== id));
        setDeleteId(null);
        showToast(`"${name}" removed.`);
      } else {
        const data = await response.json();
        setApiError(data.message || 'Failed to delete store.');
        setDeleteId(null);
      }
    } catch {
      setApiError('Could not connect to the server.');
      setDeleteId(null);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/signin/admin');
  }

  // ── RENDER ──
  return (
    <div className="ad-page">

      <header className="ad-topbar">
        <span className="ad-logo">🍔 Data Dash <span className="ad-badge">Admin</span></span>
        <button className="ad-logout" onClick={handleLogout}>Log Out</button>
      </header>

      <main className="ad-main">
        <h1 className="ad-title">Restaurant Management</h1>
        <p className="ad-sub">Add or remove restaurants from the platform.</p>

        {toast    && <div className="ad-toast">✅ {toast}</div>}
        {apiError && <div className="ad-error-banner">⚠️ {apiError}</div>}

        {/* Stats */}
        <div className="ad-stats">
          <div className="ad-stat" style={{ borderTopColor: '#4f46e5' }}>
            <div className="ad-stat-num" style={{ color: '#4f46e5' }}>{restaurants.length}</div>
            <div className="ad-stat-label">Total</div>
          </div>
          <div className="ad-stat" style={{ borderTopColor: '#16a34a' }}>
            <div className="ad-stat-num" style={{ color: '#16a34a' }}>
              {restaurants.filter((r) => r.status === 'Open').length}
            </div>
            <div className="ad-stat-label">Open</div>
          </div>
          <div className="ad-stat" style={{ borderTopColor: '#dc2626' }}>
            <div className="ad-stat-num" style={{ color: '#dc2626' }}>
              {restaurants.filter((r) => r.status === 'Closed').length}
            </div>
            <div className="ad-stat-label">Closed</div>
          </div>
        </div>

        <div className="ad-grid">

          {/* Add Form */}
          <div className="ad-card">
            <h2 className="ad-card-title">➕ Add Restaurant</h2>

            <label className="ad-label">Restaurant Name *</label>
            <input
              className={`ad-input ${errors.name ? 'ad-input-err' : ''}`}
              name="name" placeholder="e.g. Burger Palace"
              value={form.name} onChange={handleChange}
            />
            {errors.name && <span className="ad-err">{errors.name}</span>}

            <label className="ad-label">Category *</label>
            <select
              className={`ad-input ${errors.category ? 'ad-input-err' : ''}`}
              name="category" value={form.category} onChange={handleChange}
            >
              <option value="">-- Select --</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <span className="ad-err">{errors.category}</span>}

            <label className="ad-label">Address *</label>
            <input
              className={`ad-input ${errors.address ? 'ad-input-err' : ''}`}
              name="address" placeholder="e.g. 123 Main St"
              value={form.address} onChange={handleChange}
            />
            {errors.address && <span className="ad-err">{errors.address}</span>}

            <label className="ad-label">Phone *</label>
            <input
              className={`ad-input ${errors.phone ? 'ad-input-err' : ''}`}
              name="phone" placeholder="e.g. 555-0100"
              value={form.phone} onChange={handleChange}
            />
            {errors.phone && <span className="ad-err">{errors.phone}</span>}

            <label className="ad-label">Status</label>
            <select className="ad-input" name="status" value={form.status} onChange={handleChange}>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>

            <button className="ad-add-btn" onClick={handleAdd}>+ Add Restaurant</button>
          </div>

          {/* Restaurant List */}
          <div className="ad-card">
            <h2 className="ad-card-title">🏪 All Restaurants</h2>
            <input
              className="ad-input"
              placeholder="🔍 Search by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {loading && (
              <div className="ad-empty">Loading restaurants...</div>
            )}
            {!loading && restaurants.length === 0 && (
              <div className="ad-empty">No restaurants yet. Add one using the form!</div>
            )}
            {!loading && restaurants.length > 0 && filtered.length === 0 && (
              <div className="ad-empty">No results for "{search}"</div>
            )}

            {!loading && filtered.map((r) => (
              <div key={r.id} className="ad-row">
                <div className="ad-row-info">
                  <div className="ad-row-name">{r.name}</div>
                  <div className="ad-row-meta">
                    📂 {r.category} &nbsp;|&nbsp; 📍 {r.address} &nbsp;|&nbsp; 📞 {r.phone}
                  </div>
                </div>
                <div className="ad-row-right">
                  <span className={`ad-status ${r.status === 'Open' ? 'ad-open' : 'ad-closed'}`}>
                    {r.status === 'Open' ? '🟢 Open' : '🔴 Closed'}
                  </span>
                  <button className="ad-remove-btn" onClick={() => setDeleteId(r.id)}>
                    🗑 Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Confirm Delete Popup */}
      {deleteId !== null && (
        <div className="ad-overlay">
          <div className="ad-modal">
            <h3 className="ad-modal-title">⚠️ Confirm Removal</h3>
            <p className="ad-modal-text">
              Are you sure you want to remove{' '}
              <strong>"{restaurants.find((r) => r.id === deleteId)?.name}"</strong>?
              <br />This cannot be undone.
            </p>
            <div className="ad-modal-btns">
              <button className="ad-cancel-btn" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="ad-confirm-btn" onClick={() => handleDelete(deleteId)}>Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}