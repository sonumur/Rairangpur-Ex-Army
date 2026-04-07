import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const adminRoutePath = import.meta.env.VITE_ADMIN_ROUTE || '/control-room';
  const isAdminRoute = location.pathname === adminRoutePath;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Rairangpur Ex-Army Logo" className="navbar-custom-logo" />
          <span className="navbar-logo-text">
            <span className="navbar-logo-primary">Rairangpur</span>
            <span className="navbar-logo-accent">Ex-Army</span>
          </span>
        </Link>
        {!isAdminRoute ? (
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className="nav-links">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/heroes" className="nav-links">Heroes</Link>
            </li>
            <li className="nav-item">
              <Link to="/photos" className="nav-links">Photo Collection</Link>
            </li>
          </ul>
        ) : null}
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
