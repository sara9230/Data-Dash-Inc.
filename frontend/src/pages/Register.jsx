import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignIn.css';

const ROLES = [
  { value: 'customer', label: 'Customer', desc: 'Order food from restaurants' },
  { value: 'driver',   label: 'Driver',   desc: 'Deliver orders and earn' },
  { value: 'admin',    label: 'Admin',     desc: 'Manage the platform' },
];


function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('customer');
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const response = await fetch('http://127.0.0.1:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
    });

    if (response.ok) {
      if (role === 'admin')  navigate('/signin/admin');
      else                   navigate('/signin/user');
    } else {
      const data = await response.json();
      setError(data.message || 'Registration failed. Try a different username.');
    }
  };

    return (
    <div className="signin-wrapper">
      <div className="signin-left">
        <a href="/" className="signin-left-logo">DataDash</a>
        <h2 className="signin-left-headline">
          Join the<br />
          <em>community.</em>
        </h2>
        <p className="signin-left-sub">
          Customers, drivers, and restaurants — all on one platform.
        </p>
        <div className="signin-left-illustration">🚀</div>
      </div>

      <div className="signin-right">
        <div className="signin-box">
          <a href="/" className="signin-back">← Back to home</a>
          <h1>Create account</h1>
          <p className="signin-subtitle">Choose your role and get started.</p>
          <div className="role-selector">
            {ROLES.map((r) => (
              <div key={r.value} className={`role-option ${role === r.value ? 'role-selected' : ''}`} onClick={() => setRole(r.value)}>
                <span className="role-label">{r.label}</span>
                <span className="role-desc">{r.desc}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" placeholder="choose_a_username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit">Create account</button>
          </form>
          <p className="signin-link">Already have an account? <a href="/signin/user">Sign in</a></p>
        </div>
      </div>
    </div>
  );
}

export default Register;






