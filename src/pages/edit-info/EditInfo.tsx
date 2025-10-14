import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditInfo.scss';
import { deleteUser } from '../../api/userApi';


 export const EditInfo: React.FC = () => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDeleteAccount = async (e?: React.MouseEvent) => {
    e?.preventDefault();

    const userRaw = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userRaw) {
      setStatusMessage({ type: 'error', text: 'No se encontró información del usuario.' });
      return;
    }

    const user = JSON.parse(userRaw) as { _id?: string };
    const userId = user?._id;
    if (!userId) {
      setStatusMessage({ type: 'error', text: 'ID de usuario inválido.' });
      return;
    }

    const confirmed = window.confirm('¿Estás seguro que deseas eliminar tu cuenta? Esta acción es irreversible.');
    if (!confirmed) return;

    setIsDeleting(true);
    setStatusMessage(null);

    try {
      await deleteUser(userId, token || undefined);
      // clear auth and user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setStatusMessage({ type: 'success', text: 'Cuenta eliminada correctamente. Redirigiendo...' });
      setTimeout(() => navigate('/'), 1400);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'No se pudo eliminar la cuenta.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="edit-info-container">
      <div className="form-content">
        <div className="profile-icon" />

        <h1>Información de Perfil</h1>

        <form>
          <div className="form-group">
            <label>Nombre:</label>
            <input type="text" placeholder="" />
          </div>

          <div className="form-group">
            <label>Edad:</label>
            <input type="text" placeholder="" />
          </div>

          <div className="form-group">
            <label>Correo:</label>
            <input type="email" placeholder="" />
          </div>

          <button type="submit" className="submit-btn">
            Editar Perfil
          </button>
        </form>

        {statusMessage && (
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        <button
          onClick={handleDeleteAccount}
          className="delete-account"
          disabled={isDeleting}
          aria-disabled={isDeleting}
        >
          {isDeleting ? 'Eliminando cuenta...' : 'Eliminar Cuenta'}
        </button>
      </div>
    </div>
  );
};

export default EditInfo;