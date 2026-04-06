import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://127.0.0.1:5000';

function toCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
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
  .logo-btn { background: none; border: none; padding: 0; display: inline-flex; align-items: center; cursor: pointer; }
  .logo-btn img { height: 52px; width: auto; }

  .logout-btn {
    background: none; border: 1.5px solid #ccc; color: var(--black);
    padding: 7px 18px; border-radius: 100px;
    font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
    transition: border-color 0.15s;
  }
  .logout-btn:hover { border-color: var(--black); }

  .page {
    max-width: 900px; margin: 0 auto; padding: 36px 24px;
  }

  .section { margin-bottom: 32px; }
  .eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  .heading { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--black); letter-spacing: -0.3px; margin-bottom: 16px; }

  .back-btn {
    background: none; border: none; color: var(--red); font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit; margin-bottom: 20px; display: inline-flex; align-items: center; gap: 4px;
  }
  .back-btn:hover { text-decoration: underline; }

  .stores-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }

  .store-card {
    background: var(--card); border: 1.5px solid var(--border); border-radius: 16px;
    padding: 20px; cursor: pointer; text-align: left;
    width: 100%;
    transition: box-shadow 0.15s, border-color 0.15s, transform 0.12s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }
  .store-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.09); transform: translateY(-2px); border-color: var(--red); }

  .store-emoji { font-size: 36px; margin-bottom: 12px; display: block; }
  .store-name { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 4px; color: var(--black); }
  .store-meta { font-size: 12px; color: var(--muted); font-weight: 500; margin-bottom: 10px; }
  .store-rating { font-size: 13px; color: var(--red); font-weight: 600; }

  .reviews-container { 
    background: var(--card); 
    border: 1.5px solid var(--border); 
    border-radius: 16px; 
    padding: 24px;
    max-width: 900px;
    margin: 0 auto;
  }

  .store-header {
    display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
  }
  .store-header .emoji { font-size: 40px; }
  .store-header .info h2 { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .store-header .info p { font-size: 12px; color: var(--muted); }

  .review-form {
    background: #fafaf8; border: 1.5px solid var(--border); border-radius: 12px;
    padding: 18px; margin-bottom: 24px;
  }

  .form-group { margin-bottom: 14px; }
  .form-group label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: var(--black); text-transform: uppercase; letter-spacing: 0.5px; }

  .form-group textarea, .form-group select {
    width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 8px;
    font-family: inherit; font-size: 13px; color: var(--black);
    background: var(--white);
  }

  .form-group textarea { resize: vertical; min-height: 80px; }

  .star-rating {
    display: flex; gap: 8px; margin-top: 6px;
  }
  .star-btn {
    background: none; border: none; font-size: 28px; cursor: pointer;
    transition: transform 0.1s;
  }
  .star-btn:hover { transform: scale(1.15); }
  .star-btn.active { filter: drop-shadow(0 2px 4px rgba(232,48,10,0.4)); }

  .submit-btn {
    background: var(--red); color: var(--white); border: none;
    padding: 10px 20px; border-radius: 100px;
    font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
    transition: opacity 0.15s;
  }
  .submit-btn:hover { opacity: 0.9; }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .reviews-list { }

  .review-item {
    border-bottom: 1px solid var(--border); padding: 16px 0;
  }
  .review-item:last-child { border-bottom: none; }

  .review-header {
    display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;
  }
  .review-author { font-weight: 600; font-size: 14px; }
  .review-date { font-size: 12px; color: var(--muted); }

  .review-rating {
    color: var(--red); font-size: 14px; margin-bottom: 6px; font-weight: 500;
  }

  .review-text { font-size: 14px; color: var(--black); line-height: 1.5; }

  .no-reviews { text-align: center; padding: 32px 16px; color: var(--muted); }

  .alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; font-weight: 600; }
  .alert.error { background: #fdecea; color: #b71c1c; }
  .alert.success { background: #e8f5e9; color: #1b5e20; }
`;

function ReviewsPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('username');
    if (stored) {
      setUsername(stored);
    }
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await fetch(`${API}/api/stores`);
      if (res.ok) {
        const data = await res.json();
        setStores(data);
        // Fetch all reviews for all stores
        const allRevs = [];
        for (const store of data) {
          try {
            const reviewRes = await fetch(`${API}/api/stores/${store.id}/reviews`);
            if (reviewRes.ok) {
              const revData = await reviewRes.json();
              allRevs.push(...revData);
            }
          } catch (err) {
            console.error(`Error fetching reviews for store ${store.id}:`, err);
          }
        }
        setAllReviews(allRevs);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectStore = async (store) => {
    setSelectedStore(store);
    setReviews([]);
    setRating(0);
    setText('');
    setMessage('');
    setError('');
    
    try {
      const res = await fetch(`${API}/api/stores/${store.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
        // Update allReviews with the latest reviews for this store
        setAllReviews(prev => [
          ...prev.filter(r => r.store_id !== store.id),
          ...data
        ]);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!selectedStore) {
      setError('Please select a store');
      return;
    }

    if (!username) {
      setError('You must be logged in to review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!text.trim()) {
      setError('Please write a review');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API}/api/stores/${selectedStore.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_username: username,
          rating,
          text: text.trim()
        })
      });

      if (res.ok) {
        setMessage('Review posted successfully!');
        setRating(0);
        setText('');
        // Re-fetch reviews
        const reviewRes = await fetch(`${API}/api/stores/${selectedStore.id}/reviews`);
        if (reviewRes.ok) {
          const data = await reviewRes.json();
          setReviews(data);
          // Update allReviews with the latest reviews for this store
          setAllReviews(prev => [
            ...prev.filter(r => r.store_id !== selectedStore.id),
            ...data
          ]);
        }
      } else {
        const data = await res.json();
        setError(data.message || 'Error posting review');
      }
    } catch (err) {
      setError('Error posting review: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div>
      <style>{styles}</style>

      {/* NAV */}
      <nav className="header">
        <button className="logo-btn" onClick={() => navigate('/')}>
			<img src="/Data Dash Logo.png" alt="DataDash" style={{ height: '300px' }} onError={(e) => { e.target.style.display = 'none'; }} />        </button>
      </nav>

      <div className="page">
        {!selectedStore ? (
          <>
            <div className="section">
              <p className="eyebrow">Browse Restaurants</p>
              <h1 className="heading">Read & Write Reviews</h1>
            </div>

            <div className="stores-grid">
              {stores.map(store => {
                // Calculate average rating for this store
                const storeAvg = allReviews
                  .filter(r => r.store_id === store.id)
                  .reduce((sum, r) => sum + r.rating, 0);
                const storeReviewCount = allReviews.filter(r => r.store_id === store.id).length;
                const scoreAvg = storeReviewCount > 0 ? (storeAvg / storeReviewCount).toFixed(1) : 'No';

                return (
                  <div
                    key={store.id}
                    className="store-card"
                    onClick={() => selectStore(store)}
                  >
                    <span className="store-emoji">🍽️</span>
                    <h3 className="store-name">{store.name}</h3>
                    <p className="store-meta">{store.category || 'Restaurant'}</p>
                    <p className="store-rating">
                      {'⭐'.repeat(Math.min(5, Math.max(0, Math.round(scoreAvg))))} {scoreAvg} {storeReviewCount === 1 ? 'review' : `${storeReviewCount} reviews`}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <button className="back-btn" onClick={() => setSelectedStore(null)}>
              ← Back to restaurants
            </button>

            <div className="reviews-container">
              <div className="store-header">
                <span className="emoji">🍽️</span>
                <div className="info">
                  <h2>{selectedStore.name}</h2>
                  <p>{selectedStore.category || 'Restaurant'}</p>
                  {reviews.length > 0 && (
                    <p style={{ marginTop: '6px', fontSize: '13px', color: 'var(--red)', fontWeight: '600' }}>
                      ⭐ {avgRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                    </p>
                  )}
                </div>
              </div>

              {message && <div className="alert success">{message}</div>}
              {error && <div className="alert error">{error}</div>}

              {username ? (
                <form onSubmit={handleSubmitReview} className="review-form">
                  <div className="form-group">
                    <label>Your Rating</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${rating >= star ? 'active' : ''}`}
                          onClick={() => setRating(star)}
                        >
                          {rating >= star ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="review">Your Review</label>
                    <textarea
                      id="review"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Share your experience at this restaurant..."
                      maxLength="500"
                    />
                    <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                      {text.length} / 500
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Posting...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="review-form" style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  <p>Please log in to write a review</p>
                </div>
              )}

              <div className="reviews-list">
                {reviews.length > 0 ? (
                  reviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <span className="review-author">{review.username}</span>
                        <span className="review-date">{formatDate(review.created_at)}</span>
                      </div>
                      <div className="review-rating">
                        {'⭐'.repeat(review.rating)}
                      </div>
                      <p className="review-text">{review.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="no-reviews">
                    No reviews yet. Be the first to review!
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ReviewsPage;
