import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResetPassword.scss';
import { resetPasswordWithToken } from '../../api/userApi';

/**
 * Reset password page: reads token from query (e.g. ?token=...)
 * Posts { token, newPassword } to backend.
 */
export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const validate = () => {
    if (!token) return 'Token inválido o ausente.';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (password !== confirm) return 'Las contraseñas no coinciden.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const error = validate();
    if (error) {
      setMsg({ type: 'error', text: error });
      return;
    }

    setIsLoading(true);
    try {
      await resetPasswordWithToken(token, password);
      setMsg({ type: 'success', text: 'Contraseña actualizada. Redirigiendo al login...' });
      setTimeout(() => navigate('/login'), 1400);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'No se pudo actualizar la contraseña.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h1>Restablecer contraseña</h1>

        {msg && <div className={`notification ${msg.type}`}>{msg.text}</div>}

        <form onSubmit={handleSubmit} className="reset-password-form">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={isLoading}
            required
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;