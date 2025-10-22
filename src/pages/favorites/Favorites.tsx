import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film } from '../../api/filmApi';
import { getUserFavorites, removeFavorite } from '../../api/userApi';
import './Favorites.scss';

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const favoritesData = await getUserFavorites(token);
      setFavorites(favoritesData);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar favoritos');
      if (err?.message?.includes('token') || err?.message?.includes('auth')) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (filmId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await removeFavorite(filmId, token);

      // Actualizar lista local
      setFavorites(
        favorites.filter((film) => (film._id || film.id) !== filmId)
      );

      setStatusMessage({ type: 'success', text: 'Eliminado de favoritos' });
      setTimeout(() => setStatusMessage(null), 2000);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error al eliminar',
      });
      setTimeout(() => setStatusMessage(null), 2000);
    }
  };

  const handleMovieClick = (filmId: string) => {
    navigate(`/movie/${filmId}`);
  };

  if (isLoading) {
    return (
      <div className="favorites-page">
        <div className="favorites-loading">
          <div className="loading-spinner"></div>
          <p>Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-page">
        <div className="favorites-error">
          <i className="fa-solid fa-circle-exclamation"></i>
          <p>{error}</p>
          <button onClick={() => loadFavorites()} className="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="favorites-page"
      role="main"
      aria-live="polite"
      aria-label="Página de películas favoritas"
    >
      {statusMessage && (
        <div className={`status-toast ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="favorites-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <i className="fa-solid fa-arrow-left"></i> Volver
        </button>
        <h1>
          <i className="fa-solid fa-heart"></i> Mis Favoritos
        </h1>
        <p className="favorites-count">
          {favorites.length} {favorites.length === 1 ? 'película' : 'películas'}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <i className="fa-regular fa-heart"></i>
          <h2>No tienes favoritos aún</h2>
          <p>Explora películas y agrega tus favoritas para verlas aquí</p>
          <Link to="/menu">
            <button className="explore-btn">Explorar películas</button>
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((film) => {
            const filmId = film._id || film.id || '';
            // Obtener la URL del poster desde el campo posterImage del backend
            const posterImageField = (film as any).posterImage;
            let posterUrl: string | undefined;

            if (posterImageField) {
              // Si es una URL completa (empieza con http), usarla directamente
              if (posterImageField.startsWith('http')) {
                posterUrl = posterImageField;
              } else {
                // Si es solo un nombre de archivo, buscar en public/
                posterUrl = `/${posterImageField}`;
              }
            } else {
              posterUrl = film.posterUrl;
            }

            return (
              <div key={filmId} className="favorite-card">
                <div
                  className="favorite-poster"
                  onClick={() => handleMovieClick(filmId)}
                  style={{
                    backgroundImage: posterUrl
                      ? `url(${posterUrl})`
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!posterUrl && (
                    <div className="no-poster">
                      <i className="fa-solid fa-film"></i>
                    </div>
                  )}
                  <div className="favorite-overlay">
                    <button
                      className="watch-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovieClick(filmId);
                      }}
                    >
                      <i className="fa-solid fa-play"></i> Ver película
                    </button>
                  </div>
                </div>

                <div className="favorite-info">
                  <h3 onClick={() => handleMovieClick(filmId)}>{film.name}</h3>

                  <div className="favorite-meta">
                    <span className="genre">
                      <i className="fa-solid fa-tags"></i> {film.genre}
                    </span>
                    {film.releaseDate && (
                      <span className="year">
                        <i className="fa-solid fa-calendar"></i>{' '}
                        {new Date(film.releaseDate).getFullYear()}
                      </span>
                    )}
                  </div>

                  {film.rating && (
                    <div className="favorite-rating">
                      <i className="fa-solid fa-star"></i>
                      <span>{film.rating.toFixed(1)}</span>
                      {film.ratingsCount && (
                        <span className="ratings-count">
                          ({film.ratingsCount})
                        </span>
                      )}
                    </div>
                  )}

                  <p className="favorite-description">
                    {film.description?.length > 120
                      ? `${film.description.substring(0, 120)}...`
                      : film.description}
                  </p>

                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveFavorite(filmId)}
                  >
                    <i className="fa-solid fa-heart-crack"></i> Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;
