import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, LoginUserData } from '../../api/userApi';
import './Login.css';
/**
 * Login page component
 * - Uses Fetch API to POST credentials to /auth/login
 * - Shows inline validation and server error messages
 * - Accessible: proper labels, aria-live for status, visible focus outlines
 * @returns {JSX.Element}
 */
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Verificar si el usuario ya está autenticado al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      // Si ya está autenticado, redirigir al menú
      navigate('/menu');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validar que los campos estén llenos
      if (!email || !password) {
        setError('Por favor completa todos los campos');
        return;
      }

      // Preparar datos para enviar al backend
      const userData: LoginUserData = {
        email,
        password,
      };

      // Limpiar inmediatamente el campo de contraseña por seguridad
      setPassword('');

      // Enviar datos al backend
      const result = await loginUser(userData);

      // Guardar token en localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Log seguro (sin contraseña)
      console.log('Login exitoso:', {
        user: result.user,
        message: result.message,
      });

      // Mostrar mensaje de éxito y redirigir después de 1 segundo
      setSuccessMessage('¡Inicio de sesión exitoso! Redirigiendo...');

      setTimeout(() => {
        navigate('/menu');
      }, 1000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al iniciar sesión';
      setError(errorMessage);
      console.error('Error en login:', { email, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page" role="main" aria-labelledby="login-title">
      <div className="login-card">
        <h1 id="login-title" className="login-title">Iniciar Sesión</h1>
        
        <form 
          className="login-form" 
          onSubmit={handleSubmit}
          aria-labelledby="login-title"
          noValidate
        >
          <label htmlFor="email">
            
            <input
              id="email"
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
            />
          </label>

          <label htmlFor="password">
            
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
              aria-invalid={error ? 'true' : 'false'}
            />
          </label>

          {error && (
            <div className="login-error" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="login-success" role="status" aria-live="polite">
              {successMessage}
            </div>
          )}

          <div className="login-actions">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
            <Link to="/change-password" className="login-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>

        <p className="small-note">
          ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
