import React, { useState } from "react";
import "./Register.css";

/**
 * Register page component
 * - Allows users to create an account
 * - Includes fields for name, surname, age, email, and password
 * - Accessible and styled according to the provided CSS
 * @returns {JSX.Element}
 */
export const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        age: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
        // Aquí puedes agregar la lógica para enviar los datos al servidor
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <h1 className="register-title">Crear cuenta</h1>
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

                    <div className="register-actions">
                        <button type="submit" className="btn-primary">
                            Regístrate
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;