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
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-box">
        <h1>Admin Sign In</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Sign In</button>
        </form>
        <p className="signin-link">
          User? <a href="/signin/user">Sign in as User</a>
        </p>
      </div>
    </div>
  );
}

export default AdminSignIn;