import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://127.0.0.1:5000';

function toCurrency(value) {
  return `$${value.toFixed(2)}`;
}
function formatTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:     #edeae4;
    --red:    #e8300a;
    --black:  #111;
    --white:  #fff;
    --card:   #fff;
    --border: #e0ddd8;
    --muted:  #888;
    --green:  #22a95b;
  }

  html, body, #root { min-height: 100vh; background: var(--bg); }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--black);
    min-height: 100vh;
  }

  .header {
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    height: 62px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .logo { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--black); letter-spacing: -0.5px; }
  .logo span { color: var(--red); }

  .logout-btn {
    background: none; border: 1.5px solid #ccc; color: var(--black);
    padding: 7px 18px; border-radius: 100px;
    font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
    transition: border-color 0.15s;
  }
  .logout-btn:hover { border-color: var(--black); }

  .alert { padding: 10px 32px; font-size: 13px; font-weight: 600; }
  .alert.error   { background: #fdecea; color: #b71c1c; }
  .alert.success { background: #e8f5e9; color: #1b5e20; }

  .page {
    max-width: 1040px; margin: 0 auto; padding: 36px 24px;
    display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start;
  }
  @media (max-width: 720px) { .page { grid-template-columns: 1fr; } }

  .section { margin-bottom: 32px; }
  .eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  .heading { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--black); letter-spacing: -0.3px; margin-bottom: 16px; }

  .refresh-btn {
    background: none; border: none; color: var(--red); font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit; margin-bottom: 14px; display: inline-flex; align-items: center; gap: 4px;
  }
  .refresh-btn:hover { text-decoration: underline; }

  .store-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 520px) { .store-grid { grid-template-columns: 1fr; } }

  .store-card {
    background: var(--card); border: 1.5px solid var(--border); border-radius: 16px;
    padding: 18px 16px 14px; cursor: pointer; font-family: inherit; text-align: left;
    width: 100%; color: var(--black);
    transition: box-shadow 0.15s, border-color 0.15s, transform 0.12s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .store-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.09); transform: translateY(-2px); }
  .store-card.selected { border-color: var(--red); box-shadow: 0 4px 16px rgba(232,48,10,0.12); }

  .store-emoji { font-size: 30px; margin-bottom: 10px; display: block; }
  .store-name  { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; margin-bottom: 4px; color: var(--black); }
  .store-meta  { font-size: 12px; color: var(--muted); font-weight: 500; }
  .store-dot   { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 5px; vertical-align: middle; }
  .store-dot.open     { background: var(--green); }
  .store-dot.selected { background: var(--red); }

  .menu-list { display: flex; flex-direction: column; }
  .store-filters {
    display: grid;
    grid-template-columns: 1fr 200px;
    gap: 10px;
    margin: 0 0 14px;
  }
  @media (max-width: 620px) {
    .store-filters { grid-template-columns: 1fr; }
  }
  .menu-search-wrap { margin: 0 0 14px; }
  .menu-search {
    width: 100%;
    border: 1.5px solid var(--border);
    background: var(--card);
    color: var(--black);
    border-radius: 12px;
    padding: 11px 13px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .menu-search::placeholder { color: #999; }
  .menu-search:focus {
    outline: none;
    border-color: var(--red);
    box-shadow: 0 0 0 3px rgba(232,48,10,0.12);
  }
  .menu-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 0; border-bottom: 1px solid var(--border); gap: 12px;
    animation: fadeUp 0.15s ease both;
  }
  .menu-row:last-child { border-bottom: none; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  .menu-photo {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid var(--border);
    background: #f3f0eb;
    flex-shrink: 0;
  }
  .menu-info { flex: 1; }
  .menu-name  { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
  .menu-desc  { font-size: 12px; color: var(--muted); margin-bottom: 3px; line-height: 1.35; }
  .menu-price { font-size: 13px; color: var(--muted); font-weight: 500; }

  .add-btn {
    background: var(--red); color: var(--white); border: none;
    width: 32px; height: 32px; border-radius: 50%; font-size: 20px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-family: inherit; transition: background 0.15s, transform 0.1s; line-height: 1;
  }
  .add-btn:hover { background: #c5290a; transform: scale(1.08); }

  .cart-panel {
    background: var(--card); border: 1.5px solid var(--border); border-radius: 18px;
    overflow: hidden; position: sticky; top: 78px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .cart-top { padding: 18px 20px 14px; border-bottom: 1px solid var(--border); }
  .cart-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800; margin-bottom: 2px; }
  .cart-sub   { font-size: 12px; color: var(--muted); font-weight: 500; }
  .cart-sub strong { color: var(--black); font-weight: 600; }
  .cart-body { padding: 14px 20px; }
  .cart-empty { text-align: center; padding: 22px 0 6px; color: var(--muted); font-size: 13px; }
  .cart-empty-icon { font-size: 28px; margin-bottom: 6px; }
  .cart-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #f3f0eb; }
  .cart-row:last-of-type { border-bottom: none; }
  .cart-row-info { flex: 1; }
  .cart-row-name  { font-size: 13px; font-weight: 600; }
  .cart-row-price { font-size: 12px; color: var(--muted); margin-top: 1px; }
  .qty-wrap { display: flex; align-items: center; gap: 8px; background: #f3f0eb; border-radius: 100px; padding: 3px 8px; }
  .qty-btn { background: none; border: none; color: var(--black); font-size: 16px; font-weight: 800; cursor: pointer; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-family: inherit; }
  .qty-btn:hover { background: #e5e2dc; border-radius: 50%; }
  .qty-num { font-size: 13px; font-weight: 700; min-width: 14px; text-align: center; }
  .cart-totals { padding: 10px 0 2px; }
  .cart-line { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); font-weight: 500; margin-bottom: 5px; }
  .cart-line.total { font-size: 15px; font-weight: 700; color: var(--black); padding-top: 9px; margin-top: 4px; border-top: 1px solid var(--border); }
  .cart-footer { padding: 0 20px 18px; }
  .place-btn {
    width: 100%; background: var(--red); color: var(--white); border: none;
    padding: 13px; border-radius: 100px; font-size: 14px; font-weight: 700;
    cursor: pointer; font-family: inherit; transition: background 0.15s;
  }
  .place-btn:hover:not(:disabled) { background: #c5290a; }
  .place-btn:disabled { background: #d5d2cc; color: #aaa; cursor: not-allowed; }
  .hint { font-size: 13px; color: var(--muted); font-weight: 500; }
  /* ORDER STATUS */
  .order-box { ... }
  .order-title { ... }
  /* etc */
`;

const categoryEmojis = { pizza:'🍕', burger:'🍔', sushi:'🍣', chinese:'🥡', mexican:'🌮', italian:'🍝', indian:'🍛', thai:'🍜', salad:'🥗', dessert:'🍰', breakfast:'🍳', coffee:'☕', general:'🍽️' };
function storeEmoji(cat) { return categoryEmojis[(cat || '').toLowerCase()] || '🍽️'; }

function normalizeCartItems(rawItems) {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item) => {
      const id = Number(item?.id);
      const price = Number(item?.price);
      const quantity = Number(item?.quantity);
      const storeId = item?.store_id == null ? null : Number(item.store_id);

      if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(price) || !Number.isFinite(quantity) || quantity <= 0) {
        return null;
      }

      return {
        id,
        name: item?.name || '',
        description: item?.description || '',
        image_url: item?.image_url || '',
        price,
        quantity,
        store_id: Number.isFinite(storeId) ? storeId : null,
      };
    })
    .filter(Boolean);
}

export default function CustomerOrder() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const [stores, setStores] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [storeSearchTerm, setStoreSearchTerm] = useState('');
  const [storeCategoryFilter, setStoreCategoryFilter] = useState('all');
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cartSyncReady, setCartSyncReady] = useState(false);
  const [orders, setOrders] = useState([]);

  const fetchStores = useCallback(async () => {
    setLoadingStores(true); setError('');
    try {
      const res = await fetch(`${API}/api/stores`);
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to load restaurants.'); setStores([]); }
      else setStores(Array.isArray(data) ? data : []);
    } catch { setError('Could not connect to the server.'); setStores([]); }
    setLoadingStores(false);
  }, []);

  const fetchSavedCart = useCallback(async () => {
    if (!username) {
      return;
    }

    try {
      const res = await fetch(`${API}/api/users/${encodeURIComponent(username)}/cart`);
      const data = await res.json();

      if (res.ok) {
        const normalizedItems = normalizeCartItems(data.items);
        const parsedStoreId = Number(data.store_id);
        setCartItems(normalizedItems);
        setSelectedStoreId(Number.isFinite(parsedStoreId) ? parsedStoreId : null);
      }

      setCartSyncReady(true);
    } catch {
      setCartSyncReady(false);
    }
  }, [username]);

  const saveCartToAccount = useCallback(async (nextStoreId, nextItems) => {
    if (!username) {
      return;
    }

    try {
      await fetch(`${API}/api/users/${encodeURIComponent(username)}/cart`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: nextStoreId,
          items: nextItems,
        }),
      });
    } catch {
      // Keep cart usable locally if the save request fails.
    }
  }, [username]);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'customer' && role !== 'user') { navigate('/signin/user'); return; }
    fetchStores();
    fetchSavedCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Load customer orders - refresh every 5 seconds
useEffect(() => {
  async function loadOrders() {
    const username = localStorage.getItem('username');
    if (!username) return;
    try {
      const res = await fetch(`${API}/api/orders?customer_username=${username}`);
      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.log('Error loading orders:', err);
    }
  }

  loadOrders();
  const interval = setInterval(loadOrders, 5000); // Refresh every 5 seconds
  return () => clearInterval(interval);
}, []);

  useEffect(() => {
    if (!cartSyncReady) {
      return;
    }

    saveCartToAccount(selectedStoreId, cartItems);
  }, [cartSyncReady, selectedStoreId, cartItems, saveCartToAccount]);

  const openStores = useMemo(() => stores.filter((s) => (s.status || '').toLowerCase() === 'open'), [stores]);
  const availableCategories = useMemo(() => {
    const unique = Array.from(
      new Set(
        openStores
          .map((store) => (store.category || 'general').toLowerCase())
          .filter(Boolean)
      )
    );
    return unique.sort();
  }, [openStores]);
  const filteredOpenStores = useMemo(() => {
    const query = storeSearchTerm.trim().toLowerCase();
    const hasCategoryFilter = storeCategoryFilter !== 'all';

    const categoryFilteredStores = hasCategoryFilter
      ? openStores.filter((store) => (store.category || 'general').toLowerCase() === storeCategoryFilter)
      : openStores;

    if (!query) {
      return categoryFilteredStores;
    }
    return categoryFilteredStores.filter((store) => {
      const nameMatch = (store.name || '').toLowerCase().includes(query);
      const categoryMatch = (store.category || '').toLowerCase().includes(query);
      return nameMatch || categoryMatch;
    });
  }, [openStores, storeSearchTerm, storeCategoryFilter]);
  const selectedStore = useMemo(() => openStores.find((s) => s.id === selectedStoreId) || null, [openStores, selectedStoreId]);

  const fetchMenuItems = useCallback(async (storeId) => {
    if (!storeId) { setMenuItems([]); return; }
    setLoadingMenu(true); setError('');
    try {
      const res = await fetch(`${API}/api/stores/${storeId}/menu-items`);
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to load menu.'); setMenuItems([]); }
      else setMenuItems(Array.isArray(data) ? data.map((i) => ({ id: i.id, name: i.name, description: i.description || '', image_url: i.image_url || '', price: Number(i.price) || 0, store_id: i.store_id })) : []);
    } catch { setError('Could not load menu items.'); setMenuItems([]); }
    setLoadingMenu(false);
  }, []);

  useEffect(() => {
    if (!selectedStoreId) {
      setMenuItems([]);
      setMenuSearchTerm('');
      return;
    }
    fetchMenuItems(selectedStoreId);
    setMenuSearchTerm('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreId]);

  const filteredMenuItems = useMemo(() => {
    const query = menuSearchTerm.trim().toLowerCase();
    if (!query) {
      return menuItems;
    }
    return menuItems.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(query);
      const descMatch = (item.description || '').toLowerCase().includes(query);
      return nameMatch || descMatch;
    });
  }, [menuItems, menuSearchTerm]);

  const cartTotal = useMemo(() => cartItems.reduce((s, i) => s + i.price * i.quantity, 0), [cartItems]);
  const deliveryFee = cartItems.length > 0 ? 2.99 : 0;

  function addToCart(item) {
    setCartItems((prev) => {
      const ex = prev.find((i) => i.id === item.id);
      if (ex) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function changeQuantity(itemId, delta) {
    setCartItems((prev) =>
      prev.map((i) => i.id === itemId ? { ...i, quantity: i.quantity + delta } : i).filter((i) => i.quantity > 0)
    );
  }

  function handleLogout() {
    localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('username');
    navigate('/signin/user');
  }

  return (
    <>
      <style>{styles}</style>
      <div>
        <header className="header">
        <div className="logo">
          <img src="/Data Dash Logo.png" alt="DataDash" style={{ height: '50px', verticalAlign: 'middle' }} onError={(e) => { e.target.style.display = 'none'; }} />
        </div>          
        <button className="logout-btn" type="button" onClick={handleLogout}>Sign out</button>
        </header>

        {error   && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <div className="page">
           <div>
          {/* SHOW CUSTOMER ORDERS */}
          {orders.length > 0 && (
            <div className="section">
              <div className="heading">📦 Your Orders</div>
              {orders.map((order) => (
                <div key={order.id} className="order-box">
                  <div className="order-title">Order #{order.id} • {toCurrency(order.total_price)}</div>
                  <div className="order-status">
                    <div className="status-item">
                      <span className="status-icon">📋</span>
                      <div className="status-label">Placed</div>
                      <div className="status-time">{formatTime(order.created_at)}</div>
                    </div>
                    <div className="status-item">
                      <span className="status-icon">{order.status === 'accepted' || order.status === 'delivered' ? '✅' : '⏳'}</span>
                      <div className="status-label">Accepted</div>
                      <div className="status-time">{order.accepted_at ? formatTime(order.accepted_at) : '—'}</div>
                    </div>
                    <div className="status-item">
                      <span className="status-icon">{order.status === 'delivered' ? '🎉' : '⏳'}</span>
                      <div className="status-label">Delivered</div>
                      <div className="status-time">{order.delivered_at ? formatTime(order.delivered_at) : '—'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            <div className="section">
              <div className="eyebrow">Step 1</div>
              <div className="heading">Pick a restaurant</div>
              <button className="refresh-btn" type="button" onClick={fetchStores}>↻ Refresh</button>

              {!loadingStores && openStores.length > 0 && (
                <div className="store-filters">
                  <div className="menu-search-wrap" style={{ marginBottom: 0 }}>
                    <input
                      className="menu-search"
                      type="search"
                      placeholder="Search restaurants"
                      value={storeSearchTerm}
                      onChange={(e) => setStoreSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="menu-search"
                    value={storeCategoryFilter}
                    onChange={(e) => setStoreCategoryFilter(e.target.value)}
                    aria-label="Filter restaurants by category"
                  >
                    <option value="all">All categories</option>
                    {availableCategories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {loadingStores && <p className="hint">Loading…</p>}
              {!loadingStores && openStores.length === 0 && <p className="hint">No open restaurants right now.</p>}
              {!loadingStores && openStores.length > 0 && filteredOpenStores.length === 0 && (
                <p className="hint">No restaurants match your search.</p>
              )}

              {!loadingStores && filteredOpenStores.length > 0 && (
                <div className="store-grid">
                  {filteredOpenStores.map((store) => {
                    const sel = selectedStoreId === store.id;
                    return (
                      <button
                        key={store.id}
                        className={`store-card${sel ? ' selected' : ''}`}
                        type="button"
                        onClick={() => { setSelectedStoreId(store.id); setCartItems([]); }}
                      >
                        <span className="store-emoji">{storeEmoji(store.category)}</span>
                        <div className="store-name">{store.name}</div>
                        <div className="store-meta">
                          <span className={`store-dot ${sel ? 'selected' : 'open'}`} />
                          {sel ? 'Selected' : '20–30 min'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedStore && (
              <div className="section">
                <div className="eyebrow">Step 2</div>
                <div className="heading">{selectedStore.name}</div>

                {!loadingMenu && menuItems.length > 0 && (
                  <div className="menu-search-wrap">
                    <input
                      className="menu-search"
                      type="search"
                      placeholder="Search menu items"
                      value={menuSearchTerm}
                      onChange={(e) => setMenuSearchTerm(e.target.value)}
                    />
                  </div>
                )}

                {loadingMenu && <p className="hint">Loading menu…</p>}
                {!loadingMenu && menuItems.length === 0 && <p className="hint">No items available.</p>}
                {!loadingMenu && menuItems.length > 0 && filteredMenuItems.length === 0 && (
                  <p className="hint">No menu items match your search.</p>
                )}

                {!loadingMenu && filteredMenuItems.length > 0 && (
                  <div className="menu-list">
                    {filteredMenuItems.map((item, idx) => (
                      <div key={item.id} className="menu-row" style={{ animationDelay: `${idx * 0.04}s` }}>
                        {item.image_url && <img className="menu-photo" src={item.image_url} alt={item.name} loading="lazy" />}
                        <div className="menu-info">
                          <div className="menu-name">{item.name}</div>
                          {item.description && <div className="menu-desc">{item.description}</div>}
                          <div className="menu-price">{toCurrency(item.price)}</div>
                        </div>
                        <button className="add-btn" type="button" onClick={() => addToCart(item)}>+</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="cart-panel">
            <div className="cart-top">
              <div className="cart-title">Your order</div>
              <div className="cart-sub">
                {selectedStore ? <>from <strong>{selectedStore.name}</strong></> : 'No restaurant selected'}
              </div>
            </div>

            <div className="cart-body">
              {cartItems.length === 0 ? (
                <div className="cart-empty">
                  <div className="cart-empty-icon">🛍️</div>
                  <div>Add items to get started</div>
                </div>
              ) : (
                <>
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-row">
                      <div className="cart-row-info">
                        <div className="cart-row-name">{item.name}</div>
                        <div className="cart-row-price">{toCurrency(item.price)}</div>
                      </div>
                      <div className="qty-wrap">
                        <button className="qty-btn" type="button" onClick={() => changeQuantity(item.id, -1)}>−</button>
                        <span className="qty-num">{item.quantity}</span>
                        <button className="qty-btn" type="button" onClick={() => changeQuantity(item.id, 1)}>+</button>
                      </div>
                    </div>
                  ))}
                  <div className="cart-totals">
                    <div className="cart-line"><span>Subtotal</span><span>{toCurrency(cartTotal)}</span></div>
                    <div className="cart-line"><span>Delivery</span><span>{toCurrency(deliveryFee)}</span></div>
                    <div className="cart-line total"><span>Total</span><span>{toCurrency(cartTotal + deliveryFee)}</span></div>
                  </div>
                </>
              )}
            </div>

            <div className="cart-footer">
              <button
                className="place-btn"
                type="button"
                disabled={cartItems.length === 0 || !selectedStore}
                onClick={async () => {
                  setError(''); setSuccess('');
                  const username = localStorage.getItem('username');
                  try {
                    const res = await fetch(`${API}/api/orders`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        store_id: selectedStoreId,
                        customer_username: username,
                        total_price: Math.round((cartTotal + deliveryFee) * 100) / 100,
                      }),
                    });

                    const contentType = res.headers.get('content-type') || '';
                    let data = null;
                    if (contentType.includes('application/json')) {
                      data = await res.json();
                    } else {
                      const raw = await res.text();
                      data = { message: raw?.slice(0, 180) || 'Server error while placing order.' };
                    }

                    if (res.ok) {
                      setSuccess(`Order #${data.order_id} placed! Total: $${(cartTotal + deliveryFee).toFixed(2)}`);
                      setCartItems([]);
                    } else {
                      setError(data.message || 'Failed to place order.');
                    }
                  } catch {
                    setError('Could not connect to the server.');
                  }
                }}
              >
                {cartItems.length === 0 ? 'Add items to order' : `Place order · ${toCurrency(cartTotal + deliveryFee)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}