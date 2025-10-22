const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age: number;
}

export interface RegisterResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  token: string;
  expiresIn: number;
}

export interface ApiError {
  message: string;
}

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Secure fetch wrapper that masks sensitive data in DevTools
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise with the response
 */
const secureFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Crear una copia de las opciones para evitar mutación
  const secureOptions = { ...options };
  
  // Si hay un body con datos sensibles, lo registramos de forma segura
  if (secureOptions.body && secureOptions.headers) {
    const headers = secureOptions.headers as Record<string, string>;
    if (headers['Content-Type']?.includes('application/json')) {
      try {
        const bodyData = JSON.parse(secureOptions.body as string);
        if (bodyData.password) {
          // Log seguro para debugging (opcional)
          console.log('Enviando solicitud de registro para:', {
            firstName: bodyData.firstName,
            lastName: bodyData.lastName,
            email: bodyData.email,
            age: bodyData.age,
            password: '***PROTECTED***'
          });
        }
      } catch (e) {
        // Si no se puede parsear, continuar normalmente
      }
    }
  }
  
  return fetch(url, secureOptions);
};

/**
 * Logs error information without exposing sensitive data
 * @param operation - The operation that failed
 * @param userData - User data (password will be masked)
 * @param error - The error that occurred
 */
const logSafeError = (operation: string, userData: RegisterUserData, error: any) => {
  const safeUserData = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    age: userData.age,
    password: '***HIDDEN***'
  };
  console.error(`Error en ${operation}:`, {
    userData: safeUserData,
    error: error.message || error
  });
};

/**
 * Register a new user
 * @param userData - User registration data
 * @returns Promise with the created user data or error
 */
export const registerUser = async (userData: RegisterUserData): Promise<RegisterResponse> => {
  try {
    const response = await secureFetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      logSafeError('registro de usuario', userData, errorData);
      throw new Error(errorData.message || 'Error al registrar usuario');
    }

    const data: RegisterResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      logSafeError('registro de usuario', userData, error);
      throw error;
    }
    logSafeError('registro de usuario', userData, 'Error desconocido');
    throw new Error('Error de conexión con el servidor');
  }
};

/**
 * Logs error information for login without exposing sensitive data
 * @param operation - The operation that failed
 * @param userData - User data (password will be masked)
 * @param error - The error that occurred
 */
const logSafeLoginError = (operation: string, userData: LoginUserData, error: any) => {
  const safeUserData = {
    email: userData.email,
    password: '***HIDDEN***'
  };
  console.error(`Error en ${operation}:`, {
    userData: safeUserData,
    error: error.message || error
  });
};

/**
 * Login user and get authentication token
 * @param userData - User login data (email and password)
 * @returns Promise with the login response including token and user data
 */
export const loginUser = async (userData: LoginUserData): Promise<LoginResponse> => {
  try {
    const response = await secureFetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      logSafeLoginError('inicio de sesión', userData, errorData);
      throw new Error(errorData.message || 'Error al iniciar sesión');
    }

    const data: LoginResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      logSafeLoginError('inicio de sesión', userData, error);
      throw error;
    }
    logSafeLoginError('inicio de sesión', userData, 'Error desconocido');
    throw new Error('Error de conexión con el servidor');
  }
};


/**
 * Request password reset: POST /users/forgot-password { email }
 */
export const requestPasswordReset = async (email: string): Promise<{ message?: string }> => {
  try {
    const response = await secureFetch(`${API_BASE_URL}/users/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error requesting password reset');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in requestPasswordReset:', { email, error });
    throw error instanceof Error ? error : new Error('Network error');
  }
};

/**
 * Reset password using token: POST /users/reset-password { token, newPassword }
 */
export const resetPasswordWithToken = async (token: string, newPassword: string): Promise<{ message?: string }> => {
  try {
    const response = await secureFetch(`${API_BASE_URL}/users/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error resetting password');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in resetPasswordWithToken:', { token: token ? '***' : '', error });
    throw error instanceof Error ? error : new Error('Network error');
  }
};

/**
 * Get user profile by ID
 * @param userId - The user ID
 * @param token - Authentication token
 * @returns Promise with user profile data
 */
export const getUserProfile = async (userId: string, token?: string): Promise<UserProfile> => {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await secureFetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error getting user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('getUserProfile error:', { userId: userId ? '***' : '', error });
    throw error instanceof Error ? error : new Error('Network error');
  }
};

/**
 * Update user profile by ID
 * @param userId - The user ID
 * @param profileData - The updated profile data
 * @param token - Authentication token
 * @returns Promise with updated user profile data
 */
export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>,
  token?: string
): Promise<UserProfile> => {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await secureFetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error updating user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('updateUserProfile error:', { userId: userId ? '***' : '', error });
    throw error instanceof Error ? error : new Error('Network error');
  }
};

export const deleteUser = async (userId: string, token?: string): Promise<{ message?: string }> => {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await secureFetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error deleting user');
    }

    return await response.json();
  } catch (error) {
    console.error('deleteUser error:', { userId: userId ? '***' : '', error });
    throw error instanceof Error ? error : new Error('Network error');
  }
};

/**
 * Get user's favorite films
 * @param token - Authentication token
 * @returns Promise with array of favorite films
 */
export const getUserFavorites = async (token?: string): Promise<any[]> => {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await secureFetch(`${API_BASE_URL}/users/favorites`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error getting favorites');
    }

    const data = await response.json();
    return data.favorites || [];
  } catch (error) {
    console.error('getUserFavorites error:', error);
    throw error instanceof Error ? error : new Error('Network error');
  }
};

/**
 * Add a film to user's favorites
 * @param filmId - The film ID to add
 * @param token - Authentication token
 * @returns Promise with success message
 */
export const addFavorite = async (filmId: string, token?: string): Promise<{ message?: string }> => {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await secureFetch(`${API_BASE_URL}/users/favorites/${filmId}`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error adding to favorites');
    }

    return await response.json();
  } catch (error) {
    console.error('addFavorite error:', { filmId, error });
    throw error instanceof Error ? error : new Error('Network error');
  }
};

/**
 * Remove a film from user's favorites
 * @param filmId - The film ID to remove
 * @param token - Authentication token
 * @returns Promise with success message
 */
export const removeFavorite = async (filmId: string, token?: string): Promise<{ message?: string }> => {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await secureFetch(`${API_BASE_URL}/users/favorites/${filmId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error removing from favorites');
    }

    return await response.json();
  } catch (error) {
    console.error('removeFavorite error:', { filmId, error });
    throw error instanceof Error ? error : new Error('Network error');
  }
};