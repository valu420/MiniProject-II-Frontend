const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Film interface matching backend model
 */
export interface Film {
  _id?: string;
  id?: string;
  name: string;
  genre: string;
  description: string;
  url: string;
  posterUrl?: string;
  releaseDate: string;
  duration?: number;
  director?: string;
  cast?: string[];
  rating?: number;
  ratingsCount?: number;
}

/**
 * Streaming info response
 */
export interface StreamingInfo {
  streamUrl: string;
  film: {
    id: string;
    name: string;
    genre: string;
    description: string;
    releaseDate: string;
  };
}

/**
 * Secure fetch wrapper with auth token
 */
const secureFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  
  // Mejorar manejo de errores
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Si no es JSON, usar el status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response;
};

/**
 * GET all films
 * Endpoint: GET /films
 */
export const getAllFilms = async (): Promise<Film[]> => {
  try {
    const response = await secureFetch(`${API_BASE_URL}/films`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error fetching films');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getAllFilms:', error);
    throw error instanceof Error ? error : new Error('Network error');
  }
};

/**
 * GET film by ID
 * Endpoint: GET /films/:id
 */
export const getFilmById = async (id: string): Promise<Film> => {
  try {
    const response = await secureFetch(`${API_BASE_URL}/films/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Film not found');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getFilmById:', error);
    throw error instanceof Error ? error : new Error('Network error');
  }
};

/**
 * GET films by genre
 * Endpoint: GET /films/genre/:genre
 */
export const getFilmsByGenre = async (genre: string): Promise<Film[]> => {
  try {
    const response = await secureFetch(`${API_BASE_URL}/films/genre/${genre}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `No films found for genre: ${genre}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getFilmsByGenre:', error);
    throw error instanceof Error ? error : new Error('Network error');
  }
};

/**
 * GET streaming info for a film
 * Endpoint: GET /films/:id/stream
 */
export const getStreamingInfo = async (id: string): Promise<StreamingInfo> => {
  try {
    const response = await secureFetch(`${API_BASE_URL}/films/${id}/stream`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error getting streaming info');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getStreamingInfo:', error);
    throw error instanceof Error ? error : new Error('Network error');
  }
};

/**
 * CREATE new film (admin only)
 * Endpoint: POST /films
 */
export const createFilm = async (filmData: Omit<Film, '_id' | 'id'>): Promise<Film> => {
  try {
    const response = await secureFetch(`${API_BASE_URL}/films`, {
      method: 'POST',
      body: JSON.stringify(filmData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error creating film');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createFilm:', error);
    throw error instanceof Error ? error : new Error('Network error');
  }
};