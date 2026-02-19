import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserSignIn from './pages/UserSignIn';
import AdminSignIn from './pages/AdminSignIn';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin/user" element={<UserSignIn />} />
        <Route path="/signin/admin" element={<AdminSignIn />} />
        <Route path="/dashboard" element={<h1>User Dashboard (Coming Soon)</h1>} />
        <Route path="/admin/dashboard" element={<h1>Admin Dashboard (Coming Soon)</h1>} />
      </Routes>
    </Router>
  );
}

function Landing() {
  return (
    <>
      <nav>
        <div className="logo">Data Dash 🍔</div>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#features">Features</a></li>
        </ul>
      </nav>
      <div className="hero">
        <h1>Food Delivery Platform</h1>
        <p>Fast, reliable food delivery</p>
        <div className="hero-buttons">
          <a href="/signin/user" className="user-btn">Order Now</a>
          <a href="/signin/admin" className="admin-btn">Admin</a>
        </div>
      </div>
    </>
  );
}

export default App;