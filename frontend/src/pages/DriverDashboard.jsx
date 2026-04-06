// frontend/src/pages/DriverDashboard.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://127.0.0.1:5000';

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
    --yellow: #f59e0b;
    --green:  #22a95b;
    --blue:   #4f46e5;
  }

  html, body, #root { min-height: 100vh; background: var(--bg); }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--black);
    min-height: 100vh;
  }

  /* ── HEADER ── */
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
  .logo-btn { background: none; border: none; padding: 0; display: inline-flex; align-items: center; cursor: pointer; }

  .badge {
    font-size: 11px; font-weight: 700;
    background: var(--yellow); color: var(--black);
    padding: 2px 8px; border-radius: 100px;
    margin-left: 8px; vertical-align: middle;
    text-transform: uppercase; letter-spacing: 0.5px;
  }

  .logout-btn {
    background: none; border: 1.5px solid #ccc; color: var(--black);
    padding: 7px 18px; border-radius: 100px;
    font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
    transition: border-color 0.15s;
  }
  .logout-btn:hover { border-color: var(--black); }

  /* ── ALERTS ── */
  .alert { padding: 10px 32px; font-size: 13px; font-weight: 600; }
  .alert.error   { background: #fdecea; color: #b71c1c; }
  .alert.success { background: #e8f5e9; color: #1b5e20; }

  /* ── PAGE ── */
  .page { max-width: 900px; margin: 0 auto; padding: 36px 24px; }

  .eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
  .heading { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--black); letter-spacing: -0.3px; margin-bottom: 6px; }
  .sub     { font-size: 14px; color: var(--muted); margin-bottom: 28px; }

  /* ── STATS ── */
  .stats { display: flex; gap: 14px; margin-bottom: 28px; flex-wrap: wrap; }

  .stat {
    background: var(--card); border: 1.5px solid var(--border); border-radius: 16px;
    padding: 18px 24px; flex: 1; min-width: 120px;
    border-top: 4px solid transparent;
  }

  .stat-num   { font-family: 'Syne', sans-serif; font-size: 34px; font-weight: 800; line-height: 1; }
  .stat-label { font-size: 13px; color: var(--muted); margin-top: 5px; }

  /* ── TABS ── */
  .tabs { display: flex; gap: 10px; margin-bottom: 18px; }

  .tab {
    padding: 10px 22px; border-radius: 100px;
    border: 1.5px solid var(--border); background: var(--card);
    color: var(--muted); font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit;
    transition: all 0.15s;
  }
  .tab:hover { border-color: var(--yellow); color: var(--yellow); }

  .tab-active {
    background: var(--yellow) !important;
    border-color: var(--yellow) !important;
    color: var(--black) !important;
  }

  /* ── CARD ── */
  .card {
    background: var(--card); border: 1.5px solid var(--border);
    border-radius: 18px; overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }

  .hint { text-align: center; color: var(--muted); padding: 36px 20px; font-size: 13px; }

  /* ── ORDER ROWS ── */
  .order-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    gap: 12px; flex-wrap: wrap;
    transition: background 0.1s;
  }
  .order-row:last-child { border-bottom: none; }
  .order-row:hover { background: #faf9f7; }

  .order-info { flex: 1; }
  .order-name { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  .order-meta { font-size: 12px; color: var(--muted); font-weight: 500; }

  .order-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

  /* ── STATUS BADGES ── */
  .status {
    font-size: 11px; font-weight: 700;
    padding: 4px 12px; border-radius: 100px;
    white-space: nowrap;
  }
  .status-pending   { background: #fef9c3; color: #92400e; }
  .status-accepted  { background: #e0e7ff; color: #3730a3; }
  .status-delivered { background: #dcfce7; color: #166534; }

  /* ── ACTION BUTTONS ── */
  .accept-btn {
    background: var(--yellow); color: var(--black); border: none;
    padding: 8px 18px; border-radius: 100px;
    font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .accept-btn:hover { background: #d97706; color: var(--white); }

  .deliver-btn {
    background: var(--green); color: var(--white); border: none;
    padding: 8px 18px; border-radius: 100px;
    font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .deliver-btn:hover { background: #15803d; }
`;

export default function DriverDashboard() {
  const navigate = useNavigate();

  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [apiError,  setApiError]  = useState('');
  const [toast,     setToast]     = useState('');
  const [activeTab, setActiveTab] = useState('available');

  async function fetchOrders() {
    setLoading(true);
    setApiError('');
    try {
      const res  = await fetch(`${API}/api/orders`);
      const data = await res.json();
      setOrders(data);
    } catch {
      setApiError('Could not connect to the server. Make sure the backend is running.');
    }
    setLoading(false);
  }

  useEffect(() => { fetchOrders(); }, []);

  async function acceptOrder(orderId) {
    setApiError('');
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/accept`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ driver_id: 1 }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => o.id === orderId ? { ...o, status: 'accepted', driver_id: 1 } : o)
        );
        showToast('Order accepted! Head to the restaurant.');
      } else {
        setApiError(data.message || 'Failed to accept order.');
      }
    } catch {
      setApiError('Could not connect to the server.');
    }
  }

  async function markDelivered(orderId) {
    setApiError('');
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/deliver`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => o.id === orderId ? { ...o, status: 'delivered' } : o)
        );
        showToast('Order marked as delivered! 🎉');
      } else {
        setApiError(data.message || 'Failed to mark delivered.');
      }
    } catch {
      setApiError('Could not connect to the server.');
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/signin/user');
  }

  function handleLogoClick() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/');
  }

  const MY_DRIVER_ID = 1;

  const availableOrders = orders.filter((o) => o.status === 'pending');
  const myOrders        = orders.filter((o) => o.driver_id === MY_DRIVER_ID && o.status !== 'delivered');
  const delivered       = orders.filter((o) => o.driver_id === MY_DRIVER_ID && o.status === 'delivered');

  const displayOrders = activeTab === 'available' ? availableOrders : myOrders;

  return (
    <>
      <style>{styles}</style>
      <div>

        {/* ── HEADER ── */}
        <header className="header">
          <div className="logo">
            <button className="logo-btn" type="button" onClick={handleLogoClick} aria-label="Go to main menu and sign out">
              <img src="/Data Dash Logo.png" alt="DataDash" style={{ height: '300px', verticalAlign: 'middle' }} onError={(e) => { e.target.style.display = 'none'; }} />
            </button>
            <span className="badge">Driver</span>
          </div>
          <button className="logout-btn" type="button" onClick={handleLogout}>Sign out</button>
        </header>

        {apiError && <div className="alert error">⚠️ {apiError}</div>}
        {toast    && <div className="alert success">✅ {toast}</div>}

        {/* ── MAIN ── */}
        <div className="page">
          <div className="eyebrow">Driver Portal</div>
          <div className="heading">Driver Dashboard</div>
          <div className="sub">Pick up and deliver orders in your area.</div>

          {/* Stats */}
          <div className="stats">
            <div className="stat" style={{ borderTopColor: 'var(--yellow)' }}>
              <div className="stat-num" style={{ color: 'var(--yellow)' }}>{availableOrders.length}</div>
              <div className="stat-label">Available</div>
            </div>
            <div className="stat" style={{ borderTopColor: 'var(--blue)' }}>
              <div className="stat-num" style={{ color: 'var(--blue)' }}>{myOrders.length}</div>
              <div className="stat-label">My Active</div>
            </div>
            <div className="stat" style={{ borderTopColor: 'var(--green)' }}>
              <div className="stat-num" style={{ color: 'var(--green)' }}>{delivered.length}</div>
              <div className="stat-label">Delivered</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'available' ? 'tab-active' : ''}`}
              type="button"
              onClick={() => setActiveTab('available')}
            >
              📦 Available Orders
            </button>
            <button
              className={`tab ${activeTab === 'mine' ? 'tab-active' : ''}`}
              type="button"
              onClick={() => setActiveTab('mine')}
            >
              🚗 My Active Orders
            </button>
          </div>

          {/* Orders List */}
          <div className="card">
            {loading && <div className="hint">Loading orders…</div>}

            {!loading && displayOrders.length === 0 && (
              <div className="hint">
                {activeTab === 'available'
                  ? 'No available orders right now. Check back soon!'
                  : "You haven't accepted any orders yet."}
              </div>
            )}

            {!loading && displayOrders.map((order) => (
              <div key={order.id} className="order-row">
                <div className="order-info">
                  <div className="order-name">Order #{order.id}</div>
                  <div className="order-meta">
                    🏪 {order.store_name || `Store #${order.store_id}`}
                    &nbsp;·&nbsp;
                    👤 Customer #{order.customer_id}
                  </div>
                </div>
                <div className="order-right">
                  <span className={`status status-${order.status}`}>
                    {order.status === 'pending'   && 'Pending'}
                    {order.status === 'accepted'  && 'Accepted'}
                    {order.status === 'delivered' && 'Delivered'}
                  </span>

                  {order.status === 'pending' && (
                    <button className="accept-btn" type="button" onClick={() => acceptOrder(order.id)}>
                      Accept
                    </button>
                  )}
                  {order.status === 'accepted' && order.driver_id === MY_DRIVER_ID && (
                    <button className="deliver-btn" type="button" onClick={() => markDelivered(order.id)}>
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}