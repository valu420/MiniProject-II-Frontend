const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const secureFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  const text = await res.text();
  let payload: any = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }

  if (!res.ok) {
    const msg = (payload && (payload.message || payload.error)) || res.statusText || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return payload;
};

export interface IUserRef {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

export interface IComment {
  _id: string;
  text: string;
  userId: IUserRef;
  createdAt: string;
  updatedAt?: string;
  [key: string]: any;
}

/**
 * GET /api/films/:filmId/comments
 * returns array of comments (backend wraps { message, totalComments, comments })
 */
export const getCommentsByFilm = async (filmId: string): Promise<IComment[]> => {
  if (!filmId) throw new Error('filmId is required');
  const data = await secureFetch(`${API_BASE_URL}/films/${encodeURIComponent(filmId)}/comments`);
  return (data && (data.comments || data)) || [];
};

/**
 * POST /api/films/:filmId/comments  { text }
 * returns created comment in data.comment
 */
export const postComment = async (filmId: string, text: string): Promise<IComment> => {
  if (!filmId) throw new Error('filmId is required');
  if (!text || !text.trim()) throw new Error('text is required');
  const data = await secureFetch(`${API_BASE_URL}/films/${encodeURIComponent(filmId)}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text: text.trim() }),
  });
  return (data && (data.comment || data)) as IComment;
};

/**
 * GET /api/users/:userId/comments
 * returns { message, totalComments, comments }
 */
export const getCommentsByUser = async (userId: string): Promise<IComment[]> => {
  if (!userId) throw new Error('userId is required');
  const data = await secureFetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}/comments`);
  return (data && (data.comments || data)) || [];
};

/**
 * GET /api/comments/:commentId
 * returns { message, comment }
 */
export const getCommentById = async (commentId: string): Promise<IComment | null> => {
  if (!commentId) throw new Error('commentId is required');
  const data = await secureFetch(`${API_BASE_URL}/comments/${encodeURIComponent(commentId)}`);
  return (data && (data.comment || data)) || null;
};

/**
 * PUT /api/comments/:commentId { text }
 * returns updated comment in data.comment
 */
export const editComment = async (commentId: string, text: string): Promise<IComment> => {
  if (!commentId) throw new Error('commentId is required');
  if (!text || !text.trim()) throw new Error('text is required');
  const data = await secureFetch(`${API_BASE_URL}/comments/${encodeURIComponent(commentId)}`, {
    method: 'PUT',
    body: JSON.stringify({ text: text.trim() }),
  });
  return (data && (data.comment || data)) as IComment;
};

/**
 * DELETE /api/comments/:commentId
 * returns deleted comment in data.comment or message
 */
export const deleteCommentById = async (commentId: string): Promise<{ message?: string; comment?: IComment } | null> => {
  if (!commentId) throw new Error('commentId is required');
  const data = await secureFetch(`${API_BASE_URL}/comments/${encodeURIComponent(commentId)}`, {
    method: 'DELETE',
  });
  return data || null;
};