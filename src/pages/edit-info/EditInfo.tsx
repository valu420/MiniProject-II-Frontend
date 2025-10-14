import React from 'react';
import './EditInfo.scss';

const EditInfo: React.FC = () => {
  return (
    <div className="edit-info-container">
      <div className="form-content">
        <div className="profile-icon"></div>

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

        <a href="#" className="delete-account">
          Eliminar Cuenta
        </a>
      </div>
    </div>
  );
};

export default EditInfo;
