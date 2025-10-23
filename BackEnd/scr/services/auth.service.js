import { getConnection } from '../config/db.js';
import { User } from '../models/index.js';
import { logger } from '../config/logger.js';

export class AuthService {
  /**
   * Autentica un usuario por email y password
   */
  async login(email, password) {
    try {
      logger.info('Intentando login', { email });
      
      const pool = await getConnection();
      const result = await pool.request()
        .input('email', email)
        .query('SELECT * FROM usuario WHERE correo = @email');
      
      if (result.recordset.length === 0) {
        logger.warn('Usuario no encontrado', { email });
        return null;
      }
      
      const userData = result.recordset[0];
      const user = new User(userData);
      
      // Verificar password (hash)
      // TODO: Implementar bcrypt
      
      logger.info('Login exitoso', { userId: user.id, alias: user.alias });
      return user.toJSON();
      
    } catch (error) {
      logger.error('Error en login', error);
      throw error;
    }
  }

  /**
   * Obtiene usuario por ID
   */
  async getUserById(userId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('userId', userId)
        .query('SELECT * FROM usuario WHERE id_usuario = @userId');
      
      if (result.recordset.length === 0) return null;
      
      return new User(result.recordset[0]).toJSON();
    } catch (error) {
      logger.error('Error obteniendo usuario', error);
      throw error;
    }
  }
}