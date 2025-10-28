import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteCommentById, editComment, getCommentsByFilm, postComment, type IComment, } from '../../api/commentApi';
import { getFilmById, getFilmRatings, getStreamingInfo, rateFilm, updateRating, type Film, type StreamingInfo, } from '../../api/filmApi';
import { addFavorite, getUserFavorites, removeFavorite, } from '../../api/userApi';
import './Movie.css';

const resolvePosterSrc = (path?: string) => {
  if (!path) return '';
  return /^https?:\/\//i.test(path)
    ? path
    : `/${String(path).replace(/^\//, '')}`;
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

  // Movie  streaming
  const [movie, setMovie] = useState<Film | null>(null);
  const [streamingInfo, setStreamingInfo] = useState<StreamingInfo | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [subtitleLang, setSubtitleLang] = useState<'off' | 'es' | 'en'>('off');

  const [subtitleUrls, setSubtitleUrls] = useState<Record<string, string | null>>({});
  const srtCache = useRef<Map<string, string>>(new Map()); // original url -> blobUrl

  // convierte texto SRT a WebVTT simple
  const srtToVttText = (srt: string) => {
    // Quita encabezados BOM si existen
    const txt = srt.replace(/^\uFEFF/, '');
    // Añade cabecera WEBVTT y convierte coma decimal a punto (SRT usa , para ms)
    const lines = txt.split(/\r?\n/);
    const out: string[] = ['WEBVTT\n'];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // detectar líneas de tiempo SRT: 00:00:01,500 --> 00:00:04,000
      const timeMatch = line.match(/^(\d{2}:\d{2}:\d{2}),(\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}),(\d{3})(.*)$/);
      if (timeMatch) {
        const left = `${timeMatch[1]}.${timeMatch[2]}`;
        const right = `${timeMatch[3]}.${timeMatch[4]}`;
        const rest = timeMatch[5] || '';
        out.push(`${left} --> ${right}${rest}`);
      } else {
        out.push(line);
      }
    }
    return out.join('\n');
  };

  // descarga SRT/VTT y devuelve blob URL (convierte SRT -> VTT)
  const fetchSubtitleAsVtt = async (url: string) => {
    if (!url) return null;
    // usar cache si ya convertido
    if (srtCache.current.has(url)) return srtCache.current.get(url) as string;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('No se pudo descargar subtitulo');
      const text = await res.text();
      const isSrt = /\.srt(?:\?|$)/i.test(url) || /^\d+\r?\n\d{2}:\d{2}:\d{2},\d{3}/m.test(text);
      const vttText = isSrt ? srtToVttText(text) : (text.startsWith('WEBVTT') ? text : 'WEBVTT\n\n' + text);
      const blob = new Blob([vttText], { type: 'text/vtt' });
      const blobUrl = URL.createObjectURL(blob);
      srtCache.current.set(url, blobUrl);
      return blobUrl;
    } catch (err) {
      console.error('Error trayendo subtítulo', url, err);
      return null;
    }
  };

  // cuando movie.subtitles cambie, preparar blob URLs

  useEffect(() => {
    let mounted = true;

    const detectLangFromUrl = (u: string) => {
      const lower = u.toLowerCase();
      if (lower.includes('.es.') || lower.endsWith('.es.srt') || lower.includes('-es.') || lower.includes('/es/')) return 'es';
      if (lower.includes('.en.') || lower.endsWith('.en.srt') || lower.includes('-en.') || lower.includes('/en/')) return 'en';
      return 'en'; // fallback
    };

    const normalizeToMap = (raw: any): Record<string, string> => {
      const map: Record<string, string> = {};
      if (!raw) return map;
      if (typeof raw === 'string') {
        map[detectLangFromUrl(raw)] = raw;
        return map;
      }
      if (Array.isArray(raw)) {
        raw.forEach((item: any, idx: number) => {
          if (!item) return;
          if (typeof item === 'string') {
            map[detectLangFromUrl(item) || String(idx)] = item;
          } else if (typeof item === 'object') {
            const v = item as Record<string, any>;
            const url = (v.url || v.src || v.path || v.file || v.href) as string | undefined;
            const lang = (v.lang || v.srclang || v.language) as string | undefined;
            if (url) map[(lang || detectLangFromUrl(url) || String(idx)).toLowerCase()] = url;
          }
        });
        return map;
      }
      if (typeof raw === 'object') {
        Object.entries(raw).forEach(([k, v]) => {
          if (!v) return;
          if (typeof v === 'string') map[k] = v;
          else if (typeof v === 'object') {
            const obj = v as Record<string, any>;
            const url = (obj.url || obj.src || obj.path || obj.file || obj.href) as string | undefined;
            if (url) map[k] = url;
          } else {
            map[k] = String(v);
          }
        });
        return map;
      }
      return map;
    };

    const prepare = async () => {
      // ahora combinamos movie.subtitles y movie.subtitlesEsp (subtitlesEsp -> 'es')
      const rawS = (movie as any)?.subtitles;
      const rawEsp = (movie as any)?.subtitlesEsp;
      let combinedRaw: any = undefined;

      if (!rawS && !rawEsp) {
        combinedRaw = undefined;
      } else if (!rawS && rawEsp) {
        combinedRaw = rawEsp;
      } else if (rawS && !rawEsp) {
        combinedRaw = rawS;
      } else {
        // ambos presentes -> construir mapa con prioridad en subtitlesEsp para 'es'
        const baseMap = normalizeToMap(rawS);
        // si subtitlesEsp es string u objeto, extraer URL
        if (typeof rawEsp === 'string') baseMap['es'] = rawEsp;
        else if (typeof rawEsp === 'object') {
          const v = rawEsp as Record<string, any>;
          const url = (v.url || v.src || v.path || v.file || v.href) as string | undefined;
          if (url) baseMap['es'] = url;
        }
        combinedRaw = baseMap;
      }

      const subsMap = normalizeToMap(combinedRaw);
      for (const [lang, url] of Object.entries(subsMap)) {
        if (!mounted) return;
        if (!url) {
          setSubtitleUrls((prev) => ({ ...prev, [lang]: null }));
          continue;
        }
        try {
          const blobUrl = await fetchSubtitleAsVtt(url);
          if (!mounted) return;
          setSubtitleUrls((prev) => ({ ...prev, [lang]: blobUrl ?? null }));
        } catch (err) {
          console.error('Error preparando subtítulo', lang, url, err);
          setSubtitleUrls((prev) => ({ ...prev, [lang]: null }));
        }
      }
    };

    prepare();

    return () => {
      mounted = false;
      for (const blobUrl of srtCache.current.values()) {
        try { URL.revokeObjectURL(blobUrl); } catch (e) { /* ignore */ }
      }
      srtCache.current.clear();
      setSubtitleUrls({});
    };
  }, [movie?.subtitles, movie?.subtitlesEsp]);



  // Comments (from backend)
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [openActions, setOpenActions] = useState<Record<string, boolean>>({});
  const toggleActions = (commentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenActions((prev) => {
      const next = { ...prev, [commentId]: !prev[commentId] };
      return next;
    });
    requestAnimationFrame(() => adjustPopoverPosition(commentId));
  };

  // UI local
  const [userRating, setUserRating] = useState(0);
  const [userRatingId, setUserRatingId] = useState<string | null>(null); // ID del rating del usuario
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
    loadComments(id);
    checkIfFavorite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const applyTracks = () => {
      try {
        const tracks = video.textTracks;
        if (!tracks || tracks.length === 0) return;

        // desactivar todas primero
        for (let i = 0; i < tracks.length; i++) tracks[i].mode = 'disabled';
        if (subtitleLang === 'off') return;

        const want = subtitleLang; // 'es' | 'en'
        let foundIndex = -1;

        // 1) buscar por language (srcLang / language)
        for (let i = 0; i < tracks.length; i++) {
          const t = tracks[i];
          if (t.language && t.language.toLowerCase().startsWith(want)) {
            foundIndex = i;
            break;
          }
        }

        // 2) buscar por label (texto visible)
        if (foundIndex === -1) {
          const wantLabel = want === 'es' ? 'español' : want === 'en' ? 'english' : want;
          for (let i = 0; i < tracks.length; i++) {
            const t = tracks[i];
            if (t.label && t.label.toLowerCase().includes(wantLabel)) {
              foundIndex = i;
              break;
            }
          }
        }

        // 3) Si piden 'en' y no hay coincidencia exacta, elegir la primera pista que no sea española
        if (foundIndex === -1 && want === 'en') {
          for (let i = 0; i < tracks.length; i++) {
            const t = tracks[i];
            const lang = (t.language || '').toLowerCase();
            const label = (t.label || '').toLowerCase();
            if (lang === 'es' || label.includes('español')) continue;
            foundIndex = i;
            break;
          }
        }

        // 4) fallback final: escoger la primera pista disponible
        if (foundIndex === -1) {
          for (let i = 0; i < tracks.length; i++) {
            if (tracks[i]) { foundIndex = i; break; }
          }
        }

        if (foundIndex !== -1) tracks[foundIndex].mode = 'showing';
      } catch (err) {
        // no bloquear la UI si textTracks no está accesible
        // console.debug('applyTracks error', err);
      }
    };

    // aplicarlo ahora y después de que el video cargue metadatos (pistas pueden aparecer tardíamente)
    applyTracks();
    const onLoaded = () => setTimeout(applyTracks, 50);
    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('loadeddata', onLoaded);

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('loadeddata', onLoaded);
    };
  }, [subtitleLang, subtitleUrls]);

  useEffect(() => {
    Object.keys(openActions).forEach((id) => {
      if (openActions[id]) adjustPopoverPosition(id);
    });
  }, [openActions]);

  useEffect(() => {
    const onResize = () => {
      Object.keys(openActions).forEach((id) => {
        if (openActions[id]) adjustPopoverPosition(id);
      });
    };
    const onDocClick = (ev: MouseEvent) => {
      const t = ev.target as HTMLElement;
      if (!t.closest('[data-popover]') && !t.closest('.options-btn'))
        setOpenActions({});
    };
    window.addEventListener('resize', onResize);
    document.addEventListener('click', onDocClick);
    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('click', onDocClick);
    };
  }, [openActions]);

  const loadComments = async (filmId: string) => {
    try {
      const data = await getCommentsByFilm(filmId);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };



  // POST comment (uses backend)
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setStatusMessage({ type: 'error', text: 'Debes iniciar sesión para comentar' });
      setTimeout(() => setStatusMessage(null), 2000);
      return;
    }
    try {
      const created = await postComment(id, newComment.trim());

      // Si el backend no devuelve el user poblado, rellenarlo con el user local
      try {
        const rawUser = localStorage.getItem('user');
        if (rawUser) {
          const localUser = JSON.parse(rawUser);
          // asegurar estructura esperada: userId._id y userId.firstName/name
          if (!created.userId || typeof created.userId === 'string') {
            created.userId = {
              _id: localUser._id || localUser.id,
              firstName: localUser.firstName || localUser.name || localUser.username || 'Usuario',
              lastName: localUser.lastName || ''
            };
          } else {
            // si existe pero falta nombre, completarlo
            created.userId._id = created.userId._id || localUser._id || localUser.id;
            if (!created.userId.firstName) {
              created.userId.firstName = localUser.firstName || localUser.name || localUser.username || 'Usuario';
            }
          }
        }
      } catch (err) {
        // no bloquear si falla el parseo de localStorage
        console.warn('No se pudo poblar user local en el comentario', err);
      }

      // asegurar createdAt y _id para el render inmediato
      if (!created.createdAt) created.createdAt = new Date().toISOString();
      if (!created._id) created._id = `tmp-${Date.now()}`;

      setComments((prev) => [created, ...prev]);
      setNewComment('');
      setStatusMessage({ type: 'success', text: 'Comentario publicado' });
      setTimeout(() => setStatusMessage(null), 2000);
    } catch (err: any) {
      console.error('Error posting comment:', err);
      setStatusMessage({ type: 'error', text: err?.message || 'Error al publicar comentario' });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const startEdit = (c: IComment) => {
    setEditingId(c._id);
    setEditText(c.text || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    try {
      const updated = await editComment(editingId, editText.trim());
      setComments((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );
      setEditingId(null);
      setEditText('');
      setStatusMessage({ type: 'success', text: 'Comentario actualizado' });
      setTimeout(() => setStatusMessage(null), 2000);
    } catch (err: any) {
      console.error('Error editing comment:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error al editar comentario',
      });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('¿Eliminar comentario?')) return;
    try {
      await deleteCommentById(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setStatusMessage({ type: 'success', text: 'Comentario eliminado' });
      setTimeout(() => setStatusMessage(null), 2000);
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error al eliminar comentario',
      });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const loadMovieData = async (filmId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const filmData = await getFilmById(filmId);
      setMovie(filmData);

      try {
        const streamData = await getStreamingInfo(filmId);
        setStreamingInfo(streamData);
      } catch {
        setStreamingInfo(null);
      }

      // 3) Cargar el rating del usuario si está autenticado
      await loadUserRating(filmId);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar la película');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRating = async (filmId: string) => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) return;

      const user = JSON.parse(userStr);
      const response = await getFilmRatings(filmId);

      // Buscar el rating del usuario actual
      const userRatingData = response.ratings.find(
        (r: any) => r.user._id === user.id || r.user === user.id
      );
      if (userRatingData) {
        setUserRating(userRatingData.rate);
        setUserRatingId(userRatingData._id || userRatingData.id); // Guardar el ID del rating
      }
    } catch (err) {
      console.error('Error loading user rating:', err);
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
  const handleRating = async (rating: number) => {
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

      let response: any;
      // Si ya existe un rating, actualizarlo; si no, crear uno nuevo
      if (userRatingId) {
        // Actualizar rating existente
        response = await updateRating(userRatingId, rating, token);
        console.log('Update rating response:', response);
        setUserRating(rating);

        // Usar los datos del response que ahora incluyen filmRating
        if (response && response.filmRating) {
          setMovie((prev) =>
            prev
              ? {
                ...prev,
                rating: response.filmRating.averageRating,
                totalRatings: response.filmRating.totalRatings,
              }
              : prev
          );
        }

        setStatusMessage({
          type: 'success',
          text: 'Calificación actualizada exitosamente',
        });
      } else {
        // Crear nuevo rating
        response = await rateFilm(id, rating, token);
        console.log('Create rating response:', response);
        setUserRating(rating);

        // Guardar el ID del rating recién creado
        if (response.rating && (response.rating.id || response.rating._id)) {
          setUserRatingId(response.rating.id || response.rating._id);
        }

        // Para creaciones, usar los datos del response
        if (response && response.filmRating) {
          setMovie((prev) =>
            prev
              ? {
                ...prev,
                rating: response.filmRating.averageRating,
                totalRatings: response.filmRating.totalRatings,
              }
              : prev
          );
        }

        setStatusMessage({
          type: 'success',
          text: 'Calificación guardada exitosamente',
        });
      }

      // Recargar datos completos como verificación final
      setTimeout(async () => {
        try {
          const filmData = await getFilmById(id!);
          console.log('Reloaded film data:', filmData);
          setMovie(filmData);
        } catch (err) {
          console.error('Error reloading film data:', err);
        }
      }, 300);

      setTimeout(() => setStatusMessage(null), 2000);
    } catch (err: any) {
      console.error('Rating error:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error al guardar la calificación',
      });
      setTimeout(() => setStatusMessage(null), 2000);
    }
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
        await removeFavorite(id, token);
        setIsFavorite(false);
        setStatusMessage({ type: 'success', text: 'Eliminado de favoritos' });
      } else {
        await addFavorite(id, token);
        setIsFavorite(true);
        setStatusMessage({ type: 'success', text: 'Agregado a favoritos' });
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

  if (isLoading) {
    return (
      <div className="movie-loading">
        <div className="loading-spinner" aria-label="Cargando película" />
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

  const adjustPopoverPosition = (commentId: string) => {
    const pop = document.querySelector(
      `.options-popover[data-popover-id="${commentId}"]`
    ) as HTMLElement | null;
    if (!pop) return;
    pop.classList.remove('align-left', 'align-right');
    const rect = pop.getBoundingClientRect();
    const margin = 8;
    if (rect.right > window.innerWidth - margin) {
      pop.classList.add('align-left');
    } else if (rect.left < margin) {
      pop.classList.add('align-right');
    }
  };

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
    <main className="movie-page" role="main" aria-labelledby="movie-title">
      <button
        onClick={() => navigate('/menu')}
        className="back-btn"
        aria-label="Volver al menú"
      >
        ← Volver
      </button>

      {statusMessage && (
        <div className={`status-toast ${statusMessage.type}`} role="alert">
          {statusMessage.text}
        </div>
      )}

      <div className="movie-container">
        <section className="movie-media" aria-label="Contenido multimedia">
          <div className="movie-video">
            <div className="subtitle-controls">
              <label>Subtítulos:</label>
              <button
                className={`subtitle-btn ${subtitleLang === 'off' ? 'active' : ''}`}
                onClick={() => setSubtitleLang('off')}
              >
                Off
              </button>
              <button
                className={`subtitle-btn ${subtitleLang === 'es' ? 'active' : ''}`}
                onClick={() => setSubtitleLang('es')}
              >
                Español
              </button>
              <button
                className={`subtitle-btn ${subtitleLang === 'en' ? 'active' : ''}`}
                onClick={() => setSubtitleLang('en')}
              >
                English
              </button>
            </div>
            <video
              ref={videoRef}
              className="movie-player"
              controls
              poster={posterSrc}
              crossOrigin="anonymous"
              preload="auto"
            >
              <source src={videoSrc} type="video/mp4" />

              {(() => {
                // English track (backend: movie.subtitles)
                const rawEn = (movie as any)?.subtitles;
                let enSrc: string | undefined;
                if (rawEn) {
                  enSrc = (subtitleUrls['en'] ?? (typeof rawEn === 'string' ? rawEn : (rawEn.url || rawEn.src || rawEn.path || rawEn.file || rawEn.href))) as string | undefined;
                }

                // Spanish track (backend: movie.subtitlesEsp)
                const rawEs = (movie as any)?.subtitlesEsp ?? (movie as any)?.subtitles?.es ?? undefined;
                let esSrc: string | undefined;
                if (rawEs) {
                  esSrc = (subtitleUrls['es'] ?? (typeof rawEs === 'string' ? rawEs : (rawEs.url || rawEs.src || rawEs.path || rawEs.file || rawEs.href))) as string | undefined;
                }

                // <-- aquí se cambió el tipo: usar React.ReactElement[] en vez de JSX.Element[] -->
                const tracks: React.ReactElement[] = [];

                if (enSrc) {
                  tracks.push(
                    <track
                      key="sub-en"
                      kind="subtitles"
                      label="English"
                      srcLang="en"
                      src={String(enSrc)}
                    />
                  );
                }

                if (esSrc) {
                  tracks.push(
                    <track
                      key="sub-es"
                      kind="subtitles"
                      label="Español"
                      srcLang="es"
                      src={String(esSrc)}
                    />
                  );
                }

                return tracks.length > 0 ? tracks : null;
              })()}


              Tu navegador no soporta el elemento video.
            </video>
          </div>
        </section>

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

              <div
                className="movie-rating-section"
                role="group"
                aria-labelledby="rating-label"
              >
                <h2 id="rating-label">Calificación</h2>
                <div
                  className="rating-display"
                  key={`rating-${movie.rating}-${movie.totalRatings}`}
                >
                  <span className="rating-value">
                    {typeof movie.rating === 'number'
                      ? movie.rating.toFixed(1)
                      : 'N/A'}
                  </span>
                  <span className="rating-count">
                    ({(movie as any).totalRatings || 0} votos)
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
                      className={`star ${star <= (hoverRating || userRating) ? 'active' : ''
                        }`}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`Calificar con ${star} estrella${star > 1 ? 's' : ''
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

        <section className="movie-comments" aria-labelledby="comments-heading">
          <h2 id="comments-heading">Comentarios</h2>

          <form onSubmit={handleSubmitComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe tu comentario..."
              rows={4}
              aria-label="Escribe tu comentario"
              maxLength={1000}
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
              comments.map((comment) => {
                const currentUser = localStorage.getItem('user');
                const currentUserId = currentUser
                  ? JSON.parse(currentUser)._id || JSON.parse(currentUser).id
                  : null;
                const ownerId =
                  (comment.userId &&
                    (comment.userId._id || comment.userId.id)) ||
                  '';
                const isOwner = String(ownerId) === String(currentUserId);
                return (
                  <article
                    key={comment._id}
                    className={`comment-item ${editingId === comment._id ? 'is-editing' : ''
                      }`}
                    role="listitem"
                  >
                    <div className="comment-header">
                      <div className="author-row">
                        <strong className="comment-author">
                          {(comment.userId &&
                            (comment.userId.firstName ||
                              comment.userId.name)) ||
                            'Usuario'}
                        </strong>

                        {isOwner && (
                          <>
                            <button
                              type="button"
                              className="options-btn"
                              aria-haspopup="true"
                              aria-expanded={!!openActions[comment._id]}
                              onClick={(e) => toggleActions(comment._id, e)}
                            ></button>

                            <div
                              className={`options-popover ${openActions[comment._id] ? 'open' : ''
                                }`}
                              role="menu"
                              aria-hidden={!openActions[comment._id]}
                              data-popover
                              data-popover-id={comment._id}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                role="menuitem"
                                className="popover-item"
                                onClick={() => {
                                  setEditingId(comment._id);
                                  setEditText(comment.text || '');
                                  setOpenActions({});
                                }}
                              >
                                EDITAR
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                className="popover-item danger"
                                onClick={() => {
                                  handleDelete(comment._id);
                                  setOpenActions({});
                                }}
                              >
                                ELIMINAR
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      <time
                        className="comment-date"
                        dateTime={comment.createdAt}
                      >
                        {new Date(comment.createdAt).toLocaleDateString(
                          'es-ES'
                        )}
                      </time>
                    </div>

                    {editingId === comment._id ? (
                      <>
                        <textarea
                          className="edit-textarea"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          autoFocus
                          onKeyDown={(e) => {
                            // Enter = guardar, Shift+Enter = nueva línea
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveEdit();
                            }
                          }}
                        />
                        <div className="comment-actions edit-actions">
                          <button onClick={handleSaveEdit} type="button" className="save-edit-btn">Guardar</button>
                          <button onClick={() => { setEditingId(null); setEditText(''); }} type="button" className="btn">Cancelar</button>
                        </div>
                      </>
                    ) : (
                      <p className="comment-text">{comment.text}</p>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Movie;
