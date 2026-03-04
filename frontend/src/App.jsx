// frontend/src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserSignIn from './pages/UserSignIn';
import AdminSignIn from './pages/AdminSignIn';
import AdminDashboard from './pages/AdminDashBoard';
import Register from './pages/Register';
import DriverDashboard from './pages/DriverDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"                element={<Landing />} />
        <Route path="/signin/user"     element={<UserSignIn />} />
        <Route path="/signin/admin"    element={<AdminSignIn />} />
        <Route path="/dashboard"       element={<h1>User Dashboard (Coming Soon)</h1>} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
      </Routes>
    </Router>
  );
}

function Landing() {
  // landing-wrapper applies the max-width + padding only to this page
  return (
    <div className="landing-wrapper">
      <nav>
        <div className="logo">
        <img src="/data-dash-logo.png/Data Dash.png" alt="Dat Dash" style={{ height: '60px' }} />
       </div>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#features">Features</a></li>
        </ul>
      </nav>
      <div className="hero">
        <h1>Food Delivery Platform</h1>
        <p>Fast, reliable food delivery</p>
        <div className="hero-buttons">
          <a href="/signin/user"  className="user-btn">Order Now</a>
          <a href="/register"     className="user-btn">Register</a>
          <a href="/signin/admin" className="admin-btn">Admin</a>
          <a href="/driver/dashboard" className="driver-btn">Driver</a>
        </div>
      </div>
    </div>
  );
}

export default App;