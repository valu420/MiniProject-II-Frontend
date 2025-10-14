import CryptoJS from 'crypto-js';

// Clave secreta para el encriptado (en producción esto debería estar en variables de entorno)
const SECRET_KEY = 'miniproject2-secret-key-2025';

/**
 * Encripta una contraseña usando AES
 * @param password - La contraseña a encriptar
 * @returns La contraseña encriptada
 */
export const encryptPassword = (password: string): string => {
  try {
    const encrypted = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Error al encriptar la contraseña:', error);
    throw new Error('Error al procesar la contraseña');
  }
};

/**
 * Genera un hash SHA-256 de la contraseña
 * @param password - La contraseña a hashear
 * @returns El hash SHA-256 de la contraseña
 */
export const hashPassword = (password: string): string => {
  try {
    const hash = CryptoJS.SHA256(password + SECRET_KEY).toString();
    return hash;
  } catch (error) {
    console.error('Error al generar hash de la contraseña:', error);
    throw new Error('Error al procesar la contraseña');
  }
};