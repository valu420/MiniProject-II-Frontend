import React from 'react';
import { Link } from 'react-router-dom';
import './Nav.css';

/**
 * Main navigation component
 * @returns {JSX.Element}
 */
export const Nav: React.FC = () => {
  return (
    <>
      

      <nav className="main-nav" role="navigation" aria-label="Navegación principal">
        <div className="nav-container">
          <div className="nav-brand">
            <Link to="/" className="brand-link" aria-label="Lumière - Ir a inicio">
              <div className="brand-logo" aria-hidden="true">L</div>
              <span className="brand-name">Lumière</span>
            </Link>
          </div>
          
          <ul className="nav-links" role="list">
            <li role="listitem">
              <Link to="/" className="nav-link" aria-label="Ir a inicio">
                Inicio
              </Link>
            </li>
            <li role="listitem">
              <Link to="/about" className="nav-link" aria-label="Ir a sobre nosotros">
                Sobre Nosotros
              </Link>
            </li>
            <li role="listitem">
              <Link 
                to="/login" 
                className="nav-link nav-link-primary"
                aria-label="Ir a iniciar sesión"
              >
                Iniciar Sesión
              </Link>
            </li>
            <li role="listitem">
              <Link 
                to="/register" 
                className="nav-link nav-link-secondary"
                aria-label="Ir a registro de nueva cuenta"
              >
                Registro
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};