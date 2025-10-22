import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getFilmById,
  getStreamingInfo,
  type Film,
  type StreamingInfo,
} from '../../api/filmApi';
import {
  addFavorite,
  getUserFavorites,
  removeFavorite,
} from '../../api/userApi';
import './Movie.css';

const resolvePosterSrc = (path?: string) => {
  if (!path) return '';
  return /^https?:\/\//i.test(path)
    ? path
    : `/${String(path).replace(/^\/+/, '')}`;
};

interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  releaseYear: number;
  duration: number;
  director: string;
  cast: string[];
  posterUrl: string;
  videoUrl: string;
  rating?: number;
  ratingsCount?: number;
}

interface Comment {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
  };
  text: string;
  createdAt: string;
}

export const Movie: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Cargamos la película real desde el backend
  const [movie, setMovie] = useState<Film | null>(null);
  const [streamingInfo, setStreamingInfo] = useState<StreamingInfo | null>(
    null
  );

  // UI local (rating/comentarios sin backend aún)
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID de película inválido');
      setIsLoading(false);
      return;
    }
    loadMovieData(id);
    checkIfFavorite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadMovieData = async (filmId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // 1) Película
      const filmData = await getFilmById(filmId);
      setMovie(filmData);

      // 2) URL de streaming (si tu backend la expone)
      try {
        const streamData = await getStreamingInfo(filmId);
        setStreamingInfo(streamData);
      } catch {
        setStreamingInfo(null); // si no hay endpoint/da error, seguimos mostrando movie.url
      }
    } catch (err: any) {
      setError(err?.message || 'Error al cargar la película');
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !id) return;

      const favorites = await getUserFavorites(token);
      const isFav = favorites.some(
        (film: Film) => (film._id || film.id) === id
      );
      setIsFavorite(isFav);
    } catch (err) {
      console.error('Error checking favorite status:', err);
      setIsFavorite(false);
    }
  };

  // Solo UI local (sin persistencia)
  const handleRating = (rating: number) => {
    setUserRating(rating);
    setStatusMessage({
      type: 'success',
      text: 'Calificación registrada localmente',
    });
    setTimeout(() => setStatusMessage(null), 2000);
  };

  const handleToggleFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (!id) {
        setStatusMessage({ type: 'error', text: 'ID de película inválido' });
        return;
      }

      if (isFavorite) {
        // Eliminar de favoritos
        await removeFavorite(id, token);
        setIsFavorite(false);
        setStatusMessage({
          type: 'success',
          text: 'Eliminado de favoritos',
        });
      } else {
        // Agregar a favoritos
        await addFavorite(id, token);
        setIsFavorite(true);
        setStatusMessage({
          type: 'success',
          text: 'Agregado a favoritos',
        });
      }

      setTimeout(() => setStatusMessage(null), 2000);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error al actualizar favoritos',
      });
      setTimeout(() => setStatusMessage(null), 2000);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const temp: Comment = {
      _id: crypto.randomUUID(),
      userId: { firstName: 'Tú', lastName: '' },
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [temp, ...prev]);
    setNewComment('');
    setStatusMessage({ type: 'success', text: 'Comentario agregado (local)' });
    setTimeout(() => setStatusMessage(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="movie-loading">
        <div className="loading-spinner" aria-label="Cargando película"></div>
        <p>Cargando película...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-error">
        <h2>Error al cargar la película</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/menu')} className="back-btn">
          Volver al menú
        </button>
      </div>
    );
  }

  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : undefined;
  const genreText = Array.isArray((movie as any).genre)
    ? (movie as any).genre.join(', ')
    : (movie as any).genre;

  const videoSrc = streamingInfo?.streamUrl || movie.url;

  const rawPoster =
    (movie as any).posterUrl ??
    (movie as any).posterImage ??
    (movie as any).poster ??
    '';
  const posterSrc = resolvePosterSrc(rawPoster);

  return (
    <main
      className="movie-page"
      role="main"
      aria-labelledby="movie-title"
      aria-live="polite"
      aria-label="Página de detalles de película"
    >
      <button
        onClick={() => navigate('/menu')}
        className="back-btn"
        aria-label="Volver al menú"
      >
        ← Volver
      </button>

      {statusMessage && (
        <div
          className={`status-toast ${statusMessage.type}`}
          role="alert"
          aria-live="polite"
        >
          {statusMessage.text}
        </div>
      )}

      <div className="movie-container">
        {/* Poster + Video */}
        <section className="movie-media" aria-label="Contenido multimedia">
          <div className="movie-video">
            <iframe
              src={videoSrc}
              title={`Video de ${movie.name}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* Información */}
        <section className="movie-info" aria-labelledby="movie-title">
          <div className="movie-info-content">
            <div className="movie-poster">
              {posterSrc ? (
                <img
                  src={posterSrc}
                  alt={`Poster de ${movie.name}`}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    if (
                      target.parentElement &&
                      !target.parentElement.querySelector('.poster-fallback')
                    ) {
                      const fallback = document.createElement('div');
                      fallback.className = 'poster-fallback';
                      fallback.textContent = movie.name;
                      target.parentElement.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="poster-fallback" aria-label="Sin poster">
                  {movie.name}
                </div>
              )}
            </div>

            <div className="movie-text">
              {/* AÑADIDO: envuelve todo el texto */}
              <div className="movie-header">
                <h1 id="movie-title">{movie.name}</h1>
                <button
                  onClick={handleToggleFavorite}
                  className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                  aria-label={
                    isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'
                  }
                  aria-pressed={isFavorite}
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>
              </div>

              <div className="movie-meta">
                {year && <span className="movie-year">{year}</span>}
                {movie.duration && (
                  <span className="movie-duration">{movie.duration} min</span>
                )}
                {genreText && <span className="movie-genre">{genreText}</span>}
              </div>

              {movie.description && (
                <p className="movie-description">{movie.description}</p>
              )}

              {(movie.director || (movie.cast && movie.cast.length > 0)) && (
                <div className="movie-details">
                  {movie.director && (
                    <div className="detail-item">
                      <strong>Director:</strong> {movie.director}
                    </div>
                  )}
                  {movie.cast && movie.cast.length > 0 && (
                    <div className="detail-item">
                      <strong>Reparto:</strong> {movie.cast.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Calificación (solo UI local) */}
              <div
                className="movie-rating-section"
                role="group"
                aria-labelledby="rating-label"
              >
                <h2 id="rating-label">Calificación</h2>
                <div className="rating-display">
                  <span className="rating-value">
                    {typeof movie.rating === 'number'
                      ? movie.rating.toFixed(1)
                      : 'N/A'}
                  </span>
                  <span className="rating-count">
                    ({movie.ratingsCount || 0} votos)
                  </span>
                </div>

                <div
                  className="rating-input"
                  role="radiogroup"
                  aria-label="Califica esta película"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${
                        star <= (hoverRating || userRating) ? 'active' : ''
                      }`}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`Calificar con ${star} estrella${
                        star > 1 ? 's' : ''
                      }`}
                      role="radio"
                      aria-checked={star === userRating}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comentarios (solo UI local) */}
        <section className="movie-comments" aria-labelledby="comments-heading">
          <h2 id="comments-heading">Comentarios</h2>

          <form onSubmit={handleSubmitComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe tu comentario..."
              rows={4}
              aria-label="Escribe tu comentario"
              maxLength={500}
            />
            <button
              type="submit"
              className="submit-comment-btn"
              disabled={!newComment.trim()}
            >
              Comentar
            </button>
          </form>

          <div className="comments-list" role="list">
            {comments.length === 0 ? (
              <p className="no-comments">Sé el primero en comentar</p>
            ) : (
              comments.map((comment) => (
                <article
                  key={comment._id}
                  className="comment-item"
                  role="listitem"
                >
                  <div className="comment-header">
                    <strong className="comment-author">
                      {comment.userId.firstName} {comment.userId.lastName}
                    </strong>
                    <time className="comment-date" dateTime={comment.createdAt}>
                      {new Date(comment.createdAt).toLocaleDateString('es-ES')}
                    </time>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Movie;
