import { getConnection } from '../config/db.js';
import { Trade, Position } from '../models/index.js';
import { logger } from '../config/logger.js';

export class TraderService {
  /**
   * Obtiene el portafolio de un trader
   */
  async getPortfolio(userId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('userId', userId)
        .query(`
          SELECT p.*, e.nombre as empresa_nombre, e.precio_actual
          FROM portafolio p
          JOIN empresa e ON p.id_empresa = e.id_empresa
          WHERE p.id_usuario = @userId
        `);
      
      return result.recordset.map(data => new Position(data));
    } catch (error) {
      logger.error('Error obteniendo portafolio', error);
      throw error;
    }
  }

  /**
   * Obtiene historial de transacciones
   */
  async getTransactionHistory(userId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('userId', userId)
        .query(`
          SELECT t.*, e.nombre as empresa_nombre
          FROM transaccion t
          JOIN empresa e ON t.id_empresa = e.id_empresa
          WHERE t.id_usuario = @userId
          ORDER BY t.fecha DESC
        `);
      
      return result.recordset.map(data => new Trade(data));
    } catch (error) {
      logger.error('Error obteniendo historial', error);
      throw error;
    }
  }
}