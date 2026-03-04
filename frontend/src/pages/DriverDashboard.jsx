// frontend/src/pages/DriverDashboard.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DriverDashboard.css';

const API = 'http://127.0.0.1:5000';

export default function DriverDashboard() {
  const navigate = useNavigate();

  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [apiError,  setApiError]  = useState('');
  const [toast,     setToast]     = useState('');
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'mine'

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

  useEffect(() => {
    fetchOrders();
  }, []);

  async function acceptOrder(orderId) {
    setApiError('');
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/accept`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ driver_id: 1 }), // replace with real driver ID from auth
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
      const res = await fetch(`${API}/api/orders/${orderId}/deliver`, {
        method: 'POST',
      });
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

  const MY_DRIVER_ID = 1; // replace with real driver ID from auth token

  const availableOrders = orders.filter((o) => o.status === 'pending');
  const myOrders        = orders.filter((o) => o.driver_id === MY_DRIVER_ID && o.status !== 'delivered');
  const delivered       = orders.filter((o) => o.driver_id === MY_DRIVER_ID && o.status === 'delivered');

  const displayOrders = activeTab === 'available' ? availableOrders : myOrders;

  return (
    <div className="dd-page">

      <header className="dd-topbar">
        <span className="dd-logo">
          <img src="/data-dash-logo.png" alt="Data Dash" style={{ height: '42px' }} />
          <span className="dd-badge">Driver</span>
        </span>
        <button className="dd-logout" onClick={handleLogout}>Log Out</button>
      </header>

      <main className="dd-main">
        <h1 className="dd-title">Driver Dashboard</h1>
        <p className="dd-sub">Pick up and deliver orders in your area.</p>

        {toast    && <div className="dd-toast">✅ {toast}</div>}
        {apiError && <div className="dd-error-banner">⚠️ {apiError}</div>}

        {/* Stats */}
        <div className="dd-stats">
          <div className="dd-stat" style={{ borderTopColor: '#f59e0b' }}>
            <div className="dd-stat-num" style={{ color: '#f59e0b' }}>{availableOrders.length}</div>
            <div className="dd-stat-label">Available</div>
          </div>
          <div className="dd-stat" style={{ borderTopColor: '#4f46e5' }}>
            <div className="dd-stat-num" style={{ color: '#4f46e5' }}>{myOrders.length}</div>
            <div className="dd-stat-label">My Active</div>
          </div>
          <div className="dd-stat" style={{ borderTopColor: '#16a34a' }}>
            <div className="dd-stat-num" style={{ color: '#16a34a' }}>{delivered.length}</div>
            <div className="dd-stat-label">Delivered</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dd-tabs">
          <button
            className={`dd-tab ${activeTab === 'available' ? 'dd-tab-active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            📦 Available Orders
          </button>
          <button
            className={`dd-tab ${activeTab === 'mine' ? 'dd-tab-active' : ''}`}
            onClick={() => setActiveTab('mine')}
          >
            🚗 My Active Orders
          </button>
        </div>

        {/* Orders List */}
        <div className="dd-card">
          {loading && <div className="dd-empty">Loading orders...</div>}

          {!loading && displayOrders.length === 0 && (
            <div className="dd-empty">
              {activeTab === 'available'
                ? 'No available orders right now. Check back soon!'
                : "You haven't accepted any orders yet."}
            </div>
          )}

          {!loading && displayOrders.map((order) => (
            <div key={order.id} className="dd-row">
              <div className="dd-row-info">
                <div className="dd-row-name">Order #{order.id}</div>
                <div className="dd-row-meta">
                  🏪 {order.store_name || `Store #${order.store_id}`}
                  &nbsp;|&nbsp;
                  👤 Customer #{order.customer_id}
                </div>
              </div>
              <div className="dd-row-right">
                <span className={`dd-status dd-status-${order.status}`}>
                  {order.status === 'pending'  && '🟡 Pending'}
                  {order.status === 'accepted' && '🔵 Accepted'}
                  {order.status === 'delivered'&& '🟢 Delivered'}
                </span>

                {order.status === 'pending' && (
                  <button className="dd-accept-btn" onClick={() => acceptOrder(order.id)}>
                    Accept
                  </button>
                )}
                {order.status === 'accepted' && order.driver_id === MY_DRIVER_ID && (
                  <button className="dd-deliver-btn" onClick={() => markDelivered(order.id)}>
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}