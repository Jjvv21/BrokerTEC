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
            SUM(COALESCE(p.cantidad, 0)) as acciones_traders,
            (SUM(COALESCE(p.cantidad, 0)) * 100.0 / e.cantidad_acciones) as porcentaje_traders,
            (e.cantidad_acciones - SUM(COALESCE(p.cantidad, 0))) as acciones_tesoreria,
            ((e.cantidad_acciones - SUM(COALESCE(p.cantidad, 0))) * 100.0 / e.cantidad_acciones) as porcentaje_tesoreria
          FROM empresa e
          LEFT JOIN portafolio p ON e.id_empresa = p.id_empresa
          WHERE e.activo = 1
          GROUP BY e.id_empresa, e.nombre, e.cantidad_acciones
          ORDER BY e.nombre
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
            SUM(p.cantidad * e.precio_actual) as valor_portafolio,
            w.saldo as saldo_wallet,
            (SUM(p.cantidad * e.precio_actual) + w.saldo) as valor_total
          FROM usuario u
          JOIN portafolio p ON u.id_usuario = p.id_usuario
          JOIN empresa e ON p.id_empresa = e.id_empresa
          JOIN wallet w ON u.id_usuario = w.id_usuario
          WHERE u.id_rol = 2 AND e.activo = 1 AND u.activo = 1
          GROUP BY u.id_usuario, u.alias, u.nombre, w.saldo
          ORDER BY valor_portafolio DESC
        `);
      
      return result.recordset;
    } catch (error) {
      logger.error('Error obteniendo top traders', error);
      throw error;
    }
  }

  /**
   * Obtiene reporte por empresa
   */
  async getCompanyReport(companyId, startDate, endDate) {
    try {
      const pool = await getConnection();
      
      let query = `
        SELECT 
          t.id_transaccion,
          u.alias,
          t.tipo,
          t.cantidad,
          t.precio,
          t.total,
          t.fecha,
          e.nombre as empresa_nombre
        FROM transaccion t
        JOIN usuario u ON t.id_usuario = u.id_usuario
        JOIN empresa e ON t.id_empresa = e.id_empresa
        WHERE t.id_empresa = @companyId
      `;
      
      const request = pool.request().input('companyId', companyId);
      
      if (startDate) {
        query += ' AND t.fecha >= @startDate';
        request.input('startDate', startDate);
      }
      
      if (endDate) {
        query += ' AND t.fecha <= @endDate';
        request.input('endDate', endDate);
      }
      
      query += ' ORDER BY t.fecha DESC';
      
      const transactions = await request.query(query);
      
      // Obtener mayor tenedor
      const topHolder = await pool.request()
        .input('companyId', companyId)
        .query(`
          SELECT TOP 1 
            u.alias,
            p.cantidad
          FROM portafolio p
          JOIN usuario u ON p.id_usuario = u.id_usuario
          WHERE p.id_empresa = @companyId
          ORDER BY p.cantidad DESC
        `);
      
      // Obtener inventario de tesorería
      const treasury = await pool.request()
        .input('companyId', companyId)
        .query('SELECT cantidad FROM tesoreria WHERE id_empresa = @companyId');
      
      return {
        transactions: transactions.recordset,
        topHolder: topHolder.recordset[0] || { alias: 'administracion', cantidad: 0 },
        treasuryInventory: treasury.recordset[0]?.cantidad || 0,
        company: await this.getCompanyInfo(companyId)
      };
      
    } catch (error) {
      logger.error('Error obteniendo reporte por empresa', error);
      throw error;
    }
  }

  /**
   * Obtiene reporte por usuario (alias)
   */
  async getUserReport(userAlias, startDate, endDate) {
    try {
      const pool = await getConnection();

      let query = `
      SELECT 
        t.id_tx AS id_transaccion,
        t.tipo,
        t.cantidad,
        t.precio,
        (t.cantidad * t.precio) AS total,
        t.fecha,
        e.nombre AS empresa_nombre,
        m.nombre AS mercado_nombre
      FROM transaccion t
      JOIN usuario u ON t.id_usuario = u.id_usuario
      JOIN empresa e ON t.id_empresa = e.id_empresa
      JOIN mercado m ON e.id_mercado = m.id_mercado
      WHERE u.alias = @userAlias
    `;

      const request = pool.request().input('userAlias', userAlias);

      if (startDate) {
        query += ' AND t.fecha >= @startDate';
        request.input('startDate', startDate);
      }

      if (endDate) {
        query += ' AND t.fecha <= @endDate';
        request.input('endDate', endDate);
      }

      query += ' ORDER BY t.fecha DESC';

      console.log(" Query ejecutado:", query, "con alias:", userAlias); //  log útil
      const result = await request.query(query);
      console.log(" Resultado SQL:", result.recordset); //  log
      return result.recordset;

    } catch (error) {
      logger.error('Error obteniendo reporte por usuario', error);
      throw error;
    }
  }



  /**
   * Obtiene estadísticas de mercado
   */
  async getMarketStats(marketId) {
    try {
      const pool = await getConnection();
      
      const result = await pool.request()
        .input('marketId', marketId)
        .query(`
          SELECT 
            m.nombre as mercado,
            COUNT(e.id_empresa) as total_empresas,
            SUM(e.cantidad_acciones * e.precio_actual) as capitalizacion_total,
            AVG(e.precio_actual) as precio_promedio,
            SUM(COALESCE(p.cantidad, 0)) as acciones_traders,
            (SUM(COALESCE(p.cantidad, 0)) * 100.0 / SUM(e.cantidad_acciones)) as porcentaje_traders
          FROM mercado m
          JOIN empresa e ON m.id_mercado = e.id_mercado
          LEFT JOIN portafolio p ON e.id_empresa = p.id_empresa
          WHERE m.id_mercado = @marketId AND e.activo = 1
          GROUP BY m.id_mercado, m.nombre
        `);
      
      return result.recordset[0] || {};
      
    } catch (error) {
      logger.error('Error obteniendo estadísticas de mercado', error);
      throw error;
    }
  }

  /**
   * Obtiene inventario de tesorería
   */
  async getTreasuryInventory() {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query(`
          SELECT 
            t.id_empresa,
            e.nombre as empresa_nombre,
            t.cantidad as acciones_disponibles,
            e.precio_actual,
            (t.cantidad * e.precio_actual) as valor_total,
            m.nombre as mercado_nombre
          FROM tesoreria t
          JOIN empresa e ON t.id_empresa = e.id_empresa
          JOIN mercado m ON e.id_mercado = m.id_mercado
          WHERE e.activo = 1
          ORDER BY valor_total DESC
        `);
      
      return result.recordset;
    } catch (error) {
      logger.error('Error obteniendo inventario de tesorería', error);
      throw error;
    }
  }

  /**
   * Obtiene distribución de tenencia
   */
  async getOwnershipDistribution(level = 'empresa') {
    try {
      const pool = await getConnection();
      
      if (level === 'mercado') {
        const result = await pool.request()
          .query(`
            SELECT 
              m.nombre as nombre,
              SUM(e.cantidad_acciones) as total_acciones,
              SUM(COALESCE(p.cantidad, 0)) as acciones_traders,
              (SUM(COALESCE(p.cantidad, 0)) * 100.0 / SUM(e.cantidad_acciones)) as porcentaje_traders,
              (SUM(e.cantidad_acciones) - SUM(COALESCE(p.cantidad, 0))) as acciones_tesoreria,
              ((SUM(e.cantidad_acciones) - SUM(COALESCE(p.cantidad, 0))) * 100.0 / SUM(e.cantidad_acciones)) as porcentaje_tesoreria
            FROM mercado m
            JOIN empresa e ON m.id_mercado = e.id_mercado
            LEFT JOIN portafolio p ON e.id_empresa = p.id_empresa
            WHERE e.activo = 1
            GROUP BY m.id_mercado, m.nombre
            ORDER BY m.nombre
          `);
        return result.recordset;
      } else {
        // Por empresa (default)
        return await this.getHoldingsStats();
      }
      
    } catch (error) {
      logger.error('Error obteniendo distribución de tenencia', error);
      throw error;
    }
  }

  /**
   * Obtiene información básica de una empresa
   */
  async getCompanyInfo(companyId) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('companyId', companyId)
        .query(`
          SELECT 
            e.*,
            m.nombre as mercado_nombre,
            (e.precio_actual * e.cantidad_acciones) as capitalizacion
          FROM empresa e
          JOIN mercado m ON e.id_mercado = m.id_mercado
          WHERE e.id_empresa = @companyId
        `);
      
      return result.recordset[0] || {};
    } catch (error) {
      logger.error('Error obteniendo información de empresa', error);
      throw error;
    }
  }

  /**
   * Obtiene histórico de precios para gráfico
   */
  async getPriceHistory(companyId, days = 30) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input('companyId', companyId)
        .input('days', days)
        .query(`
          SELECT TOP ${days} 
            precio, 
            fecha
          FROM precio_historico
          WHERE id_empresa = @companyId
          ORDER BY fecha DESC
        `);
      
      return result.recordset.reverse(); // Orden ascendente para gráfico
    } catch (error) {
      logger.error('Error obteniendo histórico de precios', error);
      throw error;
    }
  }
}
export const analystService = new AnalystService();
