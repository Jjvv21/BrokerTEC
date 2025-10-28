// scr/services/user.service.js
import { getConnection } from '../config/db.js';
import { User } from '../models/index.js';
import { passwordUtils } from '../utils/password.js';
import { logger } from '../config/logger.js';

export class UserService {
  /**
   * Obtiene perfil de usuario
   */
  async getUserProfile(userId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('userId', userId)
        .query(`
          SELECT u.*, r.nombre_rol, c.nombre_categoria 
          FROM usuario u
          LEFT JOIN rol r ON u.id_rol = r.id_rol
          LEFT JOIN categoria c ON u.id_categoria = c.id_categoria
          WHERE u.id_usuario = @userId
        `);
      
      if (result.recordset.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      return new User(result.recordset[0]).toJSON();
    } catch (error) {
      logger.error('Error obteniendo perfil de usuario', error);
      throw error;
    }
  }

  /**
   * Actualiza perfil de usuario
   */
  async updateUserProfile(userId, userData) {
    try {
      const pool = await getConnection();
      const { nombre, direccion, pais, telefono } = userData;
      
      await pool.request()
        .input('userId', userId)
        .input('nombre', nombre)
        .input('direccion', direccion)
        .input('pais', pais)
        .input('telefono', telefono)
        .query(`
          UPDATE usuario 
          SET nombre = @nombre, direccion = @direccion, 
              pais_de_origen = @pais, telefono = @telefono
          WHERE id_usuario = @userId
        `);
      
      logger.info('Perfil de usuario actualizado', { userId });
      return { success: true, message: 'Perfil actualizado exitosamente' };
    } catch (error) {
      logger.error('Error actualizando perfil', error);
      throw error;
    }
  }

  /**
   * Cambia contraseña de usuario
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const pool = await getConnection();
      
      // Verificar contraseña actual
      const userResult = await pool.request()
        .input('userId', userId)
        .query('SELECT contrasena_hash FROM usuario WHERE id_usuario = @userId');
      
      if (userResult.recordset.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      const currentHash = userResult.recordset[0].contrasena_hash;
      const isCurrentValid = await passwordUtils.verifyPassword(currentPassword, currentHash);
      
      if (!isCurrentValid) {
        throw new Error('Contraseña actual incorrecta');
      }
      
      // Hashear nueva contraseña
      const newHash = await passwordUtils.hashPassword(newPassword);
      
      // Actualizar contraseña
      await pool.request()
        .input('userId', userId)
        .input('newHash', newHash)
        .query('UPDATE usuario SET contrasena_hash = @newHash WHERE id_usuario = @userId');
      
      logger.info('Contraseña actualizada', { userId });
      return { success: true, message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      logger.error('Error cambiando contraseña', error);
      throw error;
    }
  }
}