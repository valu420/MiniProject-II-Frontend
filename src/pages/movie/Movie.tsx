import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Movie.css';

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
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadMovieData();
    checkIfFavorite();
  }, [id]);

  const loadMovieData = async () => {
    try {
      setIsLoading(true);
      // TODO: Reemplazar con tu endpoint real
      // const response = await fetch(`/api/movies/${id}`);
      // const data = await response.json();
      // setMovie(data);
      
      // Datos de ejemplo (eliminar cuando integres el backend)
      setMovie({
        _id: id || '1',
        title: 'Película de Ejemplo',
        description: 'Esta es una descripción detallada de la película...',
        genre: ['Acción', 'Aventura'],
        releaseYear: 2024,
        duration: 120,
        director: 'Director Ejemplo',
        cast: ['Actor 1', 'Actor 2', 'Actor 3'],
        posterUrl: '/placeholder-poster.jpg',
        videoUrl: 'https://www.youtube.com/embed/example',
        rating: 4.5,
        ratingsCount: 150,
      });

      // Cargar comentarios
      // const commentsResponse = await fetch(`/api/movies/${id}/comments`);
      // const commentsData = await commentsResponse.json();
      // setComments(commentsData);
      
    } catch (err: any) {
      setError(err?.message || 'Error al cargar la película');
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // TODO: Endpoint para verificar si está en favoritos
      // const response = await fetch(`/api/users/favorites/${id}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setIsFavorite(data.isFavorite);
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  };

  const handleRating = async (rating: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatusMessage({ type: 'error', text: 'Debes iniciar sesión para calificar' });
        return;
      }

      setUserRating(rating);
      
      // TODO: Endpoint para guardar calificación
      // await fetch(`/api/movies/${id}/rate`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ rating })
      // });

      setStatusMessage({ type: 'success', text: 'Calificación guardada' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error al guardar calificación' });
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatusMessage({ type: 'error', text: 'Debes iniciar sesión para agregar favoritos' });
        return;
      }

      setIsFavorite(!isFavorite);

      // TODO: Endpoint para toggle favoritos
      // await fetch(`/api/users/favorites/${id}`, {
      //   method: isFavorite ? 'DELETE' : 'POST',
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      setStatusMessage({
        type: 'success',
        text: isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos'
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error al actualizar favoritos' });
      setIsFavorite(!isFavorite); // Revertir en caso de error
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatusMessage({ type: 'error', text: 'Debes iniciar sesión para comentar' });
        return;
      }

      // TODO: Endpoint para crear comentario
      // const response = await fetch(`/api/movies/${id}/comments`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ text: newComment })
      // });
      // const newCommentData = await response.json();
      // setComments([newCommentData, ...comments]);

      setNewComment('');
      setStatusMessage({ type: 'success', text: 'Comentario publicado' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error al publicar comentario' });
    }
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

  return (
    <main className="movie-page" role="main" aria-labelledby="movie-title">
      <button onClick={() => navigate('/menu')} className="back-btn" aria-label="Volver al menú">
        ← Volver
      </button>

      {statusMessage && (
        <div className={`status-toast ${statusMessage.type}`} role="alert" aria-live="polite">
          {statusMessage.text}
        </div>
      )}

      <div className="movie-container">
        {/* Sección del poster y video */}
        <section className="movie-media" aria-label="Contenido multimedia">
          <div className="movie-poster">
            <img src={movie.posterUrl} alt={`Poster de ${movie.title}`} />
          </div>

          <div className="movie-video">
            <iframe
              src={movie.videoUrl}
              title={`Trailer de ${movie.title}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* Información de la película */}
        <section className="movie-info" aria-labelledby="movie-title">
          <div className="movie-header">
            <h1 id="movie-title">{movie.title}</h1>
            <button
              onClick={handleToggleFavorite}
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              aria-pressed={isFavorite}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>

          <div className="movie-meta">
            <span className="movie-year">{movie.releaseYear}</span>
            <span className="movie-duration">{movie.duration} min</span>
            <span className="movie-genre">{movie.genre.join(', ')}</span>
          </div>

          <p className="movie-description">{movie.description}</p>

          <div className="movie-details">
            <div className="detail-item">
              <strong>Director:</strong> {movie.director}
            </div>
            <div className="detail-item">
              <strong>Reparto:</strong> {movie.cast.join(', ')}
            </div>
          </div>

          {/* Calificación */}
          <div className="movie-rating-section" role="group" aria-labelledby="rating-label">
            <h2 id="rating-label">Calificación</h2>
            <div className="rating-display">
              <span className="rating-value">{movie.rating?.toFixed(1) || 'N/A'}</span>
              <span className="rating-count">({movie.ratingsCount || 0} votos)</span>
            </div>

            <div className="rating-input" role="radiogroup" aria-label="Califica esta película">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= (hoverRating || userRating) ? 'active' : ''}`}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Calificar con ${star} estrella${star > 1 ? 's' : ''}`}
                  role="radio"
                  aria-checked={star === userRating}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Sección de comentarios */}
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
            <button type="submit" className="submit-comment-btn" disabled={!newComment.trim()}>
              Publicar comentario
            </button>
          </form>

          <div className="comments-list" role="list">
            {comments.length === 0 ? (
              <p className="no-comments">Sé el primero en comentar</p>
            ) : (
              comments.map((comment) => (
                <article key={comment._id} className="comment-item" role="listitem">
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