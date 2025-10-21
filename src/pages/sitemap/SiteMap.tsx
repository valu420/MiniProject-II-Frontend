import React from 'react';
import { Link } from 'react-router-dom';
import './SiteMap.css';

/**
 * Site Map page component
 * @returns {JSX.Element}
 */

export const Sitemap: React.FC = () => {
  return (
    <section className="sitemap-container">
      <div className="sitemap-content">
        <h1 className="sitemap-title">Mapa del Sitio</h1>
        <p className="sitemap-description">
          Navega fácilmente por todas las secciones de <span className="highlight">Lumière</span>.
          Aquí encontrarás accesos directos a cada parte del sitio para que explores sin perderte.
        </p>

        <div className="sitemap-grid">
          <div className="sitemap-section">
            <h2>🎬 General</h2>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/about">Sobre nosotros</Link></li>
            </ul>
          </div>

          <div className="sitemap-section">
            <h2>👤 Cuenta</h2>
            <ul>
              <li><Link to="/login">Iniciar sesión</Link></li>
              <li><Link to="/register">Registrarse</Link></li>
              <li><Link to="/profile">Perfil</Link></li>
              <li><Link to="/change-password">Cambiar contraseña</Link></li>
            </ul>
          </div>

          <div className="sitemap-section">
            <h2>🍿 Funcionalidades</h2>
            <ul>
              <li><Link to="/menu">Menú de películas</Link></li>
              <li><a href="#">Ver reseñas</a></li>
              <li><a href="#">Publicar opinión</a></li>
            </ul>
          </div>

          <div className="sitemap-section">
            <h2>📩 Contacto</h2>
            <ul>
              <li><a href="mailto:contact@lumiere.com">contact@lumiere.com</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sitemap;