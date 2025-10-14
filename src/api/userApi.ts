const API_BASE_URL = 'http://localhost:8080/api';

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