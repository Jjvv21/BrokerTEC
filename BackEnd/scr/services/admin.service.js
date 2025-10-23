import { getConnection } from '../config/db.js';
import { User, Company } from '../models/index.js';
import { logger } from '../config/logger.js';

export class AdminService {
  /**
   * Obtiene todos los usuarios
   */
  async getAllUsers() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT u.*, r.nombre_rol, c.nombre_categoria
          FROM usuario u
          LEFT JOIN rol r ON u.id_rol = r.id_rol
          LEFT JOIN categoria c ON u.id_categoria = c.id_categoria
        `);
      
      return result.recordset.map(data => new User(data).toJSON());
    } catch (error) {
      logger.error('Error obteniendo usuarios', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las empresas
   */
  async getAllCompanies() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT e.*, m.nombre as mercado_nombre
          FROM empresa e
          JOIN mercado m ON e.id_mercado = m.id_mercado
        `);
      
      return result.recordset.map(data => new Company(data));
    } catch (error) {
      logger.error('Error obteniendo empresas', error);
      throw error;
    }
  }
}