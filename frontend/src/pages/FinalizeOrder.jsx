import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API = 'http://127.0.0.1:5000';
const DELIVERY_FEE = 2.5;
const TAX_RATE = 0.13;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { min-height: 100vh; background: #edeae4; }
  body { font-family: 'DM Sans', sans-serif; color: #111; background: #edeae4; }

  .wrap { min-height: 100vh; padding: 32px 20px; }
  .panel {
    max-width: 760px;
    margin: 0 auto;
    background: #fff;
    border: 1.5px solid #e0ddd8;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(0,0,0,0.05);
  }

  .top {
    padding: 22px 24px 18px;
    border-bottom: 1px solid #e0ddd8;
    background: #faf9f7;
  }
  .eyebrow {
    font-size: 11px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #888;
    font-weight: 600;
    margin-bottom: 6px;
  }
  .title {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.4px;
    margin-bottom: 4px;
  }
  .sub { color: #666; font-size: 14px; }

  .content {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 22px;
    padding: 20px 24px 24px;
  }
  @media (max-width: 760px) {
    .content { grid-template-columns: 1fr; }
  }

  .list {
    border: 1.5px solid #ece8e3;
    border-radius: 14px;
    padding: 12px 14px;
    background: #fff;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 0;
    border-bottom: 1px solid #f0ede8;
  }
  .row:last-child { border-bottom: none; }
  .name { font-size: 14px; font-weight: 600; }
  .meta { color: #777; font-size: 12px; margin-top: 2px; }
  .line-total { font-size: 13px; color: #333; font-weight: 600; }

  .summary {
    border: 1.5px solid #ece8e3;
    border-radius: 14px;
    padding: 14px;
    background: #fff;
    height: fit-content;
  }
  .sum-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #666;
    padding: 7px 0;
  }
  .sum-row.total {
    color: #111;
    font-weight: 700;
    font-size: 16px;
    margin-top: 8px;
    padding-top: 10px;
    border-top: 1px solid #ddd;
  }

  .actions {
    margin-top: 14px;
    display: grid;
    gap: 8px;
  }
  .btn {
    width: 100%;
    border: none;
    border-radius: 999px;
    padding: 12px 14px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }
  .btn.confirm { background: #e8300a; color: #fff; }
  .btn.confirm:hover:not(:disabled) { background: #c5290a; }
  .btn.confirm:disabled { background: #d6d2cc; color: #9f9b95; cursor: not-allowed; }
  .btn.back { background: #f2efea; color: #222; }

  .msg { font-size: 13px; font-weight: 600; padding: 10px 12px; border-radius: 10px; margin-top: 10px; }
  .msg.error { background: #fdecea; color: #b71c1c; }
`;

function toCurrency(value) {
  return `$${value.toFixed(2)}`;
}

export default function FinalizeOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  const storeId = Number(location.state?.storeId);
  const storeName = location.state?.storeName || '';
  const items = Array.isArray(location.state?.items) ? location.state.items : [];

  const hasValidState = Number.isFinite(storeId) && storeId > 0 && items.length > 0;

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [items]
  );
  const tax = useMemo(() => (subtotal + DELIVERY_FEE) * TAX_RATE, [subtotal]);
  const total = useMemo(() => subtotal + DELIVERY_FEE + tax, [subtotal, tax]);

  useEffect(() => {
    if (role !== 'customer' && role !== 'user') {
      navigate('/signin/user', { replace: true });
      return;
    }

    if (!hasValidState) {
      navigate('/order', {
        replace: true,
        state: { orderError: 'Your cart is empty. Add items before finalizing.' },
      });
    }
  }, [hasValidState, navigate, role]);

  if (role !== 'customer' && role !== 'user' || !hasValidState) {
    return null;
  }

  async function clearSavedCart(currentUsername) {
    await fetch(`${API}/api/users/${encodeURIComponent(currentUsername)}/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: null, items: [] }),
    });
  }

  async function handleConfirm() {
    if (!username) {
      setError('Please sign in again to place your order.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          customer_username: username,
          total_price: Math.round(total * 100) / 100,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const raw = await res.text();
        data = { message: raw?.slice(0, 180) || 'Server error while placing order.' };
      }

      if (!res.ok) {
        setError(data.message || 'Failed to place order.');
        return;
      }

      try {
        await clearSavedCart(username);
      } catch {
        // Do not block success redirect if cart clear fails.
      }

      navigate('/order', {
        replace: true,
        state: {
          orderSuccess: `Order #${data.order_id} placed! Total: ${toCurrency(total)}.`,
        },
      });
    } catch {
      setError('Could not connect to the server.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="wrap">
        <div className="panel">
          <div className="top">
            <div className="eyebrow">Final Step</div>
            <div className="title">Finalize Order</div>
            <div className="sub">{storeName ? `Reviewing order from ${storeName}` : 'Review your order details before confirming.'}</div>
          </div>

          <div className="content">
            <div className="list">
              {items.map((item) => {
                const qty = Number(item.quantity || 0);
                const price = Number(item.price || 0);
                const lineTotal = qty * price;
                return (
                  <div className="row" key={item.id}>
                    <div>
                      <div className="name">{item.name}</div>
                      <div className="meta">{qty} x {toCurrency(price)}</div>
                    </div>
                    <div className="line-total">{toCurrency(lineTotal)}</div>
                  </div>
                );
              })}
            </div>

            <div className="summary">
              <div className="sum-row"><span>Subtotal</span><span>{toCurrency(subtotal)}</span></div>
              <div className="sum-row"><span>Delivery fee</span><span>{toCurrency(DELIVERY_FEE)}</span></div>
              <div className="sum-row"><span>Tax (13%)</span><span>{toCurrency(tax)}</span></div>
              <div className="sum-row total"><span>Total</span><span>{toCurrency(total)}</span></div>

              <div className="actions">
                <button className="btn confirm" type="button" onClick={handleConfirm} disabled={submitting}>
                  {submitting ? 'Confirming...' : 'Confirm Order'}
                </button>
                <button className="btn back" type="button" onClick={() => navigate('/order')} disabled={submitting}>
                  Back to Order Page
                </button>
              </div>

              {error && <div className="msg error">{error}</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
