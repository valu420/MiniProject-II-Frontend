import React from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';

/**
 * Main navigation component
 * @returns {JSX.Element}
 */
export const Nav: React.FC = () => {
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <div className="brand-logo">L</div>
            <span className="brand-name">Lumière</span>
          </Link>
        </div>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Inicio</Link>
          <Link to="/about" className="nav-link">Sobre Nosotros</Link>
          <Link to="/login" className="nav-link nav-link-primary">Iniciar Sesión</Link>
          <Link to="/register" className="nav-link nav-link-secondary">Registro</Link>
        </div>
      </div>
    </nav>
  );
};