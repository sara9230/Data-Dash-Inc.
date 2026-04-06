// frontend/src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserSignIn from './pages/UserSignIn';
import AdminSignIn from './pages/AdminSignIn';
import AdminDashboard from './pages/AdminDashBoard';
import Register from './pages/Register';
import DriverDashboard from './pages/DriverDashboard';
import CustomerOrder from './pages/CustomerOrder';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"                element={<Landing />} />
        <Route path="/signin/user"     element={<UserSignIn />} />
        <Route path="/signin/admin"    element={<AdminSignIn />} />
        <Route path="/dashboard"       element={<CustomerOrder />} />
        <Route path="/order"           element={<CustomerOrder />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
      </Routes>
    </Router>
  );
}

function Landing() {
  return (
    <div>
      {/* ── NAV ── */}
      <nav className="dd-nav">
        <a href="/" className="dd-nav-logo">
          <img src="/Data Dash Logo.png" alt="DataDash" onError={(e) => { e.target.style.display = 'none'; }} />
        </a>
        <ul className="dd-nav-links">
          <li><a href="#how-it-works">How it works</a></li>
          <li><a href="#roles">For drivers</a></li>
          <li><a href="/signin/user">Sign in</a></li>
          <li><a href="/register" className="dd-nav-cta">Get started</a></li>
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section className="dd-hero">
        <div className="dd-hero-text">
          <div className="dd-hero-eyebrow">
            <span>🔥</span> Now delivering near you
          </div>
          <h1 className="dd-hero-title">
            Hungry?
            <em>We've got you.</em>
          </h1>
          <p className="dd-hero-sub">
            Order from your favourite local restaurants and get it delivered fast.
            Fresh food, real-time tracking, zero hassle.
          </p>
          <div className="dd-hero-actions">
            <a href="/signin/user" className="dd-btn-primary">🍔 Order now</a>
            <a href="/register" className="dd-btn-secondary">Create account</a> 
          <a href="/signin/user" className="dd-btn-ghost">Deliver with us →</a>
          </div>
        </div>

        <div className="dd-hero-visual">
          <div className="dd-food-card-grid">
            {[
              { emoji: '🍕', name: 'Pizza Palace',  eta: '20–30 min' },
              { emoji: '🍣', name: 'Sushi Express', eta: '25–35 min' },
              { emoji: '🍔', name: 'Burger Shack',  eta: '15–25 min' },
              { emoji: '🌮', name: 'Taco Fiesta',   eta: '20–30 min' },
            ].map((item) => (
              <div className="dd-food-card" key={item.name}>
                <span className="dd-food-card-emoji">{item.emoji}</span>
                <div className="dd-food-card-name">{item.name}</div>
                <div className="dd-food-card-eta">
                  <span className="dd-food-card-eta-dot"></span>
                  {item.eta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="dd-how" id="how-it-works">
        <div className="dd-section-label">Simple process</div>
        <div className="dd-section-title">Order in three steps</div>
        <div className="dd-steps">
          {[
            { num: '01', icon: '🔍', title: 'Browse restaurants', desc: 'Explore local spots by category — pizza, sushi, burgers, and more.' },
            { num: '02', icon: '🛒', title: 'Place your order',   desc: 'Pick your items, review the total, and confirm in seconds.' },
            { num: '03', icon: '🚗', title: 'Track your delivery', desc: 'A driver picks it up and brings it straight to your door.' },
          ].map((step) => (
            <div className="dd-step" key={step.num}>
              <div className="dd-step-num">{step.num}</div>
              <span className="dd-step-icon">{step.icon}</span>
              <div className="dd-step-title">{step.title}</div>
              <div className="dd-step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className="dd-roles" id="roles">
        <div className="dd-section-label">Join the platform</div>
        <div className="dd-section-title">Built for everyone</div>
        <div className="dd-roles-grid">
          {[
            { icon: '🧑‍💻', title: 'Customers',          desc: 'Browse menus, place orders, and track your delivery in real time.',           href: '/signin/user',        cta: 'Order now' },
            { icon: '🚴',   title: 'Drivers',             desc: 'Pick up orders nearby, deliver them, and earn on your own schedule.',         href: '/signin/user',   cta: 'Start delivering' },
            { icon: '🏪',   title: 'Restaurant Admins',   desc: 'Add your restaurant, manage your menu, and reach more customers.',            href: '/signin/admin',       cta: 'Manage platform' },
          ].map((role) => (
            <a href={role.href} className="dd-role-card" key={role.title}>
              <span className="dd-role-card-icon">{role.icon}</span>
              <div className="dd-role-card-title">{role.title}</div>
              <div className="dd-role-card-desc">{role.desc}</div>
              <div className="dd-role-card-link">{role.cta} <span>→</span></div>
            </a>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="dd-footer">
        <span className="dd-footer-brand">DataDash</span>
        <span>© 2025 DataDash Inc. — Built by the team.</span>
      </footer>
    </div>
  );
}

export default App;