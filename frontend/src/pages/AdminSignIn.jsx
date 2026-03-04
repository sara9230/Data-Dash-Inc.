import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignIn.css';

function AdminSignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'admin');
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Sign in failed');
      }
    } catch {
      setError('Error connecting to server');
    }
  };

    return (
    <div className="signin-wrapper">
      <div className="signin-left">
        <a href="/" className="signin-left-logo">DataDash</a>
        <h2 className="signin-left-headline">
          Manage your<br />
          <em>restaurants.</em>
        </h2>
        <p className="signin-left-sub">
          Add stores, track orders, and keep the platform running smoothly.
        </p>
        <div className="signin-left-illustration">🏪</div>
      </div>

      <div className="signin-right">
        <div className="signin-box">
          <a href="/" className="signin-back">← Back to home</a>
          <h1>Admin portal</h1>
          <p className="signin-subtitle">Sign in with your admin credentials.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" placeholder="admin_username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit">Sign in as admin</button>
          </form>
          <p className="signin-link">Not an admin? <a href="/signin/user">Customer sign in</a></p>
        </div>
      </div>
    </div>
  );
}

export default AdminSignIn;