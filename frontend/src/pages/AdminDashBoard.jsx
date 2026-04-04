import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://127.0.0.1:5000';
const CATEGORIES = ['Fast Food', 'Japanese', 'Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'Other'];
const EMPTY_STORE = { name: '', category: '', address: '', phone: '', status: 'Open' };
const EMPTY_ITEM  = { name: '', price: '', image_url: '' };

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { min-height: 100vh; background: #edeae4; }
  body { font-family: 'DM Sans', sans-serif; background: #edeae4; color: #111; }

  .header { background: #edeae4; border-bottom: 1px solid #e0ddd8; height: 62px; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; position: sticky; top: 0; z-index: 50; }
  .logo { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; }
  .logo span { color: #e8300a; }
  .badge { font-size: 11px; font-weight: 700; background: #111; color: #fff; padding: 2px 8px; border-radius: 100px; margin-left: 8px; vertical-align: middle; }
  .btn-outline { background: none; border: 1.5px solid #ccc; color: #111; padding: 7px 18px; border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .btn-outline:hover { border-color: #111; }

  .page { max-width: 1060px; margin: 0 auto; padding: 32px 24px; }
  .page-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; margin-bottom: 4px; }
  .page-sub { font-size: 14px; color: #888; margin-bottom: 24px; }

  .grid { display: grid; grid-template-columns: 360px 1fr; gap: 18px; align-items: start; }
  @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }

  .card { background: #fff; border: 1.5px solid #e0ddd8; border-radius: 18px; padding: 22px; }
  .card-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 800; margin-bottom: 16px; }

  .lbl { font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; margin-top: 12px; }
  .inp { width: 100%; padding: 9px 12px; border: 1.5px solid #e0ddd8; border-radius: 10px; font-size: 14px; font-family: inherit; background: #faf9f7; outline: none; color: #111; }
  .inp:focus { border-color: #111; background: #fff; }
  .inp.err { border-color: #e8300a; }
  .err-msg { font-size: 12px; color: #e8300a; margin-top: 3px; display: block; }

  .btn-red { width: 100%; background: #e8300a; color: #fff; border: none; padding: 12px; border-radius: 100px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; margin-top: 14px; }
  .btn-red:hover { background: #c5290a; }

  .search { margin-bottom: 12px; }
  .hint { font-size: 13px; color: #888; text-align: center; padding: 20px 0; }

  .rest-row { border: 1.5px solid #e0ddd8; border-radius: 12px; margin-bottom: 10px; overflow: hidden; }
  .rest-row.open-row { border-color: #111; }
  .rest-top { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #fff; cursor: pointer; gap: 10px; }
  .rest-top:hover { background: #faf9f7; }
  .rest-name { font-size: 14px; font-weight: 700; }
  .rest-meta { font-size: 12px; color: #888; margin-top: 1px; }
  .rest-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .status { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; }
  .s-open { background: #e6faf0; color: #22a95b; }
  .s-closed { background: #fdecea; color: #e8300a; }
  .btn-sm { background: none; border: 1.5px solid #ddd; color: #999; padding: 4px 11px; border-radius: 100px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .btn-sm:hover { border-color: #e8300a; color: #e8300a; }
  .chevron { background: #f3f0eb; border: none; width: 26px; height: 26px; border-radius: 50%; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

  .menu-panel { background: #faf9f7; border-top: 1px solid #e0ddd8; padding: 14px; }
  .menu-title { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
  .menu-add { display: flex; gap: 8px; margin-bottom: 10px; }
  .mini-inp { flex: 1; padding: 8px 10px; border: 1.5px solid #e0ddd8; border-radius: 8px; font-size: 13px; font-family: inherit; background: #fff; outline: none; color: #111; }
  .mini-inp:focus { border-color: #111; }
  .mini-inp.w-price { width: 80px; flex: none; }
  .mini-inp.w-photo { min-width: 170px; }
  .btn-dark { background: #111; color: #fff; border: none; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit; white-space: nowrap; }
  .btn-dark:hover { background: #333; }
  .item-row { display: flex; align-items: center; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #e0ddd8; }
  .item-row:last-child { border-bottom: none; }
  .item-left { display: flex; align-items: center; gap: 10px; }
  .item-thumb { width: 34px; height: 34px; border-radius: 8px; object-fit: cover; border: 1px solid #e0ddd8; background: #f3f0eb; }
  .item-name { font-size: 13px; font-weight: 600; }
  .item-price { font-size: 13px; color: #888; }
  .btn-x { background: none; border: none; color: #bbb; font-size: 18px; cursor: pointer; line-height: 1; padding: 0 2px; }
  .btn-x:hover { color: #e8300a; }
  .btn-link {
    background: none;
    border: none;
    color: #111;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    margin-left: 8px;
  }
  .btn-link:hover { color: #e8300a; }

  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .modal { background: #fff; border-radius: 18px; padding: 26px; max-width: 340px; width: 90%; }
  .modal-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; margin-bottom: 8px; }
  .modal-text { font-size: 14px; color: #555; margin-bottom: 20px; line-height: 1.5; }
  .modal-btns { display: flex; gap: 10px; }
  .btn-cancel { flex: 1; background: #f3f0eb; border: none; padding: 12px; border-radius: 100px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .btn-confirm { flex: 1; background: #e8300a; color: #fff; border: none; padding: 12px; border-radius: 100px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }

  .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #111; color: #fff; padding: 11px 22px; border-radius: 100px; font-size: 13px; font-weight: 600; z-index: 200; }
  .alert { background: #fdecea; color: #b71c1c; border-left: 3px solid #e8300a; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [form,        setForm]        = useState(EMPTY_STORE);
  const [otherCategory, setOtherCategory] = useState('');
  const [errors,      setErrors]      = useState({});
  const [search,      setSearch]      = useState('');
  const [deleteId,    setDeleteId]    = useState(null);
  const [toast,       setToast]       = useState('');
  const [loading,     setLoading]     = useState(true);
  const [apiError,    setApiError]    = useState('');
  const [menuItems,   setMenuItems]   = useState({});
  const [menuForm,    setMenuForm]    = useState({});
  const [expanded,    setExpanded]    = useState(null);
  const [menuLoading, setMenuLoading] = useState({});

  useEffect(() => { fetchStores(); }, []);

  async function fetchStores() {
    setLoading(true);
    try {
      const data = await fetch(`${API}/api/stores`).then(r => r.json());
      setRestaurants(data);
    } catch { setApiError('Could not connect to the server.'); }
    setLoading(false);
  }

  async function fetchMenu(storeId) {
    setMenuLoading(p => ({ ...p, [storeId]: true }));
    try {
      const data = await fetch(`${API}/api/stores/${storeId}/menu-items`).then(r => r.json());
      setMenuItems(p => ({ ...p, [storeId]: Array.isArray(data) ? data : [] }));
    } catch {}
    setMenuLoading(p => ({ ...p, [storeId]: false }));
  }

  function toggleExpand(id) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!menuItems[id]) fetchMenu(id);
  }

  function toTitleCase(value) {
    return value
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function validate() {
    const e = {};
    if (!form.name.trim())    e.name     = 'Required';
    if (!form.category)       e.category = 'Required';
    if (form.category === 'Other' && !otherCategory.trim()) e.otherCategory = 'Required when category is Other';
    if (!form.address.trim()) e.address  = 'Required';
    if (!form.phone.trim())   e.phone    = 'Required';
    return e;
  }

  async function handleAdd() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const payload = {
      ...form,
      category: form.category === 'Other' ? toTitleCase(otherCategory) : form.category,
    };

    try {
      const res  = await fetch(`${API}/api/stores`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        setRestaurants(p => [...p, { ...payload, id: data.id }]);
        setForm(EMPTY_STORE);
        setOtherCategory('');
        setErrors({});
        toast2(`"${form.name}" added!`);
      }
      else setApiError(data.message || 'Failed to add.');
    } catch { setApiError('Could not connect.'); }
  }

  async function handleDelete(id) {
    const name = restaurants.find(r => r.id === id)?.name;
    try {
      const res = await fetch(`${API}/api/stores/${id}`, { method: 'DELETE' });
      if (res.ok) { setRestaurants(p => p.filter(r => r.id !== id)); setDeleteId(null); toast2(`"${name}" removed.`); }
      else { const d = await res.json(); setApiError(d.message || 'Failed.'); setDeleteId(null); }
    } catch { setApiError('Could not connect.'); setDeleteId(null); }
  }

  async function handleAddItem(storeId) {
    const mf = menuForm[storeId] || EMPTY_ITEM;
    const price = parseFloat(mf.price);
    if (!mf.name.trim() || isNaN(price) || price < 0) return;
    try {
      const payload = {
        name: mf.name.trim(),
        price,
        image_url: (mf.image_url || '').trim(),
      };
      const res  = await fetch(`${API}/api/stores/${storeId}/menu-items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) { setMenuItems(p => ({ ...p, [storeId]: [...(p[storeId] || []), { id: data.id, name: mf.name.trim(), price, image_url: payload.image_url }] })); setMenuForm(p => ({ ...p, [storeId]: EMPTY_ITEM })); toast2(`"${mf.name}" added!`); }
    } catch {}
  }

  async function handleDeleteItem(storeId, itemId, name) {
    try {
      const res = await fetch(`${API}/api/stores/${storeId}/menu-items/${itemId}`, { method: 'DELETE' });
      if (res.ok) { setMenuItems(p => ({ ...p, [storeId]: p[storeId].filter(i => i.id !== itemId) })); toast2(`"${name}" removed.`); }
    } catch {}
  }

  async function handleUpdateItemPhoto(storeId, item) {
    const nextUrl = window.prompt('Paste image URL (leave empty to remove photo):', item.image_url || '');
    if (nextUrl === null) return;

    const image_url = nextUrl.trim();
    try {
      const res = await fetch(`${API}/api/stores/${storeId}/menu-items/${item.id}/image`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url }),
      });
      if (res.ok) {
        setMenuItems((prev) => ({
          ...prev,
          [storeId]: (prev[storeId] || []).map((menuItem) => (
            menuItem.id === item.id ? { ...menuItem, image_url } : menuItem
          )),
        }));
        toast2(`Photo updated for "${item.name}".`);
      }
    } catch {}
  }

  function toast2(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{S}</style>
      <header className="header">
        <div className="logo">Data<span>Dash</span><span className="badge">Admin</span></div>
        <button className="btn-outline" type="button" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); navigate('/signin/admin'); }}>Sign out</button>
      </header>

      <div className="page">
        <div className="page-title">Restaurant Management</div>
        <div className="page-sub">Add restaurants and manage their menu items.</div>

        {apiError && <div className="alert">{apiError}</div>}

        <div className="grid">
          <div className="card">
            <div className="card-title">Add Restaurant</div>
            {[['name','Restaurant Name','text','e.g. Burger Palace'],['address','Address','text','e.g. 123 Main St'],['phone','Phone','text','e.g. 555-0100']].map(([field, label, type, ph]) => (
              <div key={field}>
                <label className="lbl">{label} *</label>
                <input className={`inp ${errors[field] ? 'err' : ''}`} type={type} placeholder={ph} value={form[field]} onChange={e => { setForm(p => ({...p, [field]: e.target.value})); setErrors(p => ({...p, [field]: ''})); }} />
                {errors[field] && <span className="err-msg">{errors[field]}</span>}
              </div>
            ))}
            <label className="lbl">Category *</label>
            <select className={`inp ${errors.category ? 'err' : ''}`} value={form.category} onChange={e => {
              const nextCategory = e.target.value;
              setForm(p => ({...p, category: nextCategory}));
              setErrors(p => ({...p, category: ''}));
              if (nextCategory !== 'Other') {
                setOtherCategory('');
                setErrors(p => ({...p, otherCategory: ''}));
              }
            }}>
              <option value="">— Select —</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            {errors.category && <span className="err-msg">{errors.category}</span>}
            {form.category === 'Other' && (
              <>
                <label className="lbl">Custom Category *</label>
                <input
                  className={`inp ${errors.otherCategory ? 'err' : ''}`}
                  type="text"
                  placeholder="e.g. Mediterranean"
                  value={otherCategory}
                  onChange={e => {
                    setOtherCategory(e.target.value);
                    setErrors(p => ({ ...p, otherCategory: '' }));
                  }}
                />
                {errors.otherCategory && <span className="err-msg">{errors.otherCategory}</span>}
              </>
            )}
            <label className="lbl">Status</label>
            <select className="inp" value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}>
              <option>Open</option><option>Closed</option>
            </select>
            <button className="btn-red" type="button" onClick={handleAdd}>+ Add Restaurant</button>
          </div>

          <div className="card">
            <div className="card-title">All Restaurants</div>
            <input className="inp search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />

            {loading && <div className="hint">Loading…</div>}
            {!loading && filtered.length === 0 && <div className="hint">{restaurants.length === 0 ? 'No restaurants yet.' : `No results for "${search}"`}</div>}

            {!loading && filtered.map(r => {
              const isOpen = expanded === r.id;
              const items  = menuItems[r.id] || [];
              const mf     = menuForm[r.id]  || EMPTY_ITEM;
              return (
                <div key={r.id} className={`rest-row ${isOpen ? 'open-row' : ''}`}>
                  <div className="rest-top" onClick={() => toggleExpand(r.id)}>
                    <div>
                      <div className="rest-name">{r.name}</div>
                      <div className="rest-meta">{r.category} · {r.address}</div>
                    </div>
                    <div className="rest-actions">
                      <span className={`status ${r.status === 'Open' ? 's-open' : 's-closed'}`}>{r.status}</span>
                      <div className="chevron">{isOpen ? '▲' : '▼'}</div>
                      <button className="btn-sm" type="button" onClick={e => { e.stopPropagation(); setDeleteId(r.id); }}>Remove</button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="menu-panel">
                      <div className="menu-title">Menu Items</div>
                      <div className="menu-add">
                        <input className="mini-inp" placeholder="Item name" value={mf.name} onChange={e => setMenuForm(p => ({...p, [r.id]: {...(p[r.id]||EMPTY_ITEM), name: e.target.value}}))} onKeyDown={e => e.key==='Enter' && handleAddItem(r.id)} />
                        <input className="mini-inp w-price" placeholder="$0.00" type="number" min="0" step="0.01" value={mf.price} onChange={e => setMenuForm(p => ({...p, [r.id]: {...(p[r.id]||EMPTY_ITEM), price: e.target.value}}))} onKeyDown={e => e.key==='Enter' && handleAddItem(r.id)} />
                        <input className="mini-inp w-photo" placeholder="Photo URL (optional)" value={mf.image_url || ''} onChange={e => setMenuForm(p => ({...p, [r.id]: {...(p[r.id]||EMPTY_ITEM), image_url: e.target.value}}))} onKeyDown={e => e.key==='Enter' && handleAddItem(r.id)} />
                        <button className="btn-dark" type="button" onClick={() => handleAddItem(r.id)}>+ Add</button>
                      </div>
                      {menuLoading[r.id] && <div className="hint">Loading…</div>}
                      {!menuLoading[r.id] && items.length === 0 && <div className="hint" style={{padding:'8px 0'}}>No items yet.</div>}
                      {items.map(item => (
                        <div key={item.id} className="item-row">
                          <div className="item-left">
                            {item.image_url && <img className="item-thumb" src={item.image_url} alt={item.name} loading="lazy" />}
                            <span className="item-name">{item.name}</span>
                          </div>
                          <div>
                            <span className="item-price">${Number(item.price).toFixed(2)}</span>
                            <button className="btn-link" type="button" onClick={() => handleUpdateItemPhoto(r.id, item)}>
                              {item.image_url ? 'Change photo' : 'Add photo'}
                            </button>
                            <button className="btn-x" type="button" onClick={() => handleDeleteItem(r.id, item.id, item.name)}>×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}

      {deleteId !== null && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-title">Remove restaurant?</div>
            <p className="modal-text">Are you sure you want to remove <strong>"{restaurants.find(r => r.id === deleteId)?.name}"</strong>? This cannot be undone.</p>
            <div className="modal-btns">
              <button className="btn-cancel" type="button" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-confirm" type="button" onClick={() => handleDelete(deleteId)}>Yes, remove</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}