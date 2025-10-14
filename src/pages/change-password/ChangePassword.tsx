import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ChangePassword.scss';

const ChangePassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Simular llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Aquí iría la llamada real a la API
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      setIsSuccess(true);
      setMessage(
        'Se ha enviado un email con instrucciones para restablecer tu contraseña.'
      );
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        'Hubo un error al enviar el correo. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        {/* Header con logo */}
        <div className="card-header">
          <div className="brand-logo">
            <div className="logo-icon">
              <img src="/logo.png" alt="Lumière" />
            </div>
            <span className="brand-name">Lumière</span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="card-content">
          <h1 className="title">Cambiar Contraseña</h1>

          <p className="description">
            Introduce el correo electrónico de tu cuenta. Te enviaremos un email
            con instrucciones para restablecer tu contraseña.
          </p>

          {message && (
            <div className={`notification ${isSuccess ? 'success' : 'error'}`}>
              <span className="notification-text">{message}</span>
            </div>
          )}

          {!isSuccess && (
            <form onSubmit={handleSubmit} className="change-password-form">
              <div className="input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo Electrónico"
                  required
                  disabled={isLoading}
                  className="email-input"
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Enviando...
                  </>
                ) : (
                  'Enviar Correo'
                )}
              </button>
            </form>
          )}

          {isSuccess && (
            <div className="success-actions">
              <div className="email-sent-icon">📧</div>
              <p className="check-email">Revisa tu bandeja de entrada</p>
              <div className="action-buttons">
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setMessage('');
                    setEmail('');
                  }}
                  className="try-again-button"
                >
                  Intentar con otro correo
                </button>
                <Link to="/login" className="back-login-button">
                  Volver al login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
