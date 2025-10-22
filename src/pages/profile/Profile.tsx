import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  deleteUser,
  getUserProfile,
  updateUserProfile,
  UserProfile,
} from '../../api/userApi';
import './Profile.scss';

/**
 * Password validation requirements
 */
interface PasswordRequirements {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState<{
    firstName: string;
    lastName: string;
    age: number;
    email: string;
  }>({
    firstName: '',
    lastName: '',
    age: 0,
    email: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordRequirements, setPasswordRequirements] =
    useState<PasswordRequirements>({
      minLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
    });
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);

  // Función para cargar el perfil del usuario
  const loadUserProfile = async () => {
    const userRaw = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userRaw) {
      setStatusMessage({
        type: 'error',
        text: 'No se encontró información del usuario.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userRaw) as { id?: string };
      const userId = user?.id;

      if (!userId) {
        setStatusMessage({ type: 'error', text: 'ID de usuario inválido.' });
        setIsLoading(false);
        return;
      }

      const profile = await getUserProfile(userId, token || undefined);
      setUserProfile(profile);
      setEditableProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        age: profile.age,
        email: profile.email,
      });
      setStatusMessage(null);
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: error?.message || 'Error al cargar el perfil.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar el perfil al montar el componente
  useEffect(() => {
    loadUserProfile();
  }, []);

  /**
   * Validate password requirements in real-time
   */
  const validatePassword = (password: string): PasswordRequirements => {
    return {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  // Función para manejar cambios en los campos editables
  const handleInputChange = (
    field: keyof typeof editableProfile,
    value: string | number
  ) => {
    setEditableProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Función para manejar el envío del formulario
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile?._id) {
      setStatusMessage({
        type: 'error',
        text: 'No se encontró información del usuario.',
      });
      return;
    }

    // Validar si se está intentando cambiar la contraseña
    if (newPassword) {
      // Validar que la nueva contraseña cumpla con los requisitos
      const requirements = validatePassword(newPassword);
      const allRequirementsMet = Object.values(requirements).every(Boolean);

      if (!allRequirementsMet) {
        setStatusMessage({
          type: 'error',
          text: 'La nueva contraseña no cumple con los requisitos.',
        });
        return;
      }

      // Validar que las contraseñas coincidan
      if (newPassword !== confirmPassword) {
        setStatusMessage({
          type: 'error',
          text: 'Las contraseñas no coinciden.',
        });
        return;
      }

      // Validar que se haya ingresado la contraseña actual
      if (!currentPassword) {
        setStatusMessage({
          type: 'error',
          text: 'Debes ingresar tu contraseña actual para cambiarla.',
        });
        return;
      }
    }

    const token = localStorage.getItem('token');
    setStatusMessage(null);

    try {
      const updateData: any = {
        firstName: editableProfile.firstName,
        lastName: editableProfile.lastName,
        age: editableProfile.age,
        email: editableProfile.email,
      };

      // Si hay contraseña nueva, incluir ambas contraseñas
      if (newPassword && currentPassword) {
        updateData.currentPassword = currentPassword;
        updateData.password = newPassword;
      }

      const updatedProfile = await updateUserProfile(
        userProfile._id,
        updateData,
        token || undefined
      );

      setUserProfile(updatedProfile);
      setIsEditing(false);

      // Limpiar los campos de contraseña
      setNewPassword('');
      setCurrentPassword('');
      setConfirmPassword('');

      setStatusMessage({
        type: 'success',
        text: newPassword
          ? 'Perfil y contraseña actualizados correctamente.'
          : 'Perfil actualizado correctamente.',
      });

      // Actualizar la información en localStorage si es necesario
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const userObj = JSON.parse(currentUser);
        const updatedUser = {
          ...userObj,
          firstName: updatedProfile.firstName,
          lastName: updatedProfile.lastName,
          email: updatedProfile.email,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      setStatusMessage({
        type: 'error',
        text: error?.message || 'Error al actualizar el perfil.',
      });
    }
  };

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    if (userProfile) {
      setEditableProfile({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        age: userProfile.age,
        email: userProfile.email,
      });
    }
    // Limpiar campos de contraseña
    setNewPassword('');
    setCurrentPassword('');
    setConfirmPassword('');
    setIsEditing(false);
  };

  const handleDeleteAccount = async (e?: React.MouseEvent) => {
    e?.preventDefault();

    const token = localStorage.getItem('token');

    if (!userProfile?._id) {
      setStatusMessage({
        type: 'error',
        text: 'No se encontró información del usuario.',
      });
      return;
    }

    const confirmed = window.confirm(
      '¿Estás seguro que deseas eliminar tu cuenta? Esta acción es irreversible.'
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setStatusMessage(null);

    try {
      await deleteUser(userProfile._id, token || undefined);
      // clear auth and user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setStatusMessage({
        type: 'success',
        text: 'Cuenta eliminada correctamente. Redirigiendo...',
      });
      setTimeout(() => navigate('/'), 1400);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'No se pudo eliminar la cuenta.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  return (
    <div
      className="profile-container"
      role="main"
      aria-live="polite"
      aria-label="Página de perfil de usuario"
    >
      <div className="form-content">
        <button
          onClick={handleBackToMenu}
          className="back-to-menu-btn"
          aria-label="Volver al menú"
        >
          ← Volver al Menú
        </button>
        <div className="profile-icon" />

        <h1>Información de Perfil</h1>

        {isLoading ? (
          <div className="loading-message">
            Cargando información del perfil...
          </div>
        ) : userProfile ? (
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={
                  isEditing ? editableProfile.firstName : userProfile.firstName
                }
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                readOnly={!isEditing}
                placeholder="Nombre"
              />
            </div>

            <div className="form-group">
              <label>Apellido:</label>
              <input
                type="text"
                value={
                  isEditing ? editableProfile.lastName : userProfile.lastName
                }
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                readOnly={!isEditing}
                placeholder="Apellido"
              />
            </div>

            <div className="form-group">
              <label>Edad:</label>
              <input
                type="number"
                value={isEditing ? editableProfile.age : userProfile.age}
                onChange={(e) =>
                  handleInputChange('age', parseInt(e.target.value) || 0)
                }
                readOnly={!isEditing}
                placeholder="Edad"
              />
            </div>

            <div className="form-group">
              <label>Correo:</label>
              <input
                type="email"
                value={isEditing ? editableProfile.email : userProfile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                readOnly={!isEditing}
                placeholder="Correo electrónico"
              />
            </div>

            {isEditing && (
              <>
                <div className="form-group">
                  <label>Contraseña actual:</label>
                  <input
                    type="password"
                    placeholder="Contraseña actual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Nueva Contraseña:</label>
                  <input
                    type="password"
                    placeholder="Nueva Contraseña (opcional)"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordRequirements(validatePassword(e.target.value));
                    }}
                    onFocus={() => setShowPasswordRequirements(true)}
                    onBlur={() => setShowPasswordRequirements(false)}
                  />

                  {/* Password requirements indicator */}
                  {showPasswordRequirements && (
                    <div className="password-requirements" aria-live="polite">
                      <p className="requirements-title">
                        La contraseña debe contener:
                      </p>
                      <ul className="requirements-list">
                        <li
                          className={
                            passwordRequirements.minLength ? 'valid' : 'invalid'
                          }
                        >
                          <span className="requirement-icon">
                            {passwordRequirements.minLength ? '✓' : '✗'}
                          </span>
                          Mínimo 8 caracteres
                        </li>
                        <li
                          className={
                            passwordRequirements.hasUpperCase
                              ? 'valid'
                              : 'invalid'
                          }
                        >
                          <span className="requirement-icon">
                            {passwordRequirements.hasUpperCase ? '✓' : '✗'}
                          </span>
                          Al menos una letra mayúscula
                        </li>
                        <li
                          className={
                            passwordRequirements.hasLowerCase
                              ? 'valid'
                              : 'invalid'
                          }
                        >
                          <span className="requirement-icon">
                            {passwordRequirements.hasLowerCase ? '✓' : '✗'}
                          </span>
                          Al menos una letra minúscula
                        </li>
                        <li
                          className={
                            passwordRequirements.hasNumber ? 'valid' : 'invalid'
                          }
                        >
                          <span className="requirement-icon">
                            {passwordRequirements.hasNumber ? '✓' : '✗'}
                          </span>
                          Al menos un número
                        </li>
                        <li
                          className={
                            passwordRequirements.hasSpecialChar
                              ? 'valid'
                              : 'invalid'
                          }
                        >
                          <span className="requirement-icon">
                            {passwordRequirements.hasSpecialChar ? '✓' : '✗'}
                          </span>
                          Al menos un carácter especial (!@#$%^&*...)
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Confirmar Nueva Contraseña:</label>
                  <input
                    type="password"
                    placeholder="Confirmar Nueva Contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <span
                      className="error-text"
                      style={{ color: 'red', fontSize: '0.875rem' }}
                    >
                      Las contraseñas no coinciden
                    </span>
                  )}
                </div>
              </>
            )}

            <div className="button-group">
              {isEditing && (
                <button type="submit" className="save-btn">
                  Guardar Cambios
                </button>
              )}
              <button
                type="button"
                className={`edit-btn ${isEditing ? 'cancel-mode' : ''}`}
                onClick={
                  isEditing ? handleCancelEdit : () => setIsEditing(true)
                }
              >
                {isEditing ? 'Cancelar' : 'Editar Perfil'}
              </button>
            </div>
          </form>
        ) : (
          <div className="error-message">
            Error al cargar la información del perfil.
            <button onClick={loadUserProfile} className="retry-btn">
              Reintentar
            </button>
          </div>
        )}

        {statusMessage && (
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        {!isEditing && (
          <button
            onClick={handleDeleteAccount}
            className="delete-account"
            disabled={isDeleting}
            aria-disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando cuenta...' : 'Eliminar Cuenta'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
