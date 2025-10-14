import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, RegisterUserData } from '../../api/userApi';
import './Register.css';

/**
 * Register page component
 * - Allows users to create an account
 * - Includes fields for name, surname, age, email, password and confirm password
 * - Accessible and styled according to the provided CSS
 * @returns {JSX.Element}
 */
export const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '', // added field
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validar que todos los campos estén llenos
      if (
        !formData.name ||
        !formData.surname ||
        !formData.email ||
        !formData.password ||
        !formData.age ||
        !formData.confirmPassword
      ) {
        setMessage({
          type: 'error',
          text: 'Por favor completa todos los campos',
        });
        setIsLoading(false);
        return;
      }

      // Password confirmation
      if (formData.password !== formData.confirmPassword) {
        setMessage({
          type: 'error',
          text: 'Las contraseñas no coinciden',
        });
        setIsLoading(false);
        return;
      }

      // Validar edad
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 1 || age > 120) {
        setMessage({
          type: 'error',
          text: 'Por favor ingresa una edad válida',
        });
        setIsLoading(false);
        return;
      }

      // Preparar datos para enviar al backend
      const userData: RegisterUserData = {
        firstName: formData.name,
        lastName: formData.surname,
        email: formData.email,
        password: formData.password, // El backend se encarga del hash
        age: age,
      };

      // Limpiar inmediatamente el campo de contraseña por seguridad
      setFormData((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));

      // Enviar datos al backend
      const result = await registerUser(userData);

      setMessage({ type: 'success', text: 'Usuario registrado exitosamente' });

      // Limpiar formulario después del registro exitoso
      setFormData({
        name: '',
        surname: '',
        age: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      console.log('Usuario creado exitosamente:', {
        id: result._id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        age: result.age,
      });

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al registrar usuario';
      setMessage({ type: 'error', text: errorMessage });
      console.error('Error al registrar usuario:', {
        error: errorMessage,
        email: formData.email, // Solo log del email, no la contraseña
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-title">Crear cuenta</h1>

        {/* Mostrar mensaje de estado */}
        {message && (
          <div
            className={`message ${
              message.type === 'error' ? 'error' : 'success'
            }`}
          >
            {message.text}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <label htmlFor="name">
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Nombres"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="surname">
            <input
              id="surname"
              type="text"
              name="surname"
              placeholder="Apellidos"
              value={formData.surname}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="age">
            <input
              id="age"
              type="number"
              name="age"
              placeholder="Edad"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="email">
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Correo Electrónico"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label htmlFor="password">
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          {/* Confirm password field */}
          <label htmlFor="confirmPassword">
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirmar Contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>

          <div className="register-actions">
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Regístrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
