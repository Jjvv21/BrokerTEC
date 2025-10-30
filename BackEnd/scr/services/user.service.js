// user.service.js - MEJORADO
import { getConnection } from '../config/db.js';
import { User } from '../models/index.js';
import { logger } from '../config/logger.js';

export class UserService {
  async getUserProfile(userId) {
    let pool;
    try {
      console.log('🔍 [UserService] getUserProfile llamado con userId:', userId);
      
      // Validar userId
      if (!userId || isNaN(userId)) {
        throw new Error('ID de usuario inválido: ' + userId);
      }
      
      pool = await getConnection();
      console.log('✅ [UserService] Conexión a BD establecida');
      
      const request = pool.request();
      request.input('userId', parseInt(userId));
      
      console.log('📝 [UserService] Ejecutando query...');
      const result = await request.query(`
        SELECT 
          u.id_usuario,
          u.alias,
          u.nombre, 
          u.correo,
          u.telefono,
          u.direccion,
          u.pais_de_origen,
          u.id_rol,
          u.id_categoria,
          u.estado,
          r.nombre_rol,
          c.nombre_categoria
        FROM usuario u
        LEFT JOIN rol r ON u.id_rol = r.id_rol
        LEFT JOIN categoria c ON u.id_categoria = c.id_categoria
        WHERE u.id_usuario = @userId
      `);
      
      console.log('📊 [UserService] Resultado de query:', {
        recordsCount: result.recordset.length,
        firstRecord: result.recordset[0]
      });
      
      if (result.recordset.length === 0) {
        throw new Error(`Usuario con ID ${userId} no encontrado en la base de datos`);
      }
      
      const rawData = result.recordset[0];
      console.log('👤 [UserService] Datos crudos de BD:', rawData);
      
      // Crear instancia del modelo
      const userInstance = new User(rawData);
      console.log('🔄 [UserService] Instancia User creada:', userInstance);
      
      const userJSON = userInstance.toJSON();
      console.log('✅ [UserService] User.toJSON() resultado:', userJSON);
      
      return userJSON;
    } catch (error) {
      console.error('❌ [UserService] Error completo:', error);
      logger.error('Error obteniendo perfil de usuario', { userId, error: error.message });
      throw error;
    }
  }
}