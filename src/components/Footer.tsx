import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Site footer with sitemap
 * @returns {JSX.Element}
 */
const Footer: React.FC = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="sitemap" aria-label="Sitemap">
          <div>
            <h4>Pages</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>
        </div>
        <p style={{ marginTop: 12, color: '#9ca3af' }}>© MiniProject II</p>
      </div>
    </footer>
  );
};

export default Footer;
