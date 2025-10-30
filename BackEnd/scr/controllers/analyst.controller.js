import { AnalystService } from '../services/analyst.service.js';
import { getConnection } from '../config/db.js';

// ✅ Crear instancia del servicio
const analystService = new AnalystService();

export const getCompanyReport = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate } = req.query;
    const result = await analystService.getCompanyReport(companyId, startDate, endDate);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUserReport = async (req, res) => {
  try {
    const { userAlias } = req.params;
    console.log("🔍 Alias recibido:", userAlias);
    const { startDate, endDate } = req.query;
    const result = await analystService.getUserReport(userAlias, startDate, endDate);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getMarketStats = async (req, res) => {
  try {
    const { marketId } = req.params;
    const result = await analystService.getMarketStats(marketId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getTreasuryInventory = async (req, res) => {
  try {
    const result = await analystService.getTreasuryInventory();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getOwnershipDistribution = async (req, res) => {
  try {
    const { level } = req.query;
    const result = await analystService.getOwnershipDistribution(level);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllTraders = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT
        id_usuario,
        alias,
        nombre,
        correo,
        id_rol,
        id_categoria,
        estado
      FROM usuario
      WHERE id_rol = 2 AND estado = 1
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error obteniendo traders:", err);
    res.status(500).json({ error: "Error obteniendo usuarios traders" });
  }
};

export const getGlobalStats = async (req, res) => {
  try {
    const pool = await getConnection();

    // Total de usuarios por rol
    const usersResult = await pool.request().query(`
      SELECT 
        r.nombre_rol AS rol,
        COUNT(u.id_usuario) AS cantidad
      FROM usuario u
      JOIN rol r ON u.id_rol = r.id_rol
      WHERE u.estado = 1
      GROUP BY r.nombre_rol
    `);

    // Total de empresas activas
    const companiesResult = await pool.request().query(`
      SELECT COUNT(*) AS totalEmpresas
      FROM empresa
      WHERE activo = 1
    `);

    const totalUsuarios = usersResult.recordset.reduce(
      (sum, row) => sum + row.cantidad,
      0
    );

    res.status(200).json({
      usuariosPorRol: usersResult.recordset,
      totalUsuarios,
      totalEmpresas: companiesResult.recordset[0].totalEmpresas,
    });
  } catch (err) {
    console.error("Error obteniendo estadísticas globales:", err);
    res.status(500).json({ error: "Error obteniendo estadísticas globales" });
  }
};

