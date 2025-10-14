import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rutas que requieren autenticación
 * Verifica si el usuario tiene un token válido en localStorage
 * Si no está autenticado, redirige al login
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // Verificar que tanto el token como la información del usuario existan
    if (!token || !user) {
      return false;
    }

    try {
      // Verificar que la información del usuario sea válida JSON
      JSON.parse(user);
      return true;
    } catch (error) {
      // Si hay error al parsear, limpiar localStorage y retornar false
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  };

  if (!isAuthenticated()) {
    // Si no está autenticado, redirigir al login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostrar el componente hijo
  return <>{children}</>;
};

export default ProtectedRoute;
