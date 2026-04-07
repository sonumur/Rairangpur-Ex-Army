import React from 'react';
import { BrowserRouter as Router, Link, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PhotoCollection from './pages/PhotoCollection';
import Heroes from './pages/Heroes';
import AdminPanel from './pages/AdminPanel';
import './App.css';

const adminRoutePath = import.meta.env.VITE_ADMIN_ROUTE || '/control-room';

const normalizePath = (path) => (path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path);

function AppContent() {
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const isAdminRoute = normalizePath(location.pathname) === normalizePath(adminRoutePath);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/heroes" element={<Heroes />} />
        <Route path="/photos" element={<PhotoCollection />} />
        <Route path={adminRoutePath} element={<AdminPanel />} />
      </Routes>

      {!isAdminRoute ? (
        <footer className="site-footer" id="site-footer">
          <div className="site-footer-shell">
            <div className="site-footer-top">
              <section className="footer-col footer-brand">
                <h3>Veterans Community Portal</h3>
                <p>
                  A veterans-led community platform that promotes brotherhood, social support, and service values for
                  members and families.
                </p>
              </section>

              <section className="footer-col">
                <h4>Quick Links</h4>
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/heroes">Heroes</Link></li>
                  <li><Link to="/photos">Photo Collection</Link></li>
                  <li><Link to="/#about-section">About Association</Link></li>
                </ul>
              </section>

              <section className="footer-col">
                <h4>Programs</h4>
                <ul>
                  <li><Link to="/#about-section">Veteran Support</Link></li>
                  <li><Link to="/#about-section">Community Welfare</Link></li>
                  <li><Link to="/#event-section">Event Participation</Link></li>
                </ul>
              </section>

              <section className="footer-col">
                <h4>Company</h4>
                <ul>
                  <li><Link to="/#about-section">Our Mission</Link></li>
                  <li><Link to="/#site-footer">Get in Touch</Link></li>
                  <li><Link to="/#site-footer-details">Privacy Policy</Link></li>
                  <li><Link to="/#site-footer-details">Terms of Service</Link></li>
                </ul>
              </section>
            </div>

            <div className="site-footer-middle" id="site-footer-details">
              <p>
                This platform supports members through coordinated events, reunions, and community initiatives. It helps
                preserve service memories, encourages social unity, and strengthens collaboration among veterans and
                families.
              </p>
              <p>
                We are committed to discipline, respect, and nation-first values. Through regular programs and shared
                participation, we continue to build a strong and reliable support network for current and future members.
              </p>
            </div>

            <p className="site-footer-copy">Copyright (c) {currentYear} Rairangpur Ex-Army Association. All rights reserved.</p>
          </div>
        </footer>
      ) : null}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
