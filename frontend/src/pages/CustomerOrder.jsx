import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://127.0.0.1:5000';

function toCurrency(value) {
  return `$${value.toFixed(2)}`;
}

export default function CustomerOrder() {
  const navigate = useNavigate();

  // Page state: store/menu data, cart, and request feedback.
  const [stores, setStores] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const username = localStorage.getItem('username') || '';

  const fetchStores = useCallback(async () => {
    setLoadingStores(true);
    setError('');

    try {
      const response = await fetch(`${API}/api/stores`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to load restaurants.');
        setStores([]);
      } else {
        setStores(Array.isArray(data) ? data : []);
      }
    } catch {
      setError('Could not connect to the server. Make sure backend is running.');
      setStores([]);
    }

    setLoadingStores(false);
  }, []);

  // Initial store fetch + simple role guard.
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'user') {
      navigate('/signin/user');
      return;
    }

    fetchStores();
  }, [navigate, fetchStores]);

  const openStores = useMemo(
    () => stores.filter((store) => (store.status || '').toLowerCase() === 'open'),
    [stores]
  );

  const selectedStore = useMemo(
    () => openStores.find((store) => store.id === selectedStoreId) || null,
    [openStores, selectedStoreId]
  );

  // Load MenuItem records for the currently selected store.
  const fetchMenuItems = useCallback(async (storeId) => {
    if (!storeId) {
      setMenuItems([]);
      setLoadingMenu(false);
      return;
    }

    setLoadingMenu(true);
    setError('');

    try {
      const response = await fetch(`${API}/api/stores/${storeId}/menu-items`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to load menu items.');
        setMenuItems([]);
      } else {
        const normalized = Array.isArray(data)
          ? data.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: Number(item.price) || 0,
              store_id: item.store_id,
            }))
          : [];
        setMenuItems(normalized);
      }
    } catch {
      setError('Could not connect to the server to load menu items.');
      setMenuItems([]);
    }

    setLoadingMenu(false);
  }, []);

  useEffect(() => {
    if (!selectedStoreId) {
      setMenuItems([]);
      setLoadingMenu(false);
      return;
    }

    fetchMenuItems(selectedStoreId);
  }, [selectedStoreId, fetchMenuItems]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  function addToCart(menuItem) {
    setError('');
    setSuccess('');
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...prev, { ...menuItem, quantity: 1 }];
    });
  }

  function changeQuantity(itemId, delta) {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(itemId) {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/signin/user');
  }

  const filteredStores = openStores.filter(
  (store) =>
    store.name.toLowerCase().includes(search.toLowerCase()) ||
    (store.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <header>
        <h1>DataDash</h1>
        <p>Customer Order Page</p>
        <button type="button" onClick={handleLogout}>Log Out</button>
      </header>

      <hr />

      {success && <p>{success}</p>}
      {error && <p>{error}</p>}

      <section>
    `  <h2>1. Choose Restaurant</h2>
        <button type="button" onClick={fetchStores}>Refresh Restaurants</button>

        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '8px',
              width: '250px',
              borderRadius: '6px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        {loadingStores && <p>Loading restaurants...</p>}
        {!loadingStores && openStores.length === 0 && <p>No open restaurants found.</p>}
        {!loadingStores && openStores.length > 0 && filteredStores.length === 0 && (
          <p>No restaurants match your search.</p>
        )}

        {!loadingStores && filteredStores.length > 0 && (
          <ul>
            {filteredStores.map((store) => (
              <li key={store.id}>
                <button type="button" onClick={() => setSelectedStoreId(store.id)}>
                  {selectedStoreId === store.id ? 'Selected: ' : ''}
                  {store.name} ({store.category || 'General'})
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
  
        <hr />

        <section>
          <h2>2. Menu Items</h2>
          {!selectedStore && <p>Select a restaurant to view menu.</p>}
          {selectedStore && <p>Store: <strong>{selectedStore.name}</strong></p>}
          {selectedStore && loadingMenu && <p>Loading menu items...</p>}
          {selectedStore && !loadingMenu && menuItems.length === 0 && <p>No menu items found for this store.</p>}

          {selectedStore && !loadingMenu && menuItems.length > 0 && (
            <ul>
              {menuItems.map((item) => (
                <li key={item.id}>
                  {item.name} - {toCurrency(item.price)}{' '}
                  {item.description}{' '}
                  <button type="button" onClick={() => addToCart(item)}>Add</button>
                </li>
              ))}
            </ul>
          )}
        </section>

      <hr />

      <section>
        <h2>3. Cart</h2>
        {selectedStore && <p>Ordering from: <strong>{selectedStore.name}</strong></p>}
        <p>Items in cart: {cartCount}</p>

        {cartItems.length === 0 && <p>Your cart is empty.</p>}

        {cartItems.length > 0 && (
          <ul>
            {cartItems.map((item) => (
              <li key={item.id}>
                {item.name} - {toCurrency(item.price)} x {item.quantity}{' '}
                <button type="button" onClick={() => changeQuantity(item.id, -1)}>-</button>{' '}
                <button type="button" onClick={() => changeQuantity(item.id, 1)}>+</button>{' '}
                <button type="button" onClick={() => removeFromCart(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
        )}

        <p><strong>Total: {toCurrency(cartTotal)}</strong></p>

        <button type="button"onClick={null}>Place Order</button>
      </section>
    </div>
  );
}
