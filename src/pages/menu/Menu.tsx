import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, getAllFilms } from '../../api/filmApi';
import './Menu.css';

/**
 * Menu page with header and category grids.
 * Loads films from backend and displays them with posters.
 * @returns {JSX.Element}
 */

const resolvePosterSrc = (path?: string) => {
  if (!path) return '';
  return /^https?:\/\//i.test(path) ? path : `/${path.replace(/^\/+/, '')}`;
};

export const Menu: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [films, setFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Obtener información del usuario desde localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Cargar películas
    loadFilms();
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('.user-menu')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const loadFilms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const filmsData = await getAllFilms();
      setFilms(filmsData);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar películas');
      console.error('Error loading films:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirigir al login
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  const handleFavoritesClick = () => {
    setIsDropdownOpen(false);
    navigate('/favorites');
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    handleLogout();
  };

  const handleCardClick = (filmId: string) => {
    navigate(`/movie/${filmId}`);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, filmId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/movie/${filmId}`);
    }
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
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="search"
              className="search-input"
              placeholder="Buscar"
              aria-label="Buscar películas"
            />
          </form>

          <div className="user-menu">
            <button
              onClick={toggleDropdown}
              className="user-btn"
              aria-label="Menú de usuario"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <span className="user-icon">👤</span>
              
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={handleProfileClick} className="dropdown-item">
                  <span className="dropdown-icon">👤</span>
                  Ver perfil
                </button>
                <button
                  onClick={handleFavoritesClick}
                  className="dropdown-item"
                >
                  <span className="dropdown-icon">⭐</span>
                  Mis favoritos
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="dropdown-item logout"
                >
                  <span className="dropdown-icon">🚪</span>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="menu-content" role="main" id="main-content">
        {isLoading ? (
          <div className="loading-container">
            <div
              className="loading-spinner"
              aria-label="Cargando películas"
            ></div>
            <p>Cargando películas...</p>
          </div>
        ) : error ? (
          <div className="error-container" role="alert">
            <h2>Error al cargar películas</h2>
            <p>{error}</p>
            <button onClick={loadFilms} className="retry-btn">
              Reintentar
            </button>
          </div>
        ) : films.length === 0 ? (
          <div className="empty-container">
            <p>No hay películas disponibles</p>
          </div>
        ) : (
          <section
            className="category-section"
            aria-labelledby="all-films-heading"
          >
            <div className="category-header">
              <h2 id="all-films-heading">Todas las Películas</h2>
              <span className="accent-line" aria-hidden="true" />
            </div>

            <div className="cards-grid" role="list">
              {films.map((film) => {
                const filmId = film._id || film.id || '';
                const posterPath =
                  film.posterUrl ??
                  (film as any).posterImage ??
                  (film as any).poster ??
                  '';
                const posterSrc = resolvePosterSrc(posterPath);
                return (
                  <article
                    key={filmId}
                    className="card"
                    role="listitem"
                    onClick={() => handleCardClick(filmId)}
                    onKeyDown={(e) => handleCardKeyDown(e, filmId)}
                    tabIndex={0}
                    aria-label={`Ver detalles de ${film.name}`}
                  >
                    <div className="card-thumb">
                      {posterSrc ? (
                        <img
                          src={posterSrc}
                          alt={`Poster de ${film.name}`}
                          loading="lazy"
                          onError={(e) => {
                            // Fallback si la imagen no carga
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.parentElement && !target.parentElement.querySelector('.poster-fallback')) {
                              target.parentElement.classList.add('no-poster');
                              const fallback = document.createElement('div');
                              fallback.className = 'poster-fallback';
                              fallback.textContent = film.name;
                              target.parentElement.appendChild(fallback);
                            }
                          }}
                        />
                      ) : (
                        <div className="poster-fallback">{film.name}</div>
                        
                      )}
                    </div>
                    <div className="card-info">
                      <h3 className="card-title">{film.name}</h3>
                      <p className="card-genre">{film.genre}</p>
                      {film.releaseDate && (
                        <p className="card-year">
                          {new Date(film.releaseDate).getFullYear()}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Menu;
