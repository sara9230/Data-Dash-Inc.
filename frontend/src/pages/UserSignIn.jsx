import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignIn.css';

function UserSignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/user/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', 'user');
        localStorage.setItem('username', data.username); // add this
        navigate('/dashboard');
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
          Good food is<br />
          <em>one tap away.</em>
        </h2>
        <p className="signin-left-sub">
          Browse local restaurants, place your order, and track it in real time.
        </p>
        <div className="signin-left-illustration">🍔</div>
      </div>

      <div className="signin-right">
        <div className="signin-box">
          <a href="/" className="signin-back">← Back to home</a>
          <h1>Welcome back</h1>
          <p className="signin-subtitle">Sign in to your account to order food.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" placeholder="your_username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit">Sign in</button>
          </form>
          <p className="signin-link">Don't have an account? <a href="/register">Create one</a></p>
          <p className="signin-link" style={{ marginTop: '8px' }}>Admin? <a href="/signin/admin">Sign in here</a></p>
        </div>
      </div>
    </div>
  );
}

export default UserSignIn;