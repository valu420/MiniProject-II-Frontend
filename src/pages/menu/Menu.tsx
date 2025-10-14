// ...existing code...
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Menu.css';

/**
 * Menu page with header and category grids.
 * Cards are empty containers (placeholders) to be filled later with images.
 * @returns {JSX.Element}
 */
export const Menu: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const categories = ['Categoria', 'Categoria'];

  useEffect(() => {
    // Obtener información del usuario desde localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirigir al login
    navigate('/login');
  };

  return (
    <div className="menu-page">
      <header className="menu-header" role="banner">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">
            L
          </div>
          <div className="brand-name">Lumière</div>
        </div>

        <div className="header-actions">
          <form
            className="search-form"
            role="search"
            aria-label="Search movies"
          >
            <input
              type="search"
              className="search-input"
              placeholder="Buscar"
              aria-label="Buscar"
            />
          </form>

          <Link to="/profile" className="user-btn" aria-label="User profile">
            <span className="user-icon" />
          </Link>

          <button
            onClick={handleLogout}
            className="logout-btn"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="menu-content" role="main">
        {categories.map((title, idx) => (
          <section
            className="category-section"
            key={idx}
            aria-labelledby={`cat-${idx}`}
          >
            <div className="category-header">
              <h2 id={`cat-${idx}`}>{title}</h2>
              <span className="accent-line" aria-hidden="true" />
            </div>

            <div className="cards-grid" role="list">
              {Array.from({ length: 8 }).map((_, i) => (
                <article
                  key={i}
                  className="card"
                  role="listitem"
                  aria-label={`${title} item ${i + 1}`}
                >
                  <div className="card-thumb" />
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default Menu;
// ...existing code...
