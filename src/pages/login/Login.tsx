import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';
/**
 * Login page component
 * - Uses Fetch API to POST credentials to /auth/login
 * - Shows inline validation and server error messages
 * - Accessible: proper labels, aria-live for status, visible focus outlines
 * @returns {JSX.Element}
 */
export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      alert('Login successful!');
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Iniciar Sesion</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label htmlFor="password">
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && (
            <div className="login-error" aria-live="polite">
              {error}
            </div>
          )}

          <div className="login-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Cargando...' : 'Iniciar Sesion'}
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
    </div>
  );
};

export default Login;
