import { getConnection } from '../config/db.js';
import { logger } from '../config/logger.js';

export class AnalystService {
  /**
   * Obtiene estadísticas de tenencia por empresa
   */
  async getHoldingsStats() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT 
            e.nombre as empresa,
            e.cantidad_acciones as total_acciones,
            SUM(p.cantidad) as acciones_traders,
            (SUM(p.cantidad) * 100.0 / e.cantidad_acciones) as porcentaje_traders
          FROM empresa e
          LEFT JOIN portafolio p ON e.id_empresa = p.id_empresa
          WHERE e.activo = 1
          GROUP BY e.id_empresa, e.nombre, e.cantidad_acciones
        `);
      
      return result.recordset;
    } catch (error) {
      logger.error('Error obteniendo estadísticas', error);
      throw error;
    }
  }

  /**
   * Obtiene top traders por valor en portafolio
   */
  async getTopTraders() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT 
            u.alias,
            u.nombre,
            SUM(p.cantidad * e.precio_actual) as valor_portafolio
          FROM usuario u
          JOIN portafolio p ON u.id_usuario = p.id_usuario
          JOIN empresa e ON p.id_empresa = e.id_empresa
          WHERE u.id_rol = 2 AND e.activo = 1
          GROUP BY u.id_usuario, u.alias, u.nombre
          ORDER BY valor_portafolio DESC
        `);
      
      return result.recordset;
    } catch (error) {
      logger.error('Error obteniendo top traders', error);
      throw error;
    }
  }
}