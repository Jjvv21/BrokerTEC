import { getConnection } from "../config/db.js";
import { logger } from "../config/logger.js";
import sql from "mssql";



export class EmpresaService {
  async getEmpresas() {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(`
        SELECT
          id_empresa,
          nombre,
          id_mercado,
          precio_actual,
          cantidad_acciones,
          market_cap,
          activo
        FROM empresa
        ORDER BY nombre ASC
      `);

      logger.info(" Empresas obtenidas correctamente");
      return result.recordset;
    } catch (error) {
      logger.error(" Error en EmpresaService.getEmpresas", error);
      throw error;
    }
  }
  async getPreciosPorEmpresa(id_empresa) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .input("id_empresa", sql.Int, parseInt(id_empresa))

        .query(`
        SELECT 
          id_hist AS id,
          id_empresa, 
          precio, 
          fecha
        FROM historico_precio
        WHERE id_empresa = @id_empresa
        ORDER BY fecha ASC
      `);

      return result.recordset;
    } catch (error) {
      logger.error(" Error en EmpresaService.getPreciosPorEmpresa", error);
      throw error;
    }
  }
}



